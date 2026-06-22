import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Company } from './company.entity';
import { CompanyResponse, CompanySearchResult, CompanySearchParams } from '@erp/shared';

/**
 * 企业服务
 * 负责企业信息 CRUD、搜索（MySQL LIKE + FULLTEXT）、详情页数据组装
 * 注意：不提供评分排序，仅支持按字母（name）和时间（createdAt）排序
 */
@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  /**
   * 企业搜索
   * 支持关键词搜索（MySQL LIKE 模糊匹配 + FULLTEXT 全文索引）
   * 支持按城市筛选
   * 仅支持按 name 字母顺序或 createdAt 时间排序，不支持评分排序
   *
   * @param params 搜索参数 { q: 关键词, city: 城市, page: 页码, pageSize: 每页条数 }
   * @returns 分页搜索结果
   */
  async search(params: {
    q?: string;
    city?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: CompanySearchResult[]; total: number; page: number; pageSize: number }> {
    const { q, city, page = 1, pageSize = 20 } = params;

    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .where('company.auditStatus = :auditStatus', { auditStatus: 'APPROVED' });

    // 关键词搜索：优先使用 MySQL FULLTEXT 全文索引，降级到 LIKE 模糊匹配
    if (q) {
      if (q.length >= 2) {
        // 使用 FULLTEXT 全文索引（需要 MySQL InnoDB 全文索引支持）
        queryBuilder.andWhere(
          'MATCH(company.name) AGAINST(:keyword IN BOOLEAN MODE)',
          { keyword: `+${q}*` },
        );
      } else {
        // 短关键词降级到 LIKE 模糊匹配
        queryBuilder.andWhere('company.name LIKE :likeName', { likeName: `%${q}%` });
      }
    }

    // 按城市筛选
    if (city) {
      queryBuilder.andWhere('company.city = :city', { city });
    }

    // 仅按字母顺序和时间排序（不支持评分排序）
    queryBuilder.orderBy('company.name', 'ASC');

    // 分页
    const [items, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    this.logger.log(`企业搜索完成: q="${q || ''}", city="${city || ''}", 结果数=${total}`);

    return {
      items: items.map((c) => this.toSearchResult(c)),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 根据 slug 获取企业详情（含点评统计）
   * @param slug 企业 URL 标识符
   * @returns 企业详情
   */
  async findBySlug(slug: string): Promise<CompanyResponse> {
    const company = await this.companyRepository.findOne({
      where: { slug, auditStatus: 'APPROVED' },
    });

    if (!company) {
      throw new NotFoundException(`企业不存在: ${slug}`);
    }

    this.logger.log(`获取企业详情: ${company.name} (${slug})`);
    return this.toResponse(company);
  }

  /**
   * 根据 ID 获取企业
   * @param id 企业 ID
   */
  async findById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`企业不存在: ${id}`);
    }
    return company;
  }

  /**
   * 创建企业
   * @param data 企业数据
   */
  async create(data: Partial<Company>): Promise<Company> {
    const company = this.companyRepository.create(data);
    const saved = await this.companyRepository.save(company);
    this.logger.log(`创建企业: ${saved.name} (${saved.id})`);
    return saved;
  }

  /**
   * 更新企业信息
   * @param id 企业 ID
   * @param data 更新数据
   */
  async update(id: string, data: Partial<Company>): Promise<Company> {
    const company = await this.findById(id);
    Object.assign(company, data);
    const saved = await this.companyRepository.save(company);
    this.logger.log(`更新企业: ${saved.name} (${saved.id})`);
    return saved;
  }

  /**
   * 更新企业评分统计（当有新点评审核通过时调用）
   * @param companyId 企业 ID
   * @param newRating 新点评的评分维度
   */
  async updateRatingStats(
    companyId: string,
    newRating: {
      overall: number;
      salary: number;
      environment: number;
      growth: number;
      management: number;
      workLifeBalance: number;
    },
  ): Promise<void> {
    const company = await this.findById(companyId);

    const currentCount = company.reviewCount || 0;
    const newCount = currentCount + 1;

    // 使用加权平均更新各项评分
    company.avgRating = this.computeWeightedAvg(company.avgRating, currentCount, newRating.overall);
    company.salaryRating = this.computeWeightedAvg(company.salaryRating, currentCount, newRating.salary);
    company.environmentRating = this.computeWeightedAvg(company.environmentRating, currentCount, newRating.environment);
    company.growthRating = this.computeWeightedAvg(company.growthRating, currentCount, newRating.growth);
    company.managementRating = this.computeWeightedAvg(company.managementRating, currentCount, newRating.management);
    company.workLifeBalanceRating = this.computeWeightedAvg(company.workLifeBalanceRating, currentCount, newRating.workLifeBalance);
    company.reviewCount = newCount;

    await this.companyRepository.save(company);
    this.logger.log(`更新企业评分统计: ${company.name}, 点评数=${newCount}`);
  }

  /**
   * 计算加权平均分
   */
  private computeWeightedAvg(oldAvg: number, oldCount: number, newValue: number): number {
    if (oldCount === 0) return newValue;
    return parseFloat(((oldAvg * oldCount + newValue) / (oldCount + 1)).toFixed(2));
  }

  /**
   * 转换为搜索响应格式
   */
  private toSearchResult(company: Company): CompanySearchResult {
    return {
      id: company.id,
      name: company.name,
      shortName: company.shortName,
      industry: company.industry,
      logo: company.logo,
      scale: company.scale,
      city: company.city,
      avgRating: Number(company.avgRating),
      reviewCount: company.reviewCount,
    };
  }

  /**
   * 转换为详情响应格式
   */
  private toResponse(company: Company): CompanyResponse {
    return {
      id: company.id,
      name: company.name,
      shortName: company.shortName,
      creditCode: company.creditCode,
      industry: company.industry,
      scale: company.scale,
      logo: company.logo,
      website: company.website,
      description: company.description,
      address: company.address,
      city: company.city,
      province: company.province,
      establishedDate: company.establishedDate,
      avgRating: Number(company.avgRating),
      reviewCount: company.reviewCount,
      salaryRating: Number(company.salaryRating),
      environmentRating: Number(company.environmentRating),
      growthRating: Number(company.growthRating),
      managementRating: Number(company.managementRating),
      workLifeBalanceRating: Number(company.workLifeBalanceRating),
      auditStatus: company.auditStatus,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    };
  }
}