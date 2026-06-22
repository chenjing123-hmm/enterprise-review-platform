import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudicialExport } from './judicial-export.entity';
import { EncryptionService } from '../encryption/encryption.service';

/**
 * 司法导出服务
 * 负责司法数据导出的请求、CEK解密审批、导出执行
 * 流程：上传法院令 → 请求导出 → CEK解密审批 → 执行导出 → 下载文件
 */
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    @InjectRepository(JudicialExport)
    private readonly exportRepository: Repository<JudicialExport>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * 请求司法数据导出
   * 上传法院令，创建导出请求
   *
   * @param params 导出参数（查询条件）
   * @param courtOrderNo 法院令号
   * @param courtOrderFilePath 法院令文件路径
   * @param requesterId 请求人ID
   */
  async requestExport(
    params: any,
    courtOrderNo: string,
    courtOrderFilePath: string,
    requesterId: string,
  ): Promise<JudicialExport> {
    // 检查法院令号是否已存在
    const existing = await this.exportRepository.findOne({
      where: { courtOrderNo },
    });
    if (existing) {
      throw new BadRequestException(`法院令号 ${courtOrderNo} 已存在`);
    }

    const exportRecord = this.exportRepository.create({
      courtOrderNo,
      exportParams: params,
      status: 'PENDING_APPROVAL',
      courtOrderFilePath,
      cekApprovalStatus: 'PENDING',
      requesterId,
    });

    const saved = await this.exportRepository.save(exportRecord);
    this.logger.log(`司法导出请求创建: 法院令号=${courtOrderNo}, 请求人=${requesterId}`);
    return saved;
  }

  /**
   * CEK 解密审批
   * 审批通过后，对加密数据进行解密
   *
   * @param exportId 导出记录ID
   * @param approverId 审批人ID
   * @returns 解密审批结果
   */
  async approveDecryption(
    exportId: string,
    approverId: string,
  ): Promise<JudicialExport> {
    const exportRecord = await this.exportRepository.findOne({
      where: { id: exportId },
    });

    if (!exportRecord) {
      throw new NotFoundException('导出记录不存在');
    }

    if (exportRecord.cekApprovalStatus === 'APPROVED') {
      throw new BadRequestException('CEK解密已审批通过');
    }

    // 调用加密服务创建解密审批
    const approval = await this.encryptionService.createDecryptionApproval(
      exportId,
      exportRecord.courtOrderNo,
    );

    exportRecord.decryptionApprovalId = approval.id;
    exportRecord.cekApprovalStatus = 'APPROVED';
    exportRecord.approverId = approverId;
    exportRecord.approvedAt = new Date();

    const saved = await this.exportRepository.save(exportRecord);
    this.logger.log(`CEK解密审批通过: exportId=${exportId}, 审批人=${approverId}`);
    return saved;
  }

  /**
   * 执行数据导出
   * 查询数据、解密敏感字段、生成导出文件
   *
   * @param exportId 导出记录ID
   */
  async performExport(exportId: string): Promise<JudicialExport> {
    const exportRecord = await this.exportRepository.findOne({
      where: { id: exportId },
    });

    if (!exportRecord) {
      throw new NotFoundException('导出记录不存在');
    }

    if (exportRecord.cekApprovalStatus !== 'APPROVED') {
      throw new BadRequestException('CEK解密尚未审批通过，无法执行导出');
    }

    // 更新状态为导出中
    exportRecord.status = 'EXPORTING';
    await this.exportRepository.save(exportRecord);

    try {
      // 实际导出逻辑：
      // 1. 根据 exportParams 查询数据
      // 2. 使用 encryptionService 解密敏感字段
      // 3. 生成 Excel/CSV 文件
      // 4. 保存到文件系统

      // 桩实现：模拟导出成功
      exportRecord.status = 'COMPLETED';
      exportRecord.exportFilePath = `/exports/judicial-${exportRecord.courtOrderNo}-${Date.now()}.xlsx`;
      exportRecord.exportFileSize = 102400;
      exportRecord.exportCount = 100;
      exportRecord.completedAt = new Date();

      const saved = await this.exportRepository.save(exportRecord);
      this.logger.log(`司法导出完成: exportId=${exportId}, 法院令号=${exportRecord.courtOrderNo}`);
      return saved;
    } catch (error) {
      exportRecord.status = 'FAILED';
      exportRecord.errorMessage = error.message;
      await this.exportRepository.save(exportRecord);
      this.logger.error(`司法导出失败: exportId=${exportId}, error=${error.message}`);
      throw error;
    }
  }

  /**
   * 获取导出记录
   */
  async findById(id: string): Promise<JudicialExport> {
    const record = await this.exportRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('导出记录不存在');
    }
    return record;
  }

  /**
   * 获取导出文件下载路径
   */
  async getDownloadPath(id: string): Promise<{ filePath: string; fileName: string }> {
    const record = await this.findById(id);

    if (record.status !== 'COMPLETED') {
      throw new BadRequestException('导出尚未完成，无法下载');
    }

    return {
      filePath: record.exportFilePath,
      fileName: `司法导出-${record.courtOrderNo}-${record.completedAt?.toISOString().slice(0, 10)}.xlsx`,
    };
  }
}