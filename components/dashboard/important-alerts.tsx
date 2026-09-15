'use client';

import Link from 'next/link';
import { AlertTriangle, CircleAlert, ShieldCheck, type LucideIcon } from 'lucide-react';
import { SectionCard } from '@/components/common/section-card';
import type { DashboardAlertItem } from '@/data/dashboard';

const alertIcons: Record<string, LucideIcon> = {
  warning: AlertTriangle,
  critical: CircleAlert,
  info: ShieldCheck,
  success: ShieldCheck,
};

const importanceStyles: Record<string, string> = {
  High: 'bg-rose-100 text-rose-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-emerald-100 text-emerald-700',
};

export function ImportantAlertsList({ alerts }: { alerts: DashboardAlertItem[] }) {
  return (
    <SectionCard title="التنبيهات المهمة" action={<AlertTriangle className="h-4 w-4 text-amber-500" />}>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type] || AlertTriangle;
          const alertBody = (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-amber-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                    <p className="mt-1 text-xs leading-6 text-slate-600">{alert.description}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${importanceStyles[alert.importance] || importanceStyles.Medium}`}>
                  {alert.importance}
                </span>
              </div>
            </div>
          );

          if (alert.href) {
            return (
              <Link key={alert.id} href={alert.href} className="block">
                {alertBody}
              </Link>
            );
          }

          return <div key={alert.id}>{alertBody}</div>;
        })}
      </div>
    </SectionCard>
  );
}
