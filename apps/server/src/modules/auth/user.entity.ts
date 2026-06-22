import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 用户实体（user）
 * 存储用户基本信息，敏感字段使用 AES-256-CBC 加密
 */
@Entity('users')
export class User {
  /** 用户唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 手机号码（SHA256 哈希） */
  @Column({ type: 'varchar', length: 64, unique: true, comment: '手机号哈希' })
  @Index()
  phone: string;

  /** 密码哈希 */
  @Column({ type: 'varchar', length: 255, comment: '密码哈希' })
  passwordHash: string;

  /** 真实姓名（AES-256-CBC 加密） */
  @Column({ type: 'text', nullable: true, comment: '真实姓名（加密）' })
  realName: string;

  /** 身份证号码（AES-256-CBC 加密） */
  @Column({ type: 'text', nullable: true, comment: '身份证号（加密）' })
  idCardNumber: string;

  /** 昵称 */
  @Column({ type: 'varchar', length: 50, comment: '昵称' })
  nickname: string;

  /** 实名认证状态 */
  @Column({
    type: 'enum',
    enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'],
    default: 'UNVERIFIED',
    comment: '实名认证状态',
  })
  realNameVerified: boolean;

  /** 用户角色 */
  @Column({ type: 'varchar', length: 20, default: 'USER', comment: '用户角色' })
  role: string;

  /** 用户状态 */
  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'BANNED', 'DELETED'],
    default: 'ACTIVE',
    comment: '用户状态',
  })
  status: string;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}