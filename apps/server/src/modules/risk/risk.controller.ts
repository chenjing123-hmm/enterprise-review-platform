import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { RiskService } from './risk.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequestUser, UserRole } from '@erp/shared';

/**
 * 风险预警控制器
 * 提供风险预警列表查询和确认/处理接口
 * 需要 ADMIN 或 SUPER_ADMIN 角色
 */
@Controller('admin/risk')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class RiskController {
  private readonly logger = new Logger(RiskController.name);

  constructor(private readonly riskService: RiskService) {}

  /**
   * GET /api/admin/risk/alerts
   * 获取风险预警列表
   */
  @Get('alerts')
  async getAlerts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('alertType') alertType?: string,
  ) {
    this.logger.log(`风险预警列表查询: status=${status || 'all'}`);
    return this.riskService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      status,
      alertType,
    );
  }

  /**
   * PUT /api/admin/risk/alerts/:id
   * 确认/处理风险预警
   * Body: { status: 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED', handlerRemark?: string }
   */
  @Put('alerts/:id')
  async updateAlert(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { status?: string; handlerRemark?: string },
  ) {
    this.logger.log(`风险预警处理: id=${id}, status=${body.status}`);
    return this.riskService.updateAlert(id, {
      status: body.status,
      handlerId: user.userId,
      handlerRemark: body.handlerRemark,
    });
  }
}