"use client";

import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  FinanceFormModal,
  FinanceFormValues,
} from "@/components/finance/finance-form-modal";
import { PaymentStatusBadge } from "@/components/finance/payment-status-badge";
import {
  financeTypeLabels,
  financeTypeOptions,
  FinanceTransaction,
  paymentStatusLabels,
  paymentStatusOptions,
} from "@/data/finance";
import { usePermissionGuard } from "@/components/permissions/use-permission-guard";
import { usePersistentList } from "@/lib/client/use-persistent-list";

type ApiFinance = Omit<FinanceTransaction, "projectName" | "clientName" | "employeeName" | "supplier"> & { project?: { name: string } | null; client?: { name: string; company?: string | null } | null; supplier?: { name: string; company?: string | null } | null; employee?: { fullName: string } | null; supplierNameSnapshot?: string | null; supplierId?: string | null };
type ApiProject = { id: string; code: string; name: string };
type ApiClient = { id: string; name: string; company?: string };
type ApiEmployee = { id: string; fullName: string; role?: string };
type ApiSupplier = { id: string; name: string; company?: string };

export default function FinancePage() {
  const { check, can } = usePermissionGuard("finance");
  const transactionsList = usePersistentList<ApiFinance>("finance");
  const projectsList = usePersistentList<ApiProject>("projects");
  const clientsList = usePersistentList<ApiClient>("clients");
  const employeesList = usePersistentList<ApiEmployee>("employees");
  const suppliersList = usePersistentList<ApiSupplier>("suppliers");
  const transactions = useMemo(() => transactionsList.data.map((item) => ({ ...item, date: item.date?.slice(0, 10) ?? '', dueDate: item.dueDate?.slice(0, 10) ?? '', projectName: item.project?.name, clientName: item.client?.company ?? item.client?.name, supplier: item.supplier?.company ?? item.supplier?.name ?? item.supplierNameSnapshot ?? undefined, employeeName: item.employee?.fullName ?? "" } as FinanceTransaction)), [transactionsList.data]);
  const availableProjects = projectsList.data;
  const mockClients = clientsList.data;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FinanceTransaction | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [project, setProject] = useState("all");
  const [client, setClient] = useState("all");
  const [date, setDate] = useState("");
  const stats = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "income" && item.status === "completed")
      .reduce((sum, item) => sum + item.amount, 0);
    const expenses = transactions
      .filter(
        (item) =>
          item.status === "completed" &&
          !["income", "client_payment"].includes(item.type),
      )
      .reduce((sum, item) => sum + item.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses,
      due: transactions
        .filter((item) => ["due", "overdue"].includes(item.status))
        .reduce((sum, item) => sum + item.amount, 0),
      received: transactions
        .filter(
          (item) =>
            item.status === "completed" &&
            (item.type === "client_payment" ||
              (item.type === "income" && !item.supplyId)),
        )
        .reduce((sum, item) => sum + item.amount, 0),
    };
  }, [transactions]);
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return transactions.filter(
      (item) =>
        (item.number.toLowerCase().includes(term) ||
          item.name.toLowerCase().includes(term) ||
          (item.clientName ?? "").toLowerCase().includes(term) ||
          (item.projectName ?? "").toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)) &&
        (type === "all" || item.type === type) &&
        (status === "all" || item.status === status) &&
        (project === "all" || item.projectId === project) &&
        (client === "all" || item.clientId === client) &&
        (!date || item.date.slice(0, 10) === date),
    );
  }, [transactions, search, type, status, project, client, date]);
  const save = async (values: FinanceFormValues) => {
    if (!check(selected ? "edit" : "create")) return false;
    const response = await fetch(selected ? `/api/data/finance/${selected.id}` : "/api/data/finance", { method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "تعذر حفظ العملية المالية");
    }
    await transactionsList.refresh();
    setSelected(null);
    return true;
  };
  const cycleStatus = async (item: FinanceTransaction) => {
    if (!check("edit")) return;
    const next =
      paymentStatusOptions[
        (paymentStatusOptions.indexOf(item.status) + 1) %
          paymentStatusOptions.length
      ];
    const response = await fetch(`/api/data/finance/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    if (response.ok) await transactionsList.refresh();
  };
  const deleteTransaction = async (item: FinanceTransaction) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه العملية المالية؟')) return;
    if (!check("delete")) return;
    const response = await fetch(`/api/data/finance/${item.id}`, { method: "DELETE" });
    if (response.ok) await transactionsList.refresh();
  };
  const money = (value: number) => `EGP ${value.toLocaleString("en-US")}`;
  return (
    <div className="space-y-6">
      {(transactionsList.error || projectsList.error || clientsList.error || employeesList.error || suppliersList.error) && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">تعذر تحميل البيانات المالية.</div>}
      {(transactionsList.loading || projectsList.loading || clientsList.loading || employeesList.loading || suppliersList.loading) && <div className="card-surface p-8 text-center text-sm text-slate-500">جاري تحميل البيانات المالية...</div>}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">مركز الماليات</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">الماليات</h1>
          <p className="mt-2 text-sm text-slate-500">
            تابع الإيرادات والمصروفات والمدفوعات والرصيد المالي للشركة.
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
          إضافة عملية مالية
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [
            "إجمالي الإيرادات",
            money(stats.income),
            "bg-emerald-50 text-emerald-700",
          ],
          [
            "إجمالي المصروفات",
            money(stats.expenses),
            "bg-rose-50 text-rose-700",
          ],
          ["صافي الرصيد", money(stats.balance), "bg-blue-50 text-blue-700"],
          [
            "المدفوعات المستحقة",
            money(stats.due),
            "bg-amber-50 text-amber-700",
          ],
          [
            "المدفوعات المستلمة",
            money(stats.received),
            "bg-sky-50 text-sky-700",
          ],
        ].map(([title, value, tone]) => (
          <div key={String(title)} className="card-surface p-4">
            <p className="text-sm text-slate-500">{title}</p>
            <div className="mt-3 flex items-end justify-between">
              <h2 className="text-xl font-bold text-slate-900">{value}</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
              >
                EGP
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="card-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم العملية أو الاسم أو العميل أو المشروع..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="filter-input"
          >
            <option value="all">كل أنواع العمليات</option>
            {financeTypeOptions.map((item) => (
              <option key={item} value={item}>
                {financeTypeLabels[item]}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="filter-input"
          >
            <option value="all">كل حالات الدفع</option>
            {paymentStatusOptions.map((item) => (
              <option key={item} value={item}>
                {paymentStatusLabels[item]}
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
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="filter-input"
          >
            <option value="all">كل العملاء</option>
            {mockClients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.company}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
          <label className="text-sm font-medium text-slate-600">
            تاريخ العملية
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
            <h2 className="text-lg font-bold text-slate-900">
              العمليات المالية
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              سجل مركزي لجميع العمليات والإجراءات المالية.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {filtered.length} عملية
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[1200px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "رقم العملية",
                  "اسم العملية",
                  "نوع العملية",
                  "المشروع",
                  "العميل",
                  "المبلغ",
                  "حالة الدفع",
                  "التاريخ",
                  "الموظف",
                  "الإجراءات",
                ].map((heading) => (
                  <th key={heading} className="table-header px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-semibold text-blue-700">
                    {item.number}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/dashboard/finance/${item.id}`}
                      className="font-semibold text-slate-800 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                      {item.description}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {financeTypeLabels[item.type]}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {item.projectName ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {item.clientName ?? item.supplier ?? "—"}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {money(item.amount)}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => cycleStatus(item)}
                      title="تغيير حالة الدفع"
                    >
                      <PaymentStatusBadge status={item.status} />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{item.date}</td>
                  <td className="px-4 py-4 text-slate-700">
                    {item.employeeName}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/finance/${item.id}`}
                        title="عرض التفاصيل"
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        title="تعديل العملية"
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
                        title="حذف العملية"
                        onClick={() => deleteTransaction(item)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
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
      <section className="card-surface overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            المدفوعات المستحقة والمتأخرة
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            تابع الجهات التي تحتاج إلى تحصيل أو سداد.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[700px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "العميل أو الجهة",
                  "المبلغ المستحق",
                  "تاريخ الاستحقاق",
                  "حالة الدفع",
                ].map((heading) => (
                  <th key={heading} className="table-header px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions
                .filter((item) => ["due", "overdue"].includes(item.status))
                .map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.clientName ??
                        item.supplier ??
                        item.projectName ??
                        "جهة داخلية"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {money(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.dueDate ?? "غير محدد"}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {transactions.every(
            (item) => !["due", "overdue"].includes(item.status),
          ) && (
            <p className="p-8 text-center text-sm text-slate-500">
              لا توجد مدفوعات مستحقة حاليًا.
            </p>
          )}
        </div>
      </section>
      <FinanceFormModal
        open={open}
        transaction={selected}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        onSubmit={save}
        projects={availableProjects}
        clients={clientsList.data}
        employees={employeesList.data}
        suppliers={suppliersList.data}
      />
    </div>
  );
}
