import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ComplaintTicket } from './complaint-ticket.entity';

/**
 * 投诉材料实体（complaint_material）
 * 存储投诉工单的证明材料（图片、文件等）
 */
@Entity('complaint_materials')
export class ComplaintMaterial {
  /** 材料唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 关联的投诉工单 ID */
  @Column({ type: 'varchar', length: 36, comment: '关联投诉工单ID' })
  @Index()
  ticketId: string;

  /** 关联的投诉工单 */
  @ManyToOne(() => ComplaintTicket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket: ComplaintTicket;

  /** 文件类型 */
  @Column({ type: 'enum', enum: ['image', 'pdf', 'other'], comment: '文件类型' })
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

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}