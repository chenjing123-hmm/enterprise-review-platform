import { Controller, Get, Query, Param, Logger, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * 企业控制器
 * 提供企业搜索、详情查询等公开接口
 */
@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  private readonly logger = new Logger(CompanyController.name);

  constructor(private readonly companyService: CompanyService) {}

  /**
   * GET /api/companies
   * 企业搜索（公开接口）
   * 查询参数: q（关键词）, city（城市）, page（页码，默认1）, pageSize（每页条数，默认20）
   * 仅支持按企业名称字母排序，不支持评分排序
   */
  @Public()
  @Get()
  async search(
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    this.logger.log(`企业搜索请求: q="${q || ''}", city="${city || ''}", page=${page || 1}`);
    return this.companyService.search({
      q,
      city,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  /**
   * GET /api/companies/:slug
   * 企业详情页（公开接口）
   * 包含企业基本信息、评分统计、点评统计
   */
  @Public()
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    this.logger.log(`企业详情请求: slug=${slug}`);
    return this.companyService.findBySlug(slug);
  }
}