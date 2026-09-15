/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { ArrowDownToLine, ArrowLeft, Package, RotateCcw, SlidersHorizontal, Warehouse } from 'lucide-react';
import { useParams } from 'next/navigation';
import { StockStatusBadge } from '@/components/warehouse/stock-status-badge';
import { stockMovementTypeLabels, type StockMovement, type WarehouseProduct } from '@/data/warehouse';
import { usePersistentList } from '@/lib/client/use-persistent-list';

const movementIcons = { in: ArrowDownToLine, out: ArrowDownToLine, return: RotateCcw, adjustment: SlidersHorizontal };

export default function WarehouseProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const products = usePersistentList<WarehouseProduct>('products');
  const movements = usePersistentList<StockMovement>('movements');
  const product = products.data.find((item) => item.id === params.id);
  const productMovements = movements.data.filter((movement) => movement.productId === params.id);

  if (products.loading || movements.loading) return <div className="card-surface p-8 text-center text-sm text-slate-500">جاري تحميل تفاصيل المنتج...</div>;
  if (products.error || movements.error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">تعذر تحميل تفاصيل المنتج.</div>;
  if (!product) return <div className="card-surface p-8 text-center text-sm text-slate-500">المنتج غير موجود.</div>;

  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-blue-600">تفاصيل المنتج</p><div className="mt-1 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold text-slate-900">{product.name}</h1><span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{product.code}</span></div><p className="mt-2 text-sm text-slate-500">{product.description}</p></div><Link href="/dashboard/warehouse" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />العودة إلى المخزن</Link></div><div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><section className="card-surface overflow-hidden"><div className="relative h-64 bg-slate-100">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Package className="h-20 w-20 text-slate-300" /></div>}<div className="absolute bottom-4 right-4"><StockStatusBadge product={product} /></div></div><div className="p-5"><div className="mb-5 flex items-center gap-2"><Warehouse className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">البيانات الأساسية</h2></div><div className="grid gap-4 sm:grid-cols-2">{[['التصنيف', product.category], ['المورد', product.supplier], ['مكان التخزين', product.storageLocation], ['الوحدة', product.unit], ['الكمية الحالية', product.currentQuantity], ['الحد الأدنى', product.minimumQuantity]].map(([label, value]) => <div key={String(label)}><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>)}</div></div></section><section className="card-surface overflow-hidden"><div className="flex items-center gap-2 border-b border-slate-100 p-5"><Warehouse className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">حركات المنتج</h2></div><div className="overflow-x-auto"><table className="data-table min-w-[700px] w-full text-sm"><thead className="bg-slate-50"><tr>{['رقم العملية','نوع الحركة','الكمية','التاريخ','الموظف','السبب'].map((heading) => <th key={heading} className="table-header px-4 py-3">{heading}</th>)}</tr></thead><tbody>{productMovements.map((movement) => { const Icon = movementIcons[movement.type]; return <tr key={movement.id} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold text-blue-700">{movement.number}</td><td className="px-4 py-3"><span className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-blue-600" />{stockMovementTypeLabels[movement.type]}</span></td><td className="px-4 py-3">{movement.quantity}</td><td className="px-4 py-3">{movement.date}</td><td className="px-4 py-3">{movement.employeeName}</td><td className="px-4 py-3">{movement.reason}</td></tr>; })}</tbody></table>{!productMovements.length && <p className="p-8 text-center text-sm text-slate-500">لا توجد حركات لهذا المنتج.</p>}</div></section></div></div>;
}
