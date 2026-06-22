import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE_KEY } from '@erp/shared';

/**
 * @Public() 装饰器 - 标记路由为公开访问（无需 JWT 认证）
 * 使用 JwtAuthGuard 时，默认所有路由需要认证，此装饰器可跳过认证
 * @example
 *   @Public()
 *   @Get('health')
 *   healthCheck() { ... }
 */
export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);