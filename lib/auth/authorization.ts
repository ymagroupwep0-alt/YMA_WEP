import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './session';
import type { PermissionAction, PermissionSection } from '@/types/permissions';
import type { PermissionId } from '@/data/settings';
import { roles } from '@/data/settings';

export class AuthorizationError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requirePermission(section: PermissionSection, action: PermissionAction) {
  const user = await getCurrentUser();
  if (!user) throw new AuthorizationError(401, 'غير مصرح');
  if (user.roleId === 'admin') return user;

  const permissionId = `${section}.${action}`;
  const [rolePermission, rolePermissionCount, override] = await Promise.all([
    prisma.rolePermission.findUnique({ where: { roleId_permissionId: { roleId: user.roleId, permissionId } } }),
    prisma.rolePermission.count({ where: { roleId: user.roleId } }),
    prisma.userPermissionOverride.findUnique({ where: { userId_permissionId: { userId: user.id, permissionId } } }),
  ]);
  const defaultRole = roles.find((role) => role.id === user.roleId);
  const roleAllowsByDefault = rolePermissionCount === 0 && Boolean(defaultRole?.permissionIds.includes(permissionId as PermissionId));
  const allowed = override ? override.effect === 'allow' : Boolean(rolePermission) || roleAllowsByDefault;
  if (!allowed) throw new AuthorizationError(403, 'غير مسموح');
  return user;
}
