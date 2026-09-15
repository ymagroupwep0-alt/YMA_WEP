'use client';

import Link from 'next/link';
import { ArrowLeft, ClipboardList, Package } from 'lucide-react';
import { useParams } from 'next/navigation';
import { SupplyPaymentBadge } from '@/components/supplies/supply-payment-badge';
import { SupplyStatusBadge } from '@/components/supplies/supply-status-badge';
import type { Client } from '@/data/clients';
import type { Project } from '@/data/projects';
import type { Supply } from '@/data/supplies';
import { usePersistentList } from '@/lib/client/use-persistent-list';

const formatMoney = (value: number) => `EGP ${value.toLocaleString('en-US')}`;

export default function SupplyDetailsPage() {
  const params = useParams<{ id: string }>();
  const supplies = usePersistentList<Supply>('supplies');
  const clients = usePersistentList<Client>('clients');
  const projects = usePersistentList<Project>('projects');
  const supply = supplies.data.find((item) => item.id === params.id);
  const client = clients.data.find((item) => item.id === supply?.clientId);
  const project = projects.data.find((item) => item.id === supply?.projectId);

  if (supplies.loading || clients.loading || projects.loading) return <div className="card-surface p-8 text-center text-sm text-slate-500">جاري تحميل تفاصيل التوريد...</div>;
  if (supplies.error || clients.error || projects.error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">تعذر تحميل تفاصيل التوريد.</div>;
  if (!supply) return <div className="card-surface p-8 text-center text-sm text-slate-500">التوريد غير موجود.</div>;

  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-blue-600">تفاصيل التوريد</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{supply.supplyNumber}</h1></div><Link href="/dashboard/supplies" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"><ArrowLeft className="h-4 w-4" />العودة إلى التوريدات</Link></div><div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"><div className="space-y-6"><section className="card-surface p-5"><div className="mb-5 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">البيانات الأساسية</h2></div><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-slate-500">العميل</p><p className="mt-2 font-bold text-slate-900">{client?.company || client?.name || 'عميل غير محدد'}</p></div><div><p className="text-sm text-slate-500">المشروع</p><p className="mt-2 font-bold text-slate-900">{project?.name || 'بدون مشروع'}</p></div><div><p className="text-sm text-slate-500">التاريخ</p><p className="mt-2 font-bold text-slate-900">{supply.date}</p></div><div><p className="text-sm text-slate-500">حالة التوريد</p><div className="mt-2"><SupplyStatusBadge status={supply.status} /></div></div><div><p className="text-sm text-slate-500">حالة الدفع</p><div className="mt-2"><SupplyPaymentBadge status={supply.paymentStatus} /></div></div></div></section><section className="card-surface overflow-hidden"><div className="flex items-center gap-2 border-b border-slate-100 p-5"><Package className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">منتجات التوريد</h2></div><div className="overflow-x-auto"><table className="data-table min-w-[720px] w-full text-sm"><thead className="bg-slate-50"><tr>{['المنتج','الكمية','سعر التكلفة','سعر البيع','الإجمالي'].map((heading) => <th key={heading} className="table-header px-4 py-3">{heading}</th>)}</tr></thead><tbody>{supply.items.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium text-slate-800">{item.productName}</td><td className="px-4 py-3">{item.quantity}</td><td className="px-4 py-3">{formatMoney(item.costPrice)}</td><td className="px-4 py-3">{formatMoney(item.sellingPrice)}</td><td className="px-4 py-3 font-semibold">{formatMoney(item.totalSellingPrice)}</td></tr>)}</tbody></table>{!supply.items.length && <p className="p-8 text-center text-sm text-slate-500">لا توجد منتجات في هذا التوريد.</p>}</div></section></div><aside className="card-surface h-fit p-5"><h2 className="text-xl font-bold text-slate-900">الملخص المالي</h2><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-500">إجمالي التكلفة</span><strong>{formatMoney(supply.totalCost)}</strong></div><div className="flex justify-between"><span className="text-slate-500">إجمالي البيع</span><strong>{formatMoney(supply.totalSellingPrice)}</strong></div><div className="flex justify-between border-t border-slate-100 pt-4"><span className="text-slate-500">إجمالي الربح</span><strong className="text-emerald-700">{formatMoney(supply.totalProfit)}</strong></div></div></aside></div></div>;
}
