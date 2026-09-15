import type { AuthUser } from './provider';

export type PublicUser = Pick<AuthUser, 'id' | 'name' | 'email' | 'roleId' | 'employeeId' | 'imageUrl' | 'phone' | 'job' | 'status'>;

export type Session = {
  userId: string;
  issuedAt: number;
  expiresAt: number;
};

export const toPublicUser = (user: AuthUser): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roleId: user.roleId,
  employeeId: user.employeeId,
  imageUrl: user.imageUrl,
  phone: user.phone,
  job: user.job,
  status: user.status,
});