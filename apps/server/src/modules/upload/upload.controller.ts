import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * 文件上传控制器
 * 提供证明材料上传和投诉材料上传接口
 */
@Controller('api/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /api/api/upload/evidence
   * 上传证明材料（点评附件）
   * Body: multipart/form-data, field: file
   */
  @Post('evidence')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEvidence(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    this.logger.log(`上传证明材料: ${file.originalname}`);
    return this.uploadService.uploadFile(file, 'evidence');
  }

  /**
   * POST /api/api/upload/complaint-material
   * 上传投诉材料
   * Body: multipart/form-data, field: file
   */
  @Post('complaint-material')
  @UseInterceptors(FileInterceptor('file'))
  async uploadComplaintMaterial(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    this.logger.log(`上传投诉材料: ${file.originalname}`);
    return this.uploadService.uploadFile(file, 'complaint-material');
  }
}