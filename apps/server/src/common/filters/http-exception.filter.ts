import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '@erp/shared';

/**
 * 全局 HTTP 异常过滤器
 * 统一异常响应格式，提供中文错误消息
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const resp = exResponse as Record<string, unknown>;
        // 处理 class-validator 的验证错误消息数组
        if (Array.isArray(resp.message)) {
          message = (resp.message as string[]).join('; ');
        } else {
          message = (resp.message as string) || '请求处理异常';
        }
      } else {
        message = '请求处理异常';
      }

      // 根据状态码补充中文消息
      if (!message || message === '请求处理异常') {
        message = this.getChineseMessage(status);
      }
    } else {
      // 非 HTTP 异常（如代码错误），记录日志并返回500
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '服务器内部错误，请稍后重试';
      this.logger.error(
        `未捕获异常: ${exception instanceof Error ? exception.message : '未知错误'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse: ApiResponse<null> = {
      code: status,
      message,
      data: null,
    } as any;

    // 附加时间戳
    (errorResponse as any).timestamp = new Date().toISOString();

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} -> ${status}: ${message}`,
    );

    response.status(status).json(errorResponse);
  }

  /**
   * 根据 HTTP 状态码返回中文错误消息
   */
  private getChineseMessage(status: number): string {
    const messages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请先登录',
      403: '权限不足，无法访问',
      404: '请求的资源不存在',
      405: '请求方法不允许',
      408: '请求超时',
      409: '资源冲突',
      413: '请求体过大',
      422: '请求参数验证失败',
      429: '请求过于频繁，请稍后重试',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
    };
    return messages[status] || '请求处理异常';
  }
}