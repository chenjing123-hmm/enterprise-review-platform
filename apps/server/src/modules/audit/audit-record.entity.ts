import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 审核记录实体（audit_record）
 * 记录5阶段审核流水线的每一步结果
 * 阶段1: DFA 敏感词扫描
 * 阶段2: 合规性检查
 * 阶段3: OCR 证据检查
 * 阶段4: 风险规则检查
 * 阶段5: 决策路由
 */
@Entity('audit_records')
@Index(['targetType', 'targetId'])
@Index(['auditorId', 'createdAt'])
export class AuditRecord {
  /** 审核记录唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 审核目标类型（review, company, complaint 等） */
  @Column({ type: 'varchar', length: 50, comment: '审核目标类型' })
  targetType: string;

  /** 审核目标 ID */
  @Column({ type: 'varchar', length: 36, comment: '审核目标ID' })
  @Index()
  targetId: string;

  /** 审核目标摘要（JSON格式） */
  @Column({ type: 'json', nullable: true, comment: '审核目标摘要' })
  targetSummary: any;

  /** 当前审核阶段（1-5） */
  @Column({ type: 'tinyint', default: 1, comment: '审核阶段（1-5）' })
  stage: number;

  /** 阶段1: DFA 敏感词扫描结果 */
  @Column({ type: 'json', nullable: true, comment: 'DFA敏感词扫描结果' })
  stage1DfaResult: any;

  /** 阶段2: 合规性检查结果 */
  @Column({ type: 'json', nullable: true, comment: '合规性检查结果' })
  stage2ComplianceResult: any;

  /** 阶段3: OCR 检查结果 */
  @Column({ type: 'json', nullable: true, comment: 'OCR检查结果' })
  stage3OcrResult: any;

  /** 阶段4: 风险规则检查结果 */
  @Column({ type: 'json', nullable: true, comment: '风险规则检查结果' })
  stage4RiskResult: any;

  /** 阶段5: 最终决策结果 */
  @Column({ type: 'json', nullable: true, comment: '最终决策结果' })
  stage5Decision: any;

  /** 审核状态 */
  @Column({ type: 'enum', enum: ['PENDING', 'PASSED', 'FAILED', 'NEED_MODIFY', 'APPROVED', 'REJECTED'], default: 'PENDING', comment: '审核状态' })
  @Index()
  status: string;

  /** 审核结果 */
  @Column({ type: 'enum', enum: ['APPROVE', 'REJECT', 'NEED_MODIFY'], nullable: true, comment: '审核结果' })
  action: string;

  /** 审核备注 */
  @Column({ type: 'text', nullable: true, comment: '审核备注' })
  remark: string;

  /** 驳回原因 */
  @Column({ type: 'text', nullable: true, comment: '驳回原因' })
  rejectReason: string;

  /** 审核前状态 */
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '审核前状态' })
  previousStatus: string;

  /** 审核后状态 */
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '审核后状态' })
  newStatus: string;

  /** 审核人 ID */
  @Column({ type: 'varchar', length: 36, nullable: true, comment: '审核人ID' })
  auditorId: string;

  /** 审核人名称 */
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '审核人名称' })
  auditorName: string;

  /** 优先级（数字越大越优先） */
  @Column({ type: 'int', default: 0, comment: '优先级' })
  priority: number;

  /** 进入队列时间 */
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', comment: '进入队列时间' })
  queuedAt: Date;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  @Index()
  createdAt: Date;
}