export type UserStatus = 'active' | 'inactive' | 'suspended';
export type RoleId = 'admin' | 'manager' | 'employee' | 'viewer';
import type { PermissionId, UserPermissionOverrides } from '@/types/permissions';

export type { PermissionId, UserPermissionOverrides } from '@/types/permissions';

export type Permission = { id: PermissionId; label: string };
export type Role = { id: RoleId; name: string; description: string; permissionIds: PermissionId[] };
export type SystemUser = { id: string; name: string; email: string; phone?: string; temporaryPassword: string; roleId: RoleId; employeeId?: string; status: UserStatus; lastLogin: string; imageUrl?: string; permissionOverrides?: UserPermissionOverrides };

const permissionSections = [
  ['dashboard', 'Dashboard'], ['company', 'معلومات الشركة'], ['projects', 'المشاريع'], ['clients-suppliers', 'العملاء والموردين'],
  ['supplies', 'التوريدات'], ['reports', 'التقارير'], ['manufacturing', 'التصنيع'], ['finance', 'الماليات'],
  ['warehouse', 'المخزن'], ['employees', 'الموظفين'], ['profits', 'الأرباح'], ['activity', 'سجل النشاط'], ['settings', 'الإعدادات'],
] as const;
const permissionActions = ['view', 'create', 'edit', 'delete', 'manage'] as const;
const actionLabels = { view: 'عرض', create: 'إضافة', edit: 'تعديل', delete: 'حذف', manage: 'إدارة' } as const;

export const permissions: Permission[] = permissionSections.flatMap(([section, sectionLabel]) => permissionActions.map((action) => ({
  id: `${section}.${action}` as PermissionId,
  label: `${actionLabels[action]} ${sectionLabel}`,
})));

export const roles: Role[] = [
  { id: 'admin', name: 'Admin', description: 'وصول كامل إلى جميع أقسام النظام.', permissionIds: permissions.map((permission) => permission.id) },
  { id: 'manager', name: 'Manager', description: 'إدارة العمليات اليومية دون الإعدادات الحساسة.', permissionIds: permissions.filter(({ id }) => !id.startsWith('settings.') && !id.endsWith('.delete') && !id.endsWith('.manage')).map(({ id }) => id) },
  { id: 'employee', name: 'Employee', description: 'الوصول إلى الأقسام المرتبطة بالمهام التشغيلية.', permissionIds: permissions.filter(({ id }) => ['dashboard.view', 'projects.view', 'projects.create', 'projects.edit', 'reports.view', 'reports.create', 'manufacturing.view', 'warehouse.view'].includes(id)).map(({ id }) => id) },
  { id: 'viewer', name: 'Viewer', description: 'مشاهدة البيانات والتقارير دون تعديل أو حذف.', permissionIds: permissions.filter(({ id }) => id.endsWith('.view')).map(({ id }) => id) },
];

export const userStatusLabels: Record<UserStatus, string> = { active: 'نشط', inactive: 'غير نشط', suspended: 'موقوف' };
export const userStatusOptions: UserStatus[] = ['active', 'inactive', 'suspended'];
export const mockSystemUsers: SystemUser[] = [
  { id: 'user-101', name: 'مدير النظام', email: 'admin@company.com', temporaryPassword: 'admin123', roleId: 'admin', status: 'active', lastLogin: '2026-08-31 09:12', imageUrl: '' },
  { id: 'user-102', name: 'سارة أحمد', email: 'sara.ahmed@company.com', temporaryPassword: 'temporary123', roleId: 'manager', employeeId: 'emp-101', status: 'active', lastLogin: '2026-08-30 16:44', imageUrl: '' },
  { id: 'user-103', name: 'محمود علي', email: 'mahmoud.ali@company.com', temporaryPassword: 'temporary123', roleId: 'employee', employeeId: 'emp-102', status: 'inactive', lastLogin: '2026-08-26 11:20', imageUrl: '' },
  { id: 'user-104', name: 'ليلى حسن', email: 'leila.hassan@company.com', temporaryPassword: 'temporary123', roleId: 'viewer', employeeId: 'emp-103', status: 'active', lastLogin: '2026-08-31 08:05', imageUrl: '' },
];
