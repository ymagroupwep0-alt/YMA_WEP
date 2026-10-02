'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Factory,
  FolderKanban,
  HandCoins,
  LayoutGrid,
  ListTodo,
  Settings,
  Truck,
  Users,
  WalletCards,
  Warehouse,
  X,
} from 'lucide-react';
import { canView } from '@/lib/permissions';
import type { PermissionSection } from '@/types/permissions';
import { usePermissions } from '@/components/permissions/permissions-provider';
import { CompanyLogo } from '@/components/common/company-logo';

const navigation: Array<{ title: string; href: string; icon: typeof LayoutGrid; section: PermissionSection }> = [
  { title: 'لوحة التحكم', href: '/dashboard', icon: LayoutGrid, section: 'dashboard' },
  { title: 'المشاريع', href: '/dashboard/projects', icon: FolderKanban, section: 'projects' },
  { title: 'التقارير', href: '/dashboard/reports', icon: BarChart3, section: 'reports' },
  { title: 'التصنيع و التجميع', href: '/dashboard/manufacturing', icon: Factory, section: 'manufacturing' },
  { title: 'الماليات', href: '/dashboard/finance', icon: WalletCards, section: 'finance' },
  { title: 'المرتبات', href: '/dashboard/payroll', icon: WalletCards, section: 'finance' },
  { title: 'المخزن', href: '/dashboard/warehouse', icon: Warehouse, section: 'warehouse' },
  { title: 'الموظفين', href: '/dashboard/employees', icon: Users, section: 'employees' },
  { title: 'الأرباح', href: '/dashboard/profits', icon: HandCoins, section: 'profits' },
  { title: 'العملاء والموردين', href: '/dashboard/clients', icon: BriefcaseBusiness, section: 'clients-suppliers' },
  { title: 'التوريدات', href: '/dashboard/supplies', icon: Truck, section: 'supplies' },
  { title: ' معلومات عن الشركة', href: '/dashboard/company', icon: Building2, section: 'company' },
  { title: 'سجل النشاط', href: '/dashboard/activity', icon: ListTodo, section: 'activity' },
  { title: 'الإعدادات', href: '/dashboard/settings', icon: Settings, section: 'settings' },
];

export function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { currentUserId, users, rolePermissions } = usePermissions();

  return (
    <aside className={`${mobile ? 'flex h-full w-full flex-col' : 'hidden h-screen w-72 lg:sticky lg:top-0 lg:flex lg:flex-col'} shrink-0 border-l border-slate-200 bg-slate-950 p-5 text-white`}>
      <div className="mb-8 flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
            <CompanyLogo width={44} height={44} className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">YMA</p>
            <h2 className="text-base font-semibold">Management</h2>
          </div>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {navigation.filter((item) => canView(users, rolePermissions, item.section, currentUserId)).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-200">النظام متصل</span>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </aside>
  );
}
