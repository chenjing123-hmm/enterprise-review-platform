import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../company/company.entity';

/**
 * 点评实体（review）
 * 存储用户对企业的点评信息，包含评分维度、雇佣类型、审核状态等
 * 支持强制字段验证：jobTitle, startDate, endDate, employmentType, content(>=50字)
 * 审核状态：PENDING → APPROVED / REJECTED
 * 发布状态：DRAFT → PUBLISHED / HIDDEN / DELETED
 */
@Entity('reviews')
@Index(['companyId', 'publishStatus', 'auditStatus'])
@Index(['userId', 'createdAt'])
export class Review {
  /** 点评唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 所属企业 ID */
  @Column({ type: 'varchar', length: 36, comment: '所属企业ID' })
  @Index()
  companyId: string;

  /** 所属企业（关联） */
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  /** 发布用户 ID */
  @Column({ type: 'varchar', length: 36, comment: '发布用户ID' })
  @Index()
  userId: string;

  /** 发布用户昵称（脱敏后存储） */
  @Column({ type: 'varchar', length: 50, comment: '用户昵称（脱敏）' })
  userNickname: string;

  /** 职位名称（必填，2-100字符） */
  @Column({ type: 'varchar', length: 100, comment: '职位名称' })
  jobTitle: string;

  /** 入职日期（必填，ISO日期格式） */
  @Column({ type: 'date', comment: '入职日期' })
  startDate: string;

  /** 离职日期（可为空，表示至今在职） */
  @Column({ type: 'varchar', length: 7, nullable: true, comment: '离职日期' })
  endDate: string | null;

  /** 雇佣类型（必填） */
  @Column({
    type: 'enum',
    enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'OUTSOURCING', 'PROBATION'],
    comment: '雇佣类型',
  })
  employmentType: string;

  /** 点评内容（必填，最少50字符） */
  @Column({ type: 'text', comment: '点评内容' })
  content: string;

  /** 综合评分 (1-5) */
  @Column({ type: 'decimal', precision: 2, scale: 1, comment: '综合评分' })
  overallRating: number;

  /** 薪资福利评分 (1-5) */
  @Column({ type: 'decimal', precision: 2, scale: 1, comment: '薪资福利评分' })
  salaryRating: number;

  /** 工作环境评分 (1-5) */
  @Column({ type: 'decimal', precision: 2, scale: 1, comment: '工作环境评分' })
  environmentRating: number;

  /** 发展前景评分 (1-5) */
  @Column({ type: 'decimal', precision: 2, scale: 1, comment: '发展前景评分' })
  growthRating: number;

  /** 管理风格评分 (1-5) */
  @Column({ type: 'decimal', precision: 2, scale: 1, comment: '管理风格评分' })
  managementRating: number;

  /** 工作生活平衡评分 (1-5) */
  @Column({ type: 'decimal', precision: 2, scale: 1, comment: '工作生活平衡评分' })
  workLifeBalanceRating: number;

  /** 证明材料 ID 列表（JSON数组，至少1个） */
  @Column({ type: 'json', comment: '证明材料ID列表' })
  evidenceIds: string[];

  /** 是否同意用户协议（必须为true） */
  @Column({ type: 'boolean', default: true, comment: '是否同意用户协议' })
  agreementAccepted: boolean;

  /** 审核状态 */
  @Column({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', comment: '审核状态' })
  @Index()
  auditStatus: string;

  /** 发布状态 */
  @Column({ type: 'enum', enum: ['DRAFT', 'PUBLISHED', 'HIDDEN', 'DELETED'], default: 'DRAFT', comment: '发布状态' })
  @Index()
  publishStatus: string;

  /** 审核备注 */
  @Column({ type: 'text', nullable: true, comment: '审核备注' })
  auditRemark: string;

  /** 点赞数 */
  @Column({ type: 'int', default: 0, comment: '点赞数' })
  likeCount: number;

  /** 评论数 */
  @Column({ type: 'int', default: 0, comment: '评论数' })
  commentCount: number;

  /** 是否匿名 */
  @Column({ type: 'boolean', default: false, comment: '是否匿名' })
  isAnonymous: boolean;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  @Index()
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}