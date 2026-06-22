import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SensitiveWordService } from './sensitive-word.service';

/**
 * 敏感词过滤中间件
 * 拦截所有 POST/PUT 请求，检查请求体中的 content 字段是否包含敏感词
 * 如果命中 CRITICAL 级别的敏感词，直接返回 400 错误
 */
@Injectable()
export class SensitiveWordMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SensitiveWordMiddleware.name);

  constructor(private readonly sensitiveWordService: SensitiveWordService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const method = req.method.toUpperCase();

    // 仅拦截 POST 和 PUT 请求
    if (method !== 'POST' && method !== 'PUT') {
      return next();
    }

    // 检查请求体中的 content 字段
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return next();
    }

    // 递归查找所有 content 字段
    const contentFields = this.extractContentFields(body);

    if (contentFields.length === 0) {
      return next();
    }

    // 对每个 content 字段进行敏感词检查
    for (const { path, value } of contentFields) {
      if (typeof value !== 'string' || value.trim().length === 0) {
        continue;
      }

      const result = this.sensitiveWordService.checkText(value);

      if (result.hasSensitive) {
        const criticalHits = result.hits.filter((h) => h.severity === 'CRITICAL');

        if (criticalHits.length > 0) {
          const words = criticalHits.map((h) => h.word).join('、');
          this.logger.warn(`敏感词拦截: 路径=${path}, 命中极严重敏感词=[${words}]`);

          res.status(400).json({
            code: 400,
            message: `内容包含违规信息，请修改后重新提交: ${words}`,
            data: null,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const highHits = result.hits.filter((h) => h.severity === 'HIGH');
        if (highHits.length > 0) {
          this.logger.warn(`敏感词警告: 路径=${path}, 命中高严重度敏感词=[${highHits.map((h) => h.word).join('、')}]`);
        }
      }
    }

    next();
  }

  /**
   * 递归提取请求体中的所有 content 字段
   */
  private extractContentFields(
    obj: any,
    parentPath: string = '',
  ): Array<{ path: string; value: any }> {
    const results: Array<{ path: string; value: any }> = [];

    if (!obj || typeof obj !== 'object') {
      return results;
    }

    for (const key of Object.keys(obj)) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      const value = obj[key];

      if (key === 'content' && typeof value === 'string') {
        results.push({ path: currentPath, value });
      } else if (key === 'reason' && typeof value === 'string') {
        results.push({ path: currentPath, value });
      } else if (key === 'description' && typeof value === 'string') {
        results.push({ path: currentPath, value });
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        results.push(...this.extractContentFields(value, currentPath));
      }
    }

    return results;
  }
}