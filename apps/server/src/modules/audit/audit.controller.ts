import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequestUser, UserRole, AuditQueueItem } from '@erp/shared';

/**
 * 审核控制器
 * 提供审核队列管理、审核通过/驳回/需修改接口
 * 需要 AUDITOR 或 SUPER_ADMIN 角色
 */
@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /api/admin/audit/queue
   * 获取审核队列（分页）
   * 按优先级降序、进入队列时间升序排列
   */
  @Get('queue')
  async getQueue(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{ items: AuditQueueItem[]; total: number }> {
    this.logger.log(`审核队列查询: page=${page || 1}`);
    return this.auditService.getAuditQueue(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  /**
   * POST /api/admin/audit/:id/approve
   * 审核通过
   */
  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body('remark') remark?: string,
  ) {
    this.logger.log(`审核通过: id=${id}, auditorId=${user.userId}`);
    return this.auditService.approve(id, user.userId, user.userId, remark);
  }

  /**
   * POST /api/admin/audit/:id/reject
   * 审核驳回
   */
  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body('rejectReason') rejectReason: string,
  ) {
    this.logger.log(`审核驳回: id=${id}, reason=${rejectReason}`);
    return this.auditService.reject(id, user.userId, user.userId, rejectReason);
  }

  /**
   * POST /api/admin/audit/:id/need-modify
   * 需要修改
   */
  @Post(':id/need-modify')
  async needModify(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body('remark') remark: string,
  ) {
    this.logger.log(`需要修改: id=${id}, remark=${remark}`);
    return this.auditService.needModify(id, user.userId, user.userId, remark);
  }
}