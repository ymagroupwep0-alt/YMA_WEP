import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { toPublicUser } from '@/lib/auth/types';
import { roles } from '@/data/settings';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const [rolePermissionRows, overrides] = await Promise.all([
    prisma.rolePermission.findMany({ select: { roleId: true, permissionId: true } }),
    prisma.userPermissionOverride.findMany({ where: { userId: user.id }, select: { permissionId: true, effect: true } }),
  ]);
  const rolePermissions = rolePermissionRows.reduce<Record<string, string[]>>((result, item) => { result[item.roleId] = [...(result[item.roleId] ?? []), item.permissionId]; return result; }, {});
  if (rolePermissionRows.length === 0) {
    for (const role of roles) rolePermissions[role.id] = role.permissionIds;
  }
  return NextResponse.json({
    user: toPublicUser(user),
    rolePermissions,
    overrides: overrides.map(({ permissionId, effect }) => ({ permissionId, effect })),
  });
}
