import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensitiveWord } from './sensitive-word.entity';
import { SensitiveWordService } from './sensitive-word.service';
import { SensitiveWordController } from './sensitive-word.controller';
import { SensitiveWordMiddleware } from './sensitive-word.middleware';

/**
 * 敏感词过滤模块 - 基于 DFA Trie 树的敏感词过滤
 * 提供敏感词管理 CRUD 和内容检查中间件
 * 中间件拦截所有 POST/PUT 请求，检查 content 字段是否包含敏感词
 */
@Module({
  imports: [TypeOrmModule.forFeature([SensitiveWord])],
  controllers: [SensitiveWordController],
  providers: [SensitiveWordService],
  exports: [SensitiveWordService, TypeOrmModule],
})
export class SensitiveWordModule implements NestModule {
  /**
   * 配置敏感词过滤中间件
   * 拦截所有 POST/PUT 请求，检查请求体中的 content 字段
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SensitiveWordMiddleware)
      .forRoutes('*'); // 拦截所有路由
  }
}