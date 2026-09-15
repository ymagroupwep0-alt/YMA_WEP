export type ManufacturingStatus = 'new' | 'in_progress' | 'paused' | 'completed' | 'delayed';

export type ManufacturingMaterial = {
  id: string;
  productId?: string;
  code?: string;
  name?: string;
  requiredQuantity: number;
  usedQuantity: number;
  unit: string;
  cost: number;
  availability?: 'متوفر' | 'جزئي' | 'غير متوفر';
  productCode?: string;
  productName?: string;
  product?: {
    id?: string;
    code?: string;
    name?: string;
    currentQuantity?: number;
    minimumQuantity?: number;
    unit?: string;
  } | null;
};

export type ManufacturingStage = {
  id: string;
  name: string;
  status: 'لم تبدأ' | 'قيد التنفيذ' | 'مكتملة';
  owner?: string;
  ownerNameSnapshot?: string;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  progress?: number;
  sortOrder?: number;
};

export type ManufacturingActivity = {
  id: string;
  title: string;
  date: string;
  note?: string;
};

export type ManufacturingProcess = {
  id: string;
  code: string;
  name: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  description: string;
  startDate: string;
  expectedEndDate: string;
  status: ManufacturingStatus;
  progress: number;
  cost: number;
  materialCost?: number;
  materials: ManufacturingMaterial[];
  stages: ManufacturingStage[];
  activity: ManufacturingActivity[];
};

export const manufacturingStatusOptions: ManufacturingStatus[] = ['new', 'in_progress', 'paused', 'completed', 'delayed'];

export const manufacturingStatusLabels: Record<ManufacturingStatus, string> = {
  new: 'جديد',
  in_progress: 'قيد التنفيذ',
  paused: 'متوقف',
  completed: 'مكتمل',
  delayed: 'متأخر',
};

export const manufacturingStageStatusOptions: ManufacturingStage['status'][] = ['لم تبدأ', 'قيد التنفيذ', 'مكتملة'];

export const mockManufacturingProcesses: ManufacturingProcess[] = [
  {
    id: 'mfg-101', code: 'MFG-2026-001', name: 'تصنيع وحدات الواجهات المعدنية', projectId: 'prj-101', projectName: 'مبنى النخبة التجاري', employeeId: 'emp-101', employeeName: 'سارة أحمد', description: 'تصنيع وتجهيز وحدات الواجهات المعدنية حسب المخططات المعتمدة.', startDate: '2026-08-01', expectedEndDate: '2026-09-20', status: 'in_progress', progress: 64, cost: 185000,
    materials: [
      { id: 'mat-101', code: 'MAT-AL-01', name: 'ألواح ألمنيوم', requiredQuantity: 420, usedQuantity: 280, unit: 'متر مربع', cost: 96000, availability: 'متوفر' },
      { id: 'mat-102', code: 'MAT-ST-02', name: 'قطاعات فولاذية', requiredQuantity: 180, usedQuantity: 120, unit: 'قطعة', cost: 54000, availability: 'جزئي' },
    ],
    stages: [
      { id: 'stage-101', name: 'تجهيز المواد', status: 'مكتملة', owner: 'سارة أحمد', startDate: '2026-08-01', endDate: '2026-08-05' },
      { id: 'stage-102', name: 'بدء التصنيع', status: 'مكتملة', owner: 'محمود علي', startDate: '2026-08-06', endDate: '2026-08-18' },
      { id: 'stage-103', name: 'التجميع', status: 'قيد التنفيذ', owner: 'يوسف سالم', startDate: '2026-08-19', endDate: '2026-09-08' },
      { id: 'stage-104', name: 'الاختبار', status: 'لم تبدأ', owner: 'محمود علي', startDate: '2026-09-09', endDate: '2026-09-14' },
      { id: 'stage-105', name: 'الفحص النهائي والتسليم', status: 'لم تبدأ', owner: 'سارة أحمد', startDate: '2026-09-15', endDate: '2026-09-20' },
    ],
    activity: [
      { id: 'mfg-act-101', title: 'تم إنشاء عملية التصنيع', date: '2026-08-01' },
      { id: 'mfg-act-102', title: 'تم إضافة المواد', date: '2026-08-02', note: 'تم تجهيز قائمة المواد الأولية.' },
      { id: 'mfg-act-103', title: 'بدأت مرحلة التجميع', date: '2026-08-19' },
      { id: 'mfg-act-104', title: 'تم تحديث نسبة الإنجاز', date: '2026-08-28', note: 'تم تحديث الإنجاز إلى 64%.' },
    ],
  },
  {
    id: 'mfg-102', code: 'MFG-2026-002', name: 'تجميع خطوط الإنتاج', projectId: 'prj-102', projectName: 'منشأة الخليج للمنتجات', employeeId: 'emp-102', employeeName: 'محمود علي', description: 'تجميع مكونات خط الإنتاج وإجراء اختبارات التشغيل الأولية.', startDate: '2026-07-12', expectedEndDate: '2026-08-30', status: 'delayed', progress: 48, cost: 320000,
    materials: [{ id: 'mat-103', code: 'MAT-ME-04', name: 'مكونات ميكانيكية', requiredQuantity: 80, usedQuantity: 52, unit: 'طقم', cost: 210000, availability: 'جزئي' }, { id: 'mat-104', code: 'MAT-EL-05', name: 'لوحات كهربائية', requiredQuantity: 16, usedQuantity: 8, unit: 'لوحة', cost: 78000, availability: 'غير متوفر' }],
    stages: [{ id: 'stage-106', name: 'تجهيز المواد', status: 'مكتملة', owner: 'محمود علي', startDate: '2026-07-12', endDate: '2026-07-18' }, { id: 'stage-107', name: 'بدء التصنيع', status: 'قيد التنفيذ', owner: 'محمود علي', startDate: '2026-07-19', endDate: '2026-08-30' }, { id: 'stage-108', name: 'الاختبار', status: 'لم تبدأ', owner: 'نادية حسن', startDate: '2026-08-31', endDate: '2026-09-05' }],
    activity: [{ id: 'mfg-act-105', title: 'تم إنشاء عملية التصنيع', date: '2026-07-12' }, { id: 'mfg-act-106', title: 'تم تحديث نسبة الإنجاز', date: '2026-08-25', note: 'تأخر التوريد أثر على الخطة.' }],
  },
  {
    id: 'mfg-103', code: 'MFG-2026-003', name: 'اختبار أنظمة مركز البيانات', projectId: 'prj-103', projectName: 'مركز البيانات الجديد', employeeId: 'emp-103', employeeName: 'ليلى حسن', description: 'اختبار الأنظمة وتجهيز محضر الاستلام النهائي.', startDate: '2026-07-01', expectedEndDate: '2026-08-20', status: 'completed', progress: 100, cost: 145000, materials: [{ id: 'mat-105', code: 'MAT-TS-07', name: 'أجهزة اختبار', requiredQuantity: 12, usedQuantity: 12, unit: 'جهاز', cost: 85000, availability: 'متوفر' }], stages: [{ id: 'stage-109', name: 'الاختبار', status: 'مكتملة', owner: 'ليلى حسن', startDate: '2026-07-20', endDate: '2026-08-10' }, { id: 'stage-110', name: 'الفحص النهائي والتسليم', status: 'مكتملة', owner: 'ليلى حسن', startDate: '2026-08-11', endDate: '2026-08-20' }], activity: [{ id: 'mfg-act-107', title: 'تم إنشاء عملية التصنيع', date: '2026-07-01' }, { id: 'mfg-act-108', title: 'اكتملت العملية', date: '2026-08-20' }],
  },
  {
    id: 'mfg-104', code: 'MFG-2026-004', name: 'إنتاج وحدات التخزين', projectId: 'prj-104', projectName: 'تحديث المراكز الميدانية', employeeId: 'emp-104', employeeName: 'يوسف سالم', description: 'إنتاج وحدات تخزين ميدانية للاستخدام في المراكز الجديدة.', startDate: '2026-08-20', expectedEndDate: '2026-10-05', status: 'new', progress: 12, cost: 98000, materials: [{ id: 'mat-106', code: 'MAT-WD-08', name: 'ألواح خشبية معالجة', requiredQuantity: 140, usedQuantity: 12, unit: 'لوح', cost: 42000, availability: 'متوفر' }], stages: [{ id: 'stage-111', name: 'تجهيز المواد', status: 'قيد التنفيذ', owner: 'يوسف سالم', startDate: '2026-08-20', endDate: '2026-08-28' }, { id: 'stage-112', name: 'بدء التصنيع', status: 'لم تبدأ', owner: 'يوسف سالم', startDate: '2026-08-29', endDate: '2026-09-20' }], activity: [{ id: 'mfg-act-109', title: 'تم إنشاء عملية التصنيع', date: '2026-08-20' }, { id: 'mfg-act-110', title: 'تم إضافة المواد', date: '2026-08-20' }],
  },
];
