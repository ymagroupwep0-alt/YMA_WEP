'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ProjectFormModal, ProjectFormValues } from '@/components/projects/project-form-modal';
import { ProjectStatusBadge } from '@/components/projects/project-status-badge';
import { Project, statusLabels, statusOptions } from '@/data/projects';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';
import { usePersistentList } from '@/lib/client/use-persistent-list';

type ApiProject = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  clientId?: string | null;
  managerId?: string | null;
  status: Project['status'];
  budget: number;
  progress: number;
  startDate: string;
  dueDate: string;
  client?: { name: string } | null;
  manager?: { fullName: string } | null;
  members?: { employee: { fullName: string } }[];
  reports?: { title: string; createdAt: string; type: string; employeeId?: string | null }[];
};

const toProject = (project: ApiProject): Project & { clientId?: string; managerId?: string } => ({
  id: project.id,
  code: project.code,
  name: project.name,
  client: project.client?.name ?? '—',
  description: project.description ?? 'لا يوجد وصف للمشروع.',
  status: project.status as Project['status'],
  startDate: project.startDate.slice(0, 10),
  dueDate: project.dueDate.slice(0, 10),
  budget: project.budget,
  progress: project.progress,
  manager: project.manager?.fullName ?? '—',
  clientId: project.clientId ?? undefined,
  managerId: project.managerId ?? undefined,
  team: project.members?.map((member) => member.employee.fullName) ?? [],
  reports: project.reports?.map((report) => ({ title: report.title, date: report.createdAt.slice(0, 10), owner: report.employeeId ?? '—' })) ?? [],
  files: [],
  timeline: [],
});

const currencyFormat = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

export default function ProjectsPage() {
  const { can, check } = usePermissionGuard('projects');
  const { data: apiProjects, loading, error, refresh } = usePersistentList<ApiProject>('projects');
  const projects = useMemo(() => apiProjects.map(toProject), [apiProjects]);
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const uniqueClients = useMemo(() => Array.from(new Set(projects.map((project) => project.client))), [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.code.toLowerCase().includes(search.toLowerCase()) ||
        project.client.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' ? true : project.status === statusFilter;
      const matchesClient = clientFilter === 'all' ? true : project.client === clientFilter;
      const matchesStartDate = startDate ? project.startDate >= startDate : true;
      const matchesDueDate = dueDate ? project.dueDate <= dueDate : true;

      return matchesSearch && matchesStatus && matchesClient && matchesStartDate && matchesDueDate;
    });
  }, [projects, search, statusFilter, clientFilter, startDate, dueDate]);

  const handleCreate = async (values: ProjectFormValues) => {
    if (!check(selectedProject ? 'edit' : 'create')) return;
    const response = await fetch(selectedProject ? `/api/data/projects/${selectedProject.id}` : '/api/data/projects', {
      method: selectedProject ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!response.ok) return;
    await refresh();
    setOpen(false);
    setSelectedProject(null);
  };

  const handleEdit = (project: Project) => {
    if (!check('edit')) return;
    setSelectedProject(project);
    setOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    if (!check('delete')) return;
    const response = await fetch(`/api/data/projects/${projectId}`, { method: 'DELETE' });
    if (response.ok) await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">إدارة المشاريع</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">المشاريع</h1>
          <p className="mt-2 text-sm text-slate-500">تابع جميع المشاريع النشطة والتقارير والموعد النهائي لكل مهمة.</p>
        </div>

        <button
          type="button"
          disabled={!can('create')}
          onClick={() => {
            setSelectedProject(null);
            setOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          إضافة مشروع جديد
        </button>
      </div>

      <div className="card-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن مشروع أو كود أو عميل..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">كل الحالات</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">كل العملاء</option>
            {uniqueClients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {loading && <p className="p-8 text-center text-sm text-slate-500">جاري تحميل المشاريع...</p>}
        {error && <p className="p-8 text-center text-sm text-rose-600">{error}</p>}
        {!loading && !error && filteredProjects.length === 0 && <p className="p-8 text-center text-sm text-slate-500">لا توجد مشاريع مطابقة.</p>}
        <div className="overflow-x-auto">
          <table className="data-table min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header px-4 py-3">كود المشروع</th>
                <th className="table-header px-4 py-3">اسم المشروع</th>
                <th className="table-header px-4 py-3">العميل</th>
                <th className="table-header px-4 py-3">الحالة</th>
                <th className="table-header px-4 py-3">تاريخ البداية</th>
                <th className="table-header px-4 py-3">موعد التسليم</th>
                <th className="table-header px-4 py-3">الميزانية</th>
                <th className="table-header px-4 py-3">نسبة الإنجاز</th>
                <th className="table-header px-4 py-3">المسؤول</th>
                <th className="table-header px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && filteredProjects.map((project) => (
                <tr key={project.id} className="border-t border-slate-200 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-900">{project.code}</td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/projects/${project.id}`} className="font-semibold text-slate-800 transition hover:text-blue-600">
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{project.client}</td>
                  <td className="px-4 py-3">
                    <ProjectStatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{project.startDate}</td>
                  <td className="px-4 py-3 text-slate-700">{project.dueDate}</td>
                  <td className="px-4 py-3 text-slate-700">{currencyFormat.format(project.budget)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-20 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{project.manager}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/projects/${project.id}`} aria-label="عرض المشروع" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Link>
                      {can('edit') && <button type="button" onClick={() => handleEdit(project)} aria-label="تعديل المشروع" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-amber-600">
                        <Pencil className="h-4 w-4" />
                      </button>}
                      {can('delete') && <button type="button" onClick={() => handleDelete(project.id)} aria-label="حذف المشروع" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProjectFormModal
        open={open}
        project={selectedProject}
        onClose={() => {
          setOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleCreate}
      />
    </div>
  );
}
