/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Client } from "@/data/clients";
import {
  ProductFormModal,
  ProductFormValues,
} from "@/components/warehouse/product-form-modal";
import {
  StockMovementModal,
  MovementFormValues,
} from "@/components/warehouse/stock-movement-modal";
import { StockStatusBadge } from "@/components/warehouse/stock-status-badge";
import { getStockStatus, StockMovement, stockMovementTypeLabels, WarehouseProduct } from "@/data/warehouse";
import { usePermissionGuard } from "@/components/permissions/use-permission-guard";
import { usePersistentList } from "@/lib/client/use-persistent-list";
import type { Employee } from "@/data/employees";

export default function WarehousePage() {
  const { check, can } = usePermissionGuard("warehouse");
  const productsList = usePersistentList<WarehouseProduct>("products");
  const movementsList = usePersistentList<StockMovement>("movements");
  const employeesList = usePersistentList<Employee>("employees");
  const clientsList = usePersistentList<Client>("clients");
  const suppliersList = usePersistentList<{ id: string; name: string; company?: string }>("suppliers");
  const products = productsList.data;
  const movements = movementsList.data;
  const employees = employeesList.data;
  const [productOpen, setProductOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<WarehouseProduct | null>(null);
  const [movementProductId, setMovementProductId] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products],
  );
  const suppliers = useMemo(
    () => Array.from(new Set(products.map((product) => product.supplier))),
    [products],
  );
  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter(
      (product) =>
        (product.name.toLowerCase().includes(term) ||
          product.code.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.supplier.toLowerCase().includes(term)) &&
        (category === "all" || product.category === category) &&
        (stockStatus === "all" || getStockStatus(product) === stockStatus) &&
        (supplier === "all" || product.supplier === supplier),
    );
  }, [products, search, category, stockStatus, supplier]);
  const stats = useMemo(
    () => ({
      total: products.length,
      available: products.filter(
        (product) => getStockStatus(product) === "available",
      ).length,
      low: products.filter((product) => getStockStatus(product) === "low")
        .length,
      minimum: products.filter(
        (product) => getStockStatus(product) === "minimum",
      ).length,
      value: products.reduce(
        (total, product) =>
          total + product.currentQuantity * product.purchasePrice,
        0,
      ),
    }),
    [products],
  );
  const saveProduct = async (values: ProductFormValues) => {
    if (!check(selectedProduct ? "edit" : "create")) return;
    const response = await fetch(selectedProduct ? `/api/data/products/${selectedProduct.id}` : "/api/data/products", {
      method: selectedProduct ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) return;
    await productsList.refresh();
    setSelectedProduct(null);
  };
  const recordMovement = async (values: MovementFormValues) => {
    if (!check("edit")) return;
    const response = await fetch("/api/data/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) return;
    await Promise.all([productsList.refresh(), movementsList.refresh()]);
  };
  const openMovement = (productId = "") => {
    if (!check("edit")) return;
    setMovementProductId(productId);
    setMovementOpen(true);
  };
  const deleteProduct = async (product: WarehouseProduct) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    if (!check("delete")) return;
    const response = await fetch(`/api/data/products/${product.id}`, { method: "DELETE" });
    if (!response.ok) return;
    await productsList.refresh();
  };
  const movementIcon = {
    in: ArrowDownToLine,
    out: ArrowUpFromLine,
    return: RotateCcw,
    adjustment: SlidersHorizontal,
  };
  return (
    <div className="space-y-6">
      {(productsList.error || movementsList.error || employeesList.error || clientsList.error || suppliersList.error) ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">تعذر تحميل بيانات المخزن.</div> : null}
      {(productsList.loading || movementsList.loading || employeesList.loading || clientsList.loading || suppliersList.loading) ? <div className="card-surface p-8 text-center text-sm text-slate-500">جاري تحميل بيانات المخزن...</div> : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">مركز المخزن</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">المخزن</h1>
          <p className="mt-2 text-sm text-slate-500">
            أدر المنتجات والكميات وحركات المخزون من مساحة واحدة.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!can("edit")}
            onClick={() => openMovement()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowUpFromLine className="h-4 w-4" />
            تسجيل حركة مخزون
          </button>
          <button
            type="button"
            disabled={!can("create")}
            onClick={() => {
              setSelectedProduct(null);
              setProductOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            إضافة منتج جديد
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["إجمالي المنتجات", stats.total, "bg-blue-50 text-blue-700"],
          [
            "المنتجات المتاحة",
            stats.available,
            "bg-emerald-50 text-emerald-700",
          ],
          ["منخفضة المخزون", stats.low, "bg-amber-50 text-amber-700"],
          ["وصلت للحد الأدنى", stats.minimum, "bg-orange-50 text-orange-700"],
          [
            "إجمالي قيمة المخزون",
            `EGP ${stats.value.toLocaleString("en-US")}`,
            "bg-sky-50 text-sky-700",
          ],
        ].map(([title, value, tone]) => (
          <div key={String(title)} className="card-surface p-4">
            <p className="text-sm text-slate-500">{title}</p>
            <div className="mt-3 flex items-end justify-between">
              <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
              >
                {title === "إجمالي قيمة المخزون" ? "قيمة" : "مؤشر"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {stats.low +
        stats.minimum +
        products.filter((product) => getStockStatus(product) === "out").length >
        0 && (
        <div className="grid gap-3 md:grid-cols-3">
          {products
            .filter((product) => getStockStatus(product) !== "available")
            .map((product) => (
              <div
                key={product.id}
                className={`flex items-center justify-between rounded-2xl border p-4 text-sm ${getStockStatus(product) === "out" ? "border-rose-200 bg-rose-50 text-rose-800" : getStockStatus(product) === "minimum" ? "border-orange-200 bg-orange-50 text-orange-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}
              >
                <span>
                  <strong>{product.name}</strong>
                  <br />
                  <span className="text-xs">
                    الكمية الحالية: {product.currentQuantity} {product.unit}،
                    الحد الأدنى: {product.minimumQuantity}
                  </span>
                </span>
                <StockStatusBadge product={product} />
              </div>
            ))}
        </div>
      )}
      <div className="card-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المنتج أو الكود أو التصنيف أو المورد..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="filter-input"
          >
            <option value="all">كل التصنيفات</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="filter-input"
          >
            <option value="all">كل حالات المخزون</option>
            <option value="available">متوفر</option>
            <option value="low">منخفض</option>
            <option value="minimum">وصل للحد الأدنى</option>
            <option value="out">غير متوفر</option>
          </select>
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="filter-input"
          >
            <option value="all">كل الموردين</option>
            {suppliers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          تظهر {filteredProducts.length} منتجات
        </p>
      </div>
      <section className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">قائمة المنتجات</h2>
            <p className="mt-1 text-sm text-slate-500">
              مخزون منظم وجاهز للربط مع عمليات التصنيع.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {filteredProducts.length} منتج
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[1250px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "الصورة",
                  "كود المنتج",
                  "اسم المنتج",
                  "التصنيف",
                  "الكمية الحالية",
                  "الحد الأدنى",
                  "الوحدة",
                  "سعر الشراء",
                  "مكان التخزين",
                  "الحالة",
                  "الإجراءات",
                ].map((heading) => (
                  <th key={heading} className="table-header px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-11 w-11 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                        {product.name.slice(0, 2)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    {product.code}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/warehouse/${product.id}`}
                      className="font-semibold text-slate-800 hover:text-blue-600"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 max-w-[170px] truncate text-xs text-slate-500">
                      {product.supplier}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {product.category}
                  </td>
                  <td
                    className={`px-4 py-3 font-bold ${getStockStatus(product) === "out" ? "text-rose-600" : getStockStatus(product) !== "available" ? "text-amber-600" : "text-slate-800"}`}
                  >
                    {product.currentQuantity}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {product.minimumQuantity}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.unit}</td>
                  <td className="px-4 py-3 text-slate-700">
                    EGP {product.purchasePrice.toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {product.storageLocation}
                  </td>
                  <td className="px-4 py-3">
                    <StockStatusBadge product={product} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/warehouse/${product.id}`}
                        title="عرض التفاصيل"
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        title="تعديل المنتج"
                        onClick={() => {
                          if (!check("edit")) return;
                          setSelectedProduct(product);
                          setProductOpen(true);
                        }}
                        className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="تسجيل حركة للمنتج"
                        onClick={() => openMovement(product.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                      >
                        <ArrowUpFromLine className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="حذف المنتج"
                        onClick={() => deleteProduct(product)}
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
          {filteredProducts.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              لا توجد منتجات مطابقة للفلاتر الحالية.
            </div>
          )}
        </div>
      </section>
      <section className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              سجل حركة المخزون
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              كل عمليات الإضافة والصرف والمرتجع وتعديل الكميات.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openMovement()}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            تسجيل حركة
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "رقم العملية",
                  "المنتج",
                  "نوع الحركة",
                  "الكمية",
                  "التاريخ",
                  "الموظف",
                  "السبب",
                ].map((heading) => (
                  <th key={heading} className="table-header px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => {
                const Icon = movementIcon[movement.type];
                return (
                  <tr key={movement.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      {movement.number}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {movement.productName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-slate-700">
                        <Icon className="h-4 w-4 text-blue-600" />
                        {stockMovementTypeLabels[movement.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {movement.quantity}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {movement.date}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {movement.employeeName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {movement.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <ProductFormModal
        open={productOpen}
        product={selectedProduct}
        onClose={() => {
          setProductOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={saveProduct}
      />
      <StockMovementModal
        open={movementOpen}
        selectedProduct={movementProductId}
        products={products}
        employees={employees}
        clients={clientsList.data}
        suppliers={suppliersList.data}
        onClose={() => setMovementOpen(false)}
        onSubmit={recordMovement}
      />
    </div>
  );
}
