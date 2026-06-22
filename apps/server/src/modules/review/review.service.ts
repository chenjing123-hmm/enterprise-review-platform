import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { ReviewEvidence } from './review-evidence.entity';
import { CompanyService } from '../company/company.service';
import { CreateReviewDTO, ReviewResponse } from '@erp/shared';

/**
 * 点评服务
 * 负责点评 CRUD、强制字段验证、合规检查
 * 注意：
 *  - 仅返回 PUBLISHED + APPROVED 状态的点评
 *  - 仅按 created_at DESC 排序，不使用加权排序
 *  - 创建前必须通过 RealNameGuard 实名认证
 */
@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewEvidence)
    private readonly evidenceRepository: Repository<ReviewEvidence>,
    private readonly companyService: CompanyService,
  ) {}

  /**
   * 创建点评（含强制字段验证和合规检查）
   * 必填字段：jobTitle, startDate, endDate, employmentType, content(>=50字符), evidenceIds(>=1), agreementAccepted(true)
   *
   * @param userId 当前用户ID
   * @param userNickname 用户昵称
   * @param companyId 企业ID
   * @param dto 创建点评 DTO
   * @returns 创建成功的点评
   */
  async create(
    userId: string,
    userNickname: string,
    companyId: string,
    dto: CreateReviewDTO,
  ): Promise<ReviewResponse> {
    // ─── 强制字段验证 ───
    this.validateCreateDTO(dto);

    // ─── 验证企业存在 ───
    const company = await this.companyService.findById(companyId);
    if (!company) {
      throw new NotFoundException('企业不存在');
    }

    // ─── 验证证明材料存在 ───
    const evidenceCount = await this.evidenceRepository.count({
      where: dto.evidenceIds.map((id) => ({ id, userId })),
    });
    if (evidenceCount < dto.evidenceIds.length) {
      throw new BadRequestException('证明材料不存在或不属于当前用户');
    }

    // ─── 创建点评 ───
    const review = this.reviewRepository.create({
      companyId,
      userId,
      userNickname,
      jobTitle: dto.jobTitle,
      startDate: dto.startDate,
      endDate: dto.endDate || '',
      employmentType: dto.employmentType,
      content: dto.content,
      overallRating: dto.rating.overall,
      salaryRating: dto.rating.salary,
      environmentRating: dto.rating.environment,
      growthRating: dto.rating.growth,
      managementRating: dto.rating.management,
      workLifeBalanceRating: dto.rating.workLifeBalance,
      evidenceIds: dto.evidenceIds,
      agreementAccepted: dto.agreementAccepted,
      auditStatus: 'PENDING',
      publishStatus: 'DRAFT',
    } as any);

    const saved = await this.reviewRepository.save(review as any) as Review;
    this.logger.log(`点评创建成功: userId=${userId}, companyId=${companyId}, reviewId=${saved.id}`);

    return this.toResponse(saved);
  }

  /**
   * 获取当前用户的点评列表
   * 仅返回 PUBLISHED + APPROVED 状态的点评，按 created_at DESC 排序
   *
   * @param userId 当前用户ID
   * @param page 页码
   * @param pageSize 每页条数
   */
  async getMyReviews(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ items: ReviewResponse[]; total: number }> {
    const [items, total] = await this.reviewRepository.findAndCount({
      where: {
        userId,
        publishStatus: 'PUBLISHED',
        auditStatus: 'APPROVED',
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    this.logger.log(`用户点评查询: userId=${userId}, 结果数=${total}`);
    return {
      items: items.map((r) => this.toResponse(r)),
      total,
    };
  }

  /**
   * 根据 ID 获取点评详情
   * 仅返回 PUBLISHED + APPROVED 状态的点评
   *
   * @param id 点评ID
   */
  async findById(id: string): Promise<ReviewResponse> {
    const review = await this.reviewRepository.findOne({
      where: {
        id,
        publishStatus: 'PUBLISHED',
        auditStatus: 'APPROVED',
      },
    });

    if (!review) {
      throw new NotFoundException('点评不存在或未发布');
    }

    return this.toResponse(review);
  }

  /**
   * 获取企业下的点评列表（公开查询）
   * 仅返回 PUBLISHED + APPROVED 状态，按 created_at DESC 排序
   */
  async getByCompanyId(
    companyId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ items: ReviewResponse[]; total: number }> {
    const [items, total] = await this.reviewRepository.findAndCount({
      where: {
        companyId,
        publishStatus: 'PUBLISHED',
        auditStatus: 'APPROVED',
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map((r) => this.toResponse(r)),
      total,
    };
  }

  /**
   * 更新点评审核状态（由审核模块调用）
   */
  async updateAuditStatus(
    reviewId: string,
    auditStatus: string,
    publishStatus: string,
    auditRemark?: string,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('点评不存在');
    }

    review.auditStatus = auditStatus;
    review.publishStatus = publishStatus;
    if (auditRemark) {
      review.auditRemark = auditRemark;
    }

    const saved = await this.reviewRepository.save(review);
    this.logger.log(`点评审核状态更新: reviewId=${reviewId}, status=${auditStatus}/${publishStatus}`);

    // 如果审核通过，更新企业评分统计
    if (auditStatus === 'APPROVED' && publishStatus === 'PUBLISHED') {
      await this.companyService.updateRatingStats(review.companyId, {
        overall: review.overallRating,
        salary: review.salaryRating,
        environment: review.environmentRating,
        growth: review.growthRating,
        management: review.managementRating,
        workLifeBalance: review.workLifeBalanceRating,
      });
    }

    return saved;
  }

  /**
   * 强制字段验证
   * 验证 jobTitle, startDate, endDate, employmentType, content, evidenceIds, agreementAccepted
   */
  private validateCreateDTO(dto: CreateReviewDTO): void {
    // jobTitle 验证
    if (!dto.jobTitle || dto.jobTitle.trim().length < 2 || dto.jobTitle.length > 100) {
      throw new BadRequestException('职位名称不能为空，且长度应在2-100字符之间');
    }

    // startDate 验证
    if (!dto.startDate) {
      throw new BadRequestException('入职日期不能为空');
    }

    // employmentType 验证
    const validTypes = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'OUTSOURCING', 'PROBATION'];
    if (!dto.employmentType || !validTypes.includes(dto.employmentType)) {
      throw new BadRequestException('无效的雇佣类型');
    }

    // content 验证（最少50字符）
    if (!dto.content || dto.content.length < 50) {
      throw new BadRequestException(`点评内容至少需要50个字符，当前${dto.content?.length || 0}个字符`);
    }
    if (dto.content.length > 5000) {
      throw new BadRequestException('点评内容不能超过5000个字符');
    }

    // evidenceIds 验证（至少1个）
    if (!dto.evidenceIds || dto.evidenceIds.length < 1) {
      throw new BadRequestException('至少需要上传1个证明材料');
    }

    // agreementAccepted 验证（必须为true）
    if (dto.agreementAccepted !== true) {
      throw new BadRequestException('必须同意用户协议才能提交点评');
    }

    // rating 验证
    if (!dto.rating) {
      throw new BadRequestException('评分维度不能为空');
    }
    const ratingFields = ['overall', 'salary', 'environment', 'growth', 'management', 'workLifeBalance'];
    for (const field of ratingFields) {
      const val = (dto.rating as any)[field];
      if (val === undefined || val < 1 || val > 5) {
        throw new BadRequestException(`${field}评分必须在1-5之间`);
      }
    }
  }

  /**
   * 转换为响应格式
   */
  private toResponse(review: Review): ReviewResponse {
    return {
      id: review.id,
      companyId: review.companyId,
      companyName: '', // 需要从关联查询获取
      userId: review.userId,
      userNickname: review.userNickname,
      jobTitle: review.jobTitle,
      startDate: review.startDate,
      endDate: review.endDate,
      employmentType: review.employmentType as any,
      content: review.content,
      rating: {
        overall: review.overallRating,
        salary: review.salaryRating,
        environment: review.environmentRating,
        growth: review.growthRating,
        management: review.managementRating,
        workLifeBalance: review.workLifeBalanceRating,
      },
      evidenceIds: review.evidenceIds,
      auditStatus: review.auditStatus as any,
      publishStatus: review.publishStatus as any,
      auditRemark: review.auditRemark,
      likeCount: review.likeCount,
      commentCount: review.commentCount,
      isAnonymous: review.isAnonymous,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }
}