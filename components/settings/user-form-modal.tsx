/* eslint-disable @next/next/no-img-element */
'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { RoleId, roles, SystemUser, UserStatus, userStatusLabels, userStatusOptions } from '@/data/settings';
import { UserPermissionOverrides } from '@/components/settings/user-permission-overrides';

export type UserFormValues = Omit<SystemUser, 'id' | 'lastLogin'>;
type Props = { open: boolean; onClose: () => void; onSubmit: (values: UserFormValues) => void; user?: SystemUser | null; entityLabel?: 'مستخدم' | 'موظف' };
const emptyForm: UserFormValues = { name: '', email: '', phone: '', temporaryPassword: '', roleId: 'employee', employeeId: '', status: 'active', imageUrl: '', permissionOverrides: {} };
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

export function UserFormModal({ open, onClose, onSubmit, user, entityLabel = 'مستخدم' }: Props) {
  const [form, setForm] = useState<UserFormValues>(emptyForm);
  const [employees, setEmployees] = useState<Array<{ id: string; fullName: string; code: string }>>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const previousBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setImageFile(null);
    setForm(user ? { name: user.name, email: user.email, phone: user.phone ?? '', temporaryPassword: '', roleId: user.roleId, employeeId: user.employeeId, status: user.status, imageUrl: user.imageUrl, permissionOverrides: user.permissionOverrides ?? {} } : emptyForm);
  }, [user, open]);

  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
        previousBlobUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setEmployeesLoading(true);
    fetch('/api/data/employees').then(async (response) => {
      if (!response.ok) throw new Error('تعذر تحميل الموظفين');
      return response.json() as Promise<Array<{ id: string; fullName: string; code: string }>>;
    }).then(setEmployees).catch(() => setEmployees([])).finally(() => setEmployeesLoading(false));
  }, [open]);

  if (!open) return null;
  const update = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => setForm((current) => ({ ...current, [field]: value }));
  const image = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previousBlobUrlRef.current) {
      URL.revokeObjectURL(previousBlobUrlRef.current);
      previousBlobUrlRef.current = null;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    previousBlobUrlRef.current = objectUrl;
    update('imageUrl', objectUrl);
  };
  const submit = async (event: FormEvent) => { event.preventDefault(); let imageUrl = form.imageUrl; if (imageFile) { const payload = new FormData(); payload.set('file', imageFile); payload.set('mode', 'account'); const response = await fetch('/api/uploads', { method: 'POST', body: payload }); if (!response.ok) return; const uploaded = await response.json(); imageUrl = uploaded.url; } onSubmit({ ...form, imageUrl }); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div><p className="text-sm font-medium text-blue-600">{entityLabel === 'موظف' ? 'إدارة الموظفين' : 'مستخدمو النظام'}</p><h3 className="text-2xl font-bold text-slate-900">{user ? `تعديل ${entityLabel}` : `إضافة ${entityLabel}`}</h3></div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">الاسم<input value={form.name} onChange={(event) => update('name', event.target.value)} className={`${inputClass} mt-2`} required /></label>
            <label className="text-sm font-medium text-slate-700">البريد الإلكتروني<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className={`${inputClass} mt-2`} required /></label>
            <label className="text-sm font-medium text-slate-700">رقم الهاتف<input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} className={`${inputClass} mt-2`} required /></label>
            <label className="text-sm font-medium text-slate-700">كلمة المرور المؤقتة<input type="password" value={form.temporaryPassword} onChange={(event) => update('temporaryPassword', event.target.value)} className={`${inputClass} mt-2`} required={!user} /></label>
            <label className="text-sm font-medium text-slate-700">الدور<select value={form.roleId} onChange={(event) => update('roleId', event.target.value as RoleId)} className={`${inputClass} mt-2`}>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">الموظف المرتبط<select value={form.employeeId ?? ''} onChange={(event) => update('employeeId', event.target.value)} className={`${inputClass} mt-2`} disabled={employeesLoading}><option value="">{employeesLoading ? 'جار تحميل الموظفين...' : 'بدون موظف مرتبط'}</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} - {employee.code}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">حالة الحساب<select value={form.status} onChange={(event) => update('status', event.target.value as UserStatus)} className={`${inputClass} mt-2`}>{userStatusOptions.map((status) => <option key={status} value={status}>{userStatusLabels[status]}</option>)}</select></label>
          </div>
          <div><p className="mb-2 text-sm font-medium text-slate-700">صورة المستخدم</p><div className="flex items-center gap-4"><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-blue-300"><ImagePlus className="h-5 w-5 text-blue-600" />اختيار صورة<input type="file" accept="image/*" onChange={image} className="hidden" /></label>{form.imageUrl && <img src={form.imageUrl} alt="معاينة المستخدم" className="h-14 w-14 rounded-full object-cover" />}</div></div>
          <UserPermissionOverrides value={form.permissionOverrides} onChange={(permissionOverrides) => update('permissionOverrides', permissionOverrides)} />
          <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button><button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">{user ? 'حفظ التغييرات' : `إضافة ${entityLabel}`}</button></div>
        </form>
      </div>
    </div>
  );
}
