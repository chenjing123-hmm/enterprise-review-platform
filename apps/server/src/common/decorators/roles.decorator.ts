import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, UserRole } from '@erp/shared';

/**
 * @Roles() 装饰器 - 用于标记路由所需的角色权限
 * @param roles 所需的角色列表，支持 SUPER_ADMIN | AUDITOR | COMPLAINT_HANDLER | RISK_ANALYST
 * @example @Roles(UserRole.SUPER_ADMIN, UserRole.AUDITOR)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);