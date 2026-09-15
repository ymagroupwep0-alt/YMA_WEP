import type { RoleId, SystemUser } from '@/data/settings';
import { roles, type PermissionId } from '@/data/settings';
import type { PermissionAction, PermissionSection, UserPermissionOverrides } from '@/types/permissions';

export const getCurrentUser = (users: SystemUser[], userId: string) => users.find((user) => user.id === userId);

export const getRolePermissions = (roleId: RoleId, rolePermissions: Record<RoleId, PermissionId[]>) =>
  rolePermissions[roleId] !== undefined ? rolePermissions[roleId] : roles.find((role) => role.id === roleId)?.permissionIds ?? [];

export const getCurrentUserPermissions = (
  users: SystemUser[],
  rolePermissions: Record<RoleId, PermissionId[]>,
  userId: string,
): PermissionId[] => {
  const user = getCurrentUser(users, userId);
  if (!user || user.status !== 'active') return [];
  if (user.roleId === 'admin') return roles.find((role) => role.id === 'admin')?.permissionIds ?? [];
  const permissions = new Set(getRolePermissions(user.roleId, rolePermissions));
  Object.entries(user.permissionOverrides ?? {}).forEach(([permission, allowed]) => {
    if (allowed) permissions.add(permission as PermissionId);
    else permissions.delete(permission as PermissionId);
  });
  return Array.from(permissions);
};

export const hasPermission = (
  users: SystemUser[],
  rolePermissions: Record<RoleId, PermissionId[]>,
  section: PermissionSection,
  action: PermissionAction,
  userId: string,
) => {
  const user = users.find((candidate) => candidate.id === userId);
  if (!user || user.status !== 'active') return false;
  if (user.roleId === 'admin') return true;
  const permission = `${section}.${action}` as PermissionId;
  const allowed = new Set(getRolePermissions(user.roleId, rolePermissions));
  const overrides: UserPermissionOverrides = user.permissionOverrides ?? {};
  return overrides[permission] ?? allowed.has(permission);
};

export const canView = (users: SystemUser[], rolePermissions: Record<RoleId, PermissionId[]>, section: PermissionSection, userId: string) => hasPermission(users, rolePermissions, section, 'view', userId);
export const canCreate = (users: SystemUser[], rolePermissions: Record<RoleId, PermissionId[]>, section: PermissionSection, userId: string) => hasPermission(users, rolePermissions, section, 'create', userId);
export const canEdit = (users: SystemUser[], rolePermissions: Record<RoleId, PermissionId[]>, section: PermissionSection, userId: string) => hasPermission(users, rolePermissions, section, 'edit', userId);
export const canDelete = (users: SystemUser[], rolePermissions: Record<RoleId, PermissionId[]>, section: PermissionSection, userId: string) => hasPermission(users, rolePermissions, section, 'delete', userId);
export const canManage = (users: SystemUser[], rolePermissions: Record<RoleId, PermissionId[]>, section: PermissionSection, userId: string) => hasPermission(users, rolePermissions, section, 'manage', userId);

export const isAdmin = (users: SystemUser[], userId: string) => users.some((user) => user.id === userId && user.status === 'active' && user.roleId === 'admin');
