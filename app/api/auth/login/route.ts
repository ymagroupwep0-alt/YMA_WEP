import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { isValidEmail, normalizeEmail, userCredentialProvider } from '@/lib/auth/provider';
import { prisma } from '@/lib/prisma';

const INVALID_CREDENTIALS = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !isValidEmail(email) || !password) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

  try {
    const user = await userCredentialProvider.findByEmail(email);
    const valid = user && user.status === 'active' && await userCredentialProvider.verifyPassword(user, password);
    if (!valid) return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await createSession(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Authentication lookup failed', error);
    return NextResponse.json({ error: 'تعذر تسجيل الدخول حاليا' }, { status: 503 });
  }
}