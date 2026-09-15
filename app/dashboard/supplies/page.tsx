"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2, Truck } from "lucide-react";
import type { Client } from "@/data/clients";
import type { Project } from "@/data/projects";
import type { WarehouseProduct } from "@/data/warehouse";
import {
  SupplyFormModal,
  SupplyFormValues,
} from "@/components/supplies/supply-form-modal";
import { SupplyPaymentBadge } from "@/components/supplies/supply-payment-badge";
import { SupplyStatusBadge } from "@/components/supplies/supply-status-badge";
import {
  calculateSupplyTotals,
  isInventoryCommitted,
  Supply,
} from "@/data/supplies";
import { usePermissionGuard } from "@/components/permissions/use-permission-guard";
import { usePersistentList } from "@/lib/client/use-persistent-list";

const formatMoney = (value: number) => `EGP ${value.toLocaleString("en-US")}`;
const getClientDisplayName = (clientId: string, clients: Client[]) => {
  const client = clients.find((item) => item.id === clientId);
  return client?.company || client?.name || "عميل غير محدد";
};
const getProjectDisplayName = (projectId: string | undefined, projects: Project[]) =>
  projects.find((item) => item.id === projectId)?.name || "بدون مشروع";

export default function SuppliesPage() {
  const { notice, check, can } = usePermissionGuard("supplies");
  const suppliesList = usePersistentList<Supply>("supplies");
  const clientsList = usePersistentList<Client>("clients");
  const projectsList = usePersistentList<Project>("projects");
  const productsList = usePersistentList<WarehouseProduct>("products");
  const supplies = useMemo(() => suppliesList.data.map((item) => ({ ...item, date: item.date?.slice(0, 10) ?? '' })), [suppliesList.data]);
  const clients = clientsList.data;
  const projects = projectsList.data;
  const products = productsList.data;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [clientId, setClientId] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [date, setDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const filteredSupplies = useMemo(
    () =>
      supplies.filter((supply) => {
        const term = search.trim().toLowerCase();
        const names = supply.items.map((item) => item.productName).join(" ");
        return (
          [supply.supplyNumber, getClientDisplayName(supply.clientId, clients), names].some(
            (value) => value.toLowerCase().includes(term),
          ) &&
          (status === "all" || supply.status === status) &&
          (paymentStatus === "all" || supply.paymentStatus === paymentStatus) &&
          (clientId === "all" || supply.clientId === clientId) &&
          (projectId === "all" || supply.projectId === projectId) &&
          (!date || supply.date === date)
        );
      }),
    [clientId, clients, date, paymentStatus, projectId, search, status, supplies],
  );
  const stats = useMemo(
    () => ({
      total: supplies.length,
      selling: supplies.reduce(
        (sum, supply) => sum + supply.totalSellingPrice,
        0,
      ),
      cost: supplies.reduce((sum, supply) => sum + supply.totalCost, 0),
      profit: supplies.reduce((sum, supply) => sum + supply.totalProfit, 0),
      active: supplies.filter((supply) =>
        ["pending", "processing"].includes(supply.status),
      ).length,
      due: supplies
        .filter((supply) =>
          ["pending", "overdue"].includes(supply.paymentStatus),
        )
        .reduce((sum, supply) => sum + supply.totalSellingPrice, 0),
    }),
    [supplies],
  );
  const saveSupply = async (values: SupplyFormValues): Promise<string | void> => {
    if (!check(selectedSupply ? "edit" : "create"))
      return "ليس لديك صلاحية لتنفيذ هذه العملية.";
    const inventoryApplied = isInventoryCommitted(values.status);
    const totals = calculateSupplyTotals(values.items);
    const response = await fetch(selectedSupply ? `/api/data/supplies/${selectedSupply.id}` : "/api/data/supplies", {
      method: selectedSupply ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, ...totals, inventoryApplied }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return payload?.error || "تعذر حفظ التوريد.";
    await Promise.all([suppliesList.refresh(), productsList.refresh()]);
    setModalOpen(false);
    setSelectedSupply(null);
  };
  const deleteSupply = async (supply: Supply) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التوريد؟')) return;
    if (!check("delete")) return;
    if (!window.confirm("هل تريد حذف عملية التوريد؟")) return;
    const response = await fetch(`/api/data/supplies/${supply.id}`, { method: "DELETE" });
    if (!response.ok) return;
    await Promise.all([suppliesList.refresh(), productsList.refresh()]);
  };
  const openEdit = (supply: Supply) => {
    if (!check("edit")) return;
    setSelectedSupply(supply);
    setModalOpen(true);
  };
  return (
    <div className="space-y-6">
      {(suppliesList.error || clientsList.error || projectsList.error || productsList.error) ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">تعذر تحميل بيانات التوريدات.</div> : null}
      {(suppliesList.loading || clientsList.loading || projectsList.loading || productsList.loading) ? <div className="card-surface p-8 text-center text-sm text-slate-500">جاري تحميل بيانات التوريدات...</div> : null}
      {notice ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
        >
          {notice}
        </div>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">إدارة التوريدات</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">التوريدات</h1>
          <p className="mt-2 text-sm text-slate-500">
            توريد منتجات الشركة إلى العملاء مع متابعة التكلفة والبيع والربح.
          </p>
        </div>
        <button
          type="button"
          disabled={!can("create")}
          onClick={() => {
            setSelectedSupply(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          إضافة توريد
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["إجمالي التوريدات", stats.total],
          ["إجمالي قيمة البيع", formatMoney(stats.selling)],
          ["إجمالي التكلفة", formatMoney(stats.cost)],
          ["إجمالي الأرباح", formatMoney(stats.profit)],
          ["قيد التنفيذ", stats.active],
          ["المدفوعات المستحقة", formatMoney(stats.due)],
        ].map(([label, value]) => (
          <div key={String(label)} className="card-surface p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Truck className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="card-surface p-4 sm:p-5">
        <div className="grid gap-3 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="بحث برقم التوريد أو العميل أو المنتج..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          >
            <option value="all">كل حالات التوريد</option>
            {Object.entries({
              draft: "مسودة",
              pending: "قيد التنفيذ",
              processing: "جاري التجهيز",
              delivered: "تم التوريد",
              completed: "مكتمل",
              cancelled: "ملغي",
            }).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          >
            <option value="all">كل حالات الدفع</option>
            {Object.entries({
              paid: "مدفوع",
              partial: "مدفوع جزئيًا",
              pending: "مستحق",
              overdue: "متأخر",
            }).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          >
            <option value="all">كل العملاء</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company || client.name}
              </option>
            ))}
          </select>
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          >
            <option value="all">كل المشاريع</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          />
        </div>
      </div>
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[1350px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "رقم التوريد",
                  "العميل",
                  "المشروع",
                  "المنتجات",
                  "إجمالي التكلفة",
                  "إجمالي البيع",
                  "الربح",
                  "حالة التوريد",
                  "حالة الدفع",
                  "التاريخ",
                  "الإجراءات",
                ].map((heading) => (
                  <th key={heading} className="table-header px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSupplies.map((supply) => (
                <tr key={supply.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {supply.supplyNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {getClientDisplayName(supply.clientId, clients)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {getProjectDisplayName(supply.projectId, projects)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {supply.items.length}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatMoney(supply.totalCost)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {formatMoney(supply.totalSellingPrice)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">
                    {formatMoney(supply.totalProfit)}
                  </td>
                  <td className="px-4 py-3">
                    <SupplyStatusBadge status={supply.status} />
                  </td>
                  <td className="px-4 py-3">
                    <SupplyPaymentBadge status={supply.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{supply.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/supplies/${supply.id}`}
                        aria-label="عرض تفاصيل التوريد"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        disabled={!can("edit")}
                        onClick={() => openEdit(supply)}
                        aria-label="تعديل التوريد"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:text-amber-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={!can("delete")}
                        onClick={() => deleteSupply(supply)}
                        aria-label="حذف التوريد"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredSupplies.length && (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              لا توجد توريدات مطابقة للفلاتر الحالية.
            </p>
          )}
        </div>
      </div>
      <SupplyFormModal
        open={modalOpen}
        supply={selectedSupply}
        clients={clients}
        projects={projects}
        products={products}
        onClose={() => {
          setModalOpen(false);
          setSelectedSupply(null);
        }}
        onSubmit={saveSupply}
      />
    </div>
  );
}
