import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { SeedService } from './seed.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@erp/shared';

/**
 * 种子数据导入控制器
 * 提供企业数据和点评数据的批量导入接口
 * 需要 SUPER_ADMIN 角色
 */
@Controller('admin/seed')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SeedController {
  private readonly logger = new Logger(SeedController.name);

  constructor(private readonly seedService: SeedService) {}

  /**
   * POST /api/admin/seed/import-companies
   * 从 CSV 文件导入企业数据
   * Body: { csvPath: string }
   */
  @Post('import-companies')
  async importCompanies(@Body() body: { csvPath: string }) {
    this.logger.log(`导入企业数据: ${body.csvPath}`);
    return this.seedService.importCompanies(body.csvPath);
  }

  /**
   * POST /api/admin/seed/import-reviews
   * 从 CSV 文件导入点评数据
   * Body: { csvPath: string }
   */
  @Post('import-reviews')
  async importReviews(@Body() body: { csvPath: string }) {
    this.logger.log(`导入点评数据: ${body.csvPath}`);
    return this.seedService.importReviews(body.csvPath);
  }
}