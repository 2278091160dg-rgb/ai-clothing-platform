/**
 * RBAC (Role-Based Access Control) 权限控制
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRole } from '@prisma/client';

export type Permission =
  | 'task:create'
  | 'task:read'
  | 'task:update'
  | 'task:delete'
  | 'task:download'
  | 'user:manage'
  | 'quota:manage'
  | 'system:admin';

interface SessionUser {
  id: string;
  role: UserRole;
}

interface Session {
  user: SessionUser;
}

// API 路由上下文类型
interface ApiContext {
  params?: Record<string, string | string[]>;
  [key: string]: unknown;
}

// 角色权限映射
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'task:create',
    'task:read',
    'task:update',
    'task:delete',
    'task:download',
    'user:manage',
    'quota:manage',
    'system:admin',
  ],
  [UserRole.USER]: ['task:create', 'task:read', 'task:update', 'task:delete', 'task:download'],
  [UserRole.VIEWER]: ['task:read', 'task:download'],
};

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

/**
 * 检查用户是否有任一权限
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * 检查用户是否有所有权限
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * 权限检查中间件
 * 如果没有权限则抛出错误
 */
export function requirePermission(userRole: UserRole, permission: Permission): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(
      `Permission denied: role "${userRole}" does not have permission "${permission}"`
    );
  }
}

/**
 * 权限守卫 - 用于API路由
 */
export function withPermission(
  permission: Permission,
  handler: (req: Request, context: ApiContext) => Promise<Response>
) {
  return async (req: Request, context: ApiContext) => {
    // 从session获取用户信息（需要在实际使用时实现）
    const session = await getSession(req);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!hasPermission(session.user.role, permission)) {
      return new Response('Forbidden', { status: 403 });
    }

    return handler(req, context);
  };
}

/**
 * 从请求中获取session（简化版）
 */
async function getSession(_req: Request): Promise<Session | null> {
  // 实际实现需要解析JWT token
  // 这里简化处理，返回null
  return null;
}

/**
 * 权限装饰器 - 用于服务层
 */
export function RequirePermission(permission: Permission) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      // 第一个参数通常是包含用户信息的上下文
      const context = args[0] as ApiContext & { user?: SessionUser };

      if (context?.user?.role) {
        requirePermission(context.user.role, permission);
      } else {
        throw new Error('User context not found');
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 检查是否是资源所有者
 */
export function isResourceOwner(
  userId: string,
  resourceOwnerId: string,
  userRole: UserRole
): boolean {
  // 管理员可以访问所有资源
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  // 用户只能访问自己的资源
  return userId === resourceOwnerId;
}
