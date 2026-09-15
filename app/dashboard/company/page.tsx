'use client';

import { Building2, Info, ShieldCheck } from 'lucide-react';
import { CompanyDocumentsSection } from '@/components/company/company-documents';
import { CompanyGallerySection } from '@/components/company/company-gallery';
import { CompanyGoalsSection } from '@/components/company/company-goals';
import { CompanyOrganizationSection } from '@/components/company/company-organization';
import { CompanyOverviewSection } from '@/components/company/company-overview';
import { CompanyTimelineSection } from '@/components/company/company-timeline';
import { CompanyVisionSection } from '@/components/company/company-vision';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';
import type { CompanyDocument, CompanyGoal, CompanyGalleryItem, CompanyOrganizationalRole, CompanyTimelineEvent, CompanyValueItem } from '@/data/company';
import { useEffect, useState } from 'react';

type CompanyResponse = {
  id: string; name: string; summary: string; industry: string; foundedYear: number; headquarters: string;
  vision?: string | null; mission?: string | null; values: CompanyValueItem[]; documents: Array<CompanyDocument & { issueDate?: string | null; createdAt?: string }>;
  goals: CompanyGoal[]; timelineEvents: Array<Omit<CompanyTimelineEvent, 'year'> & { date: string }>;
  galleryItems: CompanyGalleryItem[];
  organizationalRoles: Array<CompanyOrganizationalRole & { employee?: { fullName?: string; imageUrl?: string | null } | null }>;
};

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [error, setError] = useState('');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const { can } = usePermissionGuard('company');

  useEffect(() => {
    Promise.all([fetch('/api/data/company'), fetch('/api/data/employees'), fetch('/api/data/projects')]).then(async ([companyResponse, employeesResponse, projectsResponse]) => {
      if (!companyResponse.ok) throw new Error('تعذر تحميل بيانات الشركة');
      const [companyData, employeeData, projectData] = await Promise.all([companyResponse.json() as Promise<CompanyResponse>, employeesResponse.ok ? employeesResponse.json() : [], projectsResponse.ok ? projectsResponse.json() : []]);
      setEmployeeCount(Array.isArray(employeeData) ? employeeData.filter((item: { status?: string }) => item.status !== 'inactive').length : 0);
      setActiveProjectCount(Array.isArray(projectData) ? projectData.filter((item: { status?: string }) => !['completed','cancelled'].includes(item.status ?? '')).length : 0);
      return companyData;
    }).then(setCompany).catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>;
  if (!company) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">جار تحميل بيانات الشركة...</div>;

  const profile = { name: company.name, summary: company.summary, industry: company.industry, foundedYear: company.foundedYear, headquarters: company.headquarters, employeeCount };
  const vision = company.vision ?? '';
  const mission = company.mission ?? '';
  const values = company.values;
  const gallery = company.galleryItems;
  const goals = company.goals;
  const timeline = company.timelineEvents.map((event) => ({ ...event, year: event.date.slice(0, 4) }));
  const documents = company.documents.map((document) => ({ ...document, addedAt: (document.issueDate ?? document.createdAt ?? '').slice(0, 10) }));
  const roles = company.organizationalRoles.map((role) => ({ ...role, name: role.name ?? role.employee?.fullName ?? 'غير محدد', imageUrl: role.imageUrl ?? role.employee?.imageUrl ?? undefined }));
  const updateProfile = async (next: typeof profile) => {
    try {
      const response = await fetch(`/api/data/company/${company.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
      if (!response.ok) throw new Error('تعذر حفظ بيانات الشركة');
      setCompany((current) => current ? { ...current, ...next } : current);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'تعذر حفظ بيانات الشركة'); }
  };
  const updateCompanyField = async (fields: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/data/company/${company.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      if (!response.ok) throw new Error('تعذر حفظ التغييرات');
      setCompany((current) => current ? { ...current, ...fields } : current);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'تعذر حفظ التغييرات'); }
  };

  const updateSection = async (key: 'values' | 'documents' | 'goals' | 'timelineEvents' | 'galleryItems', value: unknown) => {
    try {
      const response = await fetch(`/api/data/company/${company.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: value }) });
      if (!response.ok) throw new Error('تعذر حفظ التغييرات');
      setCompany((current) => current ? { ...current, [key]: value } as CompanyResponse : current);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'تعذر حفظ التغييرات'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">إدارة المعلومات</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">معلومات عن الشركة</h1>
          <p className="mt-2 text-sm text-slate-500">نظرة شاملة على هوية الشركة، رسالتها، تطورها، وثيقاتها الهيكل التنظيمي.</p>
        </div>
        <button type="button" onClick={() => document.getElementById('company-overview')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Building2 className="h-4 w-4" />
          تعديل المعلومات
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div id="company-overview"><CompanyOverviewSection profile={profile} onUpdate={updateProfile} /></div>
          <CompanyVisionSection
            vision={vision}
            mission={mission}
            values={values}
            onVisionChange={(value) => { void updateCompanyField({ vision: value }); }}
            onMissionChange={(value) => { void updateCompanyField({ mission: value }); }}
            onValuesChange={(next) => { void updateSection('values', next); }}
          />
          <CompanyGallerySection items={gallery} onChange={(next) => { void updateSection('galleryItems', next); }} />
          <CompanyGoalsSection goals={goals} onChange={(next) => { void updateSection('goals', next); }} />
          <CompanyTimelineSection events={timeline} onChange={(next) => { void updateSection('timelineEvents', next); }} />
          <CompanyOrganizationSection roles={roles} />
          <CompanyDocumentsSection documents={documents} onChange={(next) => { void updateSection('documents', next); }} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <Info className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-bold">ملخص سريع</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">اسم الشركة</p>
                <p className="mt-1 text-base font-bold text-slate-900">{profile.name}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">عدد الموظفين</p>
                <p className="mt-1 text-base font-bold text-slate-900">{profile.employeeCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">المشاريع النشطة</p>
                <p className="mt-1 text-base font-bold text-slate-900">{activeProjectCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="text-lg font-bold">الصلاحيات</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {([['view', 'عرض معلومات الشركة'], ['create', 'إنشاء بيانات الشركة'], ['edit', 'تعديل معلومات الشركة'], ['manage', 'إدارة بيانات الشركة']] as const).map(([action, label]) => { const allowed = can(action); return <div key={action} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"><span>{label}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${allowed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{allowed ? 'مسموح' : 'مرفوض'}</span></div>; })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
