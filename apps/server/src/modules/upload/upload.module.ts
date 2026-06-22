import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

/**
 * 文件上传模块 - 文件上传、类型校验、大小校验、EXIF敏感数据检查
 * 支持的文件类型：jpg/png/pdf
 * 最大文件大小：10MB
 */
@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}