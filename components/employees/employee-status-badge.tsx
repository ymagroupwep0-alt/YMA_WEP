import { EmployeeStatus, employeeStatusLabels } from '@/data/employees';

type EmployeeStatusBadgeProps = {
  status: EmployeeStatus;
};

const statusClasses: Record<EmployeeStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  inactive: 'bg-rose-50 text-rose-700 border border-rose-200',
  on_leave: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}>
      {employeeStatusLabels[status]}
    </span>
  );
}
