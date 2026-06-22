import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../company/company.entity';
import { Review } from '../review/review.entity';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

/**
 * 种子数据模块 - 企业数据和点评数据批量导入
 * 从 CSV 文件读取数据，去重后以 PENDING 状态导入
 * 需要 SUPER_ADMIN 角色
 */
@Module({
  imports: [TypeOrmModule.forFeature([Company, Review])],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}