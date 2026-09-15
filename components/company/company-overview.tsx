'use client';

import { useEffect, useState } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { SectionCard } from '@/components/common/section-card';
import { CompanyLogo } from '@/components/common/company-logo';
import type { CompanyOverview } from '@/data/company';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';

export function CompanyOverviewSection({
  profile,
  onUpdate,
}: {
  profile: CompanyOverview;
  onUpdate: (next: CompanyOverview) => void;
}) {
  const { check } = usePermissionGuard('company');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const handleSave = () => {
    if (!check('edit')) return;
    onUpdate(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

  return (
    <SectionCard
      title="نبذة عن الشركة"
      action={
        !isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <Pencil className="h-3.5 w-3.5" />
            تعديل المعلومات
          </button>
        ) : null
      }
    >
      {!isEditing ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2 xl:col-span-3">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
              <CompanyLogo width={96} height={96} className="h-full w-full" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">هوية الشركة</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{profile.name}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">اسم الشركة</p>
            <p className="mt-3 text-xl font-bold text-slate-900">{profile.name}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">مجال العمل</p>
            <p className="mt-3 text-base font-semibold text-slate-800">{profile.industry}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">سنة التأسيس</p>
            <p className="mt-3 text-base font-semibold text-slate-800">{profile.foundedYear}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2 xl:col-span-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">نبذة عن الشركة</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{profile.summary}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">المقر الرئيسي</p>
            <p className="mt-3 text-base font-semibold text-slate-800">{profile.headquarters}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">عدد الموظفين</p>
            <p className="mt-3 text-base font-semibold text-slate-800">{profile.employeeCount} موظف</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>اسم الشركة</span>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>مجال العمل</span>
              <input value={draft.industry} onChange={(e) => setDraft({ ...draft, industry: e.target.value })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>سنة التأسيس</span>
              <input type="number" value={draft.foundedYear} onChange={(e) => setDraft({ ...draft, foundedYear: Number(e.target.value) || 0 })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>عدد الموظفين</span>
              <input type="number" value={draft.employeeCount} onChange={(e) => setDraft({ ...draft, employeeCount: Number(e.target.value) || 0 })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span>المقر الرئيسي</span>
              <input value={draft.headquarters} onChange={(e) => setDraft({ ...draft, headquarters: e.target.value })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span>نبذة عن الشركة</span>
              <textarea value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} rows={4} className={inputClass} />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={handleCancel} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <X className="h-4 w-4" />
              إلغاء
            </button>
            <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500">
              <Save className="h-4 w-4" />
              حفظ التغييرات
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
