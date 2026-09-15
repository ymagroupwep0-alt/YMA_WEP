export type EntityId = string;
export type ISODateString = string;
export type CurrencyCode = 'EGP';

export type UserStatus = 'active' | 'inactive' | 'suspended';
export type RoleCode = 'admin' | 'manager' | 'employee' | 'viewer';

export interface User {
  id: EntityId;
  employeeId?: EntityId;
  name: string;
  email: string;
  role: RoleCode;
  status: UserStatus;
  lastLoginAt?: ISODateString;
}

export interface Employee {
  id: EntityId;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
}

export interface Client {
  id: EntityId;
  code: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
}

export interface Supplier {
  id: EntityId;
  code: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  address?: string;
  notes?: string;
}

export interface SupplyItem {
  id: EntityId;
  productId: EntityId;
  productName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  totalCost: number;
  totalSellingPrice: number;
  profit: number;
}

export interface Supply {
  id: EntityId;
  supplyNumber: string;
  clientId: EntityId;
  projectId?: EntityId;
  date: ISODateString;
  status: string;
  items: SupplyItem[];
  subtotalCost: number;
  subtotalSellingPrice: number;
  totalCost: number;
  totalSellingPrice: number;
  totalProfit: number;
  paymentStatus: string;
  notes?: string;
  inventoryApplied: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Project {
  id: EntityId;
  code: string;
  name: string;
  clientId?: EntityId;
  supplyId?: EntityId;
  managerId?: EntityId;
  status: string;
  budget: number;
  progress: number;
  startDate: ISODateString;
  dueDate: ISODateString;
}

export interface Report {
  id: EntityId;
  code: string;
  title: string;
  type: string;
  projectId?: EntityId;
  employeeId?: EntityId;
  status: string;
  createdAt: ISODateString;
}

export interface WarehouseProduct {
  id: EntityId;
  code: string;
  name: string;
  category: string;
  currentQuantity: number;
  minimumQuantity: number;
  unit: string;
  purchasePrice: number;
  currency: CurrencyCode;
  storageLocation: string;
  supplier?: string;
}

export type StockMovementType = 'in' | 'out' | 'return' | 'adjustment';

export interface StockMovement {
  id: EntityId;
  productId: EntityId;
  type: StockMovementType;
  quantity: number;
  sellingPrice?: number;
  date: ISODateString;
  employeeId: EntityId;
  reason: string;
  notes?: string;
}

export interface ManufacturingOperation {
  id: EntityId;
  code: string;
  name: string;
  projectId: EntityId;
  employeeId: EntityId;
  status: string;
  progress: number;
  cost: number;
  currency: CurrencyCode;
  startDate: ISODateString;
  expectedEndDate: ISODateString;
}

export interface ManufacturingMaterial {
  id: EntityId;
  manufacturingOperationId: EntityId;
  productId?: EntityId;
  productCode?: string;
  requiredQuantity: number;
  usedQuantity: number;
  unit: string;
  cost: number;
  currency: CurrencyCode;
}

export interface FinanceTransaction {
  id: EntityId;
  number: string;
  name: string;
  type: string;
  category: string;
  projectId?: EntityId;
  clientId?: EntityId;
  supplyId?: EntityId;
  supplier?: string;
  employeeId: EntityId;
  amount: number;
  currency: CurrencyCode;
  date: ISODateString;
  dueDate?: ISODateString;
  status: string;
}

export interface ProfitSnapshot {
  id: EntityId;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  revenue: number;
  expenses: number;
  netProfit: number;
  currency: CurrencyCode;
}

export interface Company {
  id: EntityId;
  name: string;
  summary: string;
  industry: string;
  foundedYear: number;
  headquarters: string;
}

export interface Activity {
  id: EntityId;
  userId: EntityId;
  action: string;
  module: string;
  entityType: string;
  entityId: EntityId;
  description: string;
  createdAt: ISODateString;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface Notification {
  id: EntityId;
  userId: EntityId;
  title: string;
  description: string;
  read: boolean;
  createdAt: ISODateString;
  href?: string;
}
