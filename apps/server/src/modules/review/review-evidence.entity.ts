import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Review } from './review.entity';

/**
 * 点评证明材料实体（review-evidence）
 * 存储点评上传的证明材料信息（工作证明、工牌、工资单等）
 */
@Entity('review_evidences')
export class ReviewEvidence {
  /** 证明材料唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 关联的点评 ID */
  @Column({ type: 'varchar', length: 36, comment: '关联点评ID' })
  @Index()
  reviewId: string;

  /** 关联的点评 */
  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  /** 上传用户 ID */
  @Column({ type: 'varchar', length: 36, comment: '上传用户ID' })
  @Index()
  userId: string;

  /** 文件类型 */
  @Column({ type: 'enum', enum: ['image', 'pdf'], comment: '文件类型' })
  fileType: string;

  /** 原始文件名 */
  @Column({ type: 'varchar', length: 255, comment: '原始文件名' })
  originalName: string;

  /** 存储路径 */
  @Column({ type: 'varchar', length: 500, comment: '存储路径' })
  filePath: string;

  /** 文件大小（字节） */
  @Column({ type: 'int', comment: '文件大小（字节）' })
  fileSize: number;

  /** MIME类型 */
  @Column({ type: 'varchar', length: 100, comment: 'MIME类型' })
  mimeType: string;

  /** OCR 识别状态 */
  @Column({ type: 'enum', enum: ['PENDING', 'PASSED', 'FAILED'], default: 'PENDING', comment: 'OCR识别状态' })
  ocrStatus: string;

  /** OCR 识别结果（JSON） */
  @Column({ type: 'json', nullable: true, comment: 'OCR识别结果' })
  ocrResult: any;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}