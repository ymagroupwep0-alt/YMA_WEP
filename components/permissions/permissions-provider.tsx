'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { roles, type PermissionId, type RoleId, type SystemUser } from '@/data/settings';

type PermissionsContextValue = {
  currentUserId: string;
  users: SystemUser[];
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  rolePermissions: Record<RoleId, PermissionId[]>;
  setRolePermissions: React.Dispatch<React.SetStateAction<Record<RoleId, PermissionId[]>>>;
  loading: boolean;
  error: string;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children, currentUserId }: { children: React.ReactNode; currentUserId: string }) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<RoleId, PermissionId[]>>(
    () => Object.fromEntries(roles.map((role) => [role.id, []])) as unknown as Record<RoleId, PermissionId[]>,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me').then(async (response) => {
      if (!response.ok) throw new Error('تعذر تحميل صلاحيات المستخدم');
      return response.json() as Promise<{ user: { id: string; name: string; email: string; roleId: RoleId; employeeId: string | null; status: 'active' | 'inactive' | 'suspended'; imageUrl: string | null; phone: string | null; job: string | null }; rolePermissions: Record<RoleId, PermissionId[]>; overrides: Array<{ permissionId: PermissionId; effect: 'allow' | 'deny' }> }>;
    }).then(async ({ user, rolePermissions: persistedRolePermissions, overrides }) => {
      if (cancelled) return;
      const permissionOverrides = Object.fromEntries(overrides.map(({ permissionId, effect }) => [permissionId, effect === 'allow']));
      const normalizedCurrentUser: SystemUser = { ...user, phone: user.phone ?? '', employeeId: user.employeeId ?? undefined, imageUrl: user.imageUrl ?? undefined, temporaryPassword: '', lastLogin: 'غير متاح', permissionOverrides };
      const currentRolePermissions = persistedRolePermissions[user.roleId] ?? roles.find((role) => role.id === user.roleId)?.permissionIds ?? [];
      const canLoadUserDirectory = user.roleId === 'admin' || permissionOverrides['settings.view'] !== false && (permissionOverrides['settings.view'] === true || currentRolePermissions.includes('settings.view'));
      let normalizedUsers: SystemUser[] = [normalizedCurrentUser];
      if (canLoadUserDirectory) {
        const usersResponse = await fetch('/api/data/users');
        if (!usersResponse.ok) throw new Error('تعذر تحميل المستخدمين');
        const apiUsers = await usersResponse.json() as Array<{ id: string; name: string; email: string; roleId: RoleId; employeeId: string | null; status: 'active' | 'inactive' | 'suspended'; imageUrl: string | null; phone: string | null; lastLoginAt: string | null; permissionOverrides: Array<{ permission: { id: PermissionId }; effect: 'allow' | 'deny' }> }>;
        normalizedUsers = apiUsers.map((item) => ({ ...item, phone: item.phone ?? '', employeeId: item.employeeId ?? undefined, imageUrl: item.imageUrl ?? undefined, temporaryPassword: '', lastLogin: item.lastLoginAt ?? 'غير متاح', permissionOverrides: Object.fromEntries(item.permissionOverrides.map(({ permission, effect }) => [permission.id, effect === 'allow'])) }));
        if (!normalizedUsers.some((item) => item.id === user.id)) normalizedUsers.unshift(normalizedCurrentUser);
      }
      setUsers(normalizedUsers);
      setRolePermissions((current) => ({ ...current, ...persistedRolePermissions }));
      setLoading(false);
    }).catch((reason: Error) => { if (!cancelled) { setError(reason.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [currentUserId]);
  const value = useMemo(() => ({ currentUserId, users, setUsers, rolePermissions, setRolePermissions, loading, error }), [currentUserId, error, loading, rolePermissions, users]);
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) throw new Error('usePermissions must be used inside PermissionsProvider');
  return context;
}
