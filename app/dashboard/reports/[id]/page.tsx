/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarClock, Download, FileImage, FileText, Paperclip, UserRound } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportStatusBadge } from '@/components/reports/report-status-badge';
import { Report, reportTypeLabels } from '@/data/reports';

export default function ReportDetailsPage() {
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const exportReport = (format: 'word' | 'pdf') => {
    if (!report) return;
    const content = `<!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>${report.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 32px; color: #0f172a;">
          <h1>${report.title}</h1>
          <p><strong>الكود:</strong> ${report.code}</p>
          <p><strong>النوع:</strong> ${reportTypeLabels[report.type]}</p>
          <p><strong>المشروع:</strong> ${report.projectName}</p>
          <p><strong>الموظف:</strong> ${report.employeeName}</p>
          <p><strong>تاريخ الإنشاء:</strong> ${report.createdAt}</p>
          <hr />
          <h2>الوصف</h2>
          <p>${report.description}</p>
          <h2>المحتوى</h2>
          <p style="white-space: pre-line;">${report.content}</p>
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
      return;
    }

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/[^\w\u0600-\u06FF]+/g, '-')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };
  useEffect(() => { const load = async () => { try { const response = await fetch(`/api/data/reports/${params.id}`, { cache: 'no-store' }); const payload = await response.json(); if (!response.ok) throw new Error(payload?.error); setReport({ ...payload, projectName: payload.project?.name ?? '', employeeName: payload.employee?.fullName ?? '', activity: payload.activityEvents ?? [], attachments: payload.attachments ?? [] }); } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تحميل التقرير'); } finally { setLoading(false); } }; void load(); }, [params.id]);
  if (loading) return <div className="card-surface p-8 text-center text-sm text-slate-500">جاري تحميل التقرير...</div>;
  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>;
  if (!report) return <div className="card-surface p-8 text-center text-sm text-slate-500">التقرير غير موجود.</div>;
  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-blue-600">تفاصيل التقرير</p><div className="mt-1 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold text-slate-900">{report.title}</h1><span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{report.code}</span></div><p className="mt-2 text-sm text-slate-500">{report.description}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => exportReport('word')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" />تصدير Word</button><button type="button" onClick={() => exportReport('pdf')} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"><Download className="h-4 w-4" />طباعة PDF</button><Link href="/dashboard/reports" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />العودة إلى التقارير</Link></div></div>
  <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"><div className="space-y-6"><section className="card-surface p-5"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-slate-900">بيانات التقرير</h2><ReportStatusBadge status={report.status} /></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">نوع التقرير</p><p className="mt-2 font-bold text-slate-900">{reportTypeLabels[report.type]}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">تاريخ الإنشاء</p><p className="mt-2 font-bold text-slate-900">{report.createdAt}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">المشروع المرتبط</p><p className="mt-2 font-bold text-slate-900">{report.projectName}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">الموظف المسؤول</p><p className="mt-2 font-bold text-slate-900">{report.employeeName}</p></div></div></section><section className="card-surface p-5"><h2 className="text-xl font-bold text-slate-900">محتوى التقرير</h2><p className="mt-4 whitespace-pre-line leading-8 text-slate-700">{report.content}</p></section><section className="card-surface p-5"><div className="mb-4 flex items-center gap-2"><Paperclip className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">الملفات والصور المرفقة</h2></div>{report.attachments.length ? <div className="grid gap-3 sm:grid-cols-2">{report.attachments.map((file) => <div key={file.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">{file.isImage && file.url ? <img src={file.url} alt={file.name} className="h-40 w-full object-cover" /> : <div className="flex h-24 items-center justify-center bg-white">{file.type === 'PDF' ? <FileText className="h-10 w-10 text-rose-500" /> : <FileImage className="h-10 w-10 text-blue-500" />}</div>}<div className="p-3"><p className="truncate font-medium text-slate-800">{file.name}</p><p className="mt-1 text-xs text-slate-500">{file.type} • {file.size}</p>{file.url && <a href={file.url} target="_blank" rel="noreferrer" download={file.name} className="mt-2 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">فتح / تحميل الملف</a>}</div></div>)}</div> : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">لا توجد ملفات مرفقة بهذا التقرير.</p>}</section></div><div className="space-y-6"><section className="card-surface p-5"><div className="mb-4 flex items-center gap-2"><UserRound className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">ملخص سريع</h2></div><div className="space-y-3"><p className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span className="text-slate-500">الحالة</span><ReportStatusBadge status={report.status} /></p><p className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span className="text-slate-500">المشروع</span><span className="font-semibold text-slate-800">{report.projectName}</span></p><p className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span className="text-slate-500">المرفقات</span><span className="font-semibold text-slate-800">{report.attachments.length} ملفات</span></p></div></section><section className="card-surface p-5"><div className="mb-5 flex items-center gap-2"><CalendarClock className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">سجل النشاط</h2></div><div className="space-y-5">{report.activity.map((item) => <div key={item.id} className="relative border-r border-slate-200 pr-5"><div className="absolute -right-1.5 top-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-50" /><p className="text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.date}</p>{item.note && <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>}</div>)}</div></section></div></div></div>;
}
