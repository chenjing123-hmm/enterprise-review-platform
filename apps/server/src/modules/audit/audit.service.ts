import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditRecord } from './audit-record.entity';
import { ReviewService } from '../review/review.service';
import { SensitiveWordService } from '../sensitive-word/sensitive-word.service';
import { AuditQueueItem, AuditAction, AuditRecord as AuditRecordType } from '@erp/shared';

/**
 * 审核服务 - 5阶段审核流水线
 *
 * 阶段1: DFA 敏感词扫描 → 检查内容是否包含敏感词
 * 阶段2: 合规性检查 → 检查内容是否违反平台规则
 * 阶段3: OCR 证据检查 → 检查上传的证明材料是否真实
 * 阶段4: 风险规则检查 → 检查内容是否触发风险规则
 * 阶段5: 决策路由 → 综合各阶段结果，最终通过/驳回/需修改
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditRecord)
    private readonly auditRecordRepository: Repository<AuditRecord>,
    private readonly reviewService: ReviewService,
    private readonly sensitiveWordService: SensitiveWordService,
  ) {}

  /**
   * 执行5阶段审核流水线
   * @param review 待审核的点评对象
   * @returns 审核记录
   */
  async auditPipeline(review: any): Promise<AuditRecord> {
    this.logger.log(`开始审核流水线: reviewId=${review.id}, 内容预览="${review.content?.substring(0, 50)}..."`);

    // 创建审核记录
    const auditRecord = this.auditRecordRepository.create({
      targetType: 'review',
      targetId: review.id,
      targetSummary: {
        title: review.jobTitle || '点评',
        submitterId: review.userId,
        submitterName: review.userNickname,
        submittedAt: review.createdAt?.toISOString(),
      },
      status: 'PENDING',
      stage: 1,
      priority: 0,
    });

    let savedRecord = await this.auditRecordRepository.save(auditRecord);

    // ─── 阶段1: DFA 敏感词扫描 ───
    savedRecord = await this.executeStage1(savedRecord, review);
    if (savedRecord.status === 'FAILED') {
      this.logger.warn(`阶段1(DFA)未通过: reviewId=${review.id}`);
      return savedRecord;
    }

    // ─── 阶段2: 合规性检查 ───
    savedRecord = await this.executeStage2(savedRecord, review);
    if (savedRecord.status === 'FAILED') {
      this.logger.warn(`阶段2(合规)未通过: reviewId=${review.id}`);
      return savedRecord;
    }

    // ─── 阶段3: OCR 证据检查 ───
    savedRecord = await this.executeStage3(savedRecord, review);
    if (savedRecord.status === 'FAILED') {
      this.logger.warn(`阶段3(OCR)未通过: reviewId=${review.id}`);
      return savedRecord;
    }

    // ─── 阶段4: 风险规则检查 ───
    savedRecord = await this.executeStage4(savedRecord, review);
    if (savedRecord.status === 'FAILED') {
      this.logger.warn(`阶段4(风险)未通过: reviewId=${review.id}`);
      return savedRecord;
    }

    // ─── 阶段5: 决策路由 ───
    savedRecord = await this.executeStage5(savedRecord, review);

    this.logger.log(`审核流水线完成: reviewId=${review.id}, 最终状态=${savedRecord.status}`);
    return savedRecord;
  }

  /**
   * 阶段1: DFA 敏感词扫描
   * 使用敏感词服务的 DFA Trie 树扫描内容，检查是否命中敏感词
   */
  private async executeStage1(record: AuditRecord, review: any): Promise<AuditRecord> {
    this.logger.debug(`[阶段1] DFA 敏感词扫描: reviewId=${review.id}`);

    let hits: any[] = [];
    if (this.sensitiveWordService && this.sensitiveWordService.checkText) {
      const result = await this.sensitiveWordService.checkText(review.content || '');
      hits = result.hits;
    }

    const hasCritical = hits.some((h: any) => h.severity === 'CRITICAL');
    const hasHigh = hits.some((h: any) => h.severity === 'HIGH');

    record.stage = 1;
    record.stage1DfaResult = {
      passed: hits.length === 0,
      hits,
      hasHighSeverity: hasCritical || hasHigh,
    };

    if (hasCritical) {
      // 极严重敏感词直接驳回
      record.status = 'FAILED';
      record.remark = '内容包含极严重敏感词，自动驳回';
    } else if (hasHigh) {
      // 高严重度敏感词标记为需要人工审核
      record.priority = Math.max(record.priority, 5);
      record.status = 'PENDING';
      record.remark = '内容包含高严重度敏感词，需要人工审核';
    } else {
      record.status = 'PASSED';
    }

    return this.auditRecordRepository.save(record);
  }

  /**
   * 阶段2: 合规性检查
   * 检查内容长度、是否包含联系方式、广告信息等
   */
  private async executeStage2(record: AuditRecord, review: any): Promise<AuditRecord> {
    this.logger.debug(`[阶段2] 合规性检查: reviewId=${review.id}`);

    const content = review.content || '';
    const issues: string[] = [];

    // 检查联系方式（手机号、邮箱、QQ、微信等）
    const phonePattern = /1[3-9]\d{9}/;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const socialPattern = /(微信|QQ|qq|wx|vx|加我|联系我)\s*[:：]?\s*[\w-]+/i;

    if (phonePattern.test(content)) {
      issues.push('内容包含手机号码');
    }
    if (emailPattern.test(content)) {
      issues.push('内容包含邮箱地址');
    }
    if (socialPattern.test(content)) {
      issues.push('内容包含社交联系方式');
    }

    // 检查内容长度合规性
    if (content.length < 50) {
      issues.push('内容长度不足50字符');
    }

    record.stage = 2;
    record.stage2ComplianceResult = {
      passed: issues.length === 0,
      issues,
    };

    if (issues.length > 0) {
      record.status = 'NEED_MODIFY';
      record.remark = `合规检查发现问题: ${issues.join('; ')}`;
    } else {
      record.status = 'PASSED';
    }

    return this.auditRecordRepository.save(record);
  }

  /**
   * 阶段3: OCR 证据检查
   * 检查上传的证明材料是否经过 OCR 识别，识别结果是否包含隐私信息
   */
  private async executeStage3(record: AuditRecord, review: any): Promise<AuditRecord> {
    this.logger.debug(`[阶段3] OCR 证据检查: reviewId=${review.id}`);

    // 检查证据材料是否足够（至少1个）
    const evidenceIds = review.evidenceIds || [];
    const hasEvidence = evidenceIds.length >= 1;

    record.stage = 3;
    record.stage3OcrResult = {
      passed: hasEvidence,
      evidenceCount: evidenceIds.length,
      message: hasEvidence ? 'OCR证据检查通过' : '缺少证明材料',
    };

    if (!hasEvidence) {
      record.status = 'NEED_MODIFY';
      record.remark = '缺少证明材料，请上传至少1个证明材料';
    } else {
      record.status = 'PASSED';
    }

    return this.auditRecordRepository.save(record);
  }

  /**
   * 阶段4: 风险规则检查
   * 检查是否触发风险规则（批量刷评、恶意差评、同IP操作等）
   */
  private async executeStage4(record: AuditRecord, review: any): Promise<AuditRecord> {
    this.logger.debug(`[阶段4] 风险规则检查: reviewId=${review.id}`);

    const riskIssues: string[] = [];
    let riskLevel = 'LOW';

    // 检查内容是否包含极端评分（全1分或全5分）
    const ratings = [
      review.overallRating,
      review.salaryRating,
      review.environmentRating,
      review.growthRating,
      review.managementRating,
      review.workLifeBalanceRating,
    ];
    const allMin = ratings.every((r: number) => r <= 1);
    const allMax = ratings.every((r: number) => r >= 5);

    if (allMin) {
      riskIssues.push('疑似恶意差评（所有评分均为最低分）');
      riskLevel = 'HIGH';
    }
    if (allMax) {
      riskIssues.push('疑似虚假好评（所有评分均为最高分）');
      riskLevel = 'MEDIUM';
    }

    record.stage = 4;
    record.stage4RiskResult = {
      passed: riskIssues.length === 0,
      riskLevel,
      issues: riskIssues,
    };

    if (riskLevel === 'HIGH') {
      record.status = 'FAILED';
      record.priority = Math.max(record.priority, 10);
      record.remark = `风险规则检查不通过: ${riskIssues.join('; ')}`;
    } else if (riskLevel === 'MEDIUM') {
      record.priority = Math.max(record.priority, 3);
      record.status = 'PASSED';
    } else {
      record.status = 'PASSED';
    }

    return this.auditRecordRepository.save(record);
  }

  /**
   * 阶段5: 决策路由
   * 综合前4阶段结果，做出最终决策
   */
  private async executeStage5(record: AuditRecord, review: any): Promise<AuditRecord> {
    this.logger.debug(`[阶段5] 决策路由: reviewId=${review.id}`);

    const s1 = record.stage1DfaResult;
    const s2 = record.stage2ComplianceResult;
    const s3 = record.stage3OcrResult;
    const s4 = record.stage4RiskResult;

    // 综合决策逻辑
    let finalStatus = 'APPROVED';
    let finalAction = 'APPROVE';
    let finalRemark = '';

    // 如果任何阶段失败，则驳回
    if (record.status === 'FAILED') {
      finalStatus = 'REJECTED';
      finalAction = 'REJECT';
      finalRemark = record.remark || '审核未通过';
    } else if (record.status === 'NEED_MODIFY') {
      finalStatus = 'PENDING';
      finalAction = 'NEED_MODIFY';
      finalRemark = '需要修改后重新提交';
    } else if (record.priority >= 5) {
      // 高优先级需要人工审核
      finalStatus = 'PENDING';
      finalAction = 'NEED_MODIFY';
      finalRemark = '需要人工审核';
    }

    record.stage = 5;
    record.stage5Decision = {
      finalStatus,
      finalAction,
      summary: {
        dfaPassed: s1?.passed,
        compliancePassed: s2?.passed,
        ocrPassed: s3?.passed,
        riskPassed: s4?.passed,
      },
    };
    record.status = finalStatus;
    record.action = finalAction;
    record.remark = finalRemark || record.remark;

    const saved = await this.auditRecordRepository.save(record);

    // 更新点评的审核状态
    if (finalAction === 'APPROVE') {
      await this.reviewService.updateAuditStatus(review.id, 'APPROVED', 'PUBLISHED');
    } else if (finalAction === 'REJECT') {
      await this.reviewService.updateAuditStatus(review.id, 'REJECTED', 'DRAFT', finalRemark);
    }

    return saved;
  }

  /**
   * 获取审核队列（分页）
   * 按优先级降序、进入队列时间升序排列
   */
  async getAuditQueue(page: number = 1, pageSize: number = 20): Promise<{
    items: AuditQueueItem[];
    total: number;
  }> {
    const [items, total] = await this.auditRecordRepository.findAndCount({
      where: { status: 'PENDING' },
      order: { priority: 'DESC', queuedAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    this.logger.log(`审核队列查询: 待审核数=${total}`);

    return {
      items: items.map((r) => ({
        id: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        targetSummary: r.targetSummary || { title: '', submitterId: '', submitterName: '', submittedAt: '' },
        status: r.status as any,
        priority: r.priority,
        queuedAt: r.queuedAt.toISOString(),
      })),
      total,
    };
  }

  /**
   * 审核通过
   */
  async approve(id: string, auditorId: string, auditorName: string, remark?: string): Promise<AuditRecord> {
    const record = await this.auditRecordRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('审核记录不存在');

    record.action = 'APPROVE';
    record.status = 'APPROVED';
    record.auditorId = auditorId;
    record.auditorName = auditorName;
    record.remark = remark || '审核通过';
    record.newStatus = 'APPROVED';

    const saved = await this.auditRecordRepository.save(record);

    // 更新目标点评状态
    await this.reviewService.updateAuditStatus(record.targetId, 'APPROVED', 'PUBLISHED');

    this.logger.log(`审核通过: id=${id}, auditorId=${auditorId}`);
    return saved;
  }

  /**
   * 审核驳回
   */
  async reject(id: string, auditorId: string, auditorName: string, rejectReason: string): Promise<AuditRecord> {
    const record = await this.auditRecordRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('审核记录不存在');

    record.action = 'REJECT';
    record.status = 'REJECTED';
    record.auditorId = auditorId;
    record.auditorName = auditorName;
    record.rejectReason = rejectReason;
    record.remark = rejectReason;
    record.newStatus = 'REJECTED';

    const saved = await this.auditRecordRepository.save(record);
    await this.reviewService.updateAuditStatus(record.targetId, 'REJECTED', 'DRAFT', rejectReason);

    this.logger.log(`审核驳回: id=${id}, reason=${rejectReason}`);
    return saved;
  }

  /**
   * 需要修改
   */
  async needModify(id: string, auditorId: string, auditorName: string, remark: string): Promise<AuditRecord> {
    const record = await this.auditRecordRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('审核记录不存在');

    record.action = 'NEED_MODIFY';
    record.status = 'NEED_MODIFY';
    record.auditorId = auditorId;
    record.auditorName = auditorName;
    record.remark = remark;
    record.newStatus = 'NEED_MODIFY';

    const saved = await this.auditRecordRepository.save(record);
    this.logger.log(`需要修改: id=${id}, remark=${remark}`);
    return saved;
  }
}