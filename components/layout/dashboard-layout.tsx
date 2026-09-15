'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { PermissionRouteGuard } from '@/components/permissions/permission-route-guard';
import { PermissionsProvider } from '@/components/permissions/permissions-provider';
import type { PublicUser } from '@/lib/auth/types';

export function DashboardLayout({ children, user }: { children: React.ReactNode; user: PublicUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <PermissionsProvider currentUserId={user.id}>
      <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <div className={`fixed inset-y-0 right-0 z-40 w-72 transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} `}>
          <div className="h-full bg-slate-950 p-5 text-white">
            <Sidebar mobile />
          </div>
        </div>

        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex min-h-screen w-full flex-1 flex-col">
          <TopNavbar user={user} onMenuToggle={() => setMobileOpen((prev) => !prev)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8"><PermissionRouteGuard>{children}</PermissionRouteGuard></main>
        </div>
      </div>
      </div>
    </PermissionsProvider>
  );
}
