import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestUser } from '@erp/shared';

/**
 * 实名认证守卫 - 阻止未实名认证的用户创建点评
 * 只有实名认证状态为 VERIFIED 的用户才能通过
 */
@Injectable()
export class RealNameGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证，请先登录');
    }

    if (!user.realNameVerified) {
      throw new ForbiddenException('您需要完成实名认证后才能发表点评');
    }

    return true;
  }
}