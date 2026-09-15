import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { requireAuth } from '@/lib/auth/session';
import { toPublicUser } from '@/lib/auth/types';

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  return <DashboardLayout user={toPublicUser(user)}>{children}</DashboardLayout>;
}
