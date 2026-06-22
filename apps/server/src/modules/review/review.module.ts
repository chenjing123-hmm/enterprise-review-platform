import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { ReviewEvidence } from './review-evidence.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { CompanyModule } from '../company/company.module';

/**
 * 点评模块 - 用户点评创建、审核、查询
 * 创建点评需要实名认证（RealNameGuard）
 * 仅返回 PUBLISHED + APPROVED 状态的点评，按 created_at DESC 排序
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewEvidence]),
    CompanyModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService, TypeOrmModule],
})
export class ReviewModule {}