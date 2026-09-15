export type FinanceTransactionType = 'income' | 'expense' | 'client_payment' | 'supplier_payment' | 'salary' | 'manufacturing_cost' | 'other';
export type PaymentStatus = 'completed' | 'pending' | 'due' | 'overdue' | 'cancelled';
export type FinanceCategory = 'projects' | 'services' | 'client_payments' | 'manufacturing' | 'materials' | 'salaries' | 'operations' | 'maintenance' | 'other';

export type FinanceTransaction = {
  id: string;
  number: string;
  name: string;
  type: FinanceTransactionType;
  category: FinanceCategory;
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  supplyId?: string;
  supplier?: string;
  amount: number;
  date: string;
  dueDate?: string;
  status: PaymentStatus;
  paymentMethod: string;
  employeeId: string;
  employeeName: string;
  description: string;
  notes: string;
  activity: { id: string; title: string; date: string; note?: string }[];
};

export const financeTypeLabels: Record<FinanceTransactionType, string> = { income: 'إيراد', expense: 'مصروف', client_payment: 'دفعة من عميل', supplier_payment: 'دفعة لمورد', salary: 'راتب موظف', manufacturing_cost: 'تكلفة تصنيع', other: 'عملية أخرى' };
export const paymentStatusLabels: Record<PaymentStatus, string> = { completed: 'مكتمل', pending: 'معلق', due: 'مستحق', overdue: 'متأخر', cancelled: 'ملغي' };
export const financeCategoryLabels: Record<FinanceCategory, string> = { projects: 'مشاريع', services: 'خدمات', client_payments: 'دفعات العملاء', manufacturing: 'تصنيع', materials: 'مواد', salaries: 'رواتب', operations: 'تشغيل', maintenance: 'صيانة', other: 'أخرى' };
export const financeTypeOptions: FinanceTransactionType[] = ['income', 'expense', 'client_payment', 'supplier_payment', 'salary', 'manufacturing_cost', 'other'];
export const paymentStatusOptions: PaymentStatus[] = ['completed', 'pending', 'due', 'overdue', 'cancelled'];

export const mockFinanceTransactions: FinanceTransaction[] = [
  { id: 'fin-101', number: 'FIN-2026-001', name: 'دفعة المرحلة الثانية', type: 'client_payment', category: 'client_payments', projectId: 'prj-101', projectName: 'مبنى النخبة التجاري', clientId: 'client-101', clientName: 'شركة النخبة', amount: 180000, date: '2026-08-28', dueDate: '2026-09-10', status: 'due', paymentMethod: 'تحويل بنكي', employeeId: 'emp-103', employeeName: 'ليلى حسن', description: 'دفعة مستحقة حسب جدول الدفعات المعتمد للمشروع.', notes: 'بانتظار التحويل من العميل.', activity: [{ id: 'fin-act-101', title: 'تم إنشاء العملية المالية', date: '2026-08-28' }] },
  { id: 'fin-102', number: 'FIN-2026-002', name: 'شراء مواد الواجهات', type: 'expense', category: 'materials', projectId: 'prj-101', projectName: 'مبنى النخبة التجاري', supplier: 'شركة المعادن المتحدة', amount: 96000, date: '2026-08-25', status: 'completed', paymentMethod: 'تحويل بنكي', employeeId: 'emp-101', employeeName: 'سارة أحمد', description: 'شراء ألواح ألمنيوم ومواد الواجهات.', notes: 'تم استلام المواد في المستودع.', activity: [{ id: 'fin-act-102', title: 'تم تسجيل المصروف', date: '2026-08-25' }] },
  { id: 'fin-103', number: 'FIN-2026-003', name: 'تكلفة تصنيع خطوط الإنتاج', type: 'manufacturing_cost', category: 'manufacturing', projectId: 'prj-102', projectName: 'منشأة الخليج للمنتجات', supplier: 'حلول المعدات الصناعية', amount: 320000, date: '2026-08-20', status: 'pending', paymentMethod: 'آجل', employeeId: 'emp-102', employeeName: 'محمود علي', description: 'تكلفة تنفيذ وتجميع خطوط الإنتاج.', notes: 'تتم مراجعة الفاتورة.', activity: [{ id: 'fin-act-103', title: 'تم إنشاء العملية المالية', date: '2026-08-20' }, { id: 'fin-act-104', title: 'تم إرسال العملية للمراجعة', date: '2026-08-21' }] },
  { id: 'fin-104', number: 'FIN-2026-004', name: 'إيرادات عقد مركز البيانات', type: 'income', category: 'projects', projectId: 'prj-103', projectName: 'مركز البيانات الجديد', clientId: 'client-103', clientName: 'مؤسسة الرؤى', amount: 540000, date: '2026-08-18', status: 'completed', paymentMethod: 'تحويل بنكي', employeeId: 'emp-103', employeeName: 'ليلى حسن', description: 'إيرادات المرحلة النهائية من العقد.', notes: 'تم إيداع المبلغ.', activity: [{ id: 'fin-act-105', title: 'تم تسجيل الإيراد', date: '2026-08-18' }, { id: 'fin-act-106', title: 'تم استلام الدفعة', date: '2026-08-19' }] },
  { id: 'fin-105', number: 'FIN-2026-005', name: 'رواتب شهر أغسطس', type: 'salary', category: 'salaries', amount: 74000, date: '2026-08-27', status: 'overdue', paymentMethod: 'تحويل بنكي', employeeId: 'emp-103', employeeName: 'ليلى حسن', description: 'صرف رواتب فريق العمل عن شهر أغسطس.', notes: 'تتطلب اعتماد الإدارة المالية.', activity: [{ id: 'fin-act-107', title: 'تم إنشاء عملية الرواتب', date: '2026-08-27' }] },
  { id: 'fin-106', number: 'FIN-2026-006', name: 'رسوم صيانة المعدات', type: 'expense', category: 'maintenance', projectId: 'prj-104', projectName: 'تحديث المراكز الميدانية', amount: 28500, date: '2026-08-15', status: 'completed', paymentMethod: 'بطاقة بنكية', employeeId: 'emp-104', employeeName: 'يوسف سالم', description: 'صيانة دورية لمعدات الموقع.', notes: 'أغلقت المطالبة بعد إنجاز العمل.', activity: [{ id: 'fin-act-108', title: 'تم تسجيل المصروف', date: '2026-08-15' }] },
];
