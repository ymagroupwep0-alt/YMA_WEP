export const permissionSections = [
  'dashboard', 'company', 'projects', 'clients-suppliers', 'supplies', 'reports',
  'manufacturing', 'finance', 'warehouse', 'employees', 'profits', 'activity', 'settings',
] as const;

export const permissionActions = ['view', 'create', 'edit', 'delete', 'manage'] as const;

export type PermissionSection = (typeof permissionSections)[number];
export type PermissionAction = (typeof permissionActions)[number];
export type PermissionId = `${PermissionSection}.${PermissionAction}`;
export type LegacyPermissionId = PermissionSection;

export type Permission = {
  id: PermissionId;
  section: PermissionSection;
  action: PermissionAction;
  label: string;
  description?: string;
};

export type UserPermissionOverrides = Partial<Record<PermissionId, boolean>>;
