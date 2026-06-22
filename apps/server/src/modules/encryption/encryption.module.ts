import { Module, Global } from '@nestjs/common';
import { EncryptionService } from './encryption.service';

/**
 * 加密模块 - CEK 密钥管理
 * 全局模块，提供 DEK 生成、KEK 信封加密、KEK 轮换、数据加解密
 * 被 auth 和 export 模块引用
 */
@Global()
@Module({
  imports: [],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}