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
import { ComplaintService } from './complaint.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequestUser, UserRole, ComplaintResponse } from '@erp/shared';

/**
 * 投诉控制器
 * 公开接口：提交投诉、查询工单状态
 * 管理接口：投诉列表、详情、更新、处理
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class ComplaintController {
  private readonly logger = new Logger(ComplaintController.name);

  constructor(private readonly complaintService: ComplaintService) {}

  // ─── 公开接口 ───

  /**
   * POST /api/complaints
   * 提交投诉工单（公开接口）
   * Body: { targetType, targetId, complaintType, reason, description?, complainantContact? }
   */
  @Public()
  @Post('complaints')
  async create(
    @Body()
    body: {
      targetType: string;
      targetId: string;
      complaintType: string;
      reason: string;
      description?: string;
      complainantContact?: string;
      complainantName?: string;
    },
    @CurrentUser() user?: RequestUser,
  ): Promise<ComplaintResponse> {
    this.logger.log(`提交投诉: targetType=${body.targetType}, type=${body.complaintType}`);
    return this.complaintService.createTicket({
      complainantId: user?.userId,
      complainantName: body.complainantName || (user?.userId || '匿名用户'),
      complainantContact: body.complainantContact,
      targetType: body.targetType,
      targetId: body.targetId,
      complaintType: body.complaintType,
      reason: body.reason,
      description: body.description,
    });
  }

  /**
   * GET /api/complaints/:ticketNo/status
   * 查询工单状态（公开接口）
   */
  @Public()
  @Get('complaints/:ticketNo/status')
  async getStatus(
    @Param('ticketNo') ticketNo: string,
  ): Promise<ComplaintResponse> {
    this.logger.log(`查询工单状态: ${ticketNo}`);
    return this.complaintService.getStatusByTicketNo(ticketNo);
  }

  // ─── 管理接口 ───

  /**
   * GET /api/admin/complaints
   * 获取投诉工单列表（管理员）
   */
  @Get('admin/complaints')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ): Promise<{ items: ComplaintResponse[]; total: number }> {
    this.logger.log(`投诉工单列表查询: status=${status || 'all'}`);
    return this.complaintService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      status,
    );
  }

  /**
   * GET /api/admin/complaints/:id
   * 获取投诉工单详情（管理员）
   */
  @Get('admin/complaints/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findById(@Param('id') id: string): Promise<ComplaintResponse> {
    this.logger.log(`投诉工单详情: id=${id}`);
    return this.complaintService.findById(id);
  }

  /**
   * PUT /api/admin/complaints/:id
   * 更新投诉工单（管理员）
   */
  @Put('admin/complaints/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ): Promise<ComplaintResponse> {
    this.logger.log(`更新投诉工单: id=${id}`);
    return this.complaintService.update(id, body);
  }

  /**
   * POST /api/admin/complaints/:id/resolve
   * 处理投诉工单（管理员）
   */
  @Post('admin/complaints/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async resolve(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body('result') result: string,
  ): Promise<ComplaintResponse> {
    this.logger.log(`处理投诉工单: id=${id}, handler=${user.userId}`);
    return this.complaintService.resolveTicket(id, user.userId, user.userId, result);
  }
}