'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Project, ProjectStatus, statusLabels, statusOptions } from '@/data/projects';
import { usePersistentList } from '@/lib/client/use-persistent-list';

export type ProjectFormValues = Omit<Project, 'id' | 'code' | 'team' | 'reports' | 'files' | 'timeline' | 'client' | 'manager'> & {
  clientId?: string;
  managerId?: string;
};

type ProjectFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: ProjectFormValues) => void;
  project?: (Project & { clientId?: string; managerId?: string }) | null;
};

const defaultValues = {
  name: '',
  description: '',
  status: 'new' as ProjectStatus,
  startDate: '',
  dueDate: '',
  budget: 0,
  progress: 0,
  clientId: '',
  managerId: '',
};

export function ProjectFormModal({ open, onClose, onSubmit, project }: ProjectFormModalProps) {
  const [form, setForm] = useState(defaultValues);
  const { data: clients } = usePersistentList<{ id: string; name: string }>('clients');
  const { data: employees } = usePersistentList<{ id: string; fullName: string }>('employees');

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        dueDate: project.dueDate,
        budget: project.budget,
        progress: project.progress,
        clientId: project.clientId ?? '',
        managerId: project.managerId ?? '',
      });
    } else {
      setForm(defaultValues);
    }
  }, [project, open]);

  if (!open) return null;

  const handleChange = (field: keyof typeof defaultValues, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description,
      status: form.status,
      startDate: form.startDate,
      dueDate: form.dueDate,
      budget: Number(form.budget),
      progress: Number(form.progress),
      clientId: form.clientId || undefined,
      managerId: form.managerId || undefined,
    });
    onClose();
    setForm(defaultValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-blue-600">إضافة مشروع</p>
            <h3 className="text-2xl font-bold text-slate-900">{project ? 'تعديل المشروع' : 'مشروع جديد'}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">اسم المشروع</label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">العميل</label>
              <select
                value={form.clientId}
                onChange={(e) => handleChange('clientId', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              >
                <option value="">اختر العميل</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">وصف المشروع</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">تاريخ البداية</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">تاريخ التسليم</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">الميزانية</label>
              <input
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) => handleChange('budget', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">نسبة الإنجاز</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => handleChange('progress', Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">المسؤول</label>
              <select
                value={form.managerId}
                onChange={(e) => handleChange('managerId', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              >
                <option value="">اختر الموظف المسؤول</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">حالة المشروع</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value as ProjectStatus)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              إلغاء
            </button>
            <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              {project ? 'حفظ التغييرات' : 'إضافة المشروع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
