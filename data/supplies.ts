import { mockClients } from '@/data/clients';
import { mockProjects } from '@/data/projects';
import { mockWarehouseProducts, WarehouseProduct } from '@/data/warehouse';

export type SupplyStatus = 'draft' | 'pending' | 'processing' | 'delivered' | 'completed' | 'cancelled';
export type SupplyPaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';
export type SupplyItem = { id: string; productId: string; productName: string; quantity: number; costPrice: number; sellingPrice: number; totalCost: number; totalSellingPrice: number; profit: number };
export type SupplyTimelineEvent = { id: string; title: string; date: string; note?: string };
export type Supply = {
  id: string;
  supplyNumber: string;
  clientId: string;
  projectId?: string;
  date: string;
  status: SupplyStatus;
  items: SupplyItem[];
  subtotalCost: number;
  subtotalSellingPrice: number;
  totalCost: number;
  totalSellingPrice: number;
  totalProfit: number;
  paymentStatus: SupplyPaymentStatus;
  paidAmount?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  inventoryApplied: boolean;
  timeline: SupplyTimelineEvent[];
};

export const supplyStatusLabels: Record<SupplyStatus, string> = { draft: 'مسودة', pending: 'قيد التنفيذ', processing: 'جاري التجهيز', delivered: 'تم التوريد', completed: 'مكتمل', cancelled: 'ملغي' };
export const supplyPaymentLabels: Record<SupplyPaymentStatus, string> = { paid: 'مدفوع', partial: 'مدفوع جزئيًا', pending: 'مستحق', overdue: 'متأخر' };
export const supplyStatusOptions: SupplyStatus[] = ['draft', 'pending', 'processing', 'delivered', 'completed', 'cancelled'];
export const supplyPaymentOptions: SupplyPaymentStatus[] = ['paid', 'partial', 'pending', 'overdue'];

export const isInventoryCommitted = (status: SupplyStatus) => status === 'delivered' || status === 'completed';
export const calculateSupplyItem = (item: Pick<SupplyItem, 'id' | 'productId' | 'productName' | 'quantity' | 'costPrice' | 'sellingPrice'>): SupplyItem => ({ ...item, totalCost: item.quantity * item.costPrice, totalSellingPrice: item.quantity * item.sellingPrice, profit: item.quantity * (item.sellingPrice - item.costPrice) });
export const calculateSupplyTotals = (items: SupplyItem[]) => { const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0); const totalSellingPrice = items.reduce((sum, item) => sum + item.totalSellingPrice, 0); return { subtotalCost: totalCost, subtotalSellingPrice: totalSellingPrice, totalCost, totalSellingPrice, totalProfit: totalSellingPrice - totalCost }; };
export const getClientName = (clientId: string) => mockClients.find((client) => client.id === clientId)?.company || mockClients.find((client) => client.id === clientId)?.name || 'عميل غير محدد';
export const getProjectName = (projectId?: string) => mockProjects.find((project) => project.id === projectId)?.name || 'بدون مشروع';
export const getProduct = (productId: string) => mockWarehouseProducts.find((product) => product.id === productId);

const initialItems = [calculateSupplyItem({ id: 'supply-item-101', productId: 'mat-101', productName: 'ألواح ألمنيوم', quantity: 80, costPrice: 228, sellingPrice: 310 }), calculateSupplyItem({ id: 'supply-item-102', productId: 'mat-102', productName: 'قطاعات فولاذية', quantity: 25, costPrice: 300, sellingPrice: 420 })];
const initialTotals = calculateSupplyTotals(initialItems);
export const mockSupplies: Supply[] = [{ id: 'supply-101', supplyNumber: 'SUP-2026-001', clientId: 'client-101', projectId: 'prj-101', date: '2026-08-28', status: 'delivered', items: initialItems, ...initialTotals, paymentStatus: 'partial', notes: 'تم تسليم مواد المرحلة الأولى إلى موقع المشروع.', createdAt: '2026-08-26', updatedAt: '2026-08-28', inventoryApplied: true, timeline: [{ id: 'supply-event-101', title: 'تم إنشاء التوريد', date: '2026-08-26' }, { id: 'supply-event-102', title: 'بدأ التجهيز', date: '2026-08-27' }, { id: 'supply-event-103', title: 'تم التوريد', date: '2026-08-28' }] }, { id: 'supply-102', supplyNumber: 'SUP-2026-002', clientId: 'client-103', projectId: 'prj-103', date: '2026-09-01', status: 'processing', items: [calculateSupplyItem({ id: 'supply-item-103', productId: 'mat-105', productName: 'أجهزة اختبار', quantity: 2, costPrice: 7083, sellingPrice: 9000 })], ...calculateSupplyTotals([calculateSupplyItem({ id: 'supply-item-103', productId: 'mat-105', productName: 'أجهزة اختبار', quantity: 2, costPrice: 7083, sellingPrice: 9000 })]), paymentStatus: 'pending', notes: 'التجهيز جارٍ قبل التسليم.', createdAt: '2026-08-30', updatedAt: '2026-09-01', inventoryApplied: false, timeline: [{ id: 'supply-event-104', title: 'تم إنشاء التوريد', date: '2026-08-30' }, { id: 'supply-event-105', title: 'بدأ التجهيز', date: '2026-09-01' }] }];

export type SupplyProductOption = Pick<WarehouseProduct, 'id' | 'name' | 'currentQuantity' | 'purchasePrice' | 'unit'>;
