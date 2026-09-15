export type ProjectStatus = 'new' | 'in_progress' | 'paused' | 'completed' | 'delayed';

export type Project = {
  id: string;
  code: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  budget: number;
  progress: number;
  manager: string;
  team: string[];
  reports: { title: string; date: string; owner: string }[];
  files: { name: string; type: string; size: string }[];
  timeline: { title: string; date: string; note: string }[];
  financialSummary?: { revenue: number; expenses: number; profit: number };
};

export const statusOptions: ProjectStatus[] = ['new', 'in_progress', 'paused', 'completed', 'delayed'];

export const statusLabels: Record<ProjectStatus, string> = {
  new: 'جديد',
  in_progress: 'قيد التنفيذ',
  paused: 'متوقف',
  completed: 'مكتمل',
  delayed: 'متأخر',
};

export const mockProjects: Project[] = [
  {
    id: 'prj-101',
    code: 'PRJ-101',
    name: 'مبنى النخبة التجاري',
    client: 'شركة النخبة',
    description: 'تطوير مشروع تجاري متكامل مع الأنظمة الداخلية وتركيب المرافق.',
    status: 'in_progress',
    startDate: '2026-07-02',
    dueDate: '2026-10-15',
    budget: 780000,
    progress: 72,
    manager: 'أحمد محمد',
    team: ['سارة أحمد', 'يوسف سالم', 'ليلى راضي'],
    reports: [
      { title: 'تقرير تقدم شهر يوليو', date: '2026-07-30', owner: 'سارة أحمد' },
      { title: 'تقرير السلامة', date: '2026-08-10', owner: 'يوسف سالم' },
    ],
    files: [
      { name: 'خطة المشروع.pdf', type: 'PDF', size: '2.4 MB' },
      { name: 'مخطط الموقع.png', type: 'Image', size: '1.1 MB' },
    ],
    timeline: [
      { title: 'توقيع العقد', date: '2026-07-02', note: 'تمت الموافقة على المشروع الأولية.' },
      { title: 'بدء التنفيذ', date: '2026-07-14', note: 'بدأت أعمال الأرضيات والهيكل.' },
      { title: 'مرحلة التشييد', date: '2026-08-25', note: 'اكتملت مراحل الأساسات والتجهيزات.' },
    ],
  },
  {
    id: 'prj-102',
    code: 'PRJ-102',
    name: 'منشأة الخليج للمنتجات',
    client: 'مجموعة الخليج',
    description: 'مشروع تصنيع وتجهيز منشأة إنتاج جديدة مع تحديث المرافق.',
    status: 'delayed',
    startDate: '2026-06-10',
    dueDate: '2026-09-01',
    budget: 920000,
    progress: 48,
    manager: 'محمود علي',
    team: ['نادية حسن', 'عبد الله فهد', 'تركي عمر'],
    reports: [
      { title: 'تقرير تأخر المورد', date: '2026-08-12', owner: 'نادية حسن' },
    ],
    files: [
      { name: 'مواصفات المصنع.pdf', type: 'PDF', size: '3.2 MB' },
    ],
    timeline: [
      { title: 'تجهيز المخطط', date: '2026-06-10', note: 'تم تجهيز التصاميم الأولية.' },
      { title: 'مراجعة الموردين', date: '2026-07-18', note: 'تمت مراجعة بعض الموردين.' },
      { title: 'تأخير في التوريد', date: '2026-08-11', note: 'تعطل تجهيز بعض المعدات.' },
    ],
  },
  {
    id: 'prj-103',
    code: 'PRJ-103',
    name: 'مركز البيانات الجديد',
    client: 'مؤسسة الرؤى',
    description: 'تجهيز مركز بيانات حديث بنظام إدارة ذكي ومراقبة كاملة.',
    status: 'completed',
    startDate: '2026-04-01',
    dueDate: '2026-08-20',
    budget: 650000,
    progress: 100,
    manager: 'سلمان محمد',
    team: ['يزن خالد', 'إيمان هلال'],
    reports: [
      { title: 'تقرير الختام', date: '2026-08-19', owner: 'سلمان محمد' },
    ],
    files: [
      { name: 'دليل التشغيل.pdf', type: 'PDF', size: '1.6 MB' },
      { name: 'تقرير الاختبار.xlsx', type: 'Excel', size: '910 KB' },
    ],
    timeline: [
      { title: 'بداية التنفيذ', date: '2026-04-01', note: 'بدأ التنفيذ في الموقع.' },
      { title: 'تثبيت الأنظمة', date: '2026-07-22', note: 'تم تركيب الشبكات والأجهزة.' },
      { title: 'الاستلام النهائي', date: '2026-08-20', note: 'تم تسليم المشروع بنجاح.' },
    ],
  },
  {
    id: 'prj-104',
    code: 'PRJ-104',
    name: 'تحديث المراكز الميدانية',
    client: 'دار الإثمار',
    description: 'تحديث المراكز الميدانية وتوطين الأنظمة التشغيلية.',
    status: 'new',
    startDate: '2026-08-15',
    dueDate: '2026-11-05',
    budget: 430000,
    progress: 18,
    manager: 'ليلى حسن',
    team: ['أحمد فايز', 'رنا جابر'],
    reports: [
      { title: 'خطة التنفيذ الأولية', date: '2026-08-15', owner: 'ليلى حسن' },
    ],
    files: [
      { name: 'خطة التحديث.docx', type: 'Word', size: '540 KB' },
    ],
    timeline: [
      { title: 'بدء المشروع', date: '2026-08-15', note: 'تجهيز الملف والتوثيق.' },
    ],
  },
];
