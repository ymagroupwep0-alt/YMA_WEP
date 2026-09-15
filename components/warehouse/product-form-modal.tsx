/* eslint-disable @next/next/no-img-element */
'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { WarehouseProduct } from '@/data/warehouse';

export type ProductFormValues = Omit<WarehouseProduct, 'id'>;
type Props = { open: boolean; onClose: () => void; onSubmit: (values: ProductFormValues) => void | Promise<void>; product?: WarehouseProduct | null };
const emptyForm: ProductFormValues = { code: '', name: '', category: '', description: '', currentQuantity: 0, minimumQuantity: 0, unit: '', purchasePrice: 0, storageLocation: '', supplier: '', imageUrl: '' };
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

export function ProductFormModal({ open, onClose, onSubmit, product }: Props) {
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const previousBlobUrlRef = useRef<string | null>(null);

  useEffect(() => { setForm(product ? { ...product } : emptyForm); setImageFile(null); }, [product, open]);

  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
        previousBlobUrlRef.current = null;
      }
    };
  }, []);

  if (!open) return null;
  const update = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => setForm((current) => ({ ...current, [field]: value }));
  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
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
  const submit = async (event: FormEvent) => { event.preventDefault(); let imageUrl = form.imageUrl; if (imageFile) { const payload = new FormData(); payload.set('file', imageFile); payload.set('mode', 'product'); const response = await fetch('/api/uploads', { method: 'POST', body: payload }); if (!response.ok) return; const uploaded = await response.json(); imageUrl = uploaded.url; } await onSubmit({ ...form, imageUrl }); onClose(); };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><p className="text-sm font-medium text-blue-600">إدارة المخزن</p><h3 className="text-2xl font-bold text-slate-900">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3></div><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="space-y-5 p-6"><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-slate-700">كود المنتج<input value={form.code} onChange={(e) => update('code', e.target.value)} className={`${inputClass} mt-2`} required /></label><label className="text-sm font-medium text-slate-700">اسم المنتج<input value={form.name} onChange={(e) => update('name', e.target.value)} className={`${inputClass} mt-2`} required /></label><label className="text-sm font-medium text-slate-700">التصنيف<input value={form.category} onChange={(e) => update('category', e.target.value)} className={`${inputClass} mt-2`} required /></label><label className="text-sm font-medium text-slate-700">المورد (اختياري)<input value={form.supplier} onChange={(e) => update('supplier', e.target.value)} className={`${inputClass} mt-2`} /></label></div><label className="block text-sm font-medium text-slate-700">وصف المنتج<textarea value={form.description} onChange={(e) => update('description', e.target.value)} className={`${inputClass} mt-2 min-h-[80px]`} required /></label><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-slate-700">الكمية الحالية<input type="number" min="0" value={form.currentQuantity} onChange={(e) => update('currentQuantity', Number(e.target.value))} className={`${inputClass} mt-2`} required /></label><label className="text-sm font-medium text-slate-700">الحد الأدنى للمخزون<input type="number" min="0" value={form.minimumQuantity} onChange={(e) => update('minimumQuantity', Number(e.target.value))} className={`${inputClass} mt-2`} required /></label><label className="text-sm font-medium text-slate-700">الوحدة<input value={form.unit} onChange={(e) => update('unit', e.target.value)} className={`${inputClass} mt-2`} required /></label><label className="text-sm font-medium text-slate-700">سعر الشراء<input type="number" min="0" value={form.purchasePrice} onChange={(e) => update('purchasePrice', Number(e.target.value))} className={`${inputClass} mt-2`} required /></label><label className="text-sm font-medium text-slate-700">مكان التخزين<input value={form.storageLocation} onChange={(e) => update('storageLocation', e.target.value)} className={`${inputClass} mt-2`} required /></label></div><div><p className="mb-2 text-sm font-medium text-slate-700">صورة المنتج</p><div className="flex items-center gap-4"><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-blue-300"><ImagePlus className="h-5 w-5 text-blue-600" />اختر صورة<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>{form.imageUrl && <img src={form.imageUrl} alt="معاينة المنتج" className="h-16 w-16 rounded-xl object-cover" />}</div></div><div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button><button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">{product ? 'حفظ التغييرات' : 'إضافة المنتج'}</button></div></form></div></div>;
}
