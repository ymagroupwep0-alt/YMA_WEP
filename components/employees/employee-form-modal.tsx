'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Employee, employeeStatusLabels, employeeStatusOptions, EmployeeStatus } from '@/data/employees';

type EmployeeFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (employee: Omit<Employee, 'id' | 'code' | 'projects' | 'reports' | 'warehouseLogs' | 'attendance' | 'imageUrl'>) => void;
  employee?: Employee | null;
};

const defaultValues = {
  fullName: '',
  email: '',
  phone: '',
  role: '',
  department: '',
  hireDate: '',
  salary: 0,
  status: 'active' as EmployeeStatus,
  notes: '',
};

export function EmployeeFormModal({ open, onClose, onSubmit, employee }: EmployeeFormModalProps) {
  const [form, setForm] = useState(defaultValues);

  useEffect(() => {
    if (employee) {
      setForm({
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        department: employee.department,
        hireDate: employee.hireDate,
        salary: employee.salary,
        status: employee.status,
        notes: employee.notes,
      });
    } else {
      setForm(defaultValues);
    }
  }, [employee, open]);

  if (!open) return null;

  const handleChange = (field: keyof typeof defaultValues, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      role: form.role,
      department: form.department,
      hireDate: form.hireDate,
      salary: Number(form.salary),
      status: form.status,
      notes: form.notes,
    });
    onClose();
    setForm(defaultValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-blue-600">إدارة الموظفين</p>
            <h3 className="text-2xl font-bold text-slate-900">{employee ? 'تعديل الموظف' : 'موظف جديد'}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">الاسم الكامل</label>
              <input
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">رقم الهاتف</label>
              <input
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">الوظيفة</label>
              <input
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">القسم</label>
              <input
                value={form.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">تاريخ التعيين</label>
              <input
                type="date"
                value={form.hireDate}
                onChange={(e) => handleChange('hireDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">الراتب</label>
              <input
                type="number"
                min={0}
                value={form.salary}
                onChange={(e) => handleChange('salary', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">حالة الموظف</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value as EmployeeStatus)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                {employeeStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {employeeStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">رابط/صورة الموظف</label>
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              إلغاء
            </button>
            <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              {employee ? 'حفظ التغييرات' : 'إضافة الموظف'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
