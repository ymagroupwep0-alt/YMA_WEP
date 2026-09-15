type SummaryCardTone = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'emerald';

export type DashboardAlertItem = { id: string; title: string; description: string; type: string; importance: string; href?: string };
export type DashboardNotification = { id: string; title: string; description: string; read: boolean; createdAt: string; href?: string };
export type DashboardActivityItem = { id: string; title: string; description: string; type: string; userName: string; createdAt: string; relatedModule: string; href?: string };

type SummaryCard = {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  tone: SummaryCardTone;
  href: string;
};

export const summaryCards: SummaryCard[] = [
  {
    title: 'إجمالي المشاريع',
    value: '128',
    change: '+12.4%',
    trend: 'up',
    tone: 'blue', href: '/dashboard/projects',
  },
  {
    title: 'عدد الموظفين',
    value: '86',
    change: '+4.8%',
    trend: 'up',
    tone: 'green', href: '/dashboard/employees',
  },
  {
    title: 'قيمة المخزون',
    value: 'EGP 1.24M',
    change: '+7.6%',
    trend: 'up',
    tone: 'amber', href: '/dashboard/warehouse',
  },
  {
    title: 'إجمالي الإيرادات',
    value: 'EGP 3.8M',
    change: '+18.1%',
    trend: 'up',
    tone: 'violet', href: '/dashboard/finance',
  },
  {
    title: 'إجمالي المصروفات',
    value: 'EGP 2.1M',
    change: '-3.2%',
    trend: 'down',
    tone: 'rose', href: '/dashboard/finance',
  },
  {
    title: 'صافي الأرباح',
    value: 'EGP 1.7M',
    change: '+15.9%',
    trend: 'up',
    tone: 'emerald', href: '/dashboard/profits',
  },
];

export const recentActivity = [
  { id: 'INV-1042', title: 'تمت الموافقة على طلب شراء مواد خام', time: 'منذ 20 دقيقة', type: 'info', user: 'سارة أحمد' },
  { id: 'PRJ-118', title: 'تم تحديث خطة مشروع بيتومين', time: 'منذ 1 ساعة', type: 'warning', user: 'محمود علي' },
  { id: 'FIN-441', title: 'تمت إضافة تقرير مالي جديد', time: 'منذ 3 ساعات', type: 'success', user: 'سلمان محمد' },
  { id: 'EMP-22', title: 'تم اعتماد شهادة تدريب للموظف', time: 'منذ 5 ساعات', type: 'info', user: 'ليلى حسن' },
];

export const alerts = [
  'تجاوزت تكلفة المشروع P-204 الحد المسموح به بنسبة 8%.',
  'أقل من 15 يومًا متبقية في تسليم شحنة المخزون رقم WH-07.',
  'تمت مراجعة تقرير الأرباح الشهري بنجاح.',
];

export const projectRows = [
  { name: 'مشروع النورس', status: 'قيد التنفيذ', progress: 72, due: '15/09/2026', manager: 'عبد الرحمن' },
  { name: 'مشروع الخليج', status: 'جارٍ المراجعة', progress: 58, due: '21/09/2026', manager: 'مها ناصر' },
  { name: 'مشروع القلعة', status: 'مكتمل', progress: 100, due: '03/08/2026', manager: 'عمر خالد' },
];

export const salesRows = [
  { client: 'شركة النخبة', value: 'EGP 320,000', status: 'مدفوع', date: '10/08/2026' },
  { client: 'مؤسسة المدى', value: 'EGP 210,500', status: 'قيد الاستحقاق', date: '12/08/2026' },
  { client: 'أصيل للاستثمار', value: 'EGP 540,000', status: 'مدفوع', date: '14/08/2026' },
];

export const warehouseRows = [
  { item: 'حديد أنبوبي', qty: '420 قطعة', location: 'A-12', status: 'متوفر' },
  { item: 'أسمنت', qty: '860 كيس', location: 'B-03', status: 'منخفض' },
  { item: 'ألياف بولي', qty: '210 رزمة', location: 'C-08', status: 'متوفر' },
];

export const employeeRows = [
  { name: 'سارة أحمد', role: 'مديرة مشاريع', department: 'المشروعات', status: 'متاح' },
  { name: 'محمود علي', role: 'مهندس تصنيع', department: 'التصنيع', status: 'في العمل' },
  { name: 'ليلى حسن', role: 'محاسبة', department: 'الماليات', status: 'متاحة' },
];

export const clientRows = [
  { name: 'شركة الكرامة', company: 'القطاع العقاري', total: 'EGP 1.25M', status: 'نشط' },
  { name: 'مؤسسة الصفوة', company: 'التطوير العقاري', total: 'EGP 980K', status: 'نشط' },
  { name: 'دور الرخاء', company: 'الإنشاءات', total: 'EGP 760K', status: 'مراجعة' },
];
