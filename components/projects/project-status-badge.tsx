import { ProjectStatus, statusLabels } from '@/data/projects';

const classes: Record<ProjectStatus, string> = {
  new: 'bg-sky-50 text-sky-700 border-sky-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  delayed: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
