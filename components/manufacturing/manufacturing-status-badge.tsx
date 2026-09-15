import { ManufacturingStatus, manufacturingStatusLabels } from '@/data/manufacturing';

const classes: Record<ManufacturingStatus, string> = {
  new: 'border-sky-200 bg-sky-50 text-sky-700',
  in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  paused: 'border-amber-200 bg-amber-50 text-amber-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  delayed: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function ManufacturingStatusBadge({ status }: { status: ManufacturingStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{manufacturingStatusLabels[status]}</span>;
}
