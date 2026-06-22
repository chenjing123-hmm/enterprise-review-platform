import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Company } from '../company/company.entity';
import { Review } from '../review/review.entity';

/**
 * CSV 解析结果
 */
interface CsvRow {
  [key: string]: string;
}

/**
 * 种子数据导入服务
 * 负责从 CSV 文件导入企业和点评数据
 * 支持去重、PENDING 状态插入
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  /**
   * 导入企业数据（从 CSV 文件）
   * 读取 kjxb 相关 CSV 文件，去重后插入数据库
   * 所有企业以 PENDING 状态导入，需要人工审核
   *
   * @param csvPath CSV 文件路径
   * @returns 导入结果统计
   */
  async importCompanies(csvPath: string): Promise<{
    total: number;
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    this.logger.log(`开始导入企业数据: ${csvPath}`);

    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;
    const csvData: any[] = [];

    try {
      // 读取 CSV 文件
      const parsedData = this.readCsvFile(csvPath);
      csvData.push(...parsedData);
      this.logger.log(`读取 CSV 完成，共 ${csvData.length} 行数据`);

      for (const row of csvData) {
        try {
          const name = row['企业名称'] || row['name'] || row['公司名称'];
          const creditCode = row['统一社会信用代码'] || row['creditCode'] || row['信用代码'];

          if (!name) {
            skipped++;
            errors.push(`缺少企业名称: ${JSON.stringify(row).substring(0, 100)}`);
            continue;
          }

          // 去重：检查企业名称或信用代码是否已存在
          const existing = await this.companyRepository.findOne({
            where: [{ name }, ...(creditCode ? [{ creditCode }] : [])],
          });

          if (existing) {
            skipped++;
            this.logger.debug(`企业已存在，跳过: ${name}`);
            continue;
          }

          // 生成 slug
          const slug = this.generateSlug(name);

          // 创建企业记录
          const company = this.companyRepository.create({
            name,
            shortName: row['简称'] || row['shortName'],
            slug,
            creditCode: creditCode || '',
            industry: row['行业'] || row['industry'] || '其他',
            scale: row['规模'] || row['scale'] || '未知',
            website: row['官网'] || row['website'],
            description: row['简介'] || row['description'],
            address: row['地址'] || row['address'],
            city: row['城市'] || row['city'],
            province: row['省份'] || row['province'],
            auditStatus: 'PENDING',
          });

          await this.companyRepository.save(company);
          imported++;
          this.logger.debug(`企业导入成功: ${name}`);
        } catch (error) {
          skipped++;
          errors.push(`导入失败: ${row['企业名称'] || row['name'] || '未知'} - ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`企业数据导入失败: ${error.message}`);
      throw new BadRequestException(`企业数据导入失败: ${error.message}`);
    }

    this.logger.log(`企业数据导入完成: 总计=${csvData.length}, 导入=${imported}, 跳过=${skipped}, 错误=${errors.length}`);
    return {
      total: csvData.length,
      imported,
      skipped,
      errors: errors.slice(0, 50), // 最多返回50条错误
    };
  }

  /**
   * 导入点评数据（从 CSV 文件）
   * 读取 kjxb 相关 CSV 文件，去重后以 PENDING 状态插入
   *
   * @param csvPath CSV 文件路径
   * @returns 导入结果统计
   */
  async importReviews(csvPath: string): Promise<{
    total: number;
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    this.logger.log(`开始导入点评数据: ${csvPath}`);

    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;
    const csvData: any[] = [];

    try {
      const parsedData = this.readCsvFile(csvPath);
      csvData.push(...parsedData);
      this.logger.log(`读取 CSV 完成，共 ${csvData.length} 行数据`);

      for (const row of csvData) {
        try {
          const companyName = row['企业名称'] || row['companyName'];
          const content = row['点评内容'] || row['content'] || row['评价'];

          if (!companyName || !content) {
            skipped++;
            errors.push(`缺少必要字段: ${JSON.stringify(row).substring(0, 100)}`);
            continue;
          }

          if (content.length < 50) {
            skipped++;
            errors.push(`点评内容不足50字符: ${companyName}`);
            continue;
          }

          // 查找企业
          const company = await this.companyRepository.findOne({
            where: { name: companyName },
          });

          if (!company) {
            skipped++;
            errors.push(`企业不存在: ${companyName}`);
            continue;
          }

          // 去重：检查相同企业和内容的点评是否已存在
          const existing = await this.reviewRepository.findOne({
            where: {
              companyId: company.id,
              content,
            },
          });

          if (existing) {
            skipped++;
            this.logger.debug(`点评已存在，跳过: ${companyName}`);
            continue;
          }

          // 创建点评记录（PENDING 状态）
          const review = this.reviewRepository.create({
            companyId: company.id,
            userId: 'seed-import',
            userNickname: row['用户昵称'] || row['userNickname'] || '匿名用户',
            jobTitle: row['职位'] || row['jobTitle'] || '未知职位',
            startDate: row['入职日期'] || row['startDate'] || '2020-01-01',
            endDate: row['离职日期'] || row['endDate'] || '',
            employmentType: row['雇佣类型'] || row['employmentType'] || 'FULL_TIME',
            content,
            overallRating: parseFloat(row['综合评分'] || row['overallRating'] || '3'),
            salaryRating: parseFloat(row['薪资评分'] || row['salaryRating'] || '3'),
            environmentRating: parseFloat(row['环境评分'] || row['environmentRating'] || '3'),
            growthRating: parseFloat(row['发展评分'] || row['growthRating'] || '3'),
            managementRating: parseFloat(row['管理评分'] || row['managementRating'] || '3'),
            workLifeBalanceRating: parseFloat(row['工作生活平衡评分'] || row['workLifeBalanceRating'] || '3'),
            evidenceIds: [],
            agreementAccepted: true,
            auditStatus: 'PENDING',
            publishStatus: 'DRAFT',
          } as any);

          await this.reviewRepository.save(review as any);
          imported++;
          this.logger.debug(`点评导入成功: ${companyName}`);
        } catch (error) {
          skipped++;
          errors.push(`导入失败: ${row['企业名称'] || row['companyName'] || '未知'} - ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`点评数据导入失败: ${error.message}`);
      throw new BadRequestException(`点评数据导入失败: ${error.message}`);
    }

    this.logger.log(`点评数据导入完成: 总计=${csvData.length}, 导入=${imported}, 跳过=${skipped}, 错误=${errors.length}`);
    return {
      total: csvData.length,
      imported,
      skipped,
      errors: errors.slice(0, 50),
    };
  }

  /**
   * 读取 CSV 文件并解析为对象数组
   * 支持 UTF-8 和 GBK 编码
   */
  private readCsvFile(filePath: string): CsvRow[] {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new BadRequestException(`CSV 文件不存在: ${absolutePath}`);
    }

    let content: string;

    try {
      // 尝试 UTF-8 编码
      content = fs.readFileSync(absolutePath, 'utf-8');
    } catch {
      // 尝试 GBK 编码
      const buffer = fs.readFileSync(absolutePath);
      const iconv = require('iconv-lite');
      content = iconv.decode(buffer, 'gbk');
    }

    // 移除 BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      throw new BadRequestException('CSV 文件为空或只有表头');
    }

    // 解析表头
    const headers = this.parseCsvLine(lines[0]);
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const row: CsvRow = {};

      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
      }

      rows.push(row);
    }

    return rows;
  }

  /**
   * 解析 CSV 行（支持引号包裹的字段）
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * 生成 URL 友好的 slug
   */
  private generateSlug(name: string): string {
    // 简单的中文转拼音 slug（实际项目中应使用 pinyin 库）
    const timestamp = Date.now().toString(36);
    const sanitized = name
      .replace(/[^\w\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();

    return sanitized.length > 0 ? `${sanitized}-${timestamp}` : `company-${timestamp}`;
  }
}