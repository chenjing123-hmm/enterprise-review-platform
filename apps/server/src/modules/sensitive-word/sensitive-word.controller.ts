import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { SensitiveWordService } from './sensitive-word.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@erp/shared';

/**
 * 敏感词管理控制器
 * 提供敏感词 CRUD 和批量导入接口
 * 需要 ADMIN 或 SUPER_ADMIN 角色
 */
@Controller('admin/sensitive-words')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class SensitiveWordController {
  private readonly logger = new Logger(SensitiveWordController.name);

  constructor(private readonly sensitiveWordService: SensitiveWordService) {}

  /**
   * GET /api/admin/sensitive-words
   * 获取所有敏感词列表
   */
  @Get()
  async findAll() {
    this.logger.log('查询敏感词列表');
    return this.sensitiveWordService.findAll();
  }

  /**
   * POST /api/admin/sensitive-words
   * 创建敏感词
   */
  @Post()
  async create(
    @Body() body: { word: string; category: string; severity: string },
  ) {
    this.logger.log(`创建敏感词: ${body.word}`);
    return this.sensitiveWordService.create(body);
  }

  /**
   * DELETE /api/admin/sensitive-words/:id
   * 删除敏感词
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`删除敏感词: id=${id}`);
    await this.sensitiveWordService.remove(id);
    return { message: '敏感词已删除' };
  }

  /**
   * POST /api/admin/sensitive-words/batch-import
   * 批量导入敏感词
   * Body: { words: [{word, category, severity}] }
   */
  @Post('batch-import')
  async batchImport(
    @Body() body: { words: Array<{ word: string; category: string; severity: string }> },
  ) {
    this.logger.log(`批量导入敏感词: ${body.words?.length || 0}条`);
    return this.sensitiveWordService.batchImport(body.words);
  }
}