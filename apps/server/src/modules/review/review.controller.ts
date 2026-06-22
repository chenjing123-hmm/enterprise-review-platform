import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RealNameGuard } from '../../common/guards/real-name.guard';
import { CreateReviewDTO, ReviewResponse, RequestUser } from '@erp/shared';

/**
 * 点评控制器
 * 提供点评创建、查询接口
 * 创建点评需要实名认证（RealNameGuard）
 * 所有接口需要 JWT 认证
 */
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  private readonly logger = new Logger(ReviewController.name);

  constructor(private readonly reviewService: ReviewService) {}

  /**
   * POST /api/reviews
   * 创建点评（需要实名认证）
   * Body: CreateReviewDTO
   * 强制验证：jobTitle, startDate, endDate, employmentType, content(>=50字), evidenceIds(>=1), agreementAccepted(true)
   * 创建前通过 RealNameGuard 检查实名认证状态
   */
  @Post()
  @UseGuards(RealNameGuard)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateReviewDTO & { companyId: string },
  ): Promise<ReviewResponse> {
    this.logger.log(`创建点评请求: userId=${user.userId}, companyId=${body.companyId}`);
    return this.reviewService.create(
      user.userId,
      user.userId, // 昵称需要从用户服务获取，此处暂用 userId
      body.companyId,
      body,
    );
  }

  /**
   * GET /api/reviews/my
   * 获取当前用户的点评列表
   * 仅返回 PUBLISHED + APPROVED 状态，按 created_at DESC 排序
   */
  @Get('my')
  async getMyReviews(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{ items: ReviewResponse[]; total: number }> {
    this.logger.log(`获取用户点评列表: userId=${user.userId}`);
    return this.reviewService.getMyReviews(
      user.userId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  /**
   * GET /api/reviews/:id
   * 获取点评详情
   * 仅返回 PUBLISHED + APPROVED 状态
   */
  @Get(':id')
  async getById(@Param('id') id: string): Promise<ReviewResponse> {
    this.logger.log(`获取点评详情: id=${id}`);
    return this.reviewService.findById(id);
  }
}