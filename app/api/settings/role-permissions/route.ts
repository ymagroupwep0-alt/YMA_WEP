import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authorization';
import { logActivity } from '@/lib/activity-log';
import { usersRepository } from '@/lib/repositories/prisma';

export async function PATCH(request: Request) {
  try {
    const user = await requirePermission('settings', 'manage');
    if (user.roleId !== 'admin') return NextResponse.json({ error: 'يقتصر تعديل صلاحيات الأدوار على المدير النظام' }, { status: 403 });
    const body = await request.json() as { roleId?: unknown; permissionIds?: unknown };
    const roleId = typeof body.roleId === 'string' ? body.roleId : '';
    const permissionIds = Array.isArray(body.permissionIds) && body.permissionIds.every((item) => typeof item === 'string') ? body.permissionIds as string[] : null;
    if (!['manager', 'employee', 'viewer'].includes(roleId) || !permissionIds) return NextResponse.json({ error: 'بيانات الصلاحيات غير صحيحة' }, { status: 422 });
    const saved = await usersRepository.setRolePermissions(roleId, permissionIds);
    await logActivity({ action: 'changed_permissions', module: 'settings', entityType: 'role', entityId: roleId, description: 'changed role permissions' });
    return NextResponse.json({ roleId, permissionIds: saved });
  } catch (error) {
    const status = error instanceof Error && error.message === 'INVALID_PERMISSION' ? 422 : 403;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'تعذر حفظ الصلاحيات' }, { status });
  }
}
