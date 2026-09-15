export type CompanyOverview = {
  name: string;
  summary: string;
  industry: string;
  foundedYear: number;
  headquarters: string;
  employeeCount: number;
};

export type CompanyValueItem = {
  id: string;
  title: string;
  description: string;
};

export type GalleryCategory = 'company' | 'projects' | 'team' | 'events';

export type CompanyGalleryItem = {
  id: string;
  category: GalleryCategory;
  title: string;
  description: string;
  imageUrl: string;
};

export type GoalStatus = 'planned' | 'in_progress' | 'completed';

export type CompanyGoal = {
  id: string;
  title: string;
  description: string;
  period: string;
  status: GoalStatus;
};

export type TimelineEventType = 'founding' | 'expansion' | 'project' | 'achievement' | 'office';

export type CompanyTimelineEvent = {
  id: string;
  year: string;
  title: string;
  description: string;
  type: TimelineEventType;
};

export type CompanyOrganizationalRole = {
  id: string;
  name: string;
  title: string;
  department: string;
  imageUrl?: string;
};

export type CompanyDocumentType = 'company_profile' | 'certificates' | 'licenses' | 'other';
export type CompanyDocumentStatus = 'active' | 'draft' | 'expired';

export type CompanyDocument = {
  id: string;
  name: string;
  type: CompanyDocumentType;
  addedAt: string;
  description: string;
  status: CompanyDocumentStatus;
  fileUrl?: string;
};

export type CompanyPermissionConfig = {
  viewCompanyInfo: boolean;
  editCompanyInfo: boolean;
  manageGallery: boolean;
  manageDocuments: boolean;
};

export const companyOverviewMock: CompanyOverview = {
  name: 'YMA Group',
  summary: 'نحن شركة مصرية رائدة في مجال التطوير والاستشارات والإنشاءات، نعمل على تصميم حلول عملية تواكب متطلبات السوق المحلي والعالمي.',
  industry: 'التطوير العقاري والتصنيع والاستشارات',
  foundedYear: 2014,
  headquarters: 'القاهرة، جمهورية مصر العربية',
  employeeCount: 180,
};

export const companyVisionMissionMock = {
  vision:
    'أن نكون الشركة المفضلة في السوق العربي من خلال تقديم حلول فعالة وقيمة مستدامة ترفع من جودة الحياة وتدعم النمو الاقتصادي.',
  mission:
    'تقديم خدمات مميزة ومنتجات عالية الجودة عبر فرق متخصصة، مع الالتزام بالتميز والابتكار والمسؤولية المجتمعية.',
  values: [
    { id: 'v-1', title: 'التميز', description: 'نسعى لتحقيق أعلى مستويات الجودة في كل ما نقوم به.' },
    { id: 'v-2', title: 'الابتكار', description: 'نرحب بالأفكار الجديدة ونطور حلولًا عملية مستدامة.' },
    { id: 'v-3', title: 'المسؤولية', description: 'نلتزم بالشفافية والمساءلة تجاه العملاء والموظفين والمجتمع.' },
  ],
};

export const companyGalleryMock: CompanyGalleryItem[] = [
  {
    id: 'g-1',
    category: 'company',
    title: 'المقر الرئيسي',
    description: 'مبنى الشركة الرئيسي في القاهرة',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'g-2',
    category: 'projects',
    title: 'مشروع النورس',
    description: 'مشروع سكني متكامل في المرحلة النهائية',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'g-3',
    category: 'team',
    title: 'فريق العمل',
    description: 'الطاقم الإداري والتشغيلي',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'g-4',
    category: 'events',
    title: 'فعاليات الشركة',
    description: 'المناسبات والفعاليات السنوية',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
];

export const companyGoalsMock: CompanyGoal[] = [
  {
    id: 'goal-1',
    title: 'توسيع portfolio المشاريع',
    description: 'زيادة عدد المشاريع الجديدة بنسبة 20% خلال العام المقبل عبر التوسع في القطاعات العقارية والتنموية.',
    period: '2026 - 2027',
    status: 'in_progress',
  },
  {
    id: 'goal-2',
    title: 'تحسين كفاءة التشغيل',
    description: 'اعتماد حلول رقمية لزيادة كفاءة الموارد التشغيلية ومتابعة الأداء في الوقت الفعلي.',
    period: '2026',
    status: 'planned',
  },
  {
    id: 'goal-3',
    title: 'تطوير فريق العمل',
    description: 'اكتساب فريق الشركة مهارات جديدة ومواكبة للتطور التكنولوجي واستراتيجية التوسع.',
    period: '2025 - 2026',
    status: 'completed',
  },
];

export const companyTimelineMock: CompanyTimelineEvent[] = [
  {
    id: 'time-1',
    year: '2014',
    title: 'تأسيس الشركة',
    description: 'بدأت الشركة بخطة استثمارية بعيدة المدى في مجال التطوير والاستشارات.',
    type: 'founding',
  },
  {
    id: 'time-2',
    year: '2017',
    title: 'افتتاح المقر الرئيسي',
    description: 'تم افتتاح المقر الإداري الرئيسي في القاهرة لتوسيع خدمات الشركة.',
    type: 'office',
  },
  {
    id: 'time-3',
    year: '2020',
    title: 'تنفيذ مشروع مهم',
    description: 'انطلاق مشروع متعدد الأبعاد ساهم في تعزيز حضور الشركة في السوق.',
    type: 'project',
  },
  {
    id: 'time-4',
    year: '2023',
    title: 'توسع الشركة',
    description: 'تم توسيع نطاق الأعمال إلى قطاعات جديدة مع زيادة عدد الموظفين.',
    type: 'expansion',
  },
  {
    id: 'time-5',
    year: '2025',
    title: 'الحصول على شهادة الجودة',
    description: 'نجحت الشركة في الحصول على شهادة معتمدة لمستوى الجودة والالتزام.',
    type: 'achievement',
  },
];

export const companyStructureMock: CompanyOrganizationalRole[] = [
  { id: 'org-1', name: 'سارة أحمد', title: 'المدير التنفيذي', department: 'الإدارة العليا', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
  { id: 'org-2', name: 'خالد السالم', title: 'مدير المشاريع', department: 'المشاريع', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
  { id: 'org-3', name: 'مها ناصر', title: 'مديرة الموارد البشرية', department: 'الموارد البشرية', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80' },
  { id: 'org-4', name: 'عمر خالد', title: 'مدير العمليات', department: 'العمليات', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
  { id: 'org-5', name: 'فريق التنفيذ', title: 'الموظفون', department: 'الفرق التشغيلية', imageUrl: '' },
];

export const companyDocumentsMock: CompanyDocument[] = [
  {
    id: 'doc-1',
    name: 'ملف الشركة التعريفي',
    type: 'company_profile',
    addedAt: '2026-08-01',
    description: 'ملف شامل يوضح نبذة الشركة، الأنشطة، والخدمات.',
    status: 'active',
    fileUrl: 'https://example.com/company-profile.pdf',
  },
  {
    id: 'doc-2',
    name: 'شهادة الجودة ISO',
    type: 'certificates',
    addedAt: '2025-12-10',
    description: 'شهادة الجودة المعتمدة للشركة.',
    status: 'active',
    fileUrl: 'https://example.com/iso-certificate.pdf',
  },
  {
    id: 'doc-3',
    name: 'رخصة التشغيل',
    type: 'licenses',
    addedAt: '2025-07-14',
    description: 'رخصة التشغيل الرسمية الصادرة من الجهات المختصة.',
    status: 'active',
    fileUrl: 'https://example.com/license.pdf',
  },
];

export const companyPermissionsMock: CompanyPermissionConfig = {
  viewCompanyInfo: true,
  editCompanyInfo: true,
  manageGallery: true,
  manageDocuments: true,
};

export const companyDocumentTypeLabels: Record<CompanyDocumentType, string> = {
  company_profile: 'ملف الشركة',
  certificates: 'الشهادات',
  licenses: 'التراخيص',
  other: 'أخرى',
};

export const companyDocumentStatusLabels: Record<CompanyDocumentStatus, string> = {
  active: 'فعّال',
  draft: 'مسودة',
  expired: 'منتهي',
};

export const companyGoalStatusLabels: Record<GoalStatus, string> = {
  planned: 'مخطط',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
};

export const companyTimelineTypeLabels: Record<TimelineEventType, string> = {
  founding: 'تأسيس',
  expansion: 'توسع',
  project: 'مشروع',
  achievement: 'إنجاز',
  office: 'مقر',
};

export const companyGalleryCategoryLabels: Record<GalleryCategory, string> = {
  company: 'الشركة والمقر',
  projects: 'المشاريع',
  team: 'فريق العمل',
  events: 'الفعاليات',
};
