import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DataRetentionService } from './data-retention.service';
import { DataRetentionController } from './data-retention.controller';

/**
 * 数据保留模块 - 数据保留策略、过期数据匿名化、日志归档、用户删除
 * 包含定时任务：每天凌晨2:00执行数据保留策略检查
 * 用户删除支持7天冷静期
 */
@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [DataRetentionController],
  providers: [DataRetentionService],
  exports: [DataRetentionService],
})
export class DataRetentionModule {}