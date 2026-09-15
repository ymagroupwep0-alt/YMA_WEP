import type { PermissionId, RoleId, SystemUser, UserStatus } from '@/data/settings';
import { hasPermission } from '@/lib/permissions';

type RolePermissionMap = Record<RoleId, PermissionId[]>;

export const USER_MANAGEMENT_PERMISSION: PermissionId = 'settings.manage';

const hasUserManagementPermission = (
  users: SystemUser[],
  currentUserId: string,
  rolePermissions: RolePermissionMap,
) => {
  return hasPermission(users, rolePermissions, 'settings', 'manage', currentUserId);
};

export const canManageUsers = (
  users: SystemUser[],
  currentUserId: string,
  rolePermissions: RolePermissionMap,
) => hasUserManagementPermission(users, currentUserId, rolePermissions);

export const getActiveAdminCount = (users: SystemUser[]) =>
  users.filter((user) => user.roleId === 'admin' && user.status === 'active').length;

export const isLastActiveAdmin = (users: SystemUser[], userId: string) => {
  const user = users.find((candidate) => candidate.id === userId);
  return user?.roleId === 'admin' && user.status === 'active' && getActiveAdminCount(users) === 1;
};

export const canDeleteUser = (
  users: SystemUser[],
  userId: string,
  currentUserId: string,
  rolePermissions: RolePermissionMap,
) => {
  const target = users.find((user) => user.id === userId);
  if (!target || !hasUserManagementPermission(users, currentUserId, rolePermissions)) return false;
  if (target.roleId === 'admin') return target.id === currentUserId;
  return true;
};

export const canDeactivateUser = (
  users: SystemUser[],
  userId: string,
  currentUserId: string,
  rolePermissions: RolePermissionMap,
) =>
  hasUserManagementPermission(users, currentUserId, rolePermissions) &&
  users.some((user) => user.id === userId) &&
  !isLastActiveAdmin(users, userId);

export const canChangeUserRole = (
  users: SystemUser[],
  userId: string,
  newRole: RoleId,
  currentUserId: string,
  rolePermissions: RolePermissionMap,
) => {
  if (!hasUserManagementPermission(users, currentUserId, rolePermissions)) return false;

  const user = users.find((candidate) => candidate.id === userId);
  if (!user) return false;

  return !(user.roleId === 'admin' && user.status === 'active' && newRole !== 'admin' && getActiveAdminCount(users) === 1);
};

export const canUpdateUserStatus = (
  users: SystemUser[],
  userId: string,
  nextStatus: UserStatus,
  currentUserId: string,
  rolePermissions: RolePermissionMap,
) =>
  nextStatus === 'active'
    ? hasUserManagementPermission(users, currentUserId, rolePermissions) && users.some((user) => user.id === userId)
    : canDeactivateUser(users, userId, currentUserId, rolePermissions);
