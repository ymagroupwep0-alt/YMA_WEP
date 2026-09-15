import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { userCredentialProvider } from './provider';
import type { Session } from './types';

export const AUTH_COOKIE_NAME = 'yma_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const getSessionSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET is required in production');
  return 'development-only-yma-auth-secret';
};

const encode = (value: string) => Buffer.from(value).toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (value: string) =>
  createHmac('sha256', getSessionSecret()).update(value).digest('base64url');

const serializeSession = (session: Session) => {
  const payload = encode(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
};

const parseSession = (value: string): Session | null => {
  try {
    const [payload, signature] = value.split('.');
    if (!payload || !signature) return null;
    const expected = Buffer.from(sign(payload));
    const supplied = Buffer.from(signature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    const session = JSON.parse(decode(payload)) as Session;
    if (!session.userId || !Number.isInteger(session.issuedAt) || !Number.isInteger(session.expiresAt)) return null;
    if (session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
};

export async function createSession(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const session: Session = { userId, issuedAt: now, expiresAt: now + SESSION_TTL_SECONDS };
  (await cookies()).set(AUTH_COOKIE_NAME, serializeSession(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getSession() {
  const value = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  return value ? parseSession(value) : null;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await userCredentialProvider.findById(session.userId);
  return user?.status === 'active' ? user : null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function destroySession() {
  (await cookies()).set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}