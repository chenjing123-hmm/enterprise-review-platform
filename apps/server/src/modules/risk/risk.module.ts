import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskAlert } from './risk-alert.entity';
import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';

/**
 * 风险预警模块 - 风险检测、预警创建、预警处理
 * 支持批量刷评、恶意差评、同IP操作、异常行为模式检测
 */
@Module({
  imports: [TypeOrmModule.forFeature([RiskAlert])],
  controllers: [RiskController],
  providers: [RiskService],
  exports: [RiskService, TypeOrmModule],
})
export class RiskModule {}