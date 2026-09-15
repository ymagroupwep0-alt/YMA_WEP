import type {
  Activity,
  Client,
  Company,
  Employee,
  FinanceTransaction,
  ManufacturingOperation,
  Notification,
  Project,
  Report,
  StockMovement,
  Supplier,
  Supply,
  User,
  WarehouseProduct,
} from '@/types/domain';

export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  list(): Promise<T[]>;
  create(input: Omit<T, 'id'>): Promise<T>;
  update(id: string, input: Partial<Omit<T, 'id'>>): Promise<T>;
  delete(id: string): Promise<void>;
}

export type UserRepository = Repository<User>;
export type EmployeeRepository = Repository<Employee>;
export type ClientRepository = Repository<Client>;
export type ProjectRepository = Repository<Project>;
export type ReportRepository = Repository<Report>;
export type SupplierRepository = Repository<Supplier>;
export type SupplyRepository = Repository<Supply>;
export type WarehouseProductRepository = Repository<WarehouseProduct>;
export type StockMovementRepository = Repository<StockMovement>;
export type ManufacturingRepository = Repository<ManufacturingOperation>;
export type FinanceRepository = Repository<FinanceTransaction>;
export type CompanyRepository = Repository<Company>;
export type ActivityRepository = Repository<Activity>;
export type NotificationRepository = Repository<Notification>;
