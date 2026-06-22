import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 企业实体（company）
 * 存储企业基本信息、评分统计、搜索全文索引
 * 注意：不包含评分排序（rating），仅支持按字母和时间排序
 */
@Entity('companies')
export class Company {
  /** 企业唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 企业全称 */
  @Column({ type: 'varchar', length: 200, comment: '企业全称' })
  @Index({ fulltext: true })
  name: string;

  /** 企业简称 */
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '企业简称' })
  shortName: string;

  /** URL友好的标识符（用于SEO友好链接） */
  @Column({ type: 'varchar', length: 200, unique: true, comment: 'URL标识符' })
  @Index()
  slug: string;

  /** 统一社会信用代码 */
  @Column({ type: 'varchar', length: 18, unique: true, comment: '统一社会信用代码' })
  @Index()
  creditCode: string;

  /** 所属行业 */
  @Column({ type: 'varchar', length: 100, comment: '所属行业' })
  @Index()
  industry: string;

  /** 企业规模 */
  @Column({ type: 'varchar', length: 50, comment: '企业规模（如：50-200人、1000-5000人）' })
  scale: string;

  /** 企业 Logo 地址 */
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '企业Logo地址' })
  logo: string;

  /** 企业官网 */
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '企业官网' })
  website: string;

  /** 企业简介 */
  @Column({ type: 'text', nullable: true, comment: '企业简介' })
  description: string;

  /** 企业地址 */
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '企业地址' })
  address: string;

  /** 所在城市 */
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '所在城市' })
  @Index()
  city: string;

  /** 所在省份 */
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '所在省份' })
  province: string;

  /** 成立日期 */
  @Column({ type: 'date', nullable: true, comment: '成立日期' })
  establishedDate: string;

  /** 综合评分（所有点评的加权平均值） */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, comment: '综合评分' })
  avgRating: number;

  /** 点评总数 */
  @Column({ type: 'int', default: 0, comment: '点评总数' })
  reviewCount: number;

  /** 薪资福利评分 */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, comment: '薪资福利评分' })
  salaryRating: number;

  /** 工作环境评分 */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, comment: '工作环境评分' })
  environmentRating: number;

  /** 发展前景评分 */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, comment: '发展前景评分' })
  growthRating: number;

  /** 管理风格评分 */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, comment: '管理风格评分' })
  managementRating: number;

  /** 工作生活平衡评分 */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, comment: '工作生活平衡评分' })
  workLifeBalanceRating: number;

  /** 审核状态 */
  @Column({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', comment: '审核状态' })
  auditStatus: string;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}