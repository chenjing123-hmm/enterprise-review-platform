import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

/**
 * 日志拦截器 - 记录所有增删改（CUD）操作的请求日志
 * 记录方法: POST, PUT, PATCH, DELETE
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, body } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    // 仅记录 CUD（增删改）操作
    const cudMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    const isCudOperation = cudMethods.includes(method);

    if (!isCudOperation) {
      return next.handle();
    }

    const now = Date.now();
    const sanitizedBody = this.sanitizeBody(body);

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - now;
          this.logger.log(
            `[${method}] ${url} | ${className}.${handlerName} | ${elapsed}ms | IP: ${ip} | Body: ${JSON.stringify(sanitizedBody)}`,
          );
        },
        error: (error: Error) => {
          const elapsed = Date.now() - now;
          this.logger.error(
            `[${method}] ${url} | ${className}.${handlerName} | ${elapsed}ms | IP: ${ip} | Error: ${error.message}`,
          );
        },
      }),
    );
  }

  /**
   * 清理请求体中的敏感信息，避免日志中泄漏密码等数据
   */
  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }
    const sanitized = { ...(body as Record<string, unknown>) };
    const sensitiveFields = ['password', 'token', 'secret', 'idCard', 'realName', 'phone'];
    for (const field of sensitiveFields) {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '***';
      }
    }
    return sanitized;
  }
}