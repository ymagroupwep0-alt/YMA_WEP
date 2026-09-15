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
  ManufacturingFormModal,
  ManufacturingFormValues,
} from "@/components/manufacturing/manufacturing-form-modal";
import { ManufacturingStatusBadge } from "@/components/manufacturing/manufacturing-status-badge";
import {
  manufacturingStatusLabels,
  manufacturingStatusOptions,
  ManufacturingProcess,
} from "@/data/manufacturing";
import { usePermissionGuard } from "@/components/permissions/use-permission-guard";
import { usePersistentList } from "@/lib/client/use-persistent-list";

type ApiManufacturing = Omit<ManufacturingProcess, "projectName" | "employeeName" | "activity"> & { project?: { name: string } | null; employee?: { fullName: string } | null; activity?: ManufacturingProcess["activity"]; };
type ApiProject = { id: string; code: string; name: string };
type ApiEmployee = { id: string; fullName: string; role?: string };

export default function ManufacturingPage() {
  const { check, can } = usePermissionGuard("manufacturing");
  const processesList = usePersistentList<ApiManufacturing>("manufacturing");
  const projectsList = usePersistentList<ApiProject>("projects");
  const employeesList = usePersistentList<ApiEmployee>("employees");
  const productsList = usePersistentList<import("@/data/warehouse").WarehouseProduct>("products");
  const processes = useMemo(() => processesList.data.map((process) => ({ ...process, startDate: process.startDate?.slice(0, 10) ?? '', expectedEndDate: process.expectedEndDate?.slice(0, 10) ?? '', projectName: process.project?.name ?? "", employeeName: process.employee?.fullName ?? "", activity: process.activity ?? [], materials: process.materials ?? [], stages: process.stages ?? [] } as ManufacturingProcess)), [processesList.data]);
  const availableProjects = projectsList.data;
  const availableEmployees = employeesList.data;
  const availableProducts = productsList.data;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ManufacturingProcess | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [project, setProject] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [date, setDate] = useState("");
  const stats = useMemo(
    () => ({
      total: processes.length,
      inProgress: processes.filter((p) => p.status === "in_progress").length,
      completed: processes.filter((p) => p.status === "completed").length,
      paused: processes.filter((p) => p.status === "paused").length,
      delayed: processes.filter((p) => p.status === "delayed").length,
    }),
    [processes],
  );
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return processes.filter(
      (p) =>
        (p.code.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term) ||
          p.projectName.toLowerCase().includes(term) ||
          p.employeeName.toLowerCase().includes(term)) &&
        (status === "all" || p.status === status) &&
        (project === "all" || p.projectId === project) &&
        (employee === "all" || p.employeeId === employee) &&
        (!date || p.startDate === date),
    );
  }, [processes, search, status, project, employee, date]);
  const save = async (values: ManufacturingFormValues) => {
    if (!check(selected ? "edit" : "create")) return;
    const response = await fetch(selected ? `/api/data/manufacturing/${selected.id}` : "/api/data/manufacturing", { method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    if (response.ok) await processesList.refresh();
    setSelected(null);
  };
  const advanceStatus = async (process: ManufacturingProcess) => {
    if (!check("edit")) return;
    const next =
      manufacturingStatusOptions[
        (manufacturingStatusOptions.indexOf(process.status) + 1) %
          manufacturingStatusOptions.length
      ];
    const response = await fetch(`/api/data/manufacturing/${process.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    if (response.ok) await processesList.refresh();
  };
  const deleteProcess = async (process: ManufacturingProcess) => {
    if (!window.confirm('هل أنت متأكد من حذف عملية التصنيع؟')) return;
    if (!check("delete")) return;
    const response = await fetch(`/api/data/manufacturing/${process.id}`, { method: "DELETE" });
    if (response.ok) await processesList.refresh();
  };
  return (
    <div className="space-y-6">
      {(processesList.error || projectsList.error || employeesList.error || productsList.error) && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">تعذر تحميل بيانات التصنيع.</div>}
      {(processesList.loading || projectsList.loading || employeesList.loading || productsList.loading) && <div className="card-surface p-8 text-center text-sm text-slate-500">جاري تحميل بيانات التصنيع...</div>}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">مركز التصنيع</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">التصنيع</h1>
          <p className="mt-2 text-sm text-slate-500">
            تابع عمليات التصنيع والمواد والمراحل من التخطيط حتى التسليم.
          </p>
        </div>
        <button
          type="button"
          disabled={!can("create")}
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          إنشاء عملية تصنيع جديدة
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["إجمالي عمليات التصنيع", stats.total, "bg-blue-50 text-blue-700"],
          ["قيد التنفيذ", stats.inProgress, "bg-sky-50 text-sky-700"],
          [
            "العمليات المكتملة",
            stats.completed,
            "bg-emerald-50 text-emerald-700",
          ],
          ["العمليات المتوقفة", stats.paused, "bg-amber-50 text-amber-700"],
          ["العمليات المتأخرة", stats.delayed, "bg-rose-50 text-rose-700"],
        ].map(([title, value, tone]) => (
          <div key={String(title)} className="card-surface p-4">
            <p className="text-sm text-slate-500">{title}</p>
            <div className="mt-3 flex items-end justify-between">
              <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
              >
                {title === "إجمالي عمليات التصنيع" ? "الكل" : "حالة"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="card-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالكود أو العملية أو المشروع أو المسؤول..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="filter-input"
          >
            <option value="all">كل الحالات</option>
            {manufacturingStatusOptions.map((item) => (
              <option key={item} value={item}>
                {manufacturingStatusLabels[item]}
              </option>
            ))}
          </select>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="filter-input"
          >
            <option value="all">كل المشاريع</option>
            {availableProjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="filter-input"
          >
            <option value="all">كل المسؤولين</option>
            {availableEmployees.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
          <label className="text-sm font-medium text-slate-600">
            تاريخ البداية
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="filter-input max-w-xs"
          />
          <span className="text-xs text-slate-400">
            تظهر {filtered.length} عمليات
          </span>
        </div>
      </div>
      <section className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">عمليات التصنيع</h2>
            <p className="mt-1 text-sm text-slate-500">
              قائمة العمليات ومؤشرات الإنجاز والتكلفة.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {filtered.length} عملية
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[1200px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {[
                  "كود العملية",
                  "اسم العملية",
                  "المشروع",
                  "المسؤول",
                  "تاريخ البداية",
                  "الانتهاء المتوقع",
                  "الحالة",
                  "الإنجاز",
                  "التكلفة",
                  "الإجراءات",
                ].map((heading) => (
                  <th key={heading} className="table-header py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-4 font-semibold text-blue-700">
                    {item.code}
                  </td>
                  <td className="py-4">
                    <Link
                      href={`/dashboard/manufacturing/${item.id}`}
                      className="font-semibold text-slate-800 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 max-w-[190px] truncate text-xs text-slate-500">
                      {item.description}
                    </p>
                  </td>
                  <td className="py-4 text-slate-700">{item.projectName}</td>
                  <td className="py-4 text-slate-700">{item.employeeName}</td>
                  <td className="py-4 text-slate-600">{item.startDate}</td>
                  <td className="py-4 text-slate-600">
                    {item.expectedEndDate}
                  </td>
                  <td className="py-4">
                    <button
                      type="button"
                      onClick={() => advanceStatus(item)}
                      title="تغيير الحالة"
                    >
                      <ManufacturingStatusBadge status={item.status} />
                    </button>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-20 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {item.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-700">
                    EGP {item.cost.toLocaleString("en-US")}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/manufacturing/${item.id}`}
                        title="عرض التفاصيل"
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        title="تعديل"
                        onClick={() => {
                          if (!check("edit")) return;
                          setSelected(item);
                          setOpen(true);
                        }}
                        className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="حذف"
                        onClick={() => deleteProcess(item)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="تغيير الحالة"
                        onClick={() => advanceStatus(item)}
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
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              لا توجد عمليات مطابقة للفلاتر الحالية.
            </div>
          )}
        </div>
      </section>
      <ManufacturingFormModal
        open={open}
        process={selected}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        onSubmit={save}
        projects={availableProjects}
        employees={availableEmployees}
        products={availableProducts}
      />
    </div>
  );
}
