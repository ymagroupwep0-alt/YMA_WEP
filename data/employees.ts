export type EmployeeStatus = 'active' | 'inactive' | 'on_leave';

export type Employee = {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hireDate: string;
  salary: number;
  status: EmployeeStatus;
  imageUrl?: string;
  notes: string;
  projects: {
    name: string;
    status: string;
    dueDate: string;
  }[];
  reports: {
    title: string;
    date: string;
    type: string;
  }[];
  warehouseLogs: {
    item: string;
    action: string;
    date: string;
  }[];
  attendance: {
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'حاضر' | 'غائب' | 'إجازة';
  }[];
};

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  on_leave: 'في إجازة',
};

export const employeeStatusOptions: EmployeeStatus[] = ['active', 'inactive', 'on_leave'];

export const mockEmployees: Employee[] = [
  {
    id: 'emp-101',
    code: 'EMP-101',
    fullName: 'سارة أحمد',
    email: 'sara.ahmed@company.com',
    phone: '+201001234567',
    role: 'مديرة مشاريع',
    department: 'المشروعات',
    hireDate: '2024-01-15',
    salary: 18500,
    status: 'active',
    imageUrl: '',
    notes: 'تدير المشاريع الكبرى وتابعة للتنفيذ والمتابعة اليومية مع العملاء.',
    projects: [
      { name: 'مبنى النخبة التجاري', status: 'قيد التنفيذ', dueDate: '2026-10-15' },
      { name: 'تحديث المراكز الميدانية', status: 'قيد التنفيذ', dueDate: '2026-11-05' },
    ],
    reports: [
      { title: 'تقرير تقدم شهر أغسطس', date: '2026-08-05', type: 'تقرير تنفيذ' },
      { title: 'ملف مراجعة السلامة', date: '2026-08-18', type: 'تقرير سلامة' },
    ],
    warehouseLogs: [
      { item: 'مواد بناء', action: 'تم صرف كميات للمشروع', date: '2026-08-12' },
      { item: 'أسلاك كهربائية', action: 'تمت مراجعة الكميات', date: '2026-08-19' },
    ],
    attendance: [
      { date: '2026-08-31', checkIn: '08:10', checkOut: '17:20', status: 'حاضر' },
      { date: '2026-08-30', checkIn: '08:15', checkOut: '17:00', status: 'حاضر' },
      { date: '2026-08-29', checkIn: '08:30', checkOut: '17:15', status: 'حاضر' },
    ],
  },
  {
    id: 'emp-102',
    code: 'EMP-102',
    fullName: 'محمود علي',
    email: 'mahmoud.ali@company.com',
    phone: '+201002233445',
    role: 'مهندس تصنيع',
    department: 'التصنيع',
    hireDate: '2023-04-10',
    salary: 17000,
    status: 'on_leave',
    imageUrl: '',
    notes: 'مسؤول عن العمليات الفنية ومتابعة الجودة في خطوط التصنيع.',
    projects: [
      { name: 'منشأة الخليج للمنتجات', status: 'متأخر', dueDate: '2026-09-01' },
      { name: 'مركز البيانات الجديد', status: 'مكتمل', dueDate: '2026-08-20' },
    ],
    reports: [
      { title: 'تقرير جودة الإنتاج', date: '2026-08-14', type: 'تقرير جودة' },
    ],
    warehouseLogs: [
      { item: 'مكونات معدنية', action: 'تم اعتماد صرف المواد', date: '2026-08-16' },
    ],
    attendance: [
      { date: '2026-08-31', checkIn: '08:00', checkOut: '16:40', status: 'إجازة' },
      { date: '2026-08-30', checkIn: '08:05', checkOut: '17:10', status: 'حاضر' },
    ],
  },
  {
    id: 'emp-103',
    code: 'EMP-103',
    fullName: 'ليلى حسن',
    email: 'leila.hassan@company.com',
    phone: '+201003344556',
    role: 'محاسبة',
    department: 'الماليات',
    hireDate: '2022-09-20',
    salary: 16000,
    status: 'active',
    imageUrl: '',
    notes: 'تتولى متابعة التقارير المالية ومراجعة الحسابات اليومية.',
    projects: [
      { name: 'سجل التكاليف الشهرية', status: 'مكتمل', dueDate: '2026-08-30' },
    ],
    reports: [
      { title: 'تقرير الإيرادات', date: '2026-08-22', type: 'تقارير مالية' },
      { title: 'تقرير المصروفات', date: '2026-08-25', type: 'تقارير مالية' },
    ],
    warehouseLogs: [
      { item: 'مستندات مخزنية', action: 'تمت مراجعة التسليم', date: '2026-08-18' },
    ],
    attendance: [
      { date: '2026-08-31', checkIn: '08:20', checkOut: '17:00', status: 'حاضر' },
      { date: '2026-08-30', checkIn: '08:25', checkOut: '16:50', status: 'حاضر' },
      { date: '2026-08-29', checkIn: '08:35', checkOut: '17:05', status: 'حاضر' },
    ],
  },
  {
    id: 'emp-104',
    code: 'EMP-104',
    fullName: 'يوسف سالم',
    email: 'yousef.salem@company.com',
    phone: '+201005566778',
    role: 'مهندس موقع',
    department: 'المشروعات',
    hireDate: '2023-11-05',
    salary: 17500,
    status: 'inactive',
    imageUrl: '',
    notes: 'يُشرف على التنفيذ في الموقع ويقدم تقارير يومية عن التقدم.',
    projects: [
      { name: 'مبنى النخبة التجاري', status: 'قيد التنفيذ', dueDate: '2026-10-15' },
    ],
    reports: [
      { title: 'تقرير متابعة الموقع', date: '2026-08-21', type: 'تقرير تنفيذ' },
    ],
    warehouseLogs: [
      { item: 'إكساء ومعدات', action: 'تمت متابعة استلام الأجهزة', date: '2026-08-11' },
    ],
    attendance: [
      { date: '2026-08-31', checkIn: '00:00', checkOut: '00:00', status: 'غائب' },
      { date: '2026-08-30', checkIn: '08:10', checkOut: '16:55', status: 'حاضر' },
    ],
  },
];
