import { ReportStatus, reportStatusLabels } from '@/data/reports';

const styles: Record<ReportStatus, string> = {
  new: 'bg-blue-50 text-blue-700',
  in_review: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{reportStatusLabels[status]}</span>;
}