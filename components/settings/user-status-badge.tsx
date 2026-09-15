import { UserStatus, userStatusLabels } from '@/data/settings';

const classes: Record<UserStatus, string> = { active: 'border-emerald-200 bg-emerald-50 text-emerald-700', inactive: 'border-slate-200 bg-slate-100 text-slate-600', suspended: 'border-rose-200 bg-rose-50 text-rose-700' };

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{userStatusLabels[status]}</span>;
}
