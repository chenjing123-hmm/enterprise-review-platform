import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * 文件上传结果
 */
export interface UploadResult {
  /** 文件唯一标识 */
  id: string;
  /** 原始文件名 */
  originalName: string;
  /** 存储文件名 */
  storedName: string;
  /** 存储路径 */
  filePath: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** MIME类型 */
  mimeType: string;
  /** 文件类型 */
  fileType: 'image' | 'pdf' | 'other';
  /** 上传时间 */
  uploadedAt: string;
  /** EXIF检查结果 */
  exifCheck?: {
    passed: boolean;
    hasSensitiveData: boolean;
    issues: string[];
  };
}

/**
 * 文件上传服务
 * 负责文件上传、类型校验、大小校验、EXIF 敏感数据检查
 * 支持的文件类型：jpg/png/pdf
 * 最大文件大小：10MB
 */
@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ];
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    // 上传目录
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 上传文件
   * @param file Multer 文件对象
   * @param type 上传类型（evidence / complaint-material）
   * @returns 上传结果
   */
  async uploadFile(file: Express.Multer.File, type: 'evidence' | 'complaint-material'): Promise<UploadResult> {
    // 1. 验证文件类型
    this.validateFileType(file);

    // 2. 验证文件大小
    this.validateFileSize(file);

    // 3. 检查 EXIF 敏感数据
    const exifCheck = await this.checkExifData(file);

    // 4. 生成存储文件名
    const ext = path.extname(file.originalname).toLowerCase();
    const storedName = `${uuidv4()}${ext}`;

    // 5. 按类型分目录存储
    const typeDir = path.join(this.uploadDir, type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    const filePath = path.join(typeDir, storedName);

    // 6. 保存文件
    fs.writeFileSync(filePath, file.buffer);

    const fileType = this.getFileType(file.mimetype);

    const result: UploadResult = {
      id: uuidv4(),
      originalName: file.originalname,
      storedName,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileType,
      uploadedAt: new Date().toISOString(),
      exifCheck: exifCheck.passed ? undefined : {
        passed: false,
        hasSensitiveData: exifCheck.issues.length > 0,
        issues: exifCheck.issues,
      },
    };

    this.logger.log(`文件上传成功: ${file.originalname} -> ${storedName}, 类型=${type}, 大小=${file.size}`);
    return result;
  }

  /**
   * 验证文件类型
   * 仅允许 jpg/png/pdf
   */
  private validateFileType(file: Express.Multer.File): void {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!this.allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `不支持的文件类型: ${ext}，仅支持 ${this.allowedExtensions.join(', ')}`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `不支持的文件MIME类型: ${file.mimetype}`,
      );
    }
  }

  /**
   * 验证文件大小
   * 最大 10MB
   */
  private validateFileSize(file: Express.Multer.File): void {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB，最大允许 10MB`,
      );
    }

    if (file.size === 0) {
      throw new BadRequestException('文件为空，请重新上传');
    }
  }

  /**
   * 检查 EXIF 敏感数据
   * 检查图片文件是否包含 GPS 坐标、相机序列号等敏感 EXIF 信息
   */
  private async checkExifData(file: Express.Multer.File): Promise<{
    passed: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    const ext = path.extname(file.originalname).toLowerCase();

    // 仅对图片文件进行 EXIF 检查
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return { passed: true, issues: [] };
    }

    try {
      const buffer = file.buffer;

      // 检查 JPEG 文件是否包含 EXIF 数据
      if (ext === '.jpg' || ext === '.jpeg') {
        // 搜索 EXIF IFD 标记
        const exifMarker = buffer.indexOf(Buffer.from('Exif\x00\x00'));
        if (exifMarker > 0) {
          // 检查 GPS 信息标记（GPS IFD 标记: 0x8825）
          const gpsMarker = buffer.indexOf(Buffer.from([0x88, 0x25]));
          if (gpsMarker > 0) {
            issues.push('图片包含 GPS 地理位置信息，建议移除后再上传');
          }

          // 检查相机序列号标记
          const serialMarker = buffer.indexOf(Buffer.from('SerialNumber'));
          if (serialMarker > 0) {
            issues.push('图片包含相机序列号信息');
          }
        }
      }
    } catch (error) {
      this.logger.error(`EXIF 检查失败: ${error.message}`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  /**
   * 获取文件类型
   */
  private getFileType(mimeType: string): 'image' | 'pdf' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'other';
  }
}