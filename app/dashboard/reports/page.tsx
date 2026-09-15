"use client";

import Link from "next/link";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  ReportFormModal,
  ReportFormValues,
} from "@/components/reports/report-form-modal";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import {
  Report,
  reportStatusLabels,
  reportStatusOptions,
  reportTypeLabels,
  reportTypeOptions,
} from "@/data/reports";
import { usePermissionGuard } from "@/components/permissions/use-permission-guard";
import { usePersistentList } from "@/lib/client/use-persistent-list";

type ApiReport = Omit<Report, "projectName" | "employeeName" | "activity"> & { project?: { name: string } | null; employee?: { fullName: string } | null; activityEvents?: Report["activity"]; };
type ApiProject = { id: string; code: string; name: string };
type ApiEmployee = { id: string; fullName: string; role?: string };

export default function ReportsPage() {
  const { check, can } = usePermissionGuard("reports");
  const reportsList = usePersistentList<ApiReport>("reports");
  const projectsList = usePersistentList<ApiProject>("projects");
  const employeesList = usePersistentList<ApiEmployee>("employees");
  const reports = useMemo(() => reportsList.data.map((report) => ({ ...report, projectName: report.project?.name ?? "", employeeName: report.employee?.fullName ?? "", activity: report.activityEvents ?? [], attachments: report.attachments ?? [] } as Report)), [reportsList.data]);
  const availableProjects = projectsList.data;
  const availableEmployees = employeesList.data;
  const [open, setOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const stats = useMemo(
    () => ({
      total: reports.length,
      new: reports.filter((r) => r.status === "new").length,
      inReview: reports.filter((r) => r.status === "in_review").length,
      approved: reports.filter((r) => r.status === "approved").length,
      rejected: reports.filter((r) => r.status === "rejected").length,
    }),
    [reports],
  );
  const filteredReports = useMemo(() => {
    const term = search.toLowerCase();
    return reports.filter(
      (r) =>
        (r.title.toLowerCase().includes(term) ||
          r.code.toLowerCase().includes(term) ||
          r.projectName.toLowerCase().includes(term) ||
          r.employeeName.toLowerCase().includes(term)) &&
        (statusFilter === "all" || r.status === statusFilter) &&
        (projectFilter === "all" || r.projectId === projectFilter) &&
        (employeeFilter === "all" || r.employeeId === employeeFilter) &&
        (typeFilter === "all" || r.type === typeFilter) &&
        (!dateFilter || r.createdAt === dateFilter),
    );
  }, [
    reports,
    search,
    statusFilter,
    projectFilter,
    employeeFilter,
    typeFilter,
    dateFilter,
  ]);
  const handleSubmit = async (values: ReportFormValues) => {
    if (!check(selectedReport ? "edit" : "create")) return;
    const response = await fetch(selectedReport ? `/api/data/reports/${selectedReport.id}` : "/api/data/reports", { method: selectedReport ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    if (response.ok) await reportsList.refresh();
    setSelectedReport(null);
  };
  const changeStatus = async (report: Report) => {
    if (!check("edit")) return;
    const next =
      reportStatusOptions[
        (reportStatusOptions.indexOf(report.status) + 1) %
          reportStatusOptions.length
      ];
    const response = await fetch(`/api/data/reports/${report.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    if (response.ok) await reportsList.refresh();
  };
  const deleteReport = async (report: Report) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) return;
    if (!check("delete")) return;
    const response = await fetch(`/api/data/reports/${report.id}`, { method: "DELETE" });
    if (response.ok) await reportsList.refresh();
  };
  const inputClass = "filter-input";
  return (
    <div className="space-y-6">
      {(reportsList.error || projectsList.error || employeesList.error) && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">تعذر تحميل بيانات التقارير.</div>}
      {(reportsList.loading || projectsList.loading || employeesList.loading) && <div className="card-surface p-8 text-center text-sm text-slate-500">جاري تحميل بيانات التقارير...</div>}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">مركز التقارير</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">التقارير</h1>
          <p className="mt-2 text-sm text-slate-500">
            أنشئ تقارير الشركة وتابع دورة المراجعة والاعتماد من مساحة واحدة.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!can("create")}
            onClick={() => {
              setSelectedReport(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            إنشاء تقرير جديد
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["إجمالي التقارير", stats.total, "bg-blue-50 text-blue-700"],
          ["التقارير الجديدة", stats.new, "bg-sky-50 text-sky-700"],
          ["قيد المراجعة", stats.inReview, "bg-amber-50 text-amber-700"],
          [
            "التقارير المعتمدة",
            stats.approved,
            "bg-emerald-50 text-emerald-700",
          ],
          ["التقارير المرفوضة", stats.rejected, "bg-rose-50 text-rose-700"],
        ].map(([title, value, tone]) => (
          <div key={String(title)} className="card-surface p-4">
            <p className="text-sm text-slate-500">{title}</p>
            <div className="mt-3 flex items-end justify-between">
              <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
              >
                {title === "إجمالي التقارير" ? "الكل" : "حالة"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="card-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالعنوان أو الكود أو المشروع أو الموظف..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">كل الحالات</option>
            {reportStatusOptions.map((s) => (
              <option key={s} value={s}>
                {reportStatusLabels[s]}
              </option>
            ))}
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">كل المشاريع</option>
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">كل الموظفين</option>
            {availableEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">كل الأنواع</option>
            {reportTypeOptions.map((t) => (
              <option key={t} value={t}>
                {reportTypeLabels[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-slate-600">
            تاريخ الإنشاء
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input max-w-xs"
          />
          <span className="text-xs text-slate-400">
            تظهر {filteredReports.length} تقارير
          </span>
        </div>
      </div>
      <section className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">سجل التقارير</h2>
            <p className="mt-1 text-sm text-slate-500">
              آخر التقارير المضافة وتحديثاتها.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {filteredReports.length} تقرير
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[1050px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {[
                  "كود التقرير",
                  "عنوان التقرير",
                  "النوع",
                  "المشروع",
                  "الموظف",
                  "تاريخ الإنشاء",
                  "الحالة",
                  "الإجراءات",
                ].map((heading) => (
                  <th key={heading} className="table-header py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-4 font-semibold text-blue-700">
                    {report.code}
                  </td>
                  <td className="py-4">
                    <Link
                      href={`/dashboard/reports/${report.id}`}
                      className="font-semibold text-slate-800 hover:text-blue-600"
                    >
                      {report.title}
                    </Link>
                    <p className="mt-1 max-w-[210px] truncate text-xs text-slate-500">
                      {report.description}
                    </p>
                  </td>
                  <td className="py-4 text-slate-600">
                    {reportTypeLabels[report.type]}
                  </td>
                  <td className="py-4 text-slate-700">{report.projectName}</td>
                  <td className="py-4 text-slate-700">{report.employeeName}</td>
                  <td className="py-4 text-slate-600">{report.createdAt}</td>
                  <td className="py-4">
                    <button
                      type="button"
                      onClick={() => changeStatus(report)}
                      title="تغيير الحالة"
                    >
                      <ReportStatusBadge status={report.status} />
                    </button>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        title="عرض التقرير"
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        title="تعديل التقرير"
                        onClick={() => {
                          if (!check("edit")) return;
                          setSelectedReport(report);
                          setOpen(true);
                        }}
                        className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="حذف التقرير"
                        onClick={() => deleteReport(report)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="تغيير الحالة"
                        onClick={() => changeStatus(report)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              لا توجد تقارير مطابقة للفلاتر الحالية.
            </div>
          )}
        </div>
      </section>
      <ReportFormModal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedReport(null);
        }}
        onSubmit={handleSubmit}
        report={selectedReport}
        projects={availableProjects}
        employees={availableEmployees}
      />
    </div>
  );
}
