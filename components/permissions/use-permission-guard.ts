'use client';

import { useState } from 'react';
import { usePermissions } from './permissions-provider';
import { canCreate, canDelete, canEdit, canManage, canView } from '@/lib/permissions';
import type { PermissionAction, PermissionSection } from '@/types/permissions';

export function usePermissionGuard(section: PermissionSection) {
  const { currentUserId, users, rolePermissions } = usePermissions();
  const [notice, setNotice] = useState('');
  const check = (action: PermissionAction) => {
    const allowed = can(action);
    if (!allowed) setNotice('ليس لديك صلاحية لتنفيذ هذه العملية.');
    return allowed;
  };
  const can = (action: PermissionAction) => action === 'view' ? canView(users, rolePermissions, section, currentUserId) : action === 'create' ? canCreate(users, rolePermissions, section, currentUserId) : action === 'edit' ? canEdit(users, rolePermissions, section, currentUserId) : action === 'delete' ? canDelete(users, rolePermissions, section, currentUserId) : canManage(users, rolePermissions, section, currentUserId);
  return { notice, setNotice, check, can };
}
