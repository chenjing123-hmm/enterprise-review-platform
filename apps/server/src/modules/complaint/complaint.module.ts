import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintTicket } from './complaint-ticket.entity';
import { ComplaintMaterial } from './complaint-material.entity';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';

/**
 * 投诉模块 - 企业投诉工单系统
 * 提供公开投诉提交、工单状态查询、管理员处理工单
 * 支持24小时处理倒计时，超时自动创建风险预警
 */
@Module({
  imports: [TypeOrmModule.forFeature([ComplaintTicket, ComplaintMaterial])],
  controllers: [ComplaintController],
  providers: [ComplaintService],
  exports: [ComplaintService, TypeOrmModule],
})
export class ComplaintModule {}