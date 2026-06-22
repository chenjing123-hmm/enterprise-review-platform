import {
  Controller,
  Post,
  UseGuards,
  Logger,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

/**
 * OCR 控制器
 * 提供文件隐私识别和证据真实性检查接口
 * 用于前端上传证明材料前的预检查
 */
@Controller('api/ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  private readonly logger = new Logger(OcrController.name);

  constructor(private readonly ocrService: OcrService) {}

  /**
   * POST /api/api/ocr/check
   * OCR 隐私识别检查（前端预检查）
   * 上传文件并进行隐私信息识别和证据真实性检查
   * Body: multipart/form-data, field: file
   * 返回: { passed, findings, authenticityCheck }
   */
  @Post('check')
  @UseInterceptors(FileInterceptor('file'))
  async check(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    this.logger.log(`OCR检查请求: ${file.originalname}, size=${file.size}`);

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型，仅支持 JPG/PNG/GIF/WEBP/PDF');
    }

    // 检查文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过 10MB');
    }

    return this.ocrService.recognizePrivacy(file.path);
  }
}