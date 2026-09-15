'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { EmployeeFormModal } from '@/components/employees/employee-form-modal';
import { UserFormModal, UserFormValues } from '@/components/settings/user-form-modal';
import { EmployeeStatusBadge } from '@/components/employees/employee-status-badge';
import { Employee, employeeStatusLabels, employeeStatusOptions } from '@/data/employees';
import { usePermissions } from '@/components/permissions/permissions-provider';
import { canManageUsers } from '@/lib/user-management';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';
import { usePersistentList } from '@/lib/client/use-persistent-list';

type ApiEmployee = Omit<Employee, 'hireDate' | 'salary' | 'notes' | 'projects' | 'reports' | 'warehouseLogs' | 'attendance'> & {
  hireDate?: string | null;
  salary?: number | null;
  notes?: string | null;
};

const toEmployee = (employee: ApiEmployee): Employee => ({
  ...employee,
  hireDate: employee.hireDate?.slice(0, 10) ?? '—',
  salary: employee.salary ?? 0,
  notes: employee.notes ?? 'لا توجد ملاحظات.',
  projects: [],
  reports: [],
  warehouseLogs: [],
  attendance: [],
});

export default function EmployeesPage() {
  const { can, check } = usePermissionGuard('employees');
  const { currentUserId, users, rolePermissions } = usePermissions();
  const { data: apiEmployees, loading, error, refresh } = usePersistentList<ApiEmployee>('employees');
  const employees = useMemo(() => apiEmployees.map(toEmployee), [apiEmployees]);
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userOpen, setUserOpen] = useState(false);
  const currentUser = users.find((user) => user.id === currentUserId);

  const departmentOptions = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.department))),
    [employees]
  );

  const roleOptions = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.role))),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch =
        employee.fullName.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        employee.phone.toLowerCase().includes(term) ||
        employee.role.toLowerCase().includes(term) ||
        employee.code.toLowerCase().includes(term);

      const matchesDepartment = departmentFilter === 'all' ? true : employee.department === departmentFilter;
      const matchesRole = roleFilter === 'all' ? true : employee.role === roleFilter;
      const matchesStatus = statusFilter === 'all' ? true : employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });
  }, [employees, search, departmentFilter, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: employees.length,
      active: employees.filter((employee) => employee.status === 'active').length,
      inactive: employees.filter((employee) => employee.status === 'inactive').length,
      onLeave: employees.filter((employee) => employee.status === 'on_leave').length,
    };
  }, [employees]);

  const handleCreate = async (values: Omit<Employee, 'id' | 'code' | 'projects' | 'reports' | 'warehouseLogs' | 'attendance' | 'imageUrl'>) => {
    if (!check(selectedEmployee ? 'edit' : 'create')) return;
    const response = await fetch(selectedEmployee ? `/api/data/employees/${selectedEmployee.id}` : '/api/data/employees', {
      method: selectedEmployee ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!response.ok) return;
    await refresh();
    setOpen(false);
    setSelectedEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    if (!check('edit')) return;
    setSelectedEmployee(employee);
    setOpen(true);
  };

  const handleDelete = async (employeeId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    if (currentUser?.roleId !== 'admin' || !check('delete')) return;
    const response = await fetch(`/api/data/employees/${employeeId}`, { method: 'DELETE' });
    if (response.ok) await refresh();
  };

  const handleCreateUser = async (values: UserFormValues) => {
    if (!canManageUsers(users, currentUserId, rolePermissions)) return;
    const response = await fetch('/api/data/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    if (!response.ok) {
      window.alert((await response.json()).error ?? 'تعذر إضافة الموظف');
      return;
    }
    await refresh();
    setUserOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">الموظفون</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">إدارة الموظفين</h1>
          <p className="mt-2 text-sm text-slate-500">تابع بيانات الموظفين، أحوالهم، والمهام المرتبطة بكل قسم بشكل مركزي.</p>
        </div>

        <button
          type="button"
          disabled={!can('create') || !canManageUsers(users, currentUserId, rolePermissions)}
          onClick={() => {
            setSelectedEmployee(null);
            setUserOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          إضافة موظف جديد
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card-surface p-4">
          <p className="text-sm text-slate-500">إجمالي الموظفين</p>
          <div className="mt-3 flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900">{stats.total}</h3>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">الكل</span>
          </div>
        </div>

        <div className="card-surface p-4">
          <p className="text-sm text-slate-500">الموظفون النشطون</p>
          <div className="mt-3 flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900">{stats.active}</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">نشط</span>
          </div>
        </div>

        <div className="card-surface p-4">
          <p className="text-sm text-slate-500">الموظفون غير النشطين</p>
          <div className="mt-3 flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900">{stats.inactive}</h3>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">غير نشط</span>
          </div>
        </div>

        <div className="card-surface p-4">
          <p className="text-sm text-slate-500">الموظفون في إجازة</p>
          <div className="mt-3 flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900">{stats.onLeave}</h3>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">إجازة</span>
          </div>
        </div>
      </div>

      <div className="card-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن موظف باستخدام الاسم أو البريد أو الهاتف أو الوظيفة أو الكود..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">كل الأقسام</option>
            {departmentOptions.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">كل الوظائف</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">كل الحالات</option>
            {employeeStatusOptions.map((status) => (
              <option key={status} value={status}>
                {employeeStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {loading && <p className="p-8 text-center text-sm text-slate-500">جاري تحميل الموظفين...</p>}
        {error && <p className="p-8 text-center text-sm text-rose-600">{error}</p>}
        {!loading && !error && filteredEmployees.length === 0 && <p className="p-8 text-center text-sm text-slate-500">لا توجد بيانات موظفين.</p>}
        <div className="overflow-x-auto">
          <table className="data-table min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header px-4 py-3">الصورة</th>
                <th className="table-header px-4 py-3">كود الموظف</th>
                <th className="table-header px-4 py-3">اسم الموظف</th>
                <th className="table-header px-4 py-3">الوظيفة</th>
                <th className="table-header px-4 py-3">القسم</th>
                <th className="table-header px-4 py-3">البريد الإلكتروني</th>
                <th className="table-header px-4 py-3">رقم الهاتف</th>
                <th className="table-header px-4 py-3">تاريخ التعيين</th>
                <th className="table-header px-4 py-3">الحالة</th>
                <th className="table-header px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-t border-slate-200 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                      {employee.fullName.charAt(0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{employee.code}</td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/employees/${employee.id}`} className="font-semibold text-slate-800 transition hover:text-blue-600">
                      {employee.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{employee.role}</td>
                  <td className="px-4 py-3 text-slate-700">{employee.department}</td>
                  <td className="px-4 py-3 text-slate-700">{employee.email}</td>
                  <td className="px-4 py-3 text-slate-700">{employee.phone}</td>
                  <td className="px-4 py-3 text-slate-700">{employee.hireDate}</td>
                  <td className="px-4 py-3">
                    <EmployeeStatusBadge status={employee.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/employees/${employee.id}`} aria-label="عرض الملف" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button type="button" onClick={() => handleEdit(employee)} aria-label="تعديل الموظف" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-amber-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {currentUser?.roleId === 'admin' && can('delete') && <button type="button" onClick={() => handleDelete(employee.id)} aria-label="حذف الموظف" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeFormModal
        open={open}
        employee={selectedEmployee}
        onClose={() => {
          setOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleCreate}
      />
      <UserFormModal
        open={userOpen}
        entityLabel="موظف"
        onClose={() => setUserOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}
