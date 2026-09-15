export type StockStatus = 'available' | 'low' | 'minimum' | 'out';
export type StockMovementType = 'in' | 'out' | 'return' | 'adjustment';

export type WarehouseProduct = {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  currentQuantity: number;
  minimumQuantity: number;
  unit: string;
  purchasePrice: number;
  storageLocation: string;
  supplier: string;
  imageUrl?: string;
};

export type StockMovement = {
  id: string;
  number: string;
  productId: string;
  productName: string;
  clientId?: string;
  clientName?: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  employeeId: string;
  employeeName: string;
  reason: string;
  supplierId?: string;
  unitCost?: number;
  sellingPrice?: number;
  notes: string;
};

export const stockStatusLabels: Record<StockStatus, string> = {
  available: 'متوفر',
  low: 'منخفض',
  minimum: 'وصل للحد الأدنى',
  out: 'غير متوفر',
};

export const stockMovementTypeLabels: Record<StockMovementType, string> = {
  in: 'إضافة بضاعة',
  out: 'صرف بضاعة',
  return: 'مرتجع',
  adjustment: 'تعديل كمية',
};

export const stockMovementTypeOptions: StockMovementType[] = ['in', 'out', 'return', 'adjustment'];

export const getStockStatus = (product: Pick<WarehouseProduct, 'currentQuantity' | 'minimumQuantity'>): StockStatus => {
  if (product.currentQuantity === 0) return 'out';
  if (product.currentQuantity === product.minimumQuantity) return 'minimum';
  if (product.currentQuantity < product.minimumQuantity * 1.5) return 'low';
  return 'available';
};

export const mockWarehouseProducts: WarehouseProduct[] = [
  { id: 'mat-101', code: 'MAT-AL-01', name: 'ألواح ألمنيوم', category: 'مواد معدنية', description: 'ألواح ألمنيوم للواجهات والأعمال الخارجية.', currentQuantity: 420, minimumQuantity: 150, unit: 'متر مربع', purchasePrice: 228, storageLocation: 'A-12', supplier: 'شركة المعادن المتحدة', imageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=500&q=80' },
  { id: 'mat-102', code: 'MAT-ST-02', name: 'قطاعات فولاذية', category: 'مواد معدنية', description: 'قطاعات فولاذية للاستخدام في أعمال التجميع.', currentQuantity: 180, minimumQuantity: 120, unit: 'قطعة', purchasePrice: 300, storageLocation: 'A-14', supplier: 'مصنع الخليج للحديد' },
  { id: 'mat-103', code: 'MAT-ME-04', name: 'مكونات ميكانيكية', category: 'مكونات تصنيع', description: 'مكونات ميكانيكية لخطوط الإنتاج.', currentQuantity: 52, minimumQuantity: 52, unit: 'طقم', purchasePrice: 2625, storageLocation: 'B-03', supplier: 'حلول المعدات الصناعية' },
  { id: 'mat-104', code: 'MAT-EL-05', name: 'لوحات كهربائية', category: 'كهربائيات', description: 'لوحات كهربائية مخصصة لخطوط الإنتاج.', currentQuantity: 0, minimumQuantity: 8, unit: 'لوحة', purchasePrice: 4875, storageLocation: 'B-05', supplier: 'التقنية الكهربائية الحديثة' },
  { id: 'mat-105', code: 'MAT-TS-07', name: 'أجهزة اختبار', category: 'أدوات ومعدات', description: 'أجهزة معايرة واختبار للأنظمة.', currentQuantity: 12, minimumQuantity: 4, unit: 'جهاز', purchasePrice: 7083, storageLocation: 'C-08', supplier: 'مركز القياس المتقدم' },
  { id: 'mat-106', code: 'MAT-WD-08', name: 'ألواح خشبية معالجة', category: 'مواد خشبية', description: 'ألواح معالجة لوحدات التخزين الميدانية.', currentQuantity: 12, minimumQuantity: 25, unit: 'لوح', purchasePrice: 300, storageLocation: 'D-02', supplier: 'الأخشاب الوطنية' },
];

export const mockStockMovements: StockMovement[] = [
  { id: 'movement-101', number: 'WH-2026-001', productId: 'mat-101', productName: 'ألواح ألمنيوم', type: 'in', quantity: 420, date: '2026-08-01', employeeId: 'emp-101', employeeName: 'سارة أحمد', reason: 'توريد دفعة جديدة', notes: 'تم الاستلام والفحص.' },
  { id: 'movement-102', number: 'WH-2026-002', productId: 'mat-103', productName: 'مكونات ميكانيكية', type: 'out', quantity: 28, date: '2026-08-19', employeeId: 'emp-102', employeeName: 'محمود علي', reason: 'استخدام في التصنيع', notes: 'صرف للمرحلة الثانية.' },
  { id: 'movement-103', number: 'WH-2026-003', productId: 'mat-106', productName: 'ألواح خشبية معالجة', type: 'adjustment', quantity: 12, date: '2026-08-20', employeeId: 'emp-104', employeeName: 'يوسف سالم', reason: 'مطابقة الجرد', notes: 'تم تحديث الكمية بعد الجرد.' },
  { id: 'movement-104', number: 'WH-2026-004', productId: 'mat-102', productName: 'قطاعات فولاذية', type: 'return', quantity: 20, date: '2026-08-26', employeeId: 'emp-101', employeeName: 'سارة أحمد', reason: 'مرتجع من موقع العمل', notes: 'المواد بحالة جيدة.' },
];
