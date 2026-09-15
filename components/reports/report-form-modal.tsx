/* eslint-disable @next/next/no-img-element */
'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { FileImage, FileText, Paperclip, Upload, X } from 'lucide-react';
import { Report, ReportAttachment, ReportStatus, ReportType, reportStatusLabels, reportStatusOptions, reportTypeLabels, reportTypeOptions } from '@/data/reports';

export type ReportFormValues = Omit<Report, 'id' | 'code' | 'createdAt' | 'attachments' | 'activity'> & { attachments: ReportAttachment[] };
type SelectorProject = { id: string; code: string; name: string };
type SelectorEmployee = { id: string; fullName: string; role?: string };
type Props = { open: boolean; onClose: () => void; onSubmit: (values: ReportFormValues) => void; report?: Report | null; projects: SelectorProject[]; employees: SelectorEmployee[] };
const emptyForm: ReportFormValues = { title: '', type: 'project', projectId: '', projectName: '', employeeId: '', employeeName: '', description: '', content: '', status: 'new', attachments: [] };

export function ReportFormModal({ open, onClose, onSubmit, report, projects, employees }: Props) {
  const [form, setForm] = useState<ReportFormValues>(emptyForm);
  const mockProjects = projects;
  const mockEmployees = employees;
  useEffect(() => { if (report) setForm({ title: report.title, type: report.type, projectId: report.projectId, projectName: report.projectName, employeeId: report.employeeId, employeeName: report.employeeName, description: report.description, content: report.content, status: report.status, attachments: report.attachments }); else setForm(emptyForm); }, [report, open]);
  if (!open) return null;
  const update = <K extends keyof ReportFormValues>(field: K, value: ReportFormValues[K]) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleProject = (id: string) => { const item = projects.find((project) => project.id === id); setForm((prev) => ({ ...prev, projectId: id, projectName: item?.name ?? '' })); };
  const handleEmployee = (id: string) => { const item = employees.find((employee) => employee.id === id); setForm((prev) => ({ ...prev, employeeId: id, employeeName: item?.fullName ?? '' })); };
  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    const uploaded: ReportAttachment[] = [];
    for (const file of files) {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('mode', report ? 'edit' : 'create');
      const response = await fetch('/api/uploads', { method: 'POST', body: payload });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        window.alert(error?.error ?? `تعذر رفع ${file.name}`);
        continue;
      }
      const result = await response.json();
      uploaded.push({ id: `file-${Date.now()}-${file.name}`, name: result.name, type: file.type.split('/').pop()?.toUpperCase() ?? 'FILE', size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, isImage: result.isImage, url: result.url, mimeType: result.mimeType, fileSize: result.fileSize });
    }
    if (uploaded.length) update('attachments', [...form.attachments, ...uploaded]);
  };
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit({ ...form, projectId: form.type === 'general' ? undefined : form.projectId }); onClose(); };
  const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><p className="text-sm font-medium text-blue-600">إدارة التقارير</p><h3 className="text-2xl font-bold text-slate-900">{report ? 'تعديل التقرير' : 'إنشاء تقرير جديد'}</h3></div><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="space-y-5 p-6"><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-slate-700">عنوان التقرير<input value={form.title} onChange={(e) => update('title', e.target.value)} className={`${inputClass} mt-2`} required /></label><label className="text-sm font-medium text-slate-700">نوع التقرير<select value={form.type} onChange={(e) => update('type', e.target.value as ReportType)} className={`${inputClass} mt-2`}>{reportTypeOptions.map((type) => <option key={type} value={type}>{reportTypeLabels[type]}</option>)}</select></label></div><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-slate-700">المشروع المرتبط<select value={form.projectId} onChange={(e) => handleProject(e.target.value)} className={`${inputClass} mt-2`} required={form.type !== 'general'}><option value="">{form.type === 'general' ? 'بدون مشروع (اختياري)' : 'اختر المشروع'}</option>{mockProjects.map((project) => <option key={project.id} value={project.id}>{project.code} - {project.name}</option>)}</select></label><label className="text-sm font-medium text-slate-700">الموظف المسؤول<select value={form.employeeId} onChange={(e) => handleEmployee(e.target.value)} className={`${inputClass} mt-2`} required><option value="">اختر الموظف</option>{mockEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} - {employee.role}</option>)}</select></label></div><label className="block text-sm font-medium text-slate-700">وصف التقرير<textarea value={form.description} onChange={(e) => update('description', e.target.value)} className={`${inputClass} mt-2 min-h-[80px]`} required /></label><label className="block text-sm font-medium text-slate-700">محتوى التقرير<textarea value={form.content} onChange={(e) => update('content', e.target.value)} className={`${inputClass} mt-2 min-h-[150px] leading-7`} required /></label><label className="block text-sm font-medium text-slate-700">حالة التقرير<select value={form.status} onChange={(e) => update('status', e.target.value as ReportStatus)} className={`${inputClass} mt-2`}>{reportStatusOptions.map((status) => <option key={status} value={status}>{reportStatusLabels[status]}</option>)}</select></label><div><p className="mb-2 text-sm font-medium text-slate-700">الملفات والصور المرفقة</p><label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center hover:border-blue-300 hover:bg-blue-50/40"><Upload className="h-7 w-7 text-blue-600" /><span className="mt-2 text-sm font-semibold text-slate-700">اختر الصور أو PDF أو المستندات</span><span className="mt-1 text-xs text-slate-500">يمكنك رفع أكثر من ملف في المحاكاة الحالية</span><input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={handleFiles} className="hidden" /></label>{form.attachments.length > 0 && <div className="mt-3 grid gap-3 sm:grid-cols-2">{form.attachments.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">{file.isImage && file.url ? <img src={file.url} alt="" className="h-12 w-12 rounded-lg object-cover" /> : file.type === 'PDF' ? <FileText className="h-9 w-9 text-rose-500" /> : <FileImage className="h-9 w-9 text-blue-500" />}<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{file.name}</p><p className="text-xs text-slate-500">{file.type} • {file.size}</p></div><button type="button" onClick={() => update('attachments', form.attachments.filter((item) => item.id !== file.id))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X className="h-4 w-4" /></button></div>)}</div>}</div><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Paperclip className="h-4 w-4" />{report ? 'حفظ التغييرات' : 'حفظ التقرير'}</button></div></form></div></div>;
}