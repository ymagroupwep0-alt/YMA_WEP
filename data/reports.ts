export type ReportStatus = 'new' | 'in_review' | 'approved' | 'rejected';

export type ReportType = 'project' | 'manufacturing' | 'finance' | 'warehouse' | 'employees' | 'general';

export type ReportAttachment = {
  id: string;
  name: string;
  type: string;
  size: string;
  url?: string;
  isImage?: boolean;
  mimeType?: string;
  fileSize?: number;
};

export type ReportActivity = {
  id: string;
  title: string;
  date: string;
  note?: string;
};

export type Report = {
  id: string;
  code: string;
  title: string;
  type: ReportType;
  projectId?: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  description: string;
  content: string;
  status: ReportStatus;
  createdAt: string;
  attachments: ReportAttachment[];
  activity: ReportActivity[];
};

export const reportStatusOptions: ReportStatus[] = ['new', 'in_review', 'approved', 'rejected'];

export const reportStatusLabels: Record<ReportStatus, string> = {
  new: 'جديد',
  in_review: 'قيد المراجعة',
  approved: 'معتمد',
  rejected: 'مرفوض',
};

export const reportTypeOptions: ReportType[] = ['project', 'manufacturing', 'finance', 'warehouse', 'employees', 'general'];

export const reportTypeLabels: Record<ReportType, string> = {
  project: 'تقرير مشروع',
  manufacturing: 'تقرير تصنيع',
  finance: 'تقرير مالي',
  warehouse: 'تقرير مخزن',
  employees: 'تقرير موظفين',
  general: 'تقرير عام',
};

export const mockReports: Report[] = [
  {
    id: 'rpt-101',
    code: 'RPT-2026-001',
    title: 'تقرير تقدم أعمال مبنى النخبة',
    type: 'project',
    projectId: 'prj-101',
    projectName: 'مبنى النخبة التجاري',
    employeeId: 'emp-101',
    employeeName: 'سارة أحمد',
    description: 'ملخص مرحلي لنسبة الإنجاز والأعمال المنفذة خلال الشهر.',
    content: 'تم إنجاز أعمال الهيكل والأرضيات وفق الخطة المعتمدة، وتبلغ نسبة الإنجاز الحالية 72%. لا توجد عوائق مؤثرة على المسار الحرج.',
    status: 'approved',
    createdAt: '2026-08-28',
    attachments: [
      { id: 'file-101', name: 'صور-الموقع.png', type: 'PNG', size: '1.8 MB', isImage: true, url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80' },
      { id: 'file-102', name: 'ملخص-التقدم.pdf', type: 'PDF', size: '2.4 MB' },
    ],
    activity: [
      { id: 'activity-101', title: 'تم إنشاء التقرير', date: '2026-08-28', note: 'أنشأته سارة أحمد.' },
      { id: 'activity-102', title: 'تم رفع ملف', date: '2026-08-28', note: 'تمت إضافة صور الموقع وملخص التقدم.' },
      { id: 'activity-103', title: 'تم إرساله للمراجعة', date: '2026-08-29' },
      { id: 'activity-104', title: 'تم اعتماده', date: '2026-08-30', note: 'اعتمدته إدارة المشاريع.' },
    ],
  },
  {
    id: 'rpt-102',
    code: 'RPT-2026-002',
    title: 'مؤشرات جودة الإنتاج الأسبوعية',
    type: 'manufacturing',
    projectId: 'prj-102',
    projectName: 'منشأة الخليج للمنتجات',
    employeeId: 'emp-102',
    employeeName: 'محمود علي',
    description: 'مراجعة مؤشرات الجودة وملاحظات خط الإنتاج.',
    content: 'تحتاج دفعة المواد الأخيرة إلى مراجعة إضافية قبل اعتمادها. تم تسجيل ثلاث ملاحظات جودة وجارٍ التنسيق مع المورد.',
    status: 'in_review',
    createdAt: '2026-08-25',
    attachments: [{ id: 'file-103', name: 'مؤشرات-الجودة.xlsx', type: 'Excel', size: '910 KB' }],
    activity: [
      { id: 'activity-105', title: 'تم إنشاء التقرير', date: '2026-08-25' },
      { id: 'activity-106', title: 'تم إرساله للمراجعة', date: '2026-08-26' },
    ],
  },
  {
    id: 'rpt-103',
    code: 'RPT-2026-003',
    title: 'تقرير الإيرادات والمصروفات',
    type: 'finance',
    projectId: 'prj-103',
    projectName: 'مركز البيانات الجديد',
    employeeId: 'emp-103',
    employeeName: 'ليلى حسن',
    description: 'مقارنة الأداء المالي الفعلي بالميزانية المعتمدة.',
    content: 'بلغت المصروفات الفعلية 82% من الميزانية، مع تحقيق وفر في بند التجهيزات واستقرار في المصروفات التشغيلية.',
    status: 'new',
    createdAt: '2026-08-22',
    attachments: [],
    activity: [{ id: 'activity-107', title: 'تم إنشاء التقرير', date: '2026-08-22' }],
  },
  {
    id: 'rpt-104',
    code: 'RPT-2026-004',
    title: 'تقرير متابعة المخزون',
    type: 'warehouse',
    projectId: 'prj-104',
    projectName: 'تحديث المراكز الميدانية',
    employeeId: 'emp-104',
    employeeName: 'يوسف سالم',
    description: 'حصر المواد المصروفة والمتبقية للمشروع.',
    content: 'تمت مطابقة الكميات المصروفة مع أوامر العمل، وتحتاج بعض المواد إلى إعادة طلب قبل بدء المرحلة التالية.',
    status: 'rejected',
    createdAt: '2026-08-18',
    attachments: [{ id: 'file-104', name: 'جرد-المخزون.docx', type: 'Word', size: '540 KB' }],
    activity: [
      { id: 'activity-108', title: 'تم إنشاء التقرير', date: '2026-08-18' },
      { id: 'activity-109', title: 'تم رفض التقرير', date: '2026-08-20', note: 'يتطلب تحديث الكميات النهائية.' },
    ],
  },
];
