import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 司法导出实体（judicial_export）
 * 记录司法数据导出请求，包含法院令号、CEK解密审批、导出状态等
 */
@Entity('judicial_exports')
@Index(['courtOrderNo'])
@Index(['status', 'createdAt'])
export class JudicialExport {
  /** 导出记录唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 法院令号 */
  @Column({ type: 'varchar', length: 100, unique: true, comment: '法院令号' })
  courtOrderNo: string;

  /** 导出参数（JSON格式，包含查询条件） */
  @Column({ type: 'json', comment: '导出参数' })
  exportParams: any;

  /** 导出状态 */
  @Column({
    type: 'enum',
    enum: ['PENDING_APPROVAL', 'APPROVED', 'EXPORTING', 'COMPLETED', 'FAILED', 'EXPIRED'],
    default: 'PENDING_APPROVAL',
    comment: '导出状态',
  })
  @Index()
  status: string;

  /** 法院令文件路径 */
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '法院令文件路径' })
  courtOrderFilePath: string;

  /** 解密审批 ID */
  @Column({ type: 'varchar', length: 36, nullable: true, comment: '解密审批ID' })
  decryptionApprovalId: string;

  /** CEK 解密审批状态 */
  @Column({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', comment: 'CEK解密审批状态' })
  cekApprovalStatus: string;

  /** 导出文件路径 */
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '导出文件路径' })
  exportFilePath: string;

  /** 导出文件大小（字节） */
  @Column({ type: 'int', nullable: true, comment: '导出文件大小' })
  exportFileSize: number;

  /** 导出数据条数 */
  @Column({ type: 'int', nullable: true, comment: '导出数据条数' })
  exportCount: number;

  /** 请求人 ID */
  @Column({ type: 'varchar', length: 36, comment: '请求人ID' })
  requesterId: string;

  /** 审批人 ID */
  @Column({ type: 'varchar', length: 36, nullable: true, comment: '审批人ID' })
  approverId: string;

  /** 审批备注 */
  @Column({ type: 'text', nullable: true, comment: '审批备注' })
  approvalRemark: string;

  /** 导出失败原因 */
  @Column({ type: 'text', nullable: true, comment: '导出失败原因' })
  errorMessage: string;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 审批时间 */
  @Column({ type: 'datetime', nullable: true, comment: '审批时间' })
  approvedAt: Date;

  /** 导出完成时间 */
  @Column({ type: 'datetime', nullable: true, comment: '导出完成时间' })
  completedAt: Date;
}