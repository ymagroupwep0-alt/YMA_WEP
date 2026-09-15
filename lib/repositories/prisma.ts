import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type Serialized<T> = T extends Prisma.Decimal ? number : T extends Date ? string : T extends Array<infer U> ? Serialized<U>[] : T extends object ? { [K in keyof T]: Serialized<T[K]> } : T;

export const serialize = <T>(value: T): Serialized<T> => {
  if (value instanceof Prisma.Decimal) return value.toNumber() as Serialized<T>;
  if (value instanceof Date) return value.toISOString() as Serialized<T>;
  if (Array.isArray(value)) return value.map((item) => serialize(item)) as Serialized<T>;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)])) as Serialized<T>;
  }
  return value as Serialized<T>;
};

export const usersRepository = {
  list: () => prisma.user.findMany({ select: { id: true, name: true, email: true, roleId: true, employeeId: true, status: true, lastLoginAt: true, imageUrl: true, phone: true, job: true, createdAt: true, updatedAt: true, role: true, permissionOverrides: { include: { permission: true } }, employee: true }, orderBy: { createdAt: 'desc' } }).then(serialize),
  findById: (id: string) => prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, roleId: true, employeeId: true, status: true, lastLoginAt: true, imageUrl: true, phone: true, job: true, createdAt: true, updatedAt: true, role: true, permissionOverrides: { include: { permission: true } }, employee: true } }).then(serialize),
  create: (data: Prisma.UserUncheckedCreateInput) => prisma.user.create({ data, select: { id: true, name: true, email: true, roleId: true, employeeId: true, status: true, lastLoginAt: true, imageUrl: true, phone: true, job: true, createdAt: true, updatedAt: true, role: true, permissionOverrides: { include: { permission: true } }, employee: true } }).then(serialize),
  update: (id: string, data: Prisma.UserUncheckedUpdateInput) => prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, roleId: true, employeeId: true, status: true, lastLoginAt: true, imageUrl: true, phone: true, job: true, createdAt: true, updatedAt: true, role: true, permissionOverrides: { include: { permission: true } }, employee: true } }).then(serialize),
  delete: (id: string) => prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id }, select: { employeeId: true } });
    if (!user) throw new Error('NOT_FOUND');
    await tx.user.delete({ where: { id } });
    if (user.employeeId) {
      const [projectMembers, reports, stockMovements, manufacturing] = await Promise.all([
        tx.projectMember.count({ where: { employeeId: user.employeeId } }),
        tx.report.count({ where: { employeeId: user.employeeId } }),
        tx.stockMovement.count({ where: { employeeId: user.employeeId } }),
        tx.manufacturingOperation.count({ where: { employeeId: user.employeeId } }),
      ]);
      if (!projectMembers && !reports && !stockMovements && !manufacturing) await tx.employee.delete({ where: { id: user.employeeId } });
    }
  }),
  countActiveAdmins: () => prisma.user.count({ where: { roleId: 'admin', status: 'active' } }),
  ensureEmployeeLinks: async () => prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({ where: { employeeId: null }, select: { id: true, name: true, email: true, phone: true, job: true, status: true, imageUrl: true, roleId: true } });
    for (const user of users) {
      const employee = await tx.employee.create({ data: { id: randomUUID(), code: `EMP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, fullName: user.name, email: user.email, phone: user.phone ?? '', role: user.job ?? user.roleId, department: 'عام', status: user.status === 'active' ? 'active' : 'inactive', imageUrl: user.imageUrl } });
      await tx.user.update({ where: { id: user.id }, data: { employeeId: employee.id } });
    }
  }),
  setPermissionOverrides: (userId: string, overrides: Record<string, 'allow' | 'deny'>) => prisma.$transaction(async (transaction) => {
    const permissionIds = Object.keys(overrides);
    const validPermissions = await transaction.permission.findMany({ where: { id: { in: permissionIds } }, select: { id: true } });
    if (validPermissions.length !== permissionIds.length) throw new Error('INVALID_PERMISSION');
    await transaction.userPermissionOverride.deleteMany({ where: { userId } });
    const entries = Object.entries(overrides).filter(([permissionId]) => validPermissions.some((permission) => permission.id === permissionId));
    if (entries.length) await transaction.userPermissionOverride.createMany({ data: entries.map(([permissionId, effect]) => ({ userId, permissionId, effect })) });
  }),
  updateAccount: (id: string, data: Prisma.UserUncheckedUpdateInput) => prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, roleId: true, employeeId: true, status: true, lastLoginAt: true, imageUrl: true, phone: true, job: true, createdAt: true, updatedAt: true } }).then(serialize),
  getWithPassword: (id: string) => prisma.user.findUnique({ where: { id }, select: { id: true, passwordHash: true } }),
  setRolePermissions: (roleId: string, permissionIds: string[]) => prisma.$transaction(async (transaction) => {
    const uniqueIds = Array.from(new Set(permissionIds));
    const validPermissions = await transaction.permission.findMany({ where: { id: { in: uniqueIds } }, select: { id: true } });
    if (validPermissions.length !== uniqueIds.length) throw new Error('INVALID_PERMISSION');
    await transaction.rolePermission.deleteMany({ where: { roleId } });
    if (uniqueIds.length) await transaction.rolePermission.createMany({ data: uniqueIds.map((permissionId) => ({ roleId, permissionId })) });
    return uniqueIds;
  }),
  getRolePermissions: () => prisma.rolePermission.findMany({ select: { roleId: true, permissionId: true } }).then((items) => items.reduce<Record<string, string[]>>((result, item) => { (result[item.roleId] ??= []).push(item.permissionId); return result; }, {})),
};

export const employeesRepository = {
  list: () => prisma.employee.findMany({ orderBy: { createdAt: 'desc' } }).then(serialize),
  findById: (id: string) => prisma.employee.findUnique({ where: { id }, include: { user: true } }).then(serialize),
  create: (data: Prisma.EmployeeUncheckedCreateInput) => prisma.employee.create({ data }).then(serialize),
  update: (id: string, data: Prisma.EmployeeUncheckedUpdateInput) => prisma.employee.update({ where: { id }, data }).then(serialize),
  delete: (id: string) => prisma.$transaction(async (tx) => {
    const employee = await tx.employee.findUnique({ where: { id }, select: { user: { select: { id: true } }, _count: { select: { projectMemberships: true, reports: true, stockMovements: true, manufacturing: true, payrollRecords: true } } } });
    if (!employee) throw new Error('NOT_FOUND');
    if (employee._count.projectMemberships || employee._count.reports || employee._count.stockMovements || employee._count.manufacturing || employee._count.payrollRecords) throw new Error('EMPLOYEE_HAS_LINKED_RECORDS');
    if (employee.user) {
      await tx.user.delete({ where: { id: employee.user.id } });
    }
    await tx.employee.delete({ where: { id } });
  }),
};

export const clientsRepository = {
  list: () => prisma.client.findMany({ include: { _count: { select: { projects: true, supplies: true } } }, orderBy: { createdAt: 'desc' } }).then(serialize),
  findById: (id: string) => prisma.client.findUnique({ where: { id }, include: { projects: true, supplies: { include: { items: true } }, financeTransactions: true } }).then(serialize),
  create: (data: Prisma.ClientUncheckedCreateInput) => prisma.client.create({ data }).then(serialize),
  update: (id: string, data: Prisma.ClientUncheckedUpdateInput) => prisma.client.update({ where: { id }, data }).then(serialize),
  delete: (id: string) => prisma.client.delete({ where: { id } }),
};

export const suppliersRepository = {
  list: () => prisma.supplier.findMany({ include: { products: true, financeTransactions: true }, orderBy: { createdAt: 'desc' } }).then(serialize),
  findById: (id: string) => prisma.supplier.findUnique({ where: { id }, include: { products: true, financeTransactions: true } }).then(serialize),
  create: (data: Prisma.SupplierUncheckedCreateInput) => prisma.supplier.create({ data }).then(serialize),
  update: (id: string, data: Prisma.SupplierUncheckedUpdateInput) => prisma.supplier.update({ where: { id }, data }).then(serialize),
  delete: (id: string) => prisma.supplier.delete({ where: { id } }),
};

const projectFinanceSummary = (transactions: Array<{ type: string; amount: Prisma.Decimal; status: string }>) => {
  const revenue = transactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum.plus(t.amount), new Prisma.Decimal(0));
  const expenses = transactions
    .filter((t) => t.status === 'completed' && !['income', 'client_payment'].includes(t.type))
    .reduce((sum, t) => sum.plus(t.amount), new Prisma.Decimal(0));
  return { revenue, expenses, profit: revenue.minus(expenses) };
};

export const projectsRepository = {
  list: async () => { const rows = await prisma.project.findMany({ include: { client: true, manager: true, members: { include: { employee: true } }, reports: true, supplies: true, manufacturing: true, financeTransactions: true }, orderBy: { createdAt: 'desc' } }); return serialize(rows.map((project) => ({ ...project, financialSummary: projectFinanceSummary(project.financeTransactions) }))); },
  findById: async (id: string) => { const project = await prisma.project.findUnique({ where: { id }, include: { client: true, manager: true, members: { include: { employee: true } }, reports: true, supplies: true, manufacturing: true, financeTransactions: true } }); return project ? serialize({ ...project, financialSummary: projectFinanceSummary(project.financeTransactions) }) : null; },
  create: (data: Prisma.ProjectUncheckedCreateInput) => prisma.$transaction(async (tx) => {
    const project = await tx.project.create({ data });
    await tx.financeTransaction.create({ data: { id: `auto-project-cost-${project.id}`, number: `AUTO-PRJ-${project.id}`, name: `تكلفة مشروع ${project.name}`, type: 'expense', category: 'projects', projectId: project.id, clientId: project.clientId ?? undefined, amount: project.budget, currency: 'EGP', date: project.startDate, dueDate: project.dueDate, status: 'completed', paymentMethod: 'تكلفة المشروع', description: `تكلفة الميزانية المعتمدة للمشروع ${project.name}`, notes: 'قيد تلقائي من تكلفة المشروع.' } });
    return project;
  }).then(serialize),
  update: (id: string, data: Prisma.ProjectUncheckedUpdateInput) => prisma.$transaction(async (tx) => {
    const project = await tx.project.update({ where: { id }, data });
    await tx.financeTransaction.upsert({ where: { id: `auto-project-cost-${project.id}` }, create: { id: `auto-project-cost-${project.id}`, number: `AUTO-PRJ-${project.id}`, name: `تكلفة مشروع ${project.name}`, type: 'expense', category: 'projects', projectId: project.id, clientId: project.clientId ?? undefined, amount: project.budget, currency: 'EGP', date: project.startDate, dueDate: project.dueDate, status: 'completed', paymentMethod: 'تكلفة المشروع', description: `تكلفة الميزانية المعتمدة للمشروع ${project.name}`, notes: 'قيد تلقائي من تكلفة المشروع.' }, update: { name: `تكلفة مشروع ${project.name}`, clientId: project.clientId ?? null, amount: project.budget, date: project.startDate, dueDate: project.dueDate, status: 'completed' } });
    return project;
  }).then(serialize),
  delete: (id: string) => prisma.project.delete({ where: { id } }),
};

const supplyFinanceStatus = (paymentStatus: string) => ({
  paid: 'completed',
  partial: 'pending',
  pending: 'due',
  overdue: 'overdue',
}[paymentStatus] ?? 'pending');

type SupplyForFinance = Prisma.SupplyGetPayload<{ include: { items: true } }>;
async function syncSupplyFinance(tx: Prisma.TransactionClient, supply: SupplyForFinance, employeeId: string) {
  const incomeId = `auto-supply-income-${supply.id}`;
  const paymentId = `auto-supply-payment-${supply.id}`;
  const expenseId = `auto-supply-cost-${supply.id}`;
  const committed = ['delivered', 'completed'].includes(supply.status) && supply.status !== 'cancelled';
  if (!committed) {
    await tx.financeTransaction.deleteMany({ where: { id: { in: [incomeId, paymentId, expenseId] } } });
    return;
  }
  const status = supplyFinanceStatus(supply.paymentStatus);
  const requestedPaid = new Prisma.Decimal(supply.paidAmount); const totalSelling = new Prisma.Decimal(supply.totalSellingPrice); const paidAmount = supply.paymentStatus === 'paid' ? totalSelling : (requestedPaid.gt(totalSelling) ? totalSelling : requestedPaid);
  const base = { projectId: supply.projectId ?? null, clientId: supply.clientId ?? null, employeeId: employeeId || null, supplyId: supply.id, currency: 'EGP', date: supply.date, dueDate: supply.date };
  await tx.financeTransaction.upsert({
    where: { id: incomeId },
    create: { id: incomeId, number: `AUTO-SUP-${supply.id}-IN`, name: `إيراد التوريد ${supply.supplyNumber}`, type: 'income', category: 'projects', amount: supply.totalSellingPrice, ...base, status, paymentMethod: status === 'completed' ? 'مسجل كمدفوع' : status === 'pending' ? 'مدفوع جزئيًا' : status === 'overdue' ? 'متأخر' : 'آجل', description: `إيراد مستحق من التوريد ${supply.supplyNumber}`, notes: 'قيد تلقائي من التوريد المصدر.' },
    update: { amount: supply.totalSellingPrice, projectId: base.projectId, clientId: base.clientId, employeeId: base.employeeId, date: supply.date, dueDate: base.dueDate, status, paymentMethod: status === 'completed' ? 'مسجل كمدفوع' : status === 'pending' ? 'مدفوع جزئيًا' : status === 'overdue' ? 'متأخر' : 'آجل' },
  });
  if (paidAmount.gt(0)) {
    await tx.financeTransaction.upsert({
      where: { id: paymentId },
      create: { id: paymentId, number: `AUTO-SUP-${supply.id}-PAY`, name: `دفعة عميل للتوريد ${supply.supplyNumber}`, type: 'client_payment', category: 'client_payments', amount: paidAmount, ...base, status: paidAmount.gte(new Prisma.Decimal(supply.totalSellingPrice)) ? 'completed' : 'pending', paymentMethod: 'دفعة مسجلة بالتوريد', description: `دفعة محصلة للتوريد ${supply.supplyNumber}`, notes: 'قيد تلقائي من مبلغ الدفع في التوريد.' },
      update: { amount: paidAmount, projectId: base.projectId, clientId: base.clientId, employeeId: base.employeeId, date: base.date, dueDate: base.dueDate, status: paidAmount.gte(new Prisma.Decimal(supply.totalSellingPrice)) ? 'completed' : 'pending' },
    });
  } else { await tx.financeTransaction.delete({ where: { id: paymentId } }).catch(() => undefined); }
  await tx.financeTransaction.upsert({
    where: { id: expenseId },
    create: { id: expenseId, number: `AUTO-SUP-${supply.id}-COST`, name: `تكلفة التوريد ${supply.supplyNumber}`, type: 'expense', category: 'materials', amount: supply.totalCost, ...base, status: 'completed', paymentMethod: 'تكلفة مخزون', description: `تكلفة المواد المصروفة للتوريد ${supply.supplyNumber}`, notes: 'قيد تلقائي من تكلفة التوريد.' },
    update: { amount: supply.totalCost, projectId: base.projectId, clientId: base.clientId, employeeId: base.employeeId, date: base.date, dueDate: base.dueDate, status: 'completed', paymentMethod: 'تكلفة مخزون' },
  });
}

export const suppliesRepository = {
  list: () => prisma.supply.findMany({ include: { client: true, project: true, items: true, timelineEvents: true, financeTransactions: true }, orderBy: { date: 'desc' } }).then(serialize),
  findById: (id: string) => prisma.supply.findUnique({ where: { id }, include: { client: true, project: true, items: true, timelineEvents: true, stockMovements: true, financeTransactions: true } }).then(serialize),
  create: (data: Prisma.SupplyUncheckedCreateInput, items: Prisma.SupplyItemUncheckedCreateWithoutSupplyInput[] = []) => prisma.$transaction(async (transaction) => {
    const supply = await transaction.supply.create({ data, include: { items: true, timelineEvents: true } });
    if (items.length) await transaction.supplyItem.createMany({ data: items.map((item) => ({ ...item, supplyId: supply.id })) });
    return transaction.supply.findUniqueOrThrow({ where: { id: supply.id }, include: { items: true, timelineEvents: true } });
  }).then(serialize),
  update: (id: string, data: Prisma.SupplyUncheckedUpdateInput, items?: Prisma.SupplyItemUncheckedCreateWithoutSupplyInput[]) => prisma.$transaction(async (transaction) => {
    await transaction.supply.update({ where: { id }, data });
    if (items) {
      await transaction.supplyItem.deleteMany({ where: { supplyId: id } });
      if (items.length) await transaction.supplyItem.createMany({ data: items.map((item) => ({ ...item, supplyId: id })) });
    }
    return transaction.supply.findUniqueOrThrow({ where: { id }, include: { items: true, timelineEvents: true } });
  }).then(serialize),
  delete: (id: string) => prisma.supply.delete({ where: { id } }),
  saveWithInventory: (data: Prisma.SupplyUncheckedCreateInput | Prisma.SupplyUncheckedUpdateInput, items: Prisma.SupplyItemUncheckedCreateWithoutSupplyInput[], employeeId: string, id?: string) => prisma.$transaction(async (transaction) => {
    const previous = id ? await transaction.supply.findUniqueOrThrow({ where: { id }, include: { items: true } }) : null;
    const previousApplied = previous?.inventoryApplied ? previous.items : [];
    const nextApplied = data.inventoryApplied ? items : [];
    const quantities = new Map<string, Prisma.Decimal>();
    for (const item of previousApplied) quantities.set(item.productId, (quantities.get(item.productId) ?? new Prisma.Decimal(0)).plus(item.quantity));
    for (const item of nextApplied) quantities.set(item.productId, (quantities.get(item.productId) ?? new Prisma.Decimal(0)).minus(String(item.quantity)));
    for (const [productId, delta] of Array.from(quantities.entries())) {
      if (delta.isZero()) continue;
      const result = await transaction.warehouseProduct.updateMany({ where: { id: productId, ...(delta.isNegative() ? { currentQuantity: { gte: delta.abs() } } : {}) }, data: { currentQuantity: { increment: delta } } });
      if (result.count !== 1) throw new Error('INSUFFICIENT_STOCK');
      await transaction.stockMovement.create({ data: { id: crypto.randomUUID(), productId, type: delta.isNegative() ? 'out' : 'return', quantity: delta.abs(), date: new Date(), employeeId, reason: id ? 'تحديث توريد' : 'تطبيق توريد', supplyId: id } });
    }
    const supply = id ? await transaction.supply.update({ where: { id }, data, include: { items: true, timelineEvents: true } }) : await transaction.supply.create({ data: data as Prisma.SupplyUncheckedCreateInput, include: { items: true, timelineEvents: true } });
    await transaction.supplyItem.deleteMany({ where: { supplyId: supply.id } });
    if (items.length) await transaction.supplyItem.createMany({ data: items.map((item) => ({ ...item, supplyId: supply.id })) });
    const refreshed = await transaction.supply.findUniqueOrThrow({ where: { id: supply.id }, include: { items: true, timelineEvents: true } });
    await syncSupplyFinance(transaction, refreshed, employeeId);
    return transaction.supply.findUniqueOrThrow({ where: { id: supply.id }, include: { items: true, timelineEvents: true, financeTransactions: true } });
  }).then(serialize),
  deleteWithInventory: (id: string, employeeId: string) => prisma.$transaction(async (transaction) => {
    const supply = await transaction.supply.findUniqueOrThrow({ where: { id }, include: { items: true } });
    if (supply.inventoryApplied) {
      for (const item of supply.items) {
        await transaction.warehouseProduct.update({ where: { id: item.productId }, data: { currentQuantity: { increment: item.quantity } } });
        await transaction.stockMovement.create({ data: { id: crypto.randomUUID(), productId: item.productId, type: 'return', quantity: item.quantity, date: new Date(), employeeId, reason: 'حذف توريد مطبق', supplyId: id } });
      }
    }
    await transaction.financeTransaction.deleteMany({ where: { id: { in: [`auto-supply-income-${id}`, `auto-supply-cost-${id}`, `auto-supply-payment-${id}`] } } });
    await transaction.supplyItem.deleteMany({ where: { supplyId: id } });
    await transaction.supplyTimelineEvent.deleteMany({ where: { supplyId: id } });
    return transaction.supply.delete({ where: { id } });
  }),
};

export const warehouseRepository = {
  products: {
    list: async () => {
      const rows = await prisma.warehouseProduct.findMany({ include: { supplier: true }, orderBy: { createdAt: 'desc' } });
      return serialize(rows.map((row) => ({ ...row, supplier: row.supplier?.company ?? row.supplier?.name ?? row.supplierNameSnapshot ?? '' })));
    },
    findById: async (id: string) => {
      const row = await prisma.warehouseProduct.findUnique({ where: { id }, include: { supplier: true, stockMovements: true } });
      return row ? serialize({ ...row, supplier: row.supplier?.company ?? row.supplier?.name ?? row.supplierNameSnapshot ?? '' }) : null;
    },
    create: (data: Prisma.WarehouseProductUncheckedCreateInput) => prisma.warehouseProduct.create({ data }).then(serialize),
    update: (id: string, data: Prisma.WarehouseProductUncheckedUpdateInput) => prisma.warehouseProduct.update({ where: { id }, data }).then(serialize),
    delete: (id: string) => prisma.warehouseProduct.delete({ where: { id } }),
  },
  movements: {
    list: async () => {
      const rows = await prisma.stockMovement.findMany({ include: { product: true, employee: true }, orderBy: { date: 'desc' } });
      return serialize(rows.map((row) => ({ ...row, productName: row.product?.name ?? '', employeeName: row.employee?.fullName ?? '' })));
    },
    create: (data: Prisma.StockMovementUncheckedCreateInput) => prisma.$transaction(async (transaction) => {
      const quantity = new Prisma.Decimal(String(data.quantity));
      const delta = data.type === 'out' ? quantity.negated() : quantity;
      const productInfo = await transaction.warehouseProduct.findUniqueOrThrow({ where: { id: data.productId }, select: { purchasePrice: true, sellingPrice: true, supplierId: true, name: true } });
      const product = await transaction.warehouseProduct.updateMany({ where: { id: data.productId, ...(data.type === 'out' ? { currentQuantity: { gte: quantity } } : {}) }, data: { currentQuantity: { increment: delta } } });
      if (product.count !== 1) throw new Error('INSUFFICIENT_STOCK');
      const movement = await transaction.stockMovement.create({ data: { ...data, supplierId: data.supplierId ?? productInfo.supplierId, unitCost: data.unitCost ?? productInfo.purchasePrice }, include: { product: true, employee: true, supplier: true } });
      const isManagedByParent = Boolean(data.supplyId || data.manufacturingOperationId);
      if (!isManagedByParent && (data.type === 'in' || data.type === 'out' || data.type === 'return')) {
        const purchaseAmount = quantity.mul(movement.unitCost ?? productInfo.purchasePrice);
        const salesAmount = quantity.mul(movement.sellingPrice ?? productInfo.sellingPrice ?? productInfo.purchasePrice);
        const isReturn = data.type === 'return';
        const revenueId = `auto-stock-movement-revenue-${movement.id}`;
        const costId = `auto-stock-movement-cost-${movement.id}`;
        const shared = { projectId: null, clientId: movement.clientId ?? null, employeeId: movement.employeeId, stockMovementId: movement.id, currency: 'EGP', date: movement.date, dueDate: movement.date, status: 'completed', paymentMethod: isReturn ? 'عكس حركة بيع' : 'حركة مخزون' };

        if (data.type === 'out') {
          await transaction.financeTransaction.create({ data: { id: revenueId, number: `AUTO-WH-${movement.id}-REV`, name: `بيع مخزون ${productInfo.name}`, type: 'income', category: 'projects', ...shared, amount: salesAmount, description: `إيراد صرف ${movement.quantity} من ${productInfo.name}`, notes: 'قيد تلقائي من صرف مخزون لعميل.' } });
          await transaction.financeTransaction.create({ data: { id: costId, number: `AUTO-WH-${movement.id}-COST`, name: `تكلفة صرف مخزون ${productInfo.name}`, type: 'expense', category: 'materials', supplierId: movement.supplierId ?? undefined, supplierNameSnapshot: movement.supplier?.company ?? productInfo.name, ...shared, amount: purchaseAmount, description: `تكلفة ${movement.quantity} من ${productInfo.name}`, notes: 'قيد تكلفة البضاعة المباعة المرتبط بحركة المخزون.' } });
        } else if (isReturn) {
          await transaction.financeTransaction.create({ data: { id: revenueId, number: `AUTO-WH-${movement.id}-REV`, name: `عكس بيع مخزون ${productInfo.name}`, type: 'expense', category: 'projects', ...shared, amount: salesAmount, description: `مرتجع ${movement.quantity} من ${productInfo.name}`, notes: 'قيد عكس إيراد مرتجع من عميل.' } });
          await transaction.financeTransaction.create({ data: { id: costId, number: `AUTO-WH-${movement.id}-COST`, name: `عكس تكلفة مخزون ${productInfo.name}`, type: 'income', category: 'materials', ...shared, amount: purchaseAmount, description: `عكس تكلفة ${movement.quantity} من ${productInfo.name}`, notes: 'قيد عكس تكلفة البضاعة المباعة للمرتجع.' } });
        } else {
          await transaction.financeTransaction.create({ data: { id: costId, number: `AUTO-WH-${movement.id}-COST`, name: `شراء مخزون ${productInfo.name}`, type: 'expense', category: 'materials', supplierId: movement.supplierId ?? undefined, supplierNameSnapshot: movement.supplier?.company ?? productInfo.name, ...shared, amount: purchaseAmount, description: `إضافة ${movement.quantity} من ${productInfo.name} إلى المخزون`, notes: 'قيد تلقائي من إضافة مخزون.' } });
        }
      }
      return movement;
    }).then(serialize),
  },
};

type ReportWithDetails = Prisma.ReportGetPayload<{ include: { project: true; employee: true; attachments: true; activityEvents: true } }>;
const serializeReport = (report: ReportWithDetails) => {
  const value = serialize(report) as Serialized<ReportWithDetails>;
  return {
    ...value,
    attachments: (value.attachments ?? []).map((file) => ({
      id: file.id,
      name: file.fileName,
      type: file.mimeType?.split('/').pop()?.toUpperCase() ?? 'FILE',
      size: file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(1)} MB` : '—',
      url: file.fileUrl,
      isImage: Boolean(file.mimeType?.startsWith('image/')),
    })),
  };
};

export const reportsRepository = {
  list: () => prisma.report.findMany({ include: { project: true, employee: true, attachments: true, activityEvents: true }, orderBy: { createdAt: 'desc' } }).then((items) => items.map(serializeReport)),
  findById: (id: string) => prisma.report.findUnique({ where: { id }, include: { project: true, employee: true, attachments: true, activityEvents: true } }).then((item) => item ? serializeReport(item) : null),
  create: (data: Prisma.ReportUncheckedCreateInput) => prisma.report.create({ data }).then(serialize),
  createWithAttachments: (data: Prisma.ReportUncheckedCreateInput, attachments: Array<{ id: string; fileName: string; fileUrl: string; mimeType?: string; fileSize?: number }>) => prisma.$transaction(async (tx) => {
    const report = await tx.report.create({ data });
    if (attachments.length) await tx.reportAttachment.createMany({ data: attachments.map((file) => ({ ...file, reportId: report.id })) });
    return tx.report.findUniqueOrThrow({ where: { id: report.id }, include: { project: true, employee: true, attachments: true, activityEvents: true } });
  }).then(serializeReport),
  update: (id: string, data: Prisma.ReportUncheckedUpdateInput) => prisma.report.update({ where: { id }, data }).then(serialize),
  updateWithAttachments: (id: string, data: Prisma.ReportUncheckedUpdateInput, attachments?: Array<{ id: string; fileName: string; fileUrl: string; mimeType?: string; fileSize?: number }>) => prisma.$transaction(async (tx) => {
    await tx.report.update({ where: { id }, data });
    if (attachments) {
      await tx.reportAttachment.deleteMany({ where: { reportId: id } });
      if (attachments.length) await tx.reportAttachment.createMany({ data: attachments.map((file) => ({ ...file, reportId: id })) });
    }
    return tx.report.findUniqueOrThrow({ where: { id }, include: { project: true, employee: true, attachments: true, activityEvents: true } });
  }).then(serializeReport),
  delete: (id: string) => prisma.$transaction(async (tx) => { await tx.reportAttachment.deleteMany({ where: { reportId: id } }); await tx.reportActivityEvent.deleteMany({ where: { reportId: id } }); return tx.report.delete({ where: { id } }); }),
};

type ManufacturingOperationForFinance = Prisma.ManufacturingOperationGetPayload<object>;
const syncManufacturingFinance = async (tx: Prisma.TransactionClient, operation: ManufacturingOperationForFinance) => {
  const financeId = `auto-mfg-cost-${operation.id}`;
  const totalCost = new Prisma.Decimal(operation.cost).plus(new Prisma.Decimal(operation.materialCost));
  if (totalCost.lte(0) || operation.status === 'cancelled') { await tx.financeTransaction.deleteMany({ where: { id: financeId } }); return; }
  await tx.financeTransaction.upsert({
    where: { id: financeId },
    create: { id: financeId, number: `AUTO-MFG-${operation.id}`, name: `تكلفة التصنيع ${operation.code}`, type: 'manufacturing_cost', category: 'manufacturing', projectId: operation.projectId, employeeId: operation.employeeId, manufacturingOperationId: operation.id, amount: totalCost, currency: operation.currency, date: operation.startDate, dueDate: operation.expectedEndDate, status: operation.status === 'completed' ? 'completed' : 'pending', paymentMethod: 'تكلفة تصنيع', description: `تكلفة التصنيع ${operation.name}`, notes: 'قيد تلقائي من عملية التصنيع.' },
    update: { amount: totalCost, projectId: operation.projectId, employeeId: operation.employeeId, date: operation.startDate, dueDate: operation.expectedEndDate, status: operation.status === 'completed' ? 'completed' : 'pending' },
  });
};

const manufacturingMaterials = (items: Array<{ id?: string; productId: string; requiredQuantity: number; usedQuantity: number; unit?: string }>) => items.map((item) => ({ id: item.id || randomUUID(), productId: item.productId, requiredQuantity: new Prisma.Decimal(item.requiredQuantity), usedQuantity: new Prisma.Decimal(item.usedQuantity), unit: item.unit || '', }));

export const manufacturingRepository = {
  list: () => prisma.manufacturingOperation.findMany({ include: { project: true, employee: true, materials: { include: { product: true } }, stages: true, financeTransactions: true }, orderBy: { createdAt: 'desc' } }).then(serialize),
  findById: (id: string) => prisma.manufacturingOperation.findUnique({ where: { id }, include: { project: true, employee: true, materials: { include: { product: true } }, stages: true, stockMovements: true, financeTransactions: true } }).then(serialize),
  saveWithMaterials: (data: Prisma.ManufacturingOperationUncheckedCreateInput | Prisma.ManufacturingOperationUncheckedUpdateInput, materials: Array<{ id?: string; productId: string; requiredQuantity: number; usedQuantity: number; unit?: string }>, employeeId: string, id?: string) => prisma.$transaction(async (tx) => {
    const previous = id ? await tx.manufacturingOperation.findUniqueOrThrow({ where: { id }, include: { materials: true } }) : null;
    const operation = id ? await tx.manufacturingOperation.update({ where: { id }, data }) : await tx.manufacturingOperation.create({ data: data as Prisma.ManufacturingOperationUncheckedCreateInput });
    const previousByProduct = new Map<string, Prisma.Decimal>();
    for (const item of previous?.materials ?? []) if (item.productId) previousByProduct.set(item.productId, (previousByProduct.get(item.productId) ?? new Prisma.Decimal(0)).plus(item.usedQuantity));
    const next = manufacturingMaterials(materials);
    const nextByProduct = new Map<string, Prisma.Decimal>();
    for (const item of next) nextByProduct.set(item.productId, (nextByProduct.get(item.productId) ?? new Prisma.Decimal(0)).plus(item.usedQuantity));
    const productIds = new Set([...previousByProduct.keys(), ...nextByProduct.keys()]);
    let materialCost = new Prisma.Decimal(0);
    for (const item of next) { const product = await tx.warehouseProduct.findUniqueOrThrow({ where: { id: item.productId }, select: { purchasePrice: true } }); materialCost = materialCost.plus(new Prisma.Decimal(product.purchasePrice).mul(item.usedQuantity)); }
    for (const productId of productIds) {
      const oldQty = previousByProduct.get(productId) ?? new Prisma.Decimal(0); const newQty = nextByProduct.get(productId) ?? new Prisma.Decimal(0); const delta = newQty.minus(oldQty);
      if (delta.isZero()) continue;
      const result = await tx.warehouseProduct.updateMany({ where: { id: productId, ...(delta.gt(0) ? { currentQuantity: { gte: delta } } : {}) }, data: { currentQuantity: { increment: delta.negated() } } });
      if (result.count !== 1) throw new Error('INSUFFICIENT_STOCK');
      await tx.stockMovement.create({ data: { id: randomUUID(), number: `MFG-WH-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, productId, type: delta.gt(0) ? 'out' : 'return', quantity: delta.abs(), date: new Date(), employeeId, reason: id ? 'تحديث مواد التصنيع' : 'صرف مواد للتصنيع', manufacturingOperationId: operation.id } });
    }
    await tx.manufacturingOperation.update({ where: { id: operation.id }, data: { materialCost } });
    await tx.manufacturingMaterial.deleteMany({ where: { manufacturingOperationId: operation.id } });
    for (const item of next) { const product = await tx.warehouseProduct.findUniqueOrThrow({ where: { id: item.productId }, select: { purchasePrice: true, code: true } }); await tx.manufacturingMaterial.create({ data: { id: item.id, manufacturingOperationId: operation.id, productId: item.productId, productCode: product.code, requiredQuantity: item.requiredQuantity, usedQuantity: item.usedQuantity, unit: item.unit, cost: new Prisma.Decimal(product.purchasePrice).mul(item.usedQuantity), currency: operation.currency } }); }
    await syncManufacturingFinance(tx, { ...operation, materialCost });
    return tx.manufacturingOperation.findUniqueOrThrow({ where: { id: operation.id }, include: { project: true, employee: true, materials: { include: { product: true } }, stages: true, stockMovements: true, financeTransactions: true } });
  }).then(serialize),
  create: (data: Prisma.ManufacturingOperationUncheckedCreateInput) => prisma.$transaction(async (tx) => { const operation = await tx.manufacturingOperation.create({ data }); await syncManufacturingFinance(tx, operation); return tx.manufacturingOperation.findUniqueOrThrow({ where: { id: operation.id }, include: { project: true, employee: true, materials: { include: { product: true } }, stages: true, financeTransactions: true } }); }).then(serialize),
  update: (id: string, data: Prisma.ManufacturingOperationUncheckedUpdateInput) => prisma.$transaction(async (tx) => { const operation = await tx.manufacturingOperation.update({ where: { id }, data }); await syncManufacturingFinance(tx, operation); return tx.manufacturingOperation.findUniqueOrThrow({ where: { id }, include: { project: true, employee: true, materials: { include: { product: true } }, stages: true, financeTransactions: true } }); }).then(serialize),
  delete: (id: string, employeeId?: string) => prisma.$transaction(async (tx) => { const operation = await tx.manufacturingOperation.findUniqueOrThrow({ where: { id }, include: { materials: true } }); if (employeeId) for (const item of operation.materials) if (item.productId && item.usedQuantity.gt(0)) { await tx.warehouseProduct.update({ where: { id: item.productId }, data: { currentQuantity: { increment: item.usedQuantity } } }); await tx.stockMovement.create({ data: { id: randomUUID(), number: `MFG-RET-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, productId: item.productId, type: 'return', quantity: item.usedQuantity, date: new Date(), employeeId, reason: 'عكس مواد تصنيع محذوفة', manufacturingOperationId: id } }); } await tx.financeTransaction.deleteMany({ where: { id: `auto-mfg-cost-${id}` } }); return tx.manufacturingOperation.delete({ where: { id } }); }),
};

export const financeRepository = {
  list: () => prisma.financeTransaction.findMany({ include: { project: true, client: true, supplier: true, employee: true, supply: true }, orderBy: { date: 'desc' } }).then(serialize),
  findById: (id: string) => prisma.financeTransaction.findUnique({ where: { id }, include: { project: true, client: true, supplier: true, employee: true, supply: true } }).then(serialize),
  create: (data: Prisma.FinanceTransactionUncheckedCreateInput) => prisma.financeTransaction.create({ data }).then(serialize),
  update: (id: string, data: Prisma.FinanceTransactionUncheckedUpdateInput) => prisma.financeTransaction.update({ where: { id }, data }).then(serialize),
  delete: (id: string) => prisma.financeTransaction.delete({ where: { id } }),
};

export const payrollRepository = {
  list: () => prisma.payrollRecord.findMany({ include: { employee: true, financeTransaction: true }, orderBy: { periodEnd: 'desc' } }).then(serialize),
  findById: (id: string) => prisma.payrollRecord.findUnique({ where: { id }, include: { employee: true, financeTransaction: true } }).then(serialize),
  save: (data: Prisma.PayrollRecordUncheckedCreateInput | Prisma.PayrollRecordUncheckedUpdateInput, id?: string) => prisma.$transaction(async (tx) => {
    const basic = new Prisma.Decimal(String(data.basicSalary ?? 0)); const allowances = new Prisma.Decimal(String(data.allowances ?? 0)); const deductions = new Prisma.Decimal(String(data.deductions ?? 0)); const netSalary = basic.plus(allowances).minus(deductions); if (netSalary.lt(0)) throw new Error('INVALID_DATA');
    const payroll = id ? await tx.payrollRecord.update({ where: { id }, data: { ...data, netSalary } }) : await tx.payrollRecord.create({ data: { ...(data as Prisma.PayrollRecordUncheckedCreateInput), netSalary } });
    const financeId = `auto-payroll-${payroll.id}`;
    if (payroll.status === 'cancelled' || netSalary.lte(0)) await tx.financeTransaction.deleteMany({ where: { id: financeId } });
    else await tx.financeTransaction.upsert({ where: { id: financeId }, create: { id: financeId, number: `AUTO-PAY-${payroll.number}`, name: `راتب ${payroll.employeeId} ${payroll.number}`, type: 'salary', category: 'salaries', employeeId: payroll.employeeId, payrollId: payroll.id, amount: netSalary, currency: 'EGP', date: payroll.periodEnd, dueDate: payroll.periodEnd, status: payroll.status === 'paid' ? 'completed' : 'due', paymentMethod: payroll.paymentMethod || 'تحويل بنكي', description: `راتب عن الفترة ${payroll.periodStart.toISOString().slice(0,10)} إلى ${payroll.periodEnd.toISOString().slice(0,10)}`, notes: 'قيد تلقائي من كشف الرواتب.' }, update: { employeeId: payroll.employeeId, amount: netSalary, date: payroll.periodEnd, dueDate: payroll.periodEnd, status: payroll.status === 'paid' ? 'completed' : 'due', paymentMethod: payroll.paymentMethod || 'تحويل بنكي' } });
    return tx.payrollRecord.findUniqueOrThrow({ where: { id: payroll.id }, include: { employee: true, financeTransaction: true } });
  }).then(serialize),
  delete: (id: string) => prisma.$transaction(async (tx) => { await tx.financeTransaction.deleteMany({ where: { payrollId: id } }); return tx.payrollRecord.delete({ where: { id } }); }),
};

export const companyRepository = {
  get: () => prisma.company.findFirst({ include: { values: true, documents: true, goals: true, timelineEvents: true, galleryItems: true, organizationalRoles: { include: { employee: true } } } }).then(serialize),
  getOrCreate: async () => {
    const existing = await companyRepository.get();
    if (existing) return existing;
    return prisma.company.create({ data: { id: 'company-main', name: 'YMA Group', summary: '', industry: '', foundedYear: new Date().getFullYear(), headquarters: '', email: null, phone: null, address: null, logoUrl: null }, include: { values: true, documents: true, goals: true, timelineEvents: true, galleryItems: true, organizationalRoles: { include: { employee: true } } } }).then(serialize);
  },
  update: (id: string, data: Prisma.CompanyUncheckedUpdateInput) => prisma.company.update({ where: { id }, data }).then(serialize),
};

export const activityRepository = {
  list: () => prisma.activityLog.findMany({ include: { user: { select: { id: true, name: true, roleId: true } } }, orderBy: { createdAt: 'desc' } }).then(serialize),
  create: (data: Prisma.ActivityLogUncheckedCreateInput) => prisma.activityLog.create({ data }).then(serialize),
  delete: (id: string) => prisma.activityLog.delete({ where: { id } }),
  deleteAll: () => prisma.activityLog.deleteMany(),
};

export const notificationsRepository = {
  listForUser: (userId: string) => prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }).then(serialize),
  notifyAdmins: (data: { title: string; description: string; href: string }) => prisma.user.findMany({ where: { roleId: 'admin', status: 'active' }, select: { id: true } }).then((admins) => admins.length ? prisma.notification.createMany({ data: admins.map(({ id }) => ({ id: randomUUID(), userId: id, title: data.title, description: data.description, href: data.href })) }) : { count: 0 }),
  markRead: (userId: string, id: string) => prisma.notification.updateMany({ where: { id, userId }, data: { read: true } }),
  markAllRead: (userId: string) => prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } }),
};
