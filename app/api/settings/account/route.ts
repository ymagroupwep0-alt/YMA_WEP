import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { isValidEmail, normalizeEmail } from '@/lib/auth/provider';
import { logActivity } from '@/lib/activity-log';
import { prisma } from '@/lib/prisma';
import { usersRepository } from '@/lib/repositories/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  if (!name || !isValidEmail(email)) return NextResponse.json({ error: 'بيانات الحساب غير صحيحة' }, { status: 422 });
  const duplicate = await prisma.user.findFirst({ where: { email, NOT: { id: user.id } }, select: { id: true } });
  if (duplicate) return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
  const updated = await usersRepository.updateAccount(user.id, {
    name,
    email,
    phone: typeof body.phone === 'string' ? body.phone.trim() || null : null,
    job: typeof body.job === 'string' ? body.job.trim() || null : null,
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.trim() || null : undefined,
  });
  await logActivity({ action: 'updated', module: 'settings', entityType: 'account', entityId: user.id, description: 'updated account settings' });
  return NextResponse.json(updated);
}
