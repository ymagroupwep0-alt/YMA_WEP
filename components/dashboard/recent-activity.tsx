'use client';

import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, Building2, Factory, FileText, PackageCheck, WalletCards, type LucideIcon } from 'lucide-react';
import { SectionCard } from '@/components/common/section-card';
import type { DashboardActivityItem } from '@/data/dashboard';

const activityIcons: Record<string, LucideIcon> = {
  project_created: BriefcaseBusiness,
  project_updated: BriefcaseBusiness,
  employee_added: Building2,
  report_approved: FileText,
  report_created: FileText,
  inventory_moved: PackageCheck,
  finance_added: WalletCards,
  manufacturing_added: Factory,
};

export function RecentActivityList({ activities }: { activities: DashboardActivityItem[] }) {
  return (
    <SectionCard title="آخر العمليات" action={<span className="text-xs text-slate-500">آخر 24 ساعة</span>}>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type] || ArrowUpRight;

          const content = (
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100">
              <div className="flex gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                  <p className="mt-1 text-xs leading-6 text-slate-600">{activity.description}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{activity.userName} • {activity.createdAt}</p>
                </div>
              </div>
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">{activity.relatedModule}</span>
            </div>
          );

          if (activity.href) {
            return (
              <Link key={activity.id} href={activity.href} className="block">
                {content}
              </Link>
            );
          }

          return <div key={activity.id}>{content}</div>;
        })}
      </div>
    </SectionCard>
  );
}
