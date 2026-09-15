import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { logActivity } from '@/lib/activity-log';
import { usersRepository } from '@/lib/repositories/prisma';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const current = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const next = typeof body.newPassword === 'string' ? body.newPassword : '';
  const confirmation = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';
  if (!current || !next || !confirmation) return NextResponse.json({ error: 'جميع حقول كلمة المرور مطلوبة' }, { status: 422 });
  if (next !== confirmation) return NextResponse.json({ error: 'تأكيد كلمة المرور غير مطابق' }, { status: 422 });
  if (next.length < 8) return NextResponse.json({ error: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' }, { status: 422 });
  const credentials = await usersRepository.getWithPassword(user.id);
  if (!credentials || !(await verifyPassword(current, credentials.passwordHash))) return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 422 });
  await usersRepository.updateAccount(user.id, { passwordHash: await hashPassword(next) });
  await logActivity({ action: 'updated', module: 'settings', entityType: 'password', entityId: user.id, description: 'changed account password' });
  return NextResponse.json({ success: true });
}
