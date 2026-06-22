import {
  Controller,
  Delete,
  Post,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { DataRetentionService } from './data-retention.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestUser } from '@erp/shared';

/**
 * 数据保留控制器
 * 提供用户账号删除请求和取消删除接口
 */
@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class DataRetentionController {
  private readonly logger = new Logger(DataRetentionController.name);

  constructor(private readonly dataRetentionService: DataRetentionService) {}

  /**
   * DELETE /api/api/users/me
   * 请求删除当前用户账号
   * 进入7天冷静期，冷静期结束后执行数据匿名化
   */
  @Delete('me')
  async requestDeletion(@CurrentUser() user: RequestUser) {
    this.logger.log(`用户请求删除账号: userId=${user.userId}`);
    return this.dataRetentionService.processUserDeletion(user.userId);
  }

  /**
   * POST /api/api/users/me/cancel-deletion
   * 取消用户删除请求
   * 在7天冷静期内可以取消
   */
  @Post('me/cancel-deletion')
  async cancelDeletion(@CurrentUser() user: RequestUser) {
    this.logger.log(`用户取消删除请求: userId=${user.userId}`);
    return this.dataRetentionService.cancelUserDeletion(user.userId);
  }
}