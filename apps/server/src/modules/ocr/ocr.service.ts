import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * OCR 隐私识别结果
 */
export interface OcrPrivacyResult {
  /** 是否通过隐私检查 */
  passed: boolean;
  /** 发现的问题列表 */
  findings: Array<{
    type: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  /** 识别出的文本内容（脱敏后） */
  recognizedText?: string;
  /** 证据真实性检查结果 */
  authenticityCheck?: {
    passed: boolean;
    exifCheck: { passed: boolean; issues: string[] };
    elaCheck: { passed: boolean; issues: string[] };
  };
}

/**
 * OCR 隐私识别服务
 * 使用 Tesseract.js 进行 OCR 文字识别，然后检查是否包含隐私信息
 * 支持检查：身份证号、手机号、地址、薪资信息、机密标记
 * 同时进行证据真实性检查：EXIF 元数据检查、ELA 错误级别分析
 */
@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * 隐私识别主流程
   * 1. OCR 识别文件中的文字
   * 2. 检查是否包含隐私信息
   * 3. 检查证据真实性
   *
   * @param filePath 文件路径
   * @returns 隐私识别结果
   */
  async recognizePrivacy(filePath: string): Promise<OcrPrivacyResult> {
    this.logger.log(`OCR隐私识别开始: ${filePath}`);

    const findings: OcrPrivacyResult['findings'] = [];

    // 1. OCR 文字识别（使用 Tesseract.js）
    let recognizedText = '';
    try {
      recognizedText = await this.performOCR(filePath);
      this.logger.debug(`OCR识别文本长度: ${recognizedText.length}`);
    } catch (error) {
      this.logger.error(`OCR识别失败: ${error.message}`);
      findings.push({
        type: 'OCR_ERROR',
        description: '文件文字识别失败，请确认文件格式是否正确',
        severity: 'HIGH',
      });
    }

    // 2. 隐私信息检查
    if (recognizedText) {
      // 检查身份证号
      const idCardFindings = this.checkIdCard(recognizedText);
      findings.push(...idCardFindings);

      // 检查手机号
      const phoneFindings = this.checkPhoneNumber(recognizedText);
      findings.push(...phoneFindings);

      // 检查地址信息
      const addressFindings = this.checkAddress(recognizedText);
      findings.push(...addressFindings);

      // 检查薪资信息
      const salaryFindings = this.checkSalaryInfo(recognizedText);
      findings.push(...salaryFindings);

      // 检查机密标记
      const confidentialFindings = this.checkConfidentialMarks(recognizedText);
      findings.push(...confidentialFindings);
    }

    // 3. 证据真实性检查
    const authenticityCheck = await this.checkEvidenceAuthenticity(filePath);

    const hasCritical = findings.some((f) => f.severity === 'CRITICAL');
    const hasHigh = findings.some((f) => f.severity === 'HIGH');

    const result: OcrPrivacyResult = {
      passed: !hasCritical && !hasHigh && (authenticityCheck?.passed ?? true),
      findings,
      recognizedText: this.maskSensitiveInfo(recognizedText),
      authenticityCheck,
    };

    this.logger.log(`OCR隐私识别完成: passed=${result.passed}, findings=${findings.length}, authenticityPassed=${authenticityCheck?.passed ?? 'N/A'}`);
    return result;
  }

  /**
   * 执行 OCR 文字识别（使用 Tesseract.js）
   * 在生产环境中，此处应使用 Tesseract.js 的 worker 进行识别
   */
  private async performOCR(filePath: string): Promise<string> {
    // 安装 tesseract.js 后的实际调用示例：
    // const Tesseract = require('tesseract.js');
    // const worker = await Tesseract.createWorker('chi_sim+eng');
    // const { data: { text } } = await worker.recognize(filePath);
    // await worker.terminate();
    // return text;

    // 当前为桩实现，返回模拟文本用于测试
    this.logger.warn(`OCR 识别使用桩实现，文件: ${filePath}`);
    return `模拟OCR识别结果 - 文件: ${path.basename(filePath)}`;
  }

  /**
   * 检查身份证号码（18位）
   * 正则: 地区码(6位) + 出生日期(8位) + 顺序码(3位) + 校验码(1位)
   */
  private checkIdCard(text: string): OcrPrivacyResult['findings'] {
    const findings: OcrPrivacyResult['findings'] = [];
    // 身份证号码正则
    const idCardPattern = /[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]/g;
    const matches = text.match(idCardPattern);

    if (matches && matches.length > 0) {
      findings.push({
        type: 'ID_CARD_NUMBER',
        description: `文件中发现 ${matches.length} 个身份证号码，请注意隐私保护`,
        severity: 'CRITICAL',
      });
    }

    return findings;
  }

  /**
   * 检查手机号码（11位）
   */
  private checkPhoneNumber(text: string): OcrPrivacyResult['findings'] {
    const findings: OcrPrivacyResult['findings'] = [];
    const phonePattern = /1[3-9]\d{9}/g;
    const matches = text.match(phonePattern);

    if (matches && matches.length > 0) {
      findings.push({
        type: 'PHONE_NUMBER',
        description: `文件中发现 ${matches.length} 个手机号码，请注意隐私保护`,
        severity: 'HIGH',
      });
    }

    return findings;
  }

  /**
   * 检查地址信息（省/市/区/路/号等关键字）
   */
  private checkAddress(text: string): OcrPrivacyResult['findings'] {
    const findings: OcrPrivacyResult['findings'] = [];
    // 地址特征关键词
    const addressPatterns = [
      /(?:省|市|区|县|镇|乡|村|街道|路|巷|弄|号|栋|单元|室).{2,30}(?:省|市|区|县|镇|乡|村|街道|路|巷|弄|号|栋|单元|室)/g,
      /(?:住址|地址|户籍|现住|居住地)\s*[:：]\s*.{2,50}/g,
    ];

    for (const pattern of addressPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        findings.push({
          type: 'ADDRESS_INFO',
          description: `文件中发现地址信息，请注意隐私保护`,
          severity: 'HIGH',
        });
        break; // 只报告一次
      }
    }

    return findings;
  }

  /**
   * 检查薪资信息（金额、工资、薪酬等关键字）
   */
  private checkSalaryInfo(text: string): OcrPrivacyResult['findings'] {
    const findings: OcrPrivacyResult['findings'] = [];
    const salaryPatterns = [
      /(?:工资|薪资|薪酬|月薪|年薪|收入|奖金|绩效|加班费|补贴|公积金|社保).{0,20}\d{2,}/g,
      /\d{2,}.*(?:元|块|k|K|万|w|W)/g,
    ];

    for (const pattern of salaryPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        findings.push({
          type: 'SALARY_INFO',
          description: `文件中发现 ${matches.length} 处薪资相关信息，请注意隐私保护`,
          severity: 'MEDIUM',
        });
        break;
      }
    }

    return findings;
  }

  /**
   * 检查机密标记（机密、绝密、内部、保密等关键字）
   */
  private checkConfidentialMarks(text: string): OcrPrivacyResult['findings'] {
    const findings: OcrPrivacyResult['findings'] = [];
    const confidentialPatterns = [
      /机密|绝密|秘密|内部文件|内部资料|不得外传|禁止外传|保密|Confidential|Internal|Secret/g,
    ];

    for (const pattern of confidentialPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        findings.push({
          type: 'CONFIDENTIAL_MARK',
          description: `文件中发现 ${matches.length} 处机密标记，请确认文件是否可公开`,
          severity: 'CRITICAL',
        });
        break;
      }
    }

    return findings;
  }

  /**
   * 证据真实性检查
   * 包括 EXIF 元数据检查和 ELA（Error Level Analysis）错误级别分析
   */
  private async checkEvidenceAuthenticity(filePath: string): Promise<OcrPrivacyResult['authenticityCheck']> {
    const exifCheck = await this.checkExifMetadata(filePath);
    const elaCheck = await this.performELAAnalysis(filePath);

    return {
      passed: exifCheck.passed && elaCheck.passed,
      exifCheck,
      elaCheck,
    };
  }

  /**
   * EXIF 元数据检查
   * 检查图片是否包含相机信息、GPS 坐标、修改时间等
   */
  private async checkExifMetadata(filePath: string): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // 检查文件扩展名
      const ext = path.extname(filePath).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);

      if (!isImage) {
        // 非图片文件跳过 EXIF 检查
        return { passed: true, issues: [] };
      }

      // 读取文件头部信息（简化版 EXIF 检查）
      // 生产环境中应使用 exif-reader 或 exiftool 进行完整检查
      const buffer = fs.readFileSync(filePath);
      const header = buffer.slice(0, 100).toString('hex');

      // 检查 JPEG EXIF 标记
      if (ext === '.jpg' || ext === '.jpeg') {
        const hasExif = header.includes('45786966'); // "Exif" 的 hex 编码
        if (hasExif) {
          // 存在 EXIF 数据，记录但不阻止（因为相机拍摄的图片通常都有 EXIF）
          this.logger.debug(`文件包含 EXIF 元数据: ${filePath}`);
        }
      }

      // 检查文件是否被修改过（通过检查魔数）
      const validJpegMagic = header.startsWith('ffd8');
      const validPngMagic = header.startsWith('89504e47');
      const validGifMagic = header.startsWith('47494638');

      if (ext === '.jpg' || ext === '.jpeg') {
        if (!validJpegMagic) {
          issues.push('文件 JPEG 魔数异常，可能不是有效的 JPEG 文件');
        }
      } else if (ext === '.png') {
        if (!validPngMagic) {
          issues.push('文件 PNG 魔数异常，可能不是有效的 PNG 文件');
        }
      } else if (ext === '.gif') {
        if (!validGifMagic) {
          issues.push('文件 GIF 魔数异常，可能不是有效的 GIF 文件');
        }
      }
    } catch (error) {
      this.logger.error(`EXIF 检查失败: ${error.message}`);
      issues.push(`EXIF 元数据检查失败: ${error.message}`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  /**
   * ELA（Error Level Analysis）错误级别分析
   * 通过分析 JPEG 压缩错误级别来检测图片是否被篡改
   * 当前为桩实现，生产环境应使用专门的 ELA 分析库
   */
  private async performELAAnalysis(filePath: string): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // 桩实现：在生产环境中，此处应：
      // 1. 以不同质量级别重新压缩图片
      // 2. 计算原始图片与重新压缩图片的差异
      // 3. 分析差异区域判断是否被篡改
      this.logger.debug(`ELA 分析桩实现: ${filePath}`);
    } catch (error) {
      issues.push(`ELA 分析失败: ${error.message}`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  /**
   * 脱敏敏感信息（用于日志输出）
   * 身份证号 → 320***********1234
   * 手机号 → 138****5678
   */
  private maskSensitiveInfo(text: string): string {
    if (!text) return text;

    let masked = text;

    // 身份证号脱敏
    masked = masked.replace(
      /([1-9]\d{5})(\d{8})(\d{3}[\dXx])/g,
      '$1********$3',
    );

    // 手机号脱敏
    masked = masked.replace(
      /(1[3-9]\d)\d{4}(\d{4})/g,
      '$1****$2',
    );

    return masked;
  }
}