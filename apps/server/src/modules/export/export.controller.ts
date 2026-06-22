import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Logger,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequestUser, UserRole } from '@erp/shared';

/**
 * 司法导出控制器
 * 提供司法数据导出请求、解密审批、导出执行、文件下载接口
 * 需要 SUPER_ADMIN 角色
 */
@Controller('admin/export')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  /**
   * POST /api/admin/export/judicial
   * 请求司法数据导出（上传法院令）
   * Body: { courtOrderNo, exportParams, courtOrderFilePath }
   */
  @Post('judicial')
  async requestExport(
    @CurrentUser() user: RequestUser,
    @Body()
    body: {
      courtOrderNo: string;
      exportParams: any;
      courtOrderFilePath: string;
    },
  ) {
    this.logger.log(`司法导出请求: 法院令号=${body.courtOrderNo}`);
    return this.exportService.requestExport(
      body.exportParams,
      body.courtOrderNo,
      body.courtOrderFilePath,
      user.userId,
    );
  }

  /**
   * POST /api/admin/export/decrypt-approval
   * CEK 解密审批
   * Body: { exportId }
   */
  @Post('decrypt-approval')
  async approveDecryption(
    @CurrentUser() user: RequestUser,
    @Body() body: { exportId: string },
  ) {
    this.logger.log(`CEK解密审批: exportId=${body.exportId}`);
    return this.exportService.approveDecryption(body.exportId, user.userId);
  }

  /**
   * GET /api/admin/export/:id
   * 获取导出记录详情
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    this.logger.log(`导出记录详情: id=${id}`);
    return this.exportService.findById(id);
  }

  /**
   * GET /api/admin/export/:id/download
   * 下载导出文件
   */
  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`导出文件下载: id=${id}`);
    const { filePath, fileName } = await this.exportService.getDownloadPath(id);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    });

    return { filePath };
  }
}