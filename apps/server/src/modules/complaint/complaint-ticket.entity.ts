import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 投诉工单实体（complaint_ticket）
 * 存储企业投诉工单信息，支持24小时处理倒计时
 * 超时自动创建风险预警
 */
@Entity('complaint_tickets')
@Index(['ticketNo'])
@Index(['status', 'createdAt'])
@Index(['complainantId'])
export class ComplaintTicket {
  /** 投诉工单唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 工单编号（格式：TK-年月日-序号，如 TK-20260122-0001） */
  @Column({ type: 'varchar', length: 20, unique: true, comment: '工单编号' })
  ticketNo: string;

  /** 投诉人用户 ID */
  @Column({ type: 'varchar', length: 36, comment: '投诉人用户ID' })
  complainantId: string;

  /** 投诉人昵称 */
  @Column({ type: 'varchar', length: 50, comment: '投诉人昵称' })
  complainantName: string;

  /** 投诉人联系方式 */
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '投诉人联系方式' })
  complainantContact: string;

  /** 投诉目标类型（review / company） */
  @Column({ type: 'varchar', length: 50, comment: '投诉目标类型' })
  targetType: string;

  /** 投诉目标 ID */
  @Column({ type: 'varchar', length: 36, comment: '投诉目标ID' })
  targetId: string;

  /** 投诉类型 */
  @Column({
    type: 'enum',
    enum: ['FALSE_INFO', 'MALICIOUS_DEFAMATION', 'PERSONAL_ATTACK', 'PRIVACY_LEAK', 'SPAM', 'COPYRIGHT_INFRINGEMENT', 'OTHER'],
    comment: '投诉类型',
  })
  complaintType: string;

  /** 投诉原因描述 */
  @Column({ type: 'text', comment: '投诉原因' })
  reason: string;

  /** 投诉补充说明 */
  @Column({ type: 'text', nullable: true, comment: '补充说明' })
  description: string;

  /** 投诉状态 */
  @Column({
    type: 'enum',
    enum: ['PENDING', 'PROCESSING', 'RESOLVED', 'DISMISSED'],
    default: 'PENDING',
    comment: '投诉状态',
  })
  @Index()
  status: string;

  /** 处理结果说明 */
  @Column({ type: 'text', nullable: true, comment: '处理结果' })
  result: string;

  /** 处理人 ID */
  @Column({ type: 'varchar', length: 36, nullable: true, comment: '处理人ID' })
  handlerId: string;

  /** 处理人名称 */
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '处理人名称' })
  handlerName: string;

  /** 处理截止时间（创建后24小时） */
  @Column({ type: 'datetime', comment: '处理截止时间' })
  deadline: Date;

  /** 是否已超时 */
  @Column({ type: 'boolean', default: false, comment: '是否已超时' })
  isOverdue: boolean;

  /** 是否已创建风险预警 */
  @Column({ type: 'boolean', default: false, comment: '是否已创建风险预警' })
  riskAlertCreated: boolean;

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