 'use client';

import Link from 'next/link';
import { Download, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { financeCategoryLabels, FinanceCategory } from '@/data/finance';

type Period = 'month' | 'quarter' | 'year' | 'custom';
const money = (value: number) => `EGP ${value.toLocaleString('en-US')}`;
const incomeTypes = ['income'];
const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
type ApiFinance = { id: string; name: string; type: string; category: string; projectId?: string; project?: { name?: string }; amount: number; date: string };

export default function ProfitsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const [customStart, setCustomStart] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10));
  const [customEnd, setCustomEnd] = useState(() => now.toISOString().slice(0,10));
  const [exported, setExported] = useState(false);
  const [transactions, setTransactions] = useState<Array<{ id: string; name: string; type: string; category: FinanceCategory; projectId?: string; projectName?: string; amount: number; date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/data/finance').then(async (response) => {
      if (!response.ok) throw new Error('تعذر تحميل البيانات المالية');
      return response.json();
    }).then((items: ApiFinance[]) => setTransactions(items.map((item) => ({ ...item, projectName: item.project?.name, category: item.category as FinanceCategory })))).catch((requestError: Error) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);
  const periodRange = useMemo(() => { if (period === 'month') { const start = new Date(currentYear, currentMonth, 1).toISOString().slice(0,10); const end = new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0,10); return { start, end }; } if (period === 'quarter') { const startMonth = currentMonth - 2; const start = new Date(currentYear, startMonth, 1).toISOString().slice(0,10); const end = new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0,10); return { start, end }; } if (period === 'year') return { start: `${currentYear}-01-01`, end: `${currentYear}-12-31` }; return { start: customStart, end: customEnd }; }, [period, customStart, customEnd, currentMonth, currentYear]);
  const selected = useMemo(() => transactions.filter((item) => { const day = item.date.slice(0, 10); return day >= periodRange.start && day <= periodRange.end; }), [transactions, periodRange]);
  const totals = useMemo(() => { const income = selected.filter((item) => incomeTypes.includes(item.type)).reduce((sum, item) => sum + item.amount, 0); const expenses = selected.filter((item) => !incomeTypes.includes(item.type)).reduce((sum, item) => sum + item.amount, 0); const net = income - expenses; return { income, expenses, net, margin: income === 0 ? 0 : (net / income) * 100 }; }, [selected]);
  const projectRows = useMemo(() => { const rows = new Map<string, { id?: string; name: string; income: number; expenses: number }>(); selected.forEach((item) => { if (!item.projectName) return; const current = rows.get(item.projectName) ?? { id: item.projectId, name: item.projectName, income: 0, expenses: 0 }; if (incomeTypes.includes(item.type)) current.income += item.amount; else current.expenses += item.amount; rows.set(item.projectName, current); }); return Array.from(rows.values()).map((row) => ({ ...row, net: row.income - row.expenses, margin: row.income === 0 ? 0 : ((row.income - row.expenses) / row.income) * 100 })).sort((a, b) => b.net - a.net); }, [selected]);
  const expenseRows = useMemo(() => { const rows = new Map<FinanceCategory, number>(); selected.filter((item) => !incomeTypes.includes(item.type)).forEach((item) => rows.set(item.category, (rows.get(item.category) ?? 0) + item.amount)); return Array.from(rows.entries()).map(([category, value]) => ({ category, value, label: financeCategoryLabels[category] })).sort((a, b) => b.value - a.value); }, [selected]);
  const incomeRows = useMemo(() => { const rows = new Map<FinanceCategory, number>(); selected.filter((item) => incomeTypes.includes(item.type)).forEach((item) => rows.set(item.category, (rows.get(item.category) ?? 0) + item.amount)); return Array.from(rows.entries()).map(([category, value]) => ({ category, value, label: financeCategoryLabels[category] })).sort((a, b) => b.value - a.value); }, [selected]);
  const months = useMemo(() => { const startMonth = period === 'month' ? currentMonth : period === 'quarter' ? Math.max(0, currentMonth - 2) : 0; const endMonth = period === 'year' ? 11 : currentMonth; return Array.from({ length: endMonth - startMonth + 1 }, (_, offset) => { const month = startMonth + offset; const key = `${currentYear}-${String(month + 1).padStart(2, '0')}`; const rows = transactions.filter((item) => item.date.startsWith(key)); const income = rows.filter((item) => incomeTypes.includes(item.type)).reduce((sum, item) => sum + item.amount, 0); const expenses = rows.filter((item) => !incomeTypes.includes(item.type)).reduce((sum, item) => sum + item.amount, 0); return { label: monthNames[month], income, expenses, net: income - expenses }; }); }, [period, currentMonth, currentYear, transactions]);
  const maxChart = Math.max(...months.flatMap((item) => [item.income, item.expenses]), 1);
  const maxExpense = Math.max(...expenseRows.map((item) => item.value), 1);
  const highestIncome = incomeRows[0];
  const highestExpense = expenseRows[0];
  const exportReport = (format: 'word' | 'pdf') => {
    const documentTitle = `تقرير الأرباح - ${periodRange.start} إلى ${periodRange.end}`;
    const reportRows = projectRows.map((row) => `
      <tr>
        <td>${row.name}</td>
        <td>${money(row.income)}</td>
        <td>${money(row.expenses)}</td>
        <td>${money(row.net)}</td>
        <td>${row.margin.toFixed(1)}%</td>
      </tr>
    `).join('');
    const content = `<!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>${documentTitle}</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 32px; color: #0f172a;">
          <h1 style="margin-bottom: 12px;">${documentTitle}</h1>
          <p>إجمالي الإيرادات: <strong>${money(totals.income)}</strong></p>
          <p>إجمالي المصروفات: <strong>${money(totals.expenses)}</strong></p>
          <p>صافي الأرباح: <strong>${money(totals.net)}</strong></p>
          <p>هامش الربح: <strong>${totals.margin.toFixed(1)}%</strong></p>
          <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th>المشروع</th>
                <th>الإيرادات</th>
                <th>المصروفات</th>
                <th>صافي الربح</th>
                <th>هامش الربح</th>
              </tr>
            </thead>
            <tbody>${reportRows}</tbody>
          </table>
        </body>
      </html>`;

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 300);
      } else {
        window.print();
      }
      setExported(true);
      return;
    }

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.replace(/[^a-z0-9\u0600-\u06FF]/gi, '-') || 'report'}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };
  if (loading) return <p className="py-12 text-center text-sm text-slate-500">جارٍ تحميل التحليل المالي...</p>;
  if (error) return <p className="card-surface p-6 text-center text-sm text-rose-700">{error}</p>;
  return <div className="space-y-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium text-blue-600">مركز التحليلات المالية</p><h1 className="mt-1 text-3xl font-bold text-slate-900">الأرباح</h1><p className="mt-2 text-sm text-slate-500">حلل أداء الشركة المالي من خلال الإيرادات والمصروفات والنتائج حسب الفترة والمشروع.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => exportReport('word')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" />تصدير Word</button><button type="button" onClick={() => exportReport('pdf')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Download className="h-4 w-4" />طباعة PDF</button></div></div>
    <div className="card-surface p-4 sm:p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-semibold text-slate-800">الفترة الزمنية</p><p className="mt-1 text-xs text-slate-500">تؤثر الفترة على جميع مؤشرات التحليل أدناه.</p></div><div className="flex flex-wrap gap-2">{([['month', 'هذا الشهر'], ['quarter', 'آخر 3 أشهر'], ['year', 'هذا العام'], ['custom', 'فترة مخصصة']] as [Period, string][]).map(([value, label]) => <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${period === value ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}</div></div>{period === 'custom' && <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center"><label className="text-sm text-slate-600">من <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="filter-input mx-2" /></label><label className="text-sm text-slate-600">إلى <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="filter-input mx-2" /></label></div>}</div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[['إجمالي الإيرادات', money(totals.income), 'text-emerald-700'], ['إجمالي المصروفات', money(totals.expenses), 'text-rose-700'], ['صافي الأرباح', money(totals.net), 'text-blue-700'], ['هامش الربح', `${totals.margin.toFixed(1)}%`, 'text-indigo-700'], ['أعلى مصدر للإيرادات', highestIncome ? `${highestIncome.label} • ${money(highestIncome.value)}` : 'لا توجد بيانات', 'text-sky-700'], ['أعلى بند للمصروفات', highestExpense ? `${highestExpense.label} • ${money(highestExpense.value)}` : 'لا توجد بيانات', 'text-orange-700']].map(([title, value, tone]) => <div key={String(title)} className="card-surface p-5"><p className="text-sm text-slate-500">{title}</p><p className={`mt-3 text-xl font-bold ${tone}`}>{value}</p></div>)}</div>
    <section className="card-surface p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">تحليل الأرباح حسب الفترة</h2><p className="mt-1 text-sm text-slate-500">مقارنة الإيرادات والمصروفات وصافي الربح.</p></div><TrendingUp className="h-5 w-5 text-blue-600" /></div><div className="flex h-64 items-end gap-3 overflow-x-auto border-b border-slate-200 pb-0">{months.map((month) => <div key={month.label} className="flex min-w-[70px] flex-1 items-end justify-center gap-1 self-stretch"><div className="flex h-full items-end gap-1"><div title={`الإيرادات: ${money(month.income)}`} className="w-3 rounded-t-md bg-emerald-500" style={{ height: `${Math.max((month.income / maxChart) * 88, month.income ? 5 : 0)}%` }} /><div title={`المصروفات: ${money(month.expenses)}`} className="w-3 rounded-t-md bg-rose-400" style={{ height: `${Math.max((month.expenses / maxChart) * 88, month.expenses ? 5 : 0)}%` }} /><div title={`صافي الربح: ${money(month.net)}`} className={`w-3 rounded-t-md ${month.net >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ height: `${Math.max((Math.abs(month.net) / maxChart) * 88, month.net ? 5 : 0)}%` }} /></div><span className="mt-2 text-xs text-slate-500">{month.label}</span></div>)}</div><div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600"><span><i className="ml-1 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />الإيرادات</span><span><i className="ml-1 inline-block h-2.5 w-2.5 rounded-sm bg-rose-400" />المصروفات</span><span><i className="ml-1 inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />صافي الربح</span></div></section>
    <div className="grid gap-6 xl:grid-cols-2"><section className="card-surface p-5"><div className="mb-5"><h2 className="text-lg font-bold text-slate-900">تحليل المصروفات</h2><p className="mt-1 text-sm text-slate-500">توزيع المصروفات حسب التصنيف.</p></div><div className="space-y-4">{expenseRows.map((item) => <div key={item.category}><div className="mb-1 flex justify-between text-sm"><span className="font-medium text-slate-700">{item.label}</span><span className="text-slate-500">{money(item.value)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-rose-400" style={{ width: `${(item.value / maxExpense) * 100}%` }} /></div></div>)}{expenseRows.length === 0 && <p className="text-sm text-slate-500">لا توجد مصروفات في الفترة المحددة.</p>}</div></section><section className="card-surface p-5"><div className="mb-5"><h2 className="text-lg font-bold text-slate-900">أكثر مصادر الإيرادات</h2><p className="mt-1 text-sm text-slate-500">المصادر الأعلى مساهمة في الإيرادات.</p></div><div className="space-y-3">{incomeRows.map((item, index) => <div key={item.category} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">{index + 1}</span><span className="font-medium text-slate-800">{item.label}</span></div><span className="font-semibold text-slate-900">{money(item.value)}</span></div>)}{incomeRows.length === 0 && <p className="text-sm text-slate-500">لا توجد إيرادات في الفترة المحددة.</p>}</div></section></div>
    <section className="card-surface overflow-hidden"><div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-900">الأرباح حسب المشروع</h2><p className="mt-1 text-sm text-slate-500">مقارنة أداء المشاريع المرتبطة بالعمليات المالية.</p></div><div className="overflow-x-auto"><table className="data-table min-w-[760px] w-full text-sm"><thead className="bg-slate-50"><tr>{['المشروع', 'الإيرادات', 'المصروفات', 'صافي الربح', 'هامش الربح'].map((heading) => <th key={heading} className="table-header px-4 py-3">{heading}</th>)}</tr></thead><tbody>{projectRows.map((row) => <tr key={row.name} className="border-t border-slate-100"><td className="px-4 py-4">{row.id ? <Link href={`/dashboard/projects/${row.id}`} className="font-semibold text-slate-800 hover:text-blue-600">{row.name}</Link> : <span className="font-semibold text-slate-800">{row.name}</span>}</td><td className="px-4 py-4 text-emerald-700">{money(row.income)}</td><td className="px-4 py-4 text-rose-700">{money(row.expenses)}</td><td className={`px-4 py-4 font-bold ${row.net >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{money(row.net)}</td><td className="px-4 py-4 text-slate-700">{row.margin.toFixed(1)}%</td></tr>)}</tbody></table>{projectRows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">لا توجد بيانات مشاريع في الفترة المحددة.</p>}</div></section>
    <section className="card-surface p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">أفضل المشاريع</h2><p className="mt-1 text-sm text-slate-500">ترتيب المشاريع حسب صافي الربح.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{projectRows.length} مشاريع</span></div><div className="grid gap-3 md:grid-cols-3">{projectRows.slice(0, 3).map((row, index) => <div key={row.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-500">#{index + 1}</span><span className="text-xs font-semibold text-emerald-700">{row.margin.toFixed(1)}% هامش</span></div><p className="mt-3 font-bold text-slate-900">{row.name}</p><p className="mt-2 text-sm font-semibold text-blue-700">{money(row.net)}</p></div>)}</div></section><div className="sr-only" aria-live="polite">{exported ? 'تم تجهيز تقرير الأرباح للتصدير.' : ''}</div></div>;
}
