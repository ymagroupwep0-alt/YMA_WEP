export type ClientStatus = 'active' | 'inactive' | 'potential';

export type Client = {
  id: string;
  code: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  clientType: string;
  notes: string;
  dateAdded: string;
  status: ClientStatus;
  projectCount: number;
  projectTotal: number;
  associatedProjects: {
    name: string;
    status: 'new' | 'in_progress' | 'paused' | 'completed' | 'delayed';
    value: number;
    dueDate: string;
  }[];
  upcomingPayments: {
    title: string;
    amount: number;
    dueDate: string;
  }[];
};

export const clientStatusLabels: Record<ClientStatus, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  potential: 'محتمل',
};

export const clientStatusOptions: ClientStatus[] = ['active', 'inactive', 'potential'];

export const mockClients: Client[] = [
  {
    id: 'client-101',
    code: 'CL-101',
    name: 'أحمد السالم',
    company: 'شركة النخبة',
    phone: '+201000123456',
    email: 'ahmed@alnakhla.com',
    address: 'القاهرة، حي النخبة',
    clientType: 'شركة خاصة',
    notes: 'عميل رئيسي مع علاقة مستمرة ومشتريات متكررة.',
    dateAdded: '2026-01-12',
    status: 'active',
    projectCount: 3,
    projectTotal: 1250000,
    associatedProjects: [
      { name: 'مبنى النخبة التجاري', status: 'in_progress', value: 780000, dueDate: '2026-10-15' },
      { name: 'تحديث المرافق', status: 'completed', value: 260000, dueDate: '2026-08-20' },
      { name: 'توسعة الموقع', status: 'new', value: 210000, dueDate: '2026-11-05' },
    ],
    upcomingPayments: [
      { title: 'دفعة المرحلة الثانية', amount: 180000, dueDate: '2026-09-10' },
      { title: 'دفعة إضافية', amount: 95000, dueDate: '2026-09-22' },
    ],
  },
  {
    id: 'client-102',
    code: 'CL-102',
    name: 'ريم عبدالله',
    company: 'مجموعة الخليج',
    phone: '+201012345678',
    email: 'rem@gulfgroup.eg',
    address: 'الإسكندرية، حي الروضة',
    clientType: 'مجموعة استثمارية',
    notes: 'عميل استراتيجي، يطلب تقارير دورية وتحديثات متابعة.',
    dateAdded: '2026-02-04',
    status: 'potential',
    projectCount: 2,
    projectTotal: 920000,
    associatedProjects: [
      { name: 'منشأة الخليج للمنتجات', status: 'delayed', value: 920000, dueDate: '2026-09-01' },
      { name: 'قيمة المراجعة', status: 'paused', value: 150000, dueDate: '2026-10-10' },
    ],
    upcomingPayments: [
      { title: 'دفعة تأخير المشروع', amount: 130000, dueDate: '2026-09-05' },
    ],
  },
  {
    id: 'client-103',
    code: 'CL-103',
    name: 'سارة محمد',
    company: 'مؤسسة الرؤى',
    phone: '+201044556677',
    email: 'sara@alroya.eg',
    address: 'المنصورة، حي الأمير فيصل',
    clientType: 'مؤسسة تقنية',
    notes: 'عميل مميز مع مشاريع تقنية واحتياجات متابعة عالية.',
    dateAdded: '2026-03-18',
    status: 'active',
    projectCount: 2,
    projectTotal: 650000,
    associatedProjects: [
      { name: 'مركز البيانات الجديد', status: 'completed', value: 650000, dueDate: '2026-08-20' },
      { name: 'تحسين الأنظمة', status: 'in_progress', value: 340000, dueDate: '2026-11-16' },
    ],
    upcomingPayments: [
      { title: 'دفعة استلام المشروع', amount: 200000, dueDate: '2026-09-15' },
    ],
  },
  {
    id: 'client-104',
    code: 'CL-104',
    name: 'خالد حامد',
    company: 'دار الإثمار',
    phone: '+201055501122',
    email: 'khalid@dirah.eg',
    address: 'مكة المكرمة',
    clientType: 'شركة عقارية',
    notes: 'تحديثات ميدانية ومتابعة مستمرة للتوزيع.',
    dateAdded: '2026-04-09',
    status: 'inactive',
    projectCount: 1,
    projectTotal: 430000,
    associatedProjects: [
      { name: 'تحديث المراكز الميدانية', status: 'new', value: 430000, dueDate: '2026-11-05' },
    ],
    upcomingPayments: [
      { title: 'مراجعة أولية', amount: 60000, dueDate: '2026-09-08' },
    ],
  },
];
