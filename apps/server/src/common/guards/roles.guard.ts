import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole, RequestUser } from '@erp/shared';

/**
 * RBAC 角色守卫 - 检查用户是否拥有所需角色权限
 * 支持的角色: SUPER_ADMIN, AUDITOR, COMPLAINT_HANDLER, RISK_ANALYST
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由上声明的所需角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有声明角色要求，则允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 从请求中获取当前用户
    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // 检查用户角色是否在所需角色列表中
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('您没有权限执行此操作，需要以下角色之一: ' + requiredRoles.join(', '));
    }

    return true;
  }
}