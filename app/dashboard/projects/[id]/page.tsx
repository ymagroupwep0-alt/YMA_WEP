'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarRange, Folder, Paperclip, Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Project } from '@/data/projects';

type ApiProject = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: string;
  budget: number;
  progress: number;
  startDate: string;
  dueDate: string;
  client?: { name: string } | null;
  manager?: { fullName: string } | null;
  members?: { employee: { fullName: string } }[];
  reports?: { title: string; createdAt: string; employee?: { fullName: string } | null }[];
  financialSummary?: { revenue: number; expenses: number; profit: number };
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = String(params.id);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/data/projects/${projectId}`, { cache: 'no-store' });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error ?? 'تعذر تحميل بيانات المشروع');
        const record = payload as ApiProject | null;
        if (!record) throw new Error('المشروع غير موجود');
        setProject({ id: record.id, code: record.code, name: record.name, client: record.client?.name ?? '—', description: record.description ?? 'لا يوجد وصف للمشروع.', status: record.status as Project['status'], budget: record.budget, progress: record.progress, startDate: record.startDate.slice(0, 10), dueDate: record.dueDate.slice(0, 10), manager: record.manager?.fullName ?? '—', team: record.members?.map((member) => member.employee.fullName) ?? [], reports: record.reports?.map((report) => ({ title: report.title, date: report.createdAt.slice(0, 10), owner: report.employee?.fullName ?? '—' })) ?? [], files: [], timeline: [], financialSummary: { revenue: Number(record.financialSummary?.revenue ?? 0), expenses: Number(record.financialSummary?.expenses ?? 0), profit: Number(record.financialSummary?.profit ?? 0) } });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'تعذر تحميل بيانات المشروع');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [projectId]);

  if (loading) return <p className="p-8 text-center text-sm text-slate-500">جاري تحميل بيانات المشروع...</p>;
  if (error) return <p className="p-8 text-center text-sm text-rose-600">{error}</p>;
  if (!project) return <p className="p-8 text-center text-sm text-slate-500">المشروع غير موجود.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">تفاصيل المشروع</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{project.name}</h1>
        </div>

        <Link href="/dashboard/projects" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          العودة إلى المشاريع
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">معلومات المشروع</h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {project.code}
              </span>
            </div>

            <p className="leading-8 text-slate-700">{project.description}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">العميل</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{project.client}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">حالة المشروع</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{project.status}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">نسبة الإنجاز</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{project.progress}%</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">الميزانية</p>
                <p className="mt-2 text-lg font-bold text-slate-900">EGP {project.budget.toLocaleString('en-US')}</p>
              </div>
            </div>
          </section>

          <section className="card-surface p-5">
            <h2 className="text-xl font-bold text-slate-900">الملخص المالي للمشروع</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-sm text-slate-500">الإيرادات</p><p className="mt-2 text-lg font-bold text-emerald-700">EGP {project.financialSummary?.revenue.toLocaleString('en-US')}</p></div>
              <div className="rounded-2xl bg-rose-50 p-4"><p className="text-sm text-slate-500">التكاليف</p><p className="mt-2 text-lg font-bold text-rose-700">EGP {project.financialSummary?.expenses.toLocaleString('en-US')}</p></div>
              <div className="rounded-2xl bg-blue-50 p-4"><p className="text-sm text-slate-500">الربح</p><p className="mt-2 text-lg font-bold text-blue-700">EGP {project.financialSummary?.profit.toLocaleString('en-US')}</p></div>
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">الموظفين المسؤولين</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.team.map((person) => (
                <span key={person} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                  {person}
                </span>
              ))}
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">التقارير المرتبطة</h2>
            </div>
            <div className="space-y-3">
              {project.reports.map((report) => (
                <div key={report.title} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="font-medium text-slate-800">{report.title}</p>
                    <p className="text-xs text-slate-500">{report.owner}</p>
                  </div>
                  <span className="text-xs text-slate-600">{report.date}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">الملفات والصور</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {project.files.map((file) => (
                <div key={file.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium text-slate-800">{file.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{file.type} • {file.size}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Timeline المشروع</h2>
            </div>
            <div className="space-y-4">
              {project.timeline.map((item) => (
                <div key={item.title} className="relative border-r border-slate-200 pr-4">
                  <div className="absolute -right-1 top-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <div className="mb-1 text-sm font-semibold text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.date}</div>
                  <p className="mt-2 text-sm text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
