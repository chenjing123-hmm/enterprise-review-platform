import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 风险预警实体（risk_alert）
 * 存储系统自动检测到的风险预警信息
 * 支持批量刷评、恶意差评、同IP操作、异常行为模式等风险类型
 */
@Entity('risk_alerts')
@Index(['alertType', 'status'])
@Index(['createdAt'])
export class RiskAlert {
  /** 风险预警唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 预警类型 */
  @Column({
    type: 'enum',
    enum: ['BATCH_REVIEW', 'MASS_NEGATIVE', 'SAME_IP', 'ABNORMAL_PATTERN', 'COMPLAINT_OVERDUE', 'OTHER'],
    comment: '预警类型',
  })
  @Index()
  alertType: string;

  /** 预警级别 */
  @Column({
    type: 'enum',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
    comment: '预警级别',
  })
  severity: string;

  /** 预警标题 */
  @Column({ type: 'varchar', length: 200, comment: '预警标题' })
  title: string;

  /** 预警详情 */
  @Column({ type: 'text', comment: '预警详情' })
  description: string;

  /** 关联用户 ID */
  @Column({ type: 'varchar', length: 36, nullable: true, comment: '关联用户ID' })
  userId: string;

  /** 关联企业 ID */
  @Column({ type: 'varchar', length: 36, nullable: true, comment: '关联企业ID' })
  companyId: string;

  /** 关联 IP 地址 */
  @Column({ type: 'varchar', length: 45, nullable: true, comment: '关联IP地址' })
  ipAddress: string;

  /** 预警状态 */
  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'],
    default: 'ACTIVE',
    comment: '预警状态',
  })
  @Index()
  status: string;

  /** 处理人 ID */
  @Column({ type: 'varchar', length: 36, nullable: true, comment: '处理人ID' })
  handlerId: string;

  /** 处理备注 */
  @Column({ type: 'text', nullable: true, comment: '处理备注' })
  handlerRemark: string;

  /** 额外数据（JSON格式，存储风险检测的详细数据） */
  @Column({ type: 'json', nullable: true, comment: '额外数据' })
  extraData: any;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  /** 处理时间 */
  @Column({ type: 'datetime', nullable: true, comment: '处理时间' })
  resolvedAt: Date;
}