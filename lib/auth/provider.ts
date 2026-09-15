import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from './password';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  employeeId: string | null;
  status: string;
  lastLoginAt: Date | null;
  imageUrl: string | null;
  phone: string | null;
  job: string | null;
};

export interface UserCredentialProvider {
  findByEmail(email: string): Promise<(AuthUser & { passwordHash: string }) | null>;
  findById(userId: string): Promise<AuthUser | null>;
  verifyPassword(user: AuthUser & { passwordHash: string }, password: string): Promise<boolean>;
}

export class PrismaUserCredentialProvider implements UserCredentialProvider {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, select: {
      id: true, name: true, email: true, roleId: true, employeeId: true, status: true,
      lastLoginAt: true, imageUrl: true, phone: true, job: true, passwordHash: true,
    } });
  }

  async findById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: {
      id: true, name: true, email: true, roleId: true, employeeId: true, status: true,
      lastLoginAt: true, imageUrl: true, phone: true, job: true,
    } });
  }

  async verifyPassword(user: AuthUser & { passwordHash: string }, password: string) {
    return verifyPassword(password, user.passwordHash);
  }
}

export const userCredentialProvider = new PrismaUserCredentialProvider();

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const hashSessionSecret = (secret: string) => createHash('sha256').update(secret).digest();