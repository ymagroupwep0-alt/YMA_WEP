 'use client';

import Link from 'next/link';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatCard } from '@/components/common/stat-card';
import { SectionCard } from '@/components/common/section-card';

type DashboardProject = { name: string; status: string; progress: number; dueDate: string };
type DashboardFinance = { type: string; amount: number; status?: string };
type DashboardProduct = { name: string; currentQuantity: number; minimumQuantity: number; purchasePrice: number };
type DashboardSupply = { supplyNumber: string; status: string };
type DashboardActivity = { entityId: string; description: string; action: string; createdAt?: string; user?: { name?: string } };
type DashboardData = { projects: DashboardProject[]; employees: unknown[]; finance: DashboardFinance[]; supplies: DashboardSupply[]; activity: DashboardActivity[]; products: DashboardProduct[] };

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all(['projects', 'employees', 'finance', 'supplies', 'activity', 'products'].map((resource) => fetch(`/api/data/${resource}`).then(async (response) => {
      if (!response.ok) throw new Error('تعذر تحميل بيانات لوحة القيادة');
      return response.json();
    }))).then(([projects, employees, finance, supplies, activity, products]) => setData({ projects: projects as DashboardProject[], employees: employees as unknown[], finance: finance as DashboardFinance[], supplies: supplies as DashboardSupply[], activity: activity as DashboardActivity[], products: products as DashboardProduct[] })).catch((requestError: Error) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="py-12 text-center text-sm text-slate-500">جارٍ تحميل لوحة القيادة...</p>;
  if (error) return <p className="card-surface p-6 text-center text-sm text-rose-700">{error}</p>;
  if (!data) return <p className="card-surface p-8 text-center text-sm text-slate-500">لا توجد بيانات للعرض.</p>;

  const income = data.finance.filter((item) => item.type === 'income' && item.status === 'completed').reduce((sum, item) => sum + item.amount, 0);
  const expenses = data.finance.filter((item) => item.status === 'completed' && !['income', 'client_payment'].includes(item.type)).reduce((sum, item) => sum + item.amount, 0);
  const activeProjects = data.projects.filter((item) => !['completed', 'cancelled'].includes(item.status)).length;
  const activeProgressValues = data.projects.filter((item) => !['completed', 'cancelled'].includes(item.status)).map((item) => item.progress);
  const execution = activeProgressValues.length ? Math.round(activeProgressValues.reduce((sum, item) => sum + item, 0) / activeProgressValues.length) : 0;
  const money = (value: number) => `EGP ${value.toLocaleString('en-US')}`;
  const summaryCards = [
    { title: 'المشاريع النشطة', value: activeProjects.toLocaleString('en-US'), change: 'محدث الآن', trend: 'up' as const, tone: 'blue', href: '/dashboard/projects' },
    { title: 'عدد الموظفين', value: data.employees.length.toLocaleString('en-US'), change: 'محدث الآن', trend: 'up' as const, tone: 'green', href: '/dashboard/employees' },
    { title: 'إجمالي الإيرادات', value: money(income), change: 'محدث الآن', trend: 'up' as const, tone: 'violet', href: '/dashboard/finance' },
    { title: 'المصروفات / صافي الأرباح', value: `${money(expenses)} / ${money(income - expenses)}`, change: 'محدث الآن', trend: income - expenses >= 0 ? 'up' as const : 'down' as const, tone: income - expenses >= 0 ? 'emerald' : 'rose', href: '/dashboard/profits' },
  ];
  const recentActivity: { id: string; title: string; time: string; type: string; user: string }[] = data.activity.slice(0, 4).map((item) => ({ id: item.entityId, title: item.description, time: item.createdAt?.replace('T', ' ').slice(0, 16) || '-', type: item.action === 'deleted' ? 'warning' : 'success', user: item.user?.name || 'مستخدم النظام' }));
  const performance = income ? ((income - expenses) / income) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">لوحة القيادة</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard الرئيسية</h1>
        </div>
        <Link href="/dashboard/reports" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          <TrendingUp className="h-4 w-4" />
          تقرير الأداء
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <SectionCard title="آخر العمليات" action={<span className="text-xs text-slate-500">آخر 24 ساعة</span>}>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex gap-3">
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.type === 'warning' ? 'bg-amber-500' : item.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.user} • {item.time}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">{item.id}</span>
              </div>
            ))}
            {!recentActivity.length && <p className="text-sm text-slate-500">لا توجد عمليات مسجلة.</p>}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="أداء الشركة"
        action={
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <ArrowUpRight className="h-4 w-4" />
            {performance.toFixed(1)}%
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">إجمالي المبيعات</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{money(income)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">المشاريع النشطة</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{activeProjects}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">نسبة التنفيذ</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{execution}%</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
