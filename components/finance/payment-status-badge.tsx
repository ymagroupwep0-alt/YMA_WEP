import { PaymentStatus, paymentStatusLabels } from '@/data/finance';

const classes: Record<PaymentStatus, string> = { completed: 'border-emerald-200 bg-emerald-50 text-emerald-700', pending: 'border-amber-200 bg-amber-50 text-amber-700', due: 'border-orange-200 bg-orange-50 text-orange-700', overdue: 'border-rose-200 bg-rose-50 text-rose-700', cancelled: 'border-slate-200 bg-slate-100 text-slate-600' };

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{paymentStatusLabels[status]}</span>;
}
