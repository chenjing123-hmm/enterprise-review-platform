import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditRecord } from './audit-record.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { ReviewModule } from '../review/review.module';
import { SensitiveWordModule } from '../sensitive-word/sensitive-word.module';

/**
 * 审核模块 - 5阶段审核流水线
 * 阶段1: DFA敏感词扫描 → 阶段2: 合规性检查 → 阶段3: OCR证据检查
 * → 阶段4: 风险规则检查 → 阶段5: 决策路由
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditRecord]),
    ReviewModule,
    SensitiveWordModule,
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService, TypeOrmModule],
})
export class AuditModule {}