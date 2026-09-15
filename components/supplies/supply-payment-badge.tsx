import { SupplyPaymentStatus, supplyPaymentLabels } from '@/data/supplies';

const classes: Record<SupplyPaymentStatus, string> = { paid: 'bg-emerald-50 text-emerald-700 border-emerald-200', partial: 'bg-blue-50 text-blue-700 border-blue-200', pending: 'bg-amber-50 text-amber-700 border-amber-200', overdue: 'bg-rose-50 text-rose-700 border-rose-200' };
export function SupplyPaymentBadge({ status }: { status: SupplyPaymentStatus }) { return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{supplyPaymentLabels[status]}</span>; }
