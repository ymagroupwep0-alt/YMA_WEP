export type SupplierStatus = 'active' | 'inactive' | 'pending';

export type SupplierSupply = {
  id: string;
  title: string;
  date: string;
  quantity: number;
  amount: number;
  status: string;
};

export type Supplier = {
  id: string;
  code: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  products: string;
  supplyCount: number;
  totalSupplyValue: number;
  amountDue: number;
  status: SupplierStatus;
  notes: string;
  dateAdded: string;
  supplies: SupplierSupply[];
  timeline: { title: string; date: string; note?: string }[];
};

export const supplierStatusLabels: Record<SupplierStatus, string> = { active: 'نشط', inactive: 'غير نشط', pending: 'قيد التقييم' };
export const supplierStatusOptions: SupplierStatus[] = ['active', 'inactive', 'pending'];

export const mockSuppliers: Supplier[] = [
  { id: 'supplier-101', code: 'SUP-101', name: 'شركة المعادن المتحدة', contactName: 'محمود حسن', phone: '+201011223344', email: 'sales@metals-eg.com', address: 'الجيزة، المنطقة الصناعية', products: 'ألواح ألمنيوم، قطاعات معدنية، مسامير تثبيت', supplyCount: 12, totalSupplyValue: 860000, amountDue: 96000, status: 'active', notes: 'مورد رئيسي لمواد الواجهات والتجهيزات المعدنية.', dateAdded: '2026-01-08', supplies: [{ id: 'supply-101', title: 'مواد الواجهات', date: '2026-08-25', quantity: 240, amount: 96000, status: 'مستلم' }, { id: 'supply-102', title: 'قطاعات معدنية', date: '2026-07-14', quantity: 180, amount: 74000, status: 'مستلم' }], timeline: [{ title: 'إضافة المورد', date: '2026-01-08' }, { title: 'آخر توريد', date: '2026-08-25', note: 'تم تسجيل مواد الواجهات في المخزن.' }] },
  { id: 'supplier-102', code: 'SUP-102', name: 'حلول المعدات الصناعية', contactName: 'نادية علي', phone: '+201055667788', email: 'contact@industrial-solutions.eg', address: 'القاهرة، مدينة نصر', products: 'خطوط إنتاج، معدات تشغيل، قطع غيار', supplyCount: 7, totalSupplyValue: 1240000, amountDue: 320000, status: 'active', notes: 'متخصص في معدات التصنيع وخطوط الإنتاج.', dateAdded: '2026-02-19', supplies: [{ id: 'supply-103', title: 'خطوط الإنتاج', date: '2026-08-20', quantity: 4, amount: 320000, status: 'قيد المراجعة' }], timeline: [{ title: 'مراجعة عقد التوريد', date: '2026-07-18' }, { title: 'توريد خطوط الإنتاج', date: '2026-08-20' }] },
  { id: 'supplier-103', code: 'SUP-103', name: 'موردو التقنية الحديثة', contactName: 'يوسف فؤاد', phone: '+201099887766', email: 'hello@modern-tech.eg', address: 'الإسكندرية، سموحة', products: 'أجهزة شبكات، حساسات، أنظمة مراقبة', supplyCount: 4, totalSupplyValue: 285000, amountDue: 0, status: 'pending', notes: 'مورد جديد تحت التقييم.', dateAdded: '2026-05-11', supplies: [], timeline: [{ title: 'تسجيل المورد للتقييم', date: '2026-05-11' }] },
];
