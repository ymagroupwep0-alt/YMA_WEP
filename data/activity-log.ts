export type ActivityModule = 'projects' | 'reports' | 'employees' | 'warehouse' | 'manufacturing' | 'finance' | 'settings' | 'company' | 'clients-suppliers' | 'supplies' | 'notifications';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'approved'
  | 'status_changed'
  | 'added'
  | 'removed'
  | 'moved'
  | 'updated_quantity'
  | 'changed_permissions'
  | 'user_login';

export type ActivityLogEntry = {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: ActivityAction;
  module: ActivityModule;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  createdAt: string;
  href?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export const activityModuleLabels: Record<ActivityModule, string> = {
  projects: 'المشاريع',
  reports: 'التقارير',
  employees: 'الموظفين',
  warehouse: 'المخزن',
  manufacturing: 'التصنيع',
  finance: 'الماليات',
  settings: 'الإعدادات',
  company: 'الشركة',
  'clients-suppliers': 'العملاء والموردون',
  supplies: 'التوريدات',
  notifications: 'الإشعارات',
};

export const activityActionLabels: Record<ActivityAction, string> = {
  created: 'إنشاء',
  updated: 'تعديل',
  deleted: 'حذف',
  approved: 'اعتماد',
  status_changed: 'تغيير الحالة',
  added: 'إضافة',
  removed: 'إزالة',
  moved: 'نقل',
  updated_quantity: 'تعديل الكمية',
  changed_permissions: 'تغيير الصلاحيات',
  user_login: 'تسجيل دخول',
};

export const activityLogs: ActivityLogEntry[] = [
  {
    id: 'log-101',
    userId: 'emp-101',
    userName: 'سارة أحمد',
    userRole: 'مديرة مشاريع',
    action: 'updated',
    module: 'projects',
    entityType: 'project',
    entityId: 'prj-101',
    title: 'تحديث بيانات مشروع',
    description: 'قامت سارة أحمد بتعديل بيانات مشروع مبنى النخبة التجاري وتحديث الخطة التشغيلية.',
    createdAt: '2026-09-01 14:30',
    href: '/dashboard/projects',
    metadata: { projectName: 'مبنى النخبة التجاري', priority: 'High' },
  },
  {
    id: 'log-102',
    userId: 'emp-103',
    userName: 'ليلى حسن',
    userRole: 'محاسبة',
    action: 'approved',
    module: 'reports',
    entityType: 'report',
    entityId: 'rep-201',
    title: 'اعتماد تقرير مالي',
    description: 'قام فريق الماليات باعتماد التقرير الشهري بعد مراجعة الإيرادات والمصروفات.',
    createdAt: '2026-09-01 12:15',
    href: '/dashboard/reports',
    metadata: { reportType: 'Monthly', status: 'Approved' },
  },
  {
    id: 'log-103',
    userId: 'emp-104',
    userName: 'يوسف سالم',
    userRole: 'مهندس موقع',
    action: 'created',
    module: 'employees',
    entityType: 'employee',
    entityId: 'emp-104',
    title: 'إضافة موظف جديد',
    description: 'تم تسجيل موظف جديد في قسم المشاريع وتحديث بيانات التواصل.',
    createdAt: '2026-08-31 16:45',
    href: '/dashboard/employees',
    metadata: { department: 'المشاريع' },
  },
  {
    id: 'log-104',
    userId: 'emp-102',
    userName: 'محمود علي',
    userRole: 'مهندس تصنيع',
    action: 'moved',
    module: 'warehouse',
    entityType: 'inventory_movement',
    entityId: 'wh-204',
    title: 'حركة مخزون',
    description: 'تم تحويل كميات من المواد الخام إلى منطقة الإنتاج وفق الخطة التشغيلية.',
    createdAt: '2026-08-30 11:05',
    href: '/dashboard/warehouse',
    metadata: { item: 'مواد خام', quantity: 120 },
  },
  {
    id: 'log-105',
    userId: 'emp-102',
    userName: 'محمود علي',
    userRole: 'مهندس تصنيع',
    action: 'created',
    module: 'manufacturing',
    entityType: 'manufacturing_order',
    entityId: 'mfg-304',
    title: 'إنشاء عملية تصنيع',
    description: 'تم إنشاء عملية تصنيع جديدة في منشأة الخليج للمنتجات.',
    createdAt: '2026-08-29 09:20',
    href: '/dashboard/manufacturing',
    metadata: { line: 'Line A', status: 'In Progress' },
  },
  {
    id: 'log-106',
    userId: 'emp-103',
    userName: 'ليلى حسن',
    userRole: 'محاسبة',
    action: 'added',
    module: 'finance',
    entityType: 'finance_transaction',
    entityId: 'fin-101',
    title: 'إضافة عملية مالية',
    description: 'تم تسجيل دفعة عميل جديدة في نظام المالية وتحويلها إلى مراجعة الإدارة.',
    createdAt: '2026-08-28 15:10',
    href: '/dashboard/finance',
    metadata: { amount: 180000, currency: 'EGP' },
  },
  {
    id: 'log-107',
    userId: 'admin',
    userName: 'مدير النظام',
    userRole: 'Administrator',
    action: 'changed_permissions',
    module: 'settings',
    entityType: 'user',
    entityId: 'user-102',
    title: 'تحديث صلاحيات المستخدم',
    description: 'تم تعديل صلاحيات مستخدم إدارة المشاريع ليشمل إمكانية الاعتماد على التقارير.',
    createdAt: '2026-08-27 13:40',
    href: '/dashboard/settings',
    metadata: { user: 'سارة أحمد', permission: 'reports' },
  },
  {
    id: 'log-108',
    userId: 'emp-101',
    userName: 'سارة أحمد',
    userRole: 'مديرة مشاريع',
    action: 'updated',
    module: 'company',
    entityType: 'company_profile',
    entityId: 'company-1',
    title: 'تعديل معلومات الشركة',
    description: 'تم تحديث نبذة الشركة ومعلومات العنوان ومجال العمل حسب آخر التطويرات.',
    createdAt: '2026-08-25 10:25',
    href: '/dashboard/company',
    metadata: { section: 'overview' },
  },
  {
    id: 'log-109',
    userId: 'emp-101',
    userName: 'سارة أحمد',
    userRole: 'مديرة مشاريع',
    action: 'status_changed',
    module: 'projects',
    entityType: 'project',
    entityId: 'prj-102',
    title: 'تغيير حالة المشروع',
    description: 'تم تغيير حالة المشروع إلى متأخر بسبب تأخير توريد المعدات الأساسية.',
    createdAt: '2026-08-24 09:05',
    href: '/dashboard/projects',
    metadata: { from: 'in_progress', to: 'delayed' },
  },
  {
    id: 'log-110',
    userId: 'emp-103',
    userName: 'ليلى حسن',
    userRole: 'محاسبة',
    action: 'updated_quantity',
    module: 'warehouse',
    entityType: 'product',
    entityId: 'prod-401',
    title: 'تعديل كمية منتج',
    description: 'تم تعديل الكمية المتاحة لمنتج الحديد الأنبوبي بعد استلام شحنة جديدة.',
    createdAt: '2026-08-23 17:00',
    href: '/dashboard/warehouse',
    metadata: { item: 'حديد أنبوبي', quantity: 50 },
  },
];

export function createActivity(entry: Partial<ActivityLogEntry> & Pick<ActivityLogEntry, 'userId' | 'userName' | 'userRole' | 'action' | 'module' | 'entityType' | 'entityId' | 'title' | 'description'>): ActivityLogEntry {
  return {
    id: entry.id ?? `log-${Date.now()}`,
    userId: entry.userId,
    userName: entry.userName,
    userRole: entry.userRole,
    action: entry.action,
    module: entry.module,
    entityType: entry.entityType,
    entityId: entry.entityId,
    title: entry.title,
    description: entry.description,
    createdAt: entry.createdAt ?? new Date().toISOString().slice(0, 16).replace('T', ' '),
    href: entry.href,
    metadata: entry.metadata,
  };
}
