export type PayrollStatus = 'draft' | 'due' | 'paid' | 'cancelled';
export type PayrollRecord = { id: string; number: string; employeeId: string; employeeName?: string; periodStart: string; periodEnd: string; basicSalary: number; allowances: number; deductions: number; netSalary: number; status: PayrollStatus; paymentMethod?: string; paidAt?: string | null; notes?: string };
export const payrollStatusLabels: Record<PayrollStatus,string> = { draft:'مسودة', due:'مستحق', paid:'مدفوع', cancelled:'ملغي' };
export const payrollStatusOptions: PayrollStatus[] = ['draft','due','paid','cancelled'];
