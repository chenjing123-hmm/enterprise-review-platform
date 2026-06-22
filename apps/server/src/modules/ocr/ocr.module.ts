import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';

/**
 * OCR 模块 - 图片文字识别与隐私信息检查
 * 使用 Tesseract.js 进行 OCR 识别，检查身份证号、手机号、地址、薪资、机密标记
 * 同时进行证据真实性检查：EXIF 元数据、ELA 错误级别分析
 */
@Module({
  imports: [],
  controllers: [OcrController],
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}