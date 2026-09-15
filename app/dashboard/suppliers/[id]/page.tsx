'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarRange, Mail, MapPin, Package, WalletCards } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SupplierStatusBadge } from '@/components/suppliers/supplier-status-badge';

const currencyFormat = new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });

type SupplierDetails = {
  id: string; code: string; name: string; company?: string | null; contactName: string; email: string; phone: string;
  address?: string | null; productsSnapshot?: string | null; status: 'active' | 'inactive' | 'pending'; notes?: string | null; dateAdded?: string | null;
  products: { id: string; name: string; category: string; currentQuantity: number; purchasePrice: number; unit: string }[];
  financeTransactions: { id: string; name: string; type: string; amount: number; currency: string; date: string; dueDate?: string | null; status: string }[];
};

export default function SupplierDetailsPage() {
  const params = useParams();
  const supplierId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [supplier, setSupplier] = useState<SupplierDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`/api/data/suppliers/${supplierId}`, { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(payload?.error ?? 'تعذر تحميل بيانات المورد');
        return payload as SupplierDetails;
      })
      .then((data) => { if (active) setSupplier(data); })
      .catch((reason: Error) => { if (active) setError(reason.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [supplierId]);

  if (loading) return <p className="py-12 text-center text-sm text-slate-500">جارٍ تحميل بيانات المورد...</p>;
  if (error) return <p className="card-surface p-6 text-center text-sm text-rose-700">{error}</p>;
  if (!supplier) notFound();

  const transactions = supplier.financeTransactions ?? [];
  const totalTransactions = transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const outstanding = transactions.filter((item) => ['pending', 'partial', 'overdue'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const upcoming = transactions.filter((item) => item.dueDate && item.dueDate.slice(0, 10) >= new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-medium text-blue-600">تفاصيل المورد</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{supplier.name}</h1><p className="mt-2 text-sm text-slate-500">{supplier.company || 'بيانات حقيقية من قاعدة البيانات'}</p></div>
        <Link href="/dashboard/clients" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"><ArrowLeft className="h-4 w-4" /> العودة إلى العملاء والموردين</Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-slate-900">البيانات الأساسية</h2><span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{supplier.code}</span></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">اسم المورد / الشركة</p><p className="mt-2 font-bold text-slate-900">{supplier.name}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">اسم المسؤول</p><p className="mt-2 font-bold text-slate-900">{supplier.contactName || '-'}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">المنتجات المرتبطة</p><p className="mt-2 font-bold text-slate-900">{supplier.products.length ? supplier.products.map((p) => p.name).join('، ') : supplier.productsSnapshot || 'لا توجد منتجات مرتبطة'}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">حالة المورد</p><div className="mt-2"><SupplierStatusBadge status={supplier.status} /></div></div>
            </div>
          </section>

          <section className="card-surface overflow-hidden">
            <div className="border-b border-slate-100 p-5"><h2 className="text-xl font-bold text-slate-900">المنتجات المرتبطة بالمورد</h2><p className="mt-1 text-sm text-slate-500">المنتجات المرتبطة فعليًا بالمورد في قاعدة البيانات.</p></div>
            <div className="overflow-x-auto"><table className="data-table min-w-[650px] w-full text-sm"><thead className="bg-slate-50"><tr><th className="table-header px-4 py-3">المنتج</th><th className="table-header px-4 py-3">التصنيف</th><th className="table-header px-4 py-3">الكمية</th><th className="table-header px-4 py-3">سعر الشراء</th><th className="table-header px-4 py-3">الوحدة</th></tr></thead><tbody>{supplier.products.map((product) => <tr key={product.id} className="border-t border-slate-200"><td className="px-4 py-3 font-semibold text-slate-900">{product.name}</td><td className="px-4 py-3 text-slate-700">{product.category}</td><td className="px-4 py-3 text-slate-700">{product.currentQuantity}</td><td className="px-4 py-3 text-slate-700">{currencyFormat.format(Number(product.purchasePrice || 0))}</td><td className="px-4 py-3 text-slate-700">{product.unit}</td></tr>)}</tbody></table>{!supplier.products.length && <p className="p-6 text-center text-sm text-slate-500">لا توجد منتجات مرتبطة بهذا المورد.</p>}</div>
          </section>

          <section className="card-surface overflow-hidden">
            <div className="border-b border-slate-100 p-5"><h2 className="text-xl font-bold text-slate-900">العمليات المالية المرتبطة</h2><p className="mt-1 text-sm text-slate-500">العمليات المسجلة فعليًا على المورد، بدون Mock Data.</p></div>
            <div className="overflow-x-auto"><table className="data-table min-w-[800px] w-full text-sm"><thead className="bg-slate-50"><tr><th className="table-header px-4 py-3">العملية</th><th className="table-header px-4 py-3">النوع</th><th className="table-header px-4 py-3">القيمة</th><th className="table-header px-4 py-3">التاريخ</th><th className="table-header px-4 py-3">الاستحقاق</th><th className="table-header px-4 py-3">الحالة</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id} className="border-t border-slate-200"><td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td><td className="px-4 py-3 text-slate-700">{item.type}</td><td className="px-4 py-3 text-slate-700">{currencyFormat.format(Number(item.amount || 0))}</td><td className="px-4 py-3 text-slate-700">{item.date?.slice(0, 10) || '-'}</td><td className="px-4 py-3 text-slate-700">{item.dueDate?.slice(0, 10) || '-'}</td><td className="px-4 py-3 text-slate-700">{item.status || '-'}</td></tr>)}</tbody></table>{!transactions.length && <p className="p-6 text-center text-sm text-slate-500">لا توجد عمليات مالية مرتبطة بهذا المورد.</p>}</div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-surface p-5"><div className="mb-4 flex items-center gap-2"><Mail className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">معلومات التواصل</h2></div><div className="space-y-3 text-sm"><p className="flex justify-between gap-3"><span className="text-slate-500">البريد</span><span className="font-medium text-slate-800">{supplier.email || '-'}</span></p><p className="flex justify-between gap-3"><span className="text-slate-500">الهاتف</span><span className="font-medium text-slate-800">{supplier.phone || '-'}</span></p><p className="flex justify-between gap-3"><span className="text-slate-500">العنوان</span><span className="font-medium text-slate-800">{supplier.address || '-'}</span></p></div></section>
          <section className="card-surface p-5"><div className="mb-4 flex items-center gap-2"><WalletCards className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">ملخص المورد</h2></div><p className="text-sm text-slate-500">عدد العمليات المالية</p><p className="mt-2 text-2xl font-bold text-slate-900">{transactions.length}</p><p className="mt-4 text-sm text-slate-500">إجمالي قيمة العمليات</p><p className="mt-2 text-xl font-bold text-slate-900">{currencyFormat.format(totalTransactions)}</p><p className="mt-4 text-sm text-slate-500">المبالغ المستحقة</p><p className="mt-2 text-xl font-bold text-rose-600">{currencyFormat.format(outstanding)}</p></section>
          <section className="card-surface p-5"><div className="mb-4 flex items-center gap-2"><Package className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">المنتجات</h2></div><p className="text-sm text-slate-500">عدد المنتجات المرتبطة</p><p className="mt-2 text-2xl font-bold text-slate-900">{supplier.products.length}</p><p className="mt-4 text-sm text-slate-500">تاريخ إضافة المورد</p><p className="mt-2 font-semibold text-slate-800">{supplier.dateAdded?.slice(0, 10) || '-'}</p></section>
          <section className="card-surface p-5"><div className="mb-4 flex items-center gap-2"><CalendarRange className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">الاستحقاقات القادمة</h2></div><div className="space-y-3">{upcoming.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex justify-between gap-3"><span className="font-medium text-slate-800">{item.name}</span><span className="font-semibold text-slate-900">{currencyFormat.format(Number(item.amount || 0))}</span></div><p className="mt-2 text-xs text-slate-500">تاريخ الاستحقاق: {item.dueDate?.slice(0, 10)}</p></div>)}{!upcoming.length && <p className="text-sm text-slate-500">لا توجد استحقاقات قادمة.</p>}</div></section>
          <section className="card-surface p-5"><div className="mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">الملاحظات</h2></div><p className="leading-8 text-slate-700">{supplier.notes || 'لا توجد ملاحظات.'}</p></section>
        </div>
      </div>
    </div>
  );
}
