'use client';
import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { usePersistentList } from '@/lib/client/use-persistent-list';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';
import type { Employee } from '@/data/employees';
import { payrollStatusLabels, payrollStatusOptions, type PayrollRecord, type PayrollStatus } from '@/data/payroll';

type ApiPayroll = PayrollRecord & { employee?: { fullName: string } | null };
const today = new Date().toISOString().slice(0, 10);
const monthStart = `${today.slice(0, 7)}-01`;

export default function PayrollPage() {
  const { can } = usePermissionGuard('finance');
  const payroll = usePersistentList<ApiPayroll>('payroll');
  const employees = usePersistentList<Employee>('employees');

  const [editing, setEditing] = useState<ApiPayroll | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [periodStart, setPeriodStart] = useState(monthStart);
  const [periodEnd, setPeriodEnd] = useState(today);
  const [basic, setBasic] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [status, setStatus] = useState<PayrollStatus>('due');
  const [paymentMethod, setPaymentMethod] = useState('تحويل بنكي');
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PayrollStatus>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const net = useMemo(() => basic + allowances - deductions, [basic, allowances, deductions]);

  useEffect(() => {
    if (!editing) return;
    setEmployeeId(editing.employeeId);
    setPeriodStart(editing.periodStart?.slice(0, 10) ?? monthStart);
    setPeriodEnd(editing.periodEnd?.slice(0, 10) ?? today);
    setBasic(Number(editing.basicSalary) || 0);
    setAllowances(Number(editing.allowances) || 0);
    setDeductions(Number(editing.deductions) || 0);
    setStatus(editing.status);
    setPaymentMethod(editing.paymentMethod || 'تحويل بنكي');
  }, [editing]);

  const reset = () => {
    setEditing(null);
    setEmployeeId('');
    setPeriodStart(monthStart);
    setPeriodEnd(today);
    setBasic(0);
    setAllowances(0);
    setDeductions(0);
    setStatus('due');
    setPaymentMethod('تحويل بنكي');
    setError('');
  };

  const save = async () => {
    if (!can('create') && !editing) return;
    if (!can('edit') && editing) return;
    if (!employeeId) return setError('اختر الموظف.');
    if (net <= 0) return setError('صافي الراتب يجب أن يكون أكبر من صفر.');
    if (periodStart > periodEnd) return setError('بداية الفترة يجب أن تسبق نهايتها.');

    const payload = {
      employeeId,
      periodStart,
      periodEnd,
      basicSalary: basic,
      allowances,
      deductions,
      netSalary: net,
      status,
      paymentMethod,
      paidAt: status === 'paid' ? periodEnd : null,
    };

    const response = await fetch(editing ? `/api/data/payroll/${editing.id}` : '/api/data/payroll', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return setError(body.error || 'تعذر حفظ كشف الراتب.');
    }

    await payroll.refresh();
    reset();
  };

  const remove = async (id: string) => {
    if (!can('delete') || !window.confirm('حذف كشف الراتب والعملية المالية المرتبطة به')) return;
    const response = await fetch(`/api/data/payroll/${id}`, { method: 'DELETE' });
    if (response.ok) await payroll.refresh();
  };

  const filteredPayroll = useMemo(() => {
    const term = search.trim().toLowerCase();

    return payroll.data.filter((item) => {
      const employeeName = item.employee?.fullName ?? item.employeeName ?? item.employeeId ?? '';
      const code = item.number ?? '';

      const matchesSearch =
        !term ||
        code.toLowerCase().includes(term) ||
        employeeName.toLowerCase().includes(term) ||
        (item.paymentMethod ?? '').toLowerCase().includes(term);

      const matchesEmployee = employeeFilter === 'all' || item.employeeId === employeeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesFromDate = !fromDate || item.periodStart?.slice(0, 10) >= fromDate;
      const matchesToDate = !toDate || item.periodEnd?.slice(0, 10) <= toDate;

      return matchesSearch && matchesEmployee && matchesStatus && matchesFromDate && matchesToDate;
    });
  }, [payroll.data, search, employeeFilter, statusFilter, fromDate, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">إدارة الرواتب</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">المرتبات</h1>
        <p className="mt-2 text-sm text-slate-500">
          تسجيل وتعديل الرواتب متاح لمدير النظام فقط وكل راتب ينشئ أو يحدث عملية صرف في الماليات تلقائيا.
        </p>
      </div>

      <section className="card-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {editing ? 'تعديل كشف الراتب' : 'تسجيل راتب جديد'}
          </h2>
          {editing && (
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الموظف</label>
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="filter-input"
            >
              <option value="">اختر الموظف</option>
              {employees.data.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">تاريخ بداية الفترة</label>
            <input
              type="date"
              value={periodStart}
              onChange={(event) => setPeriodStart(event.target.value)}
              className="filter-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">تاريخ نهاية الفترة</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(event) => setPeriodEnd(event.target.value)}
              className="filter-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">حالة الكشف</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PayrollStatus)}
              className="filter-input"
            >
              {payrollStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {payrollStatusLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الراتب الأساسي</label>
            <input
              type="number"
              min="0"
              value={basic}
              onChange={(event) => setBasic(Number(event.target.value))}
              placeholder="الراتب الأساسي"
              className="filter-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">البدلات</label>
            <input
              type="number"
              min="0"
              value={allowances}
              onChange={(event) => setAllowances(Number(event.target.value))}
              placeholder="البدلات"
              className="filter-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الخصومات</label>
            <input
              type="number"
              min="0"
              value={deductions}
              onChange={(event) => setDeductions(Number(event.target.value))}
              placeholder="الخصومات"
              className="filter-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">طريقة الدفع</label>
            <input
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              placeholder="طريقة الدفع"
              className="filter-input"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">صافي الراتب</p>
            <p className="text-2xl font-bold text-slate-900">EGP {net.toLocaleString('en-US')}</p>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={!can(editing ? 'edit' : 'create')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editing ? 'تحديث كشف الراتب' : 'تسجيل كشف الراتب'}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
        )}
      </section>

      <section className="card-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">بحث بالكود أو الموظف</label>
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث برقم الكشف أو اسم الموظف"
                className="filter-input w-full pr-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الموظف</label>
            <select
              value={employeeFilter}
              onChange={(event) => setEmployeeFilter(event.target.value)}
              className="filter-input"
            >
              <option value="all">كل الموظفين</option>
              {employees.data.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الحالة</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | PayrollStatus)}
              className="filter-input"
            >
              <option value="all">كل الحالات</option>
              {payrollStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {payrollStatusLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">من تاريخ</label>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="filter-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">إلى تاريخ</label>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </section>

      <section className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">سجل الرواتب</h2>
            <p className="mt-1 text-sm text-slate-500">عرض النتائج بعد تطبيق الفلاتر الحالية.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {filteredPayroll.length} كشف
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table min-w-[1050px] w-full text-sm">
            <thead>
              <tr>
                {['رقم الكشف', 'الموظف', 'الفترة', 'الراتب الأساسي', 'البدلات', 'الخصومات', 'صافي الراتب', 'الحالة', 'الإجراءات'].map((heading) => (
                  <th key={heading} className="table-header px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPayroll.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-blue-700">{item.number}</td>
                  <td className="px-4 py-3">{item.employee?.fullName ?? item.employeeName ?? item.employeeId}</td>
                  <td className="px-4 py-3">
                    {item.periodStart?.slice(0, 10)} → {item.periodEnd?.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">{Number(item.basicSalary).toLocaleString()}</td>
                  <td className="px-4 py-3">{Number(item.allowances).toLocaleString()}</td>
                  <td className="px-4 py-3">{Number(item.deductions).toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {Number(item.netSalary).toLocaleString()} EGP
                  </td>
                  <td className="px-4 py-3">{payrollStatusLabels[item.status]}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        disabled={!can('edit')}
                        onClick={() => setEditing(item)}
                        className="text-blue-600 disabled:opacity-40"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled={!can('delete')}
                        onClick={() => remove(item.id)}
                        className="text-rose-600 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredPayroll.length && (
            <p className="p-8 text-center text-sm text-slate-500">
              لا توجد بيانات رواتب تطابق الفلاتر الحالية.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
