import { ClientStatus, clientStatusLabels } from '@/data/clients';

const classes: Record<ClientStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  potential: 'bg-amber-50 text-amber-700 border-amber-200',
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {clientStatusLabels[status]}
    </span>
  );
}
