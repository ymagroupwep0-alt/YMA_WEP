'use client';

import { usePathname, useRouter } from 'next/navigation';
import { canView } from '@/lib/permissions';
import type { PermissionSection } from '@/types/permissions';
import { usePermissions } from './permissions-provider';

const routeSections: Array<[string, PermissionSection]> = [
  ['/dashboard/company', 'company'],
  ['/dashboard/projects', 'projects'],
  ['/dashboard/clients', 'clients-suppliers'],
  ['/dashboard/suppliers', 'clients-suppliers'],
  ['/dashboard/supplies', 'supplies'],
  ['/dashboard/reports', 'reports'],
  ['/dashboard/manufacturing', 'manufacturing'],
  ['/dashboard/finance', 'finance'],
  ['/dashboard/payroll', 'finance'],
  ['/dashboard/warehouse', 'warehouse'],
  ['/dashboard/employees', 'employees'],
  ['/dashboard/profits', 'profits'],
  ['/dashboard/activity', 'activity'],
  ['/dashboard/settings', 'settings'],
  ['/dashboard', 'dashboard'],
];

export function PermissionRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUserId, users, rolePermissions, loading } = usePermissions();
  const section = routeSections.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1];

  if (loading) return <div className="py-12 text-center text-sm text-slate-500">جاري تحميل الصلاحيات...</div>;

  if (section && !canView(users, rolePermissions, section, currentUserId)) {
    return (
      <div className="card-surface mx-auto max-w-xl p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">ليس لديك صلاحية للوصول إلى هذه الصفحة.</h1>
        <button type="button" onClick={() => router.push('/dashboard')} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          العودة إلى Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
