import { SupplyStatus, supplyStatusLabels } from '@/data/supplies';

const classes: Record<SupplyStatus, string> = { draft: 'bg-slate-100 text-slate-700 border-slate-200', pending: 'bg-amber-50 text-amber-700 border-amber-200', processing: 'bg-blue-50 text-blue-700 border-blue-200', delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200', completed: 'bg-green-50 text-green-700 border-green-200', cancelled: 'bg-rose-50 text-rose-700 border-rose-200' };
export function SupplyStatusBadge({ status }: { status: SupplyStatus }) { return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{supplyStatusLabels[status]}</span>; }
