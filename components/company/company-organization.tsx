/* eslint-disable @next/next/no-img-element */
'use client';

import { Building2, Users } from 'lucide-react';
import { SectionCard } from '@/components/common/section-card';
import type { CompanyOrganizationalRole } from '@/data/company';

export function CompanyOrganizationSection({ roles }: { roles: CompanyOrganizationalRole[] }) {
  return (
    <SectionCard title="الهيكل التنظيمي" action={<span className="text-xs text-slate-500">{roles.length} منصب</span>}>
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">الإدارة العليا</div>
          <div className="h-8 w-px bg-slate-300" />
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800">المدير التنفيذي</div>
          <div className="h-8 w-px bg-slate-300" />
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800">مديرو الأقسام</div>
          <div className="h-8 w-px bg-slate-300" />
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800">الموظفون</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                {role.imageUrl ? (
                  <img src={role.imageUrl} alt={role.name} className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                    <Users className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <p className="text-base font-bold text-slate-900">{role.name}</p>
                  <p className="text-sm text-slate-600">{role.title}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>{role.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
