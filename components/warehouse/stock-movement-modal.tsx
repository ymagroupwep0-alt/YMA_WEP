'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import type { Client } from '@/data/clients';
import type { Employee } from '@/data/employees';
import { StockMovementType, stockMovementTypeLabels, stockMovementTypeOptions, WarehouseProduct } from '@/data/warehouse';

export type MovementFormValues = {
  productId: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  employeeId: string;
  employeeName: string;
  reason: string;
  clientId?: string;
  clientName?: string;
  supplierId?: string;
  unitCost?: number;
  sellingPrice?: number;
  notes: string;
};

type SupplierOption = { id: string; name: string; company?: string };
type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MovementFormValues) => void | Promise<void>;
  products: WarehouseProduct[];
  employees: Employee[];
  clients?: Client[];
  suppliers?: SupplierOption[];
  selectedProduct?: string;
};

const emptyForm: MovementFormValues = {
  productId: '', type: 'in', quantity: 0, date: new Date().toISOString().slice(0, 10),
  employeeId: '', employeeName: '', reason: '', clientId: '', clientName: '', supplierId: '',
  unitCost: 0, sellingPrice: 0, notes: '',
};
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';
const icons = { in: ArrowDownToLine, out: ArrowUpFromLine, return: RotateCcw, adjustment: SlidersHorizontal };

export function StockMovementModal({ open, onClose, onSubmit, products, employees, clients = [], suppliers = [], selectedProduct }: Props) {
  const [form, setForm] = useState<MovementFormValues>({ ...emptyForm, productId: selectedProduct ?? '' });
  useEffect(() => { setForm({ ...emptyForm, productId: selectedProduct ?? '' }); }, [open, selectedProduct]);
  if (!open) return null;

  const update = <K extends keyof MovementFormValues>(field: K, value: MovementFormValues[K]) => setForm((current) => ({ ...current, [field]: value }));
  const selectEmployee = (id: string) => { const employee = employees.find((item) => item.id === id); setForm((current) => ({ ...current, employeeId: id, employeeName: employee?.fullName ?? '' })); };
  const selectClient = (id: string) => { const client = clients.find((item) => item.id === id); setForm((current) => ({ ...current, clientId: id, clientName: client?.company || client?.name || '' })); };
  const submit = async (event: FormEvent) => { event.preventDefault(); await onSubmit(form); onClose(); };
  const Icon = icons[form.type];
  const showClientSelector = form.type === 'out' || form.type === 'return';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2 text-blue-600"><Icon className="h-5 w-5" /></div><div><p className="text-sm font-medium text-blue-600">حركة المخزون</p><h3 className="text-2xl font-bold text-slate-900">تسجيل حركة جديدة</h3></div></div>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">المنتج<select value={form.productId} onChange={(e) => update('productId', e.target.value)} className={`${inputClass} mt-2`} required><option value="">اختر المنتج</option>{products.map((product) => <option key={product.id} value={product.id}>{product.code} - {product.name}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">نوع العملية<select value={form.type} onChange={(e) => update('type', e.target.value as StockMovementType)} className={`${inputClass} mt-2`}>{stockMovementTypeOptions.map((type) => <option key={type} value={type}>{stockMovementTypeLabels[type]}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">الكمية<input type="number" min="0" value={form.quantity} onChange={(e) => update('quantity', Number(e.target.value))} className={`${inputClass} mt-2`} required /></label>
            <label className="text-sm font-medium text-slate-700">التاريخ<input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className={`${inputClass} mt-2`} required /></label>
            <label className="text-sm font-medium text-slate-700">الموظف المسؤول<select value={form.employeeId} onChange={(e) => selectEmployee(e.target.value)} className={`${inputClass} mt-2`} required><option value="">اختر الموظف</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></label>
            {showClientSelector && <label className="text-sm font-medium text-slate-700">العميل<select value={form.clientId ?? ''} onChange={(e) => selectClient(e.target.value)} className={`${inputClass} mt-2`} required><option value="">اختر العميل</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.company || client.name}</option>)}</select></label>}
            {showClientSelector && <label className="text-sm font-medium text-slate-700">سعر البيع الفعلي أو التفاوضي للوحدة<input type="number" min="0" value={form.sellingPrice ?? 0} onChange={(e) => update('sellingPrice', Number(e.target.value))} className={`${inputClass} mt-2`} required /></label>}
            {form.type === 'in' && <><label className="text-sm font-medium text-slate-700">المورد<select value={form.supplierId ?? ''} onChange={(e) => update('supplierId', e.target.value)} className={`${inputClass} mt-2`}><option value="">من مورد المنتج تلقائيًا</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.company || supplier.name}</option>)}</select></label><label className="text-sm font-medium text-slate-700">سعر الشراء للوحدة<input type="number" min="0" value={form.unitCost ?? 0} onChange={(e) => update('unitCost', Number(e.target.value))} className={`${inputClass} mt-2`} /></label></>}
            <label className="text-sm font-medium text-slate-700 md:col-span-2">سبب العملية<input value={form.reason} onChange={(e) => update('reason', e.target.value)} className={`${inputClass} mt-2`} required /></label>
          </div>
          <label className="block text-sm font-medium text-slate-700">ملاحظات<textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className={`${inputClass} mt-2 min-h-[90px]`} /></label>
          <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button><button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">تسجيل الحركة</button></div>
        </form>
      </div>
    </div>
  );
}
