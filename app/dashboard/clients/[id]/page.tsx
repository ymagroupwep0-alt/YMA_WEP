'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarRange, Mail, MapPin, Phone, Users } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClientStatusBadge } from '@/components/clients/client-status-badge';

const currencyFormat = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

type ClientDetails = {
  id: string; code: string; name: string; company: string; email: string; phone: string;
  address?: string; clientType?: string; status: string; dateAdded?: string; notes?: string;
  projects: { id: string; name: string; status: string; budget: number; dueDate: string }[];
  supplies: { id: string; supplyNumber: string; date: string; totalSellingPrice: number; totalProfit: number; status: string }[];
  financeTransactions: { id: string; name: string; amount: number; dueDate?: string; projectId?: string }[];
};

type Report = { id: string; title: string; projectId?: string };

export default function ClientDetailsPage() {
  const params = useParams();
  const clientId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/data/clients/${clientId}`).then(async (response) => { if (!response.ok) throw new Error('تعذر تحميل بيانات العميل'); return response.json(); }),
      fetch('/api/data/reports').then(async (response) => { if (!response.ok) throw new Error('تعذر تحميل التقارير'); return response.json(); }),
    ]).then(([clientData, reportData]) => {
      if (!active) return;
      setClient(clientData);
      setReports(reportData);
    }).catch((requestError: Error) => { if (active) setError(requestError.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [clientId]);

  if (loading) return <p className="py-12 text-center text-sm text-slate-500">جارٍ تحميل بيانات العميل...</p>;
  if (error) return <p className="card-surface p-6 text-center text-sm text-rose-700">{error}</p>;

  if (!client) {
    notFound();
  }

  const totalProjectValue = client.projects.reduce((sum, item) => sum + item.budget, 0);
  const projectIds = new Set(client.projects.map((project) => project.id));
  const relatedReports = reports.filter((report) => report.projectId && projectIds.has(report.projectId));
  const relatedFinance = client.financeTransactions;
  const relatedSupplies = client.supplies;
  const upcomingPayments = relatedFinance.filter((payment) => payment.dueDate && payment.dueDate >= new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">تفاصيل العميل</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{client.name}</h1>
        </div>

        <Link href="/dashboard/clients" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          العودة إلى العملاء
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">البيانات الأساسية</h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {client.code}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">اسم العميل</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{client.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">اسم الشركة</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{client.company}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">نوع العميل</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{client.clientType}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">حالة العميل</p>
                <div className="mt-2">
                  <ClientStatusBadge status={client.status as 'active' | 'inactive' | 'potential'} />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">تاريخ الإضافة</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{client.dateAdded?.slice(0, 10) || '-'}</p>
              </div>
            </div>
          </section>

          <section className="card-surface overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-xl font-bold text-slate-900">التوريدات</h2>
              <p className="mt-1 text-sm text-slate-500">التوريدات المرتبطة بهذا العميل.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[650px] w-full text-sm">
                <thead className="bg-slate-50"><tr><th className="table-header px-4 py-3">رقم التوريد</th><th className="table-header px-4 py-3">التاريخ</th><th className="table-header px-4 py-3">القيمة</th><th className="table-header px-4 py-3">الربح</th><th className="table-header px-4 py-3">الحالة</th><th className="table-header px-4 py-3">التفاصيل</th></tr></thead>
                <tbody>{relatedSupplies.map((supply) => <tr key={supply.id} className="border-t border-slate-200"><td className="px-4 py-3 font-semibold text-slate-900">{supply.supplyNumber}</td><td className="px-4 py-3 text-slate-700">{supply.date}</td><td className="px-4 py-3 text-slate-700">{currencyFormat.format(supply.totalSellingPrice)}</td><td className="px-4 py-3 font-semibold text-emerald-700">{currencyFormat.format(supply.totalProfit)}</td><td className="px-4 py-3 text-slate-700">{supply.status}</td><td className="px-4 py-3"><Link href={`/dashboard/supplies/${supply.id}`} className="font-semibold text-blue-700 hover:underline">عرض</Link></td></tr>)}</tbody>
              </table>
              {!relatedSupplies.length && <p className="px-5 py-8 text-center text-sm text-slate-500">لا توجد توريدات مرتبطة بهذا العميل.</p>}
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">معلومات التواصل</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-500">البريد الإلكتروني</span>
                <span className="font-medium text-slate-800">{client.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-500">رقم الهاتف</span>
                <span className="font-medium text-slate-800">{client.phone}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-500">العنوان</span>
                <span className="font-medium text-slate-800">{client.address}</span>
              </div>
            </div>
          </section>

          <section className="card-surface p-5">
            <h2 className="mb-4 text-xl font-bold text-slate-900">التقارير والعمليات المرتبطة</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">التقارير المرتبطة</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{relatedReports.length}</p>
                {relatedReports.map((report) => <p key={report.id} className="mt-2 text-sm text-slate-700">{report.title}</p>)}
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">العمليات المالية</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{relatedFinance.length}</p>
                {relatedFinance.map((transaction) => <p key={transaction.id} className="mt-2 text-sm text-slate-700">{transaction.name} · {currencyFormat.format(transaction.amount)}</p>)}
              </div>
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">المشاريع المرتبطة</h2>
            </div>
            <div className="space-y-3">
              {client.projects.map((project) => (
                <div key={project.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800">{project.name}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{project.status}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>قيمة المشروع</span>
                    <span className="font-semibold text-slate-700">{currencyFormat.format(project.budget)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>موعد التسليم</span>
                    <span className="font-semibold text-slate-700">{project.dueDate}</span>
                  </div>
                </div>
              ))}
              {!client.projects.length && <p className="text-sm text-slate-500">لا توجد مشاريع مرتبطة بهذا العميل.</p>}
            </div>
          </section>

          <section className="card-surface p-5">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Timeline آخر النشاطات</h2>
            <div className="space-y-3">
              {client.projects.map((project) => <div key={`activity-${project.id}`} className="border-r-2 border-blue-200 pr-4"><p className="font-semibold text-slate-800">مشروع مرتبط: {project.name}</p><p className="mt-1 text-xs text-slate-500">موعد التسليم: {project.dueDate}</p></div>)}
              <div className="border-r-2 border-blue-200 pr-4"><p className="font-semibold text-slate-800">إضافة العميل إلى النظام</p><p className="mt-1 text-xs text-slate-500">{client.dateAdded?.slice(0, 10) || '-'}</p></div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">إجمالي قيمة المشاريع</h2>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">الإجمالي</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{currencyFormat.format(totalProjectValue)}</p>
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">المدفوعات المرتبطة مستقبلًا</h2>
            </div>
            <div className="space-y-3">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800">{payment.name}</span>
                    <span className="font-semibold text-slate-900">{currencyFormat.format(payment.amount)}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">تاريخ الاستحقاق: {payment.dueDate?.slice(0, 10)}</p>
                </div>
              ))}
              {!upcomingPayments.length && <p className="text-sm text-slate-500">لا توجد مدفوعات قادمة.</p>}
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">الملاحظات</h2>
            </div>
            <p className="leading-8 text-slate-700">{client.notes}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
