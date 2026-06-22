import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudicialExport } from './judicial-export.entity';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { EncryptionModule } from '../encryption/encryption.module';

/**
 * 司法导出模块 - 法院令数据导出、CEK解密审批、导出文件生成
 * 流程：上传法院令 → 请求导出 → CEK解密审批 → 执行导出 → 下载文件
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([JudicialExport]),
    EncryptionModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService, TypeOrmModule],
})
export class ExportModule {}