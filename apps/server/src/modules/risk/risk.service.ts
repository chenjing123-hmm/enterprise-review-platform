import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskAlert } from './risk-alert.entity';

/**
 * 风险预警服务
 * 负责检测和创建风险预警，支持批量刷评、恶意差评、同IP操作、异常行为模式检测
 */
@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name);

  constructor(
    @InjectRepository(RiskAlert)
    private readonly riskAlertRepository: Repository<RiskAlert>,
  ) {}

  /**
   * 检查批量刷评风险
   * 检测同一用户在短时间内创建大量点评
   *
   * @param userId 用户ID
   * @returns 是否触发风险预警
   */
  async checkBatchReview(userId: string): Promise<boolean> {
    this.logger.debug(`批量刷评风险检查: userId=${userId}`);

    // 实际实现应查询该用户最近24小时内的点评数量
    // 如果超过阈值（如10条/天），则创建预警
    const threshold = 10; // 24小时内最大点评数
    const timeframe = 24 * 60 * 60 * 1000; // 24小时

    // 桩实现：此处应查询数据库
    // const recentReviews = await this.reviewRepository.count({
    //   where: { userId, createdAt: MoreThan(new Date(Date.now() - timeframe)) },
    // });

    const recentReviews = 0; // 桩数据

    if (recentReviews >= threshold) {
      await this.createAlert({
        alertType: 'BATCH_REVIEW',
        severity: 'HIGH',
        title: '用户批量刷评风险',
        description: `用户 ${userId} 在24小时内创建了 ${recentReviews} 条点评，超过阈值 ${threshold} 条`,
        userId,
        extraData: { recentReviews, threshold, timeframe },
      });
      return true;
    }

    return false;
  }

  /**
   * 检查企业恶意差评风险
   * 检测某一企业在短时间内收到大量低分点评
   *
   * @param companyId 企业ID
   * @returns 是否触发风险预警
   */
  async checkMassNegative(companyId: string): Promise<boolean> {
    this.logger.debug(`恶意差评风险检查: companyId=${companyId}`);

    // 实际实现应查询该企业最近24小时内的低分点评数量
    const threshold = 5; // 24小时内异常低分点评数
    const minRating = 2; // 最低评分阈值

    // 桩实现
    const lowRatingCount = 0;

    if (lowRatingCount >= threshold) {
      await this.createAlert({
        alertType: 'MASS_NEGATIVE',
        severity: 'CRITICAL',
        title: '企业遭受恶意差评风险',
        description: `企业 ${companyId} 在24小时内收到 ${lowRatingCount} 条低分点评（评分<=${minRating}），可能遭受恶意攻击`,
        companyId,
        extraData: { lowRatingCount, threshold, minRating },
      });
      return true;
    }

    return false;
  }

  /**
   * 检查同IP操作风险
   * 检测同一IP地址是否在短时间内创建大量点评或账户
   *
   * @param ip IP地址
   * @returns 是否触发风险预警
   */
  async checkSameIP(ip: string): Promise<boolean> {
    this.logger.debug(`同IP风险检查: ip=${ip}`);

    // 实际实现应查询该IP最近的操作记录
    const threshold = 3; // 同IP最大操作数

    // 桩实现
    const activityCount = 0;

    if (activityCount >= threshold) {
      await this.createAlert({
        alertType: 'SAME_IP',
        severity: 'HIGH',
        title: '同IP异常操作风险',
        description: `IP ${ip} 在短时间内进行了 ${activityCount} 次操作，超过阈值 ${threshold}`,
        ipAddress: ip,
        extraData: { activityCount, threshold },
      });
      return true;
    }

    return false;
  }

  /**
   * 检查异常行为模式
   * 综合检测各种异常行为模式（如：注册后立即点评、全员5分/1分、内容相似度高等）
   */
  async checkAbnormalPattern(): Promise<{
    triggered: boolean;
    alerts: RiskAlert[];
  }> {
    this.logger.debug('异常行为模式检查');

    const alerts: RiskAlert[] = [];

    // 检查各种异常模式
    // 1. 注册后立即点评（注册时间 < 1小时）
    // 2. 内容相似度检查（与其他点评内容高度相似）
    // 3. 评分分布异常（全1分或全5分）
    // 4. 点评时间分布异常（集中在凌晨时段）

    // 桩实现
    return {
      triggered: alerts.length > 0,
      alerts,
    };
  }

  /**
   * 创建风险预警
   * @param data 预警数据
   */
  async createAlert(data: {
    alertType: string;
    severity: string;
    title: string;
    description: string;
    userId?: string;
    companyId?: string;
    ipAddress?: string;
    extraData?: any;
  }): Promise<RiskAlert> {
    const alert = this.riskAlertRepository.create({
      alertType: data.alertType,
      severity: data.severity,
      title: data.title,
      description: data.description,
      userId: data.userId,
      companyId: data.companyId,
      ipAddress: data.ipAddress,
      status: 'ACTIVE',
      extraData: data.extraData,
    });

    const saved = await this.riskAlertRepository.save(alert);
    this.logger.warn(`风险预警创建: [${saved.severity}] ${saved.title}`);
    return saved;
  }

  /**
   * 获取风险预警列表
   */
  async findAll(
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    alertType?: string,
  ): Promise<{ items: RiskAlert[]; total: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (alertType) where.alertType = alertType;

    const [items, total] = await this.riskAlertRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    this.logger.log(`风险预警列表查询: status=${status || 'all'}, 结果数=${total}`);
    return { items, total };
  }

  /**
   * 确认/处理风险预警
   */
  async updateAlert(
    id: string,
    data: {
      status?: string;
      handlerId?: string;
      handlerRemark?: string;
    },
  ): Promise<RiskAlert> {
    const alert = await this.riskAlertRepository.findOne({ where: { id } });
    if (!alert) {
      throw new Error(`风险预警不存在: ${id}`);
    }

    if (data.status) alert.status = data.status;
    if (data.handlerId) alert.handlerId = data.handlerId;
    if (data.handlerRemark) alert.handlerRemark = data.handlerRemark;

    if (data.status === 'RESOLVED') {
      alert.resolvedAt = new Date();
    }

    const saved = await this.riskAlertRepository.save(alert);
    this.logger.log(`风险预警更新: ${id}, 状态=${saved.status}`);
    return saved;
  }
}