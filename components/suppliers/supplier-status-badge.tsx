import { SupplierStatus, supplierStatusLabels } from '@/data/suppliers';

const classes: Record<SupplierStatus, string> = { active: 'bg-emerald-50 text-emerald-700 border-emerald-200', inactive: 'bg-slate-100 text-slate-700 border-slate-200', pending: 'bg-amber-50 text-amber-700 border-amber-200' };

export function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{supplierStatusLabels[status]}</span>;
}
