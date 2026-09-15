'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, CalendarClock, CheckCheck, ClipboardList, Mail, MapPin, ShieldCheck, Warehouse } from 'lucide-react';
import { useParams } from 'next/navigation';
import { EmployeeStatusBadge } from '@/components/employees/employee-status-badge';
import { Employee } from '@/data/employees';

type ApiEmployee = Omit<Employee, 'hireDate' | 'salary' | 'notes' | 'projects' | 'reports' | 'warehouseLogs' | 'attendance'> & { hireDate?: string | null; salary?: number | null; notes?: string | null };
type ApiProject = { id: string; name: string; status: string; dueDate: string; managerId?: string | null; members?: { employeeId: string }[] };
type ApiReport = { title: string; type: string; createdAt: string; employeeId?: string | null };
type ApiMovement = { id: string; reason: string; type: string; date: string; employeeId: string; product?: { name: string } | null };

const currencyFormat = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

export default function EmployeeDetailsPage() {
  const params = useParams();
  const employeeId = String(params.id);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [employeeResponse, projectsResponse, reportsResponse, movementsResponse] = await Promise.all([
          fetch(`/api/data/employees/${employeeId}`, { cache: 'no-store' }),
          fetch('/api/data/projects', { cache: 'no-store' }),
          fetch('/api/data/reports', { cache: 'no-store' }),
          fetch('/api/data/movements', { cache: 'no-store' }),
        ]);
        const responses = [employeeResponse, projectsResponse, reportsResponse, movementsResponse];
        const payloads = await Promise.all(responses.map(async (response) => {
          const payload = await response.json().catch(() => null);
          if (!response.ok) throw new Error(payload?.error ?? 'تعذر تحميل بيانات الموظف');
          return payload;
        }));
        const record = payloads[0] as ApiEmployee | null;
        if (!record) throw new Error('الموظف غير موجود');
        const projects = (payloads[1] as ApiProject[]).filter((project) => project.managerId === employeeId || project.members?.some((member) => member.employeeId === employeeId));
        const reports = (payloads[2] as ApiReport[]).filter((report) => report.employeeId === employeeId);
        const movements = (payloads[3] as ApiMovement[]).filter((movement) => movement.employeeId === employeeId);
        setEmployee({ ...record, hireDate: record.hireDate?.slice(0, 10) ?? '—', salary: record.salary ?? 0, notes: record.notes ?? 'لا توجد ملاحظات.', projects: projects.map((project) => ({ name: project.name, status: project.status, dueDate: project.dueDate.slice(0, 10) })), reports: reports.map((report) => ({ title: report.title, type: report.type, date: report.createdAt.slice(0, 10) })), warehouseLogs: movements.map((movement) => ({ item: movement.product?.name ?? movement.reason, action: movement.reason || movement.type, date: movement.date.slice(0, 10) })), attendance: [] });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'تعذر تحميل بيانات الموظف');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [employeeId]);

  if (loading) return <p className="p-8 text-center text-sm text-slate-500">جاري تحميل بيانات الموظف...</p>;
  if (error) return <p className="p-8 text-center text-sm text-rose-600">{error}</p>;
  if (!employee) return <p className="p-8 text-center text-sm text-slate-500">الموظف غير موجود.</p>;

  const todayAttendance = employee.attendance[0] ?? {
    date: '—',
    checkIn: '—',
    checkOut: '—',
    status: 'غائب',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">تفاصيل الموظف</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{employee.fullName}</h1>
        </div>

        <Link href="/dashboard/employees" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          العودة إلى الموظفين
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">البيانات الشخصية</h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {employee.code}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">الاسم الكامل</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{employee.fullName}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">حالة الموظف</p>
                <div className="mt-2">
                  <EmployeeStatusBadge status={employee.status} />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">تاريخ التعيين</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{employee.hireDate}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">الراتب</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{currencyFormat.format(employee.salary)}</p>
              </div>
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">بيانات التواصل</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-500">البريد الإلكتروني</span>
                <span className="font-medium text-slate-800">{employee.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-500">رقم الهاتف</span>
                <span className="font-medium text-slate-800">{employee.phone}</span>
              </div>
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">الوظيفة والقسم</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">الوظيفة</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{employee.role}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">القسم</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{employee.department}</p>
              </div>
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">المشاريع المرتبطة</h2>
            </div>
            <div className="space-y-3">
              {employee.projects.length ? employee.projects.map((project) => (
                <div key={project.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800">{project.name}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{project.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">تاريخ التسليم: {project.dueDate}</p>
                </div>
              )) : <p className="text-sm text-slate-500">لا توجد مشاريع مرتبطة بهذا الموظف.</p>}
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">التقارير التي قام برفعها</h2>
            </div>
            <div className="space-y-3">
              {employee.reports.length ? employee.reports.map((report) => (
                <div key={report.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800">{report.title}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{report.type}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">التاريخ: {report.date}</p>
                </div>
              )) : <p className="text-sm text-slate-500">لا توجد تقارير مرتبطة بهذا الموظف.</p>}
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">عمليات المخزن</h2>
            </div>
            <div className="space-y-3">
              {employee.warehouseLogs.length ? employee.warehouseLogs.map((log) => (
                <div key={`${log.item}-${log.date}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800">{log.item}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{log.action}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">التاريخ: {log.date}</p>
                </div>
              )) : <p className="text-sm text-slate-500">لا توجد عمليات مخزن مرتبطة بهذا الموظف.</p>}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">سجل الحضور والانصراف</h2>
            </div>
            <div className="space-y-3">
              {employee.attendance.length ? employee.attendance.map((record) => (
                <div key={record.date} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800">{record.date}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{record.status}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>وقت الحضور: {record.checkIn}</span>
                    <span>وقت الانصراف: {record.checkOut}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">لا توجد بيانات حضور متاحة لهذا الموظف.</p>}
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">الملاحظات</h2>
            </div>
            <p className="leading-8 text-slate-700">{employee.notes}</p>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <CheckCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">الحضور اليوم</h2>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">تاريخ اليوم</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{todayAttendance.date}</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <div className="flex items-center justify-between"><span>وقت الحضور</span><span>{todayAttendance.checkIn}</span></div>
                <div className="flex items-center justify-between"><span>وقت الانصراف</span><span>{todayAttendance.checkOut}</span></div>
                <div className="flex items-center justify-between"><span>الحالة</span><span>{todayAttendance.status}</span></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
