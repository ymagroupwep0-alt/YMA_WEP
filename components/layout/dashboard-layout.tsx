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
        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
            aria-label="إغلاق القائمة"
          />
        )}
        <div
          aria-hidden={!mobileOpen}
          className={`invisible fixed inset-y-0 right-0 z-40 w-72 max-w-[calc(100vw-3rem)] transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'visible translate-x-0' : 'translate-x-full'}`}
        >
          <Sidebar mobile onClose={() => setMobileOpen(false)} />
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
