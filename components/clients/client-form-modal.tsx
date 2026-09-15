'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Client, clientStatusLabels, clientStatusOptions, ClientStatus } from '@/data/clients';

type ClientFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (client: Omit<Client, 'id' | 'code' | 'projectCount' | 'projectTotal' | 'associatedProjects' | 'upcomingPayments' | 'dateAdded'>) => void;
  client?: Client | null;
};

const defaultValues = {
  name: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  clientType: '',
  notes: '',
  status: 'active' as ClientStatus,
};

export function ClientFormModal({ open, onClose, onSubmit, client }: ClientFormModalProps) {
  const [form, setForm] = useState(defaultValues);

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        company: client.company,
        phone: client.phone,
        email: client.email,
        address: client.address,
        clientType: client.clientType,
        notes: client.notes,
        status: client.status,
      });
    } else {
      setForm(defaultValues);
    }
  }, [client, open]);

  if (!open) return null;

  const handleChange = (field: keyof typeof defaultValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      company: form.company,
      phone: form.phone,
      email: form.email,
      address: form.address,
      clientType: form.clientType,
      notes: form.notes,
      status: form.status,
    });
    onClose();
    setForm(defaultValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-blue-600">إدارة العملاء</p>
            <h3 className="text-2xl font-bold text-slate-900">{client ? 'تعديل العميل' : 'عميل جديد'}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">اسم العميل</label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">اسم الشركة</label>
              <input
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">العنوان</label>
              <input
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">نوع العميل</label>
              <input
                value={form.clientType}
                onChange={(e) => handleChange('clientType', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">حالة العميل</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value as ClientStatus)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              {clientStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {clientStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              إلغاء
            </button>
            <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              {client ? 'حفظ التغييرات' : 'إضافة العميل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
