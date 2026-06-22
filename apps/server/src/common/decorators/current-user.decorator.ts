import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '@erp/shared';

/**
 * @CurrentUser() 装饰器 - 从请求中提取当前登录用户信息
 * @example
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: RequestUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;

    // 如果指定了 data 字段，则返回该字段的值
    if (data) {
      return user?.[data];
    }

    return user;
  },
);