import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { AuthorizationError, requirePermission } from '@/lib/auth/authorization';
import type { PermissionSection } from '@/types/permissions';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { logActivity } from '@/lib/activity-log';
import { serialize } from '@/lib/repositories/prisma';
import { activityRepository, clientsRepository, companyRepository, employeesRepository, financeRepository, manufacturingRepository, payrollRepository, projectsRepository, reportsRepository, suppliersRepository, suppliesRepository, usersRepository, warehouseRepository } from '@/lib/repositories/prisma';

const resourcePermissions: Record<string, PermissionSection> = {
  clients: 'clients-suppliers',
  suppliers: 'clients-suppliers',
  employees: 'employees',
  projects: 'projects',
  supplies: 'supplies',
  company: 'company',
  products: 'warehouse',
  movements: 'warehouse',
  reports: 'reports',
  manufacturing: 'manufacturing',
  finance: 'finance',
  payroll: 'finance',
  users: 'settings',
  activity: 'activity',
};

const permissionForResource = (resource: string): PermissionSection => {
  const permission = resourcePermissions[resource];

  if (!permission) {
    throw new Error('NOT_FOUND');
  }

  return permission;
};

const idFor = (body: Record<string, unknown>) => typeof body.id === 'string' && body.id ? body.id : randomUUID();
const date = (value: unknown) => typeof value === 'string' && value ? new Date(value) : undefined;
const text = (value: unknown) => typeof value === 'string' ? value : undefined;
const nullableText = (value: unknown) => { const v = text(value)?.trim(); return v ? v : undefined; };
const numberValue = (value: unknown) => typeof value === 'number' ? value : typeof value === 'string' && value ? Number(value) : undefined;
const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const userRoles = new Set(['admin', 'manager', 'employee', 'viewer']);
const userStatuses = new Set(['active', 'inactive', 'suspended']);
const fields = (body: Record<string, unknown>, names: string[]) => Object.fromEntries(names.filter((name) => body[name] !== undefined).map((name) => [name, body[name]]));
const reportAttachments = (body: Record<string, unknown>) => Array.isArray(body.attachments) ? body.attachments.flatMap((item) => {
  if (!item || typeof item !== 'object') return [];
  const value = item as Record<string, unknown>;
  if (typeof value.name !== 'string' || typeof value.url !== 'string') return [];
  return [{ id: typeof value.id === 'string' && value.id ? value.id : randomUUID(), fileName: value.name, fileUrl: value.url, mimeType: text(value.mimeType) ?? undefined, fileSize: numberValue(value.fileSize) }];
}) : [];

const supplyItems = (body: Record<string, unknown>) => Array.isArray(body.items) ? body.items.flatMap((item) => {
  if (!item || typeof item !== 'object') return [];
  const value = item as Record<string, unknown>;
  if (typeof value.productId !== 'string' || !value.productId) return [];
  return [{ id: typeof value.id === 'string' && value.id ? value.id : randomUUID(), productId: value.productId, productName: text(value.productName) ?? '', quantity: numberValue(value.quantity) ?? 0, costPrice: numberValue(value.costPrice) ?? 0, sellingPrice: numberValue(value.sellingPrice) ?? 0, totalCost: numberValue(value.totalCost) ?? 0, totalSellingPrice: numberValue(value.totalSellingPrice) ?? 0, profit: numberValue(value.profit) ?? 0 }];
}) : [];

const mutationModule = (resource: string) => resource === 'clients' || resource === 'suppliers' ? 'clients-suppliers' : resource === 'users' ? 'settings' : resource === 'payroll' ? 'finance' : resource as 'projects' | 'reports' | 'employees' | 'warehouse' | 'manufacturing' | 'finance' | 'company' | 'supplies';
const recordMutation = async (resource: string, action: 'created' | 'updated' | 'deleted' | 'changed_permissions', id: string) => {
  await logActivity({ action, module: mutationModule(resource), entityType: resource === 'products' ? 'warehouse_product' : resource, entityId: id, description: `${action} ${resource}` });
};

function errorResponse(error: unknown) {
  if (error instanceof AuthorizationError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') return NextResponse.json({ error: 'الكمية المتاحة غير كافية' }, { status: 409 });
  if (error instanceof Error && error.message === 'EMPLOYEE_LINK_REQUIRED') return NextResponse.json({ error: 'يجب ربط المستخدم بموظف قبل تسجيل حركة مخزون' }, { status: 422 });
  if (error instanceof Error && error.message === 'PASSWORD_REQUIRED') return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 422 });
  if (error instanceof Error && error.message === 'INVALID_PERMISSION') return NextResponse.json({ error: 'صلاحية غير صحيحة' }, { status: 422 });
  if (error instanceof Error && error.message === 'INVALID_EMAIL') return NextResponse.json({ error: 'البريد الإلكتروني غير صحيح' }, { status: 422 });
  if (error instanceof Error && error.message === 'INVALID_ROLE') return NextResponse.json({ error: 'الدور المحدد غير صحيح' }, { status: 422 });
  if (error instanceof Error && error.message === 'INVALID_STATUS') return NextResponse.json({ error: 'حالة الحساب غير صحيحة' }, { status: 422 });
  if (error instanceof Error && error.message === 'ADMIN_EMPLOYEE_DELETE_FORBIDDEN') return NextResponse.json({ error: 'لا يمكن حذف موظف مرتبط بحساب مدير نظام' }, { status: 403 });
  if (error instanceof Error && error.message === 'EMPLOYEE_HAS_LINKED_RECORDS') return NextResponse.json({ error: 'لا يمكن حذف الموظف لوجود سجلات مرتبطة به' }, { status: 409 });
  if (error instanceof Error && error.message === 'INVALID_DATA') return NextResponse.json({ error: 'توجد بيانات ناقصة أو غير صحيحة' }, { status: 422 });
  if (error instanceof Error && error.message === 'NOT_FOUND') return NextResponse.json({ error: 'العنصر المطلوب غير موجود' }, { status: 404 });
  if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'P2002') return NextResponse.json({ error: 'هناك سجل موجود بالفعل بهذه البيانات' }, { status: 409 });
  if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'P2003') return NextResponse.json({ error: 'لا يمكن تنفيذ العملية بسبب بيانات مرتبطة بسجلات أخرى' }, { status: 409 });
  if (error instanceof Error && error.message === 'LAST_ACTIVE_ADMIN') return NextResponse.json({ error: 'لا يمكن إزالة آخر مدير نظام نشط' }, { status: 409 });
  console.error('API data operation failed', error);
  return NextResponse.json({ error: 'تعذر تنفيذ العملية' }, { status: 500 });
}

async function list(resource: string) {
  switch (resource) {
    case 'clients': return clientsRepository.list();
    case 'suppliers': return suppliersRepository.list();
    case 'employees': return employeesRepository.list();
    case 'projects': return projectsRepository.list();
    case 'supplies': return suppliesRepository.list();
    case 'products': return warehouseRepository.products.list();
    case 'movements': return warehouseRepository.movements.list();
    case 'reports': return reportsRepository.list();
    case 'manufacturing': return manufacturingRepository.list();
    case 'finance': return financeRepository.list();
    case 'payroll': return payrollRepository.list();
    case 'users': await usersRepository.ensureEmployeeLinks(); return usersRepository.list();
    case 'activity': return activityRepository.list();
    case 'company': return companyRepository.getOrCreate();
    default: throw new Error('NOT_FOUND');
  }
}

async function create(resource: string, body: Record<string, unknown>, employeeId?: string) {
  const id = idFor(body);
  switch (resource) {
    case 'clients': return clientsRepository.create({ id, code: text(body.code) ?? `CL-${Date.now()}`, name: text(body.name) ?? '', company: text(body.company) ?? '', email: text(body.email) ?? '', phone: text(body.phone) ?? '', address: text(body.address), clientType: text(body.clientType), notes: text(body.notes), dateAdded: date(body.dateAdded) ?? new Date(), status: text(body.status) ?? 'active' });
    case 'suppliers': return suppliersRepository.create({ id, code: text(body.code) ?? `SUP-${Date.now()}`, name: text(body.name) ?? '', company: text(body.company), contactName: text(body.contactName) ?? '', email: text(body.email) ?? '', phone: text(body.phone) ?? '', address: text(body.address), productsSnapshot: text(body.products) ?? text(body.productsSnapshot), dateAdded: date(body.dateAdded) ?? new Date(), status: text(body.status) ?? 'pending', notes: text(body.notes) });
    case 'employees': return employeesRepository.create({ id, code: text(body.code) ?? `EMP-${Date.now()}`, fullName: text(body.fullName) ?? '', email: text(body.email) ?? '', phone: text(body.phone) ?? '', role: text(body.role) ?? '', department: text(body.department) ?? '', hireDate: date(body.hireDate), salary: numberValue(body.salary), status: text(body.status) ?? 'active', imageUrl: text(body.imageUrl), notes: text(body.notes) });
    case 'projects': return projectsRepository.create({ id, code: text(body.code) ?? `PRJ-${Date.now()}`, name: text(body.name) ?? '', description: text(body.description), clientId: text(body.clientId), managerId: text(body.managerId), status: text(body.status) ?? 'new', budget: numberValue(body.budget) ?? 0, progress: numberValue(body.progress) ?? 0, startDate: date(body.startDate) ?? new Date(), dueDate: date(body.dueDate) ?? new Date() });
    case 'supplies': {
      if (body.inventoryApplied && !employeeId) throw new Error('EMPLOYEE_LINK_REQUIRED');
      return suppliesRepository.saveWithInventory({ id, supplyNumber: text(body.supplyNumber) ?? `SUPPLY-${Date.now()}`, clientId: text(body.clientId) ?? '', projectId: text(body.projectId), date: date(body.date) ?? new Date(), status: text(body.status) ?? 'draft', subtotalCost: numberValue(body.subtotalCost) ?? 0, subtotalSellingPrice: numberValue(body.subtotalSellingPrice) ?? 0, totalCost: numberValue(body.totalCost) ?? 0, totalSellingPrice: numberValue(body.totalSellingPrice) ?? 0, totalProfit: numberValue(body.totalProfit) ?? 0, paymentStatus: text(body.paymentStatus) ?? 'pending', paidAmount: numberValue(body.paidAmount) ?? 0, notes: text(body.notes), inventoryApplied: Boolean(body.inventoryApplied) }, supplyItems(body), employeeId ?? '');
    }
    case 'products': return warehouseRepository.products.create({ id, code: text(body.code) ?? `PRD-${Date.now()}`, name: text(body.name) ?? '', category: text(body.category) ?? '', description: text(body.description), currentQuantity: numberValue(body.currentQuantity) ?? 0, minimumQuantity: numberValue(body.minimumQuantity) ?? 0, unit: text(body.unit) ?? '', purchasePrice: numberValue(body.purchasePrice) ?? 0, sellingPrice: numberValue(body.sellingPrice), currency: text(body.currency) ?? 'EGP', storageLocation: text(body.storageLocation) ?? '', supplierId: nullableText(body.supplierId), supplierNameSnapshot: text(body.supplier), imageUrl: text(body.imageUrl) });
    case 'movements': if (!employeeId) throw new Error('EMPLOYEE_LINK_REQUIRED'); const movementType = (text(body.type) ?? 'adjustment') as 'in' | 'out' | 'return' | 'adjustment'; if ((movementType === 'out' || movementType === 'return') && !nullableText(body.clientId)) throw new Error('INVALID_DATA'); return warehouseRepository.movements.create({ id, number: text(body.number), productId: text(body.productId) ?? '', clientId: nullableText(body.clientId), type: movementType, quantity: numberValue(body.quantity) ?? 0, date: date(body.date) ?? new Date(), employeeId, reason: text(body.reason) ?? '', supplierId: nullableText(body.supplierId), unitCost: numberValue(body.unitCost), sellingPrice: numberValue(body.sellingPrice), notes: text(body.notes), supplyId: nullableText(body.supplyId), manufacturingOperationId: nullableText(body.manufacturingOperationId) });
    case 'reports': return reportsRepository.createWithAttachments({ id, code: text(body.code) ?? `REP-${Date.now()}`, title: text(body.title) ?? '', type: text(body.type) ?? '', projectId: text(body.projectId), employeeId: text(body.employeeId), description: text(body.description), content: text(body.content), status: text(body.status) ?? 'draft' }, reportAttachments(body));
    case 'manufacturing': { if (!employeeId) throw new Error('EMPLOYEE_LINK_REQUIRED'); const materials = Array.isArray(body.materials) ? body.materials.flatMap((item) => { if (!item || typeof item !== 'object') return []; const v = item as Record<string, unknown>; const productId = text(v.productId); if (!productId) return []; return [{ id: text(v.id), productId, requiredQuantity: numberValue(v.requiredQuantity) ?? 0, usedQuantity: numberValue(v.usedQuantity) ?? 0, unit: text(v.unit) ?? '' }]; }) : []; return manufacturingRepository.saveWithMaterials({ id, code: text(body.code) ?? `MFG-${Date.now()}`, name: text(body.name) ?? '', description: text(body.description), projectId: text(body.projectId) ?? '', employeeId: text(body.employeeId) ?? '', status: text(body.status) ?? 'planned', progress: numberValue(body.progress) ?? 0, cost: numberValue(body.cost) ?? 0, materialCost: 0, currency: text(body.currency) ?? 'EGP', startDate: date(body.startDate) ?? new Date(), expectedEndDate: date(body.expectedEndDate) ?? new Date() }, materials, employeeId); }
    case 'finance': { const amount = numberValue(body.amount); const operationName = nullableText(body.name); const operationType = nullableText(body.type); const category = nullableText(body.category); if (!operationName || !operationType || !category || amount === undefined || !Number.isFinite(amount) || amount <= 0) throw new Error('INVALID_DATA'); const operationDate = date(body.date); if (!operationDate || Number.isNaN(operationDate.getTime())) throw new Error('INVALID_DATA'); const generatedNumber = `FIN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; return financeRepository.create({ id, number: nullableText(body.number) ?? generatedNumber, name: operationName, type: operationType, category, projectId: nullableText(body.projectId), clientId: nullableText(body.clientId), supplierId: nullableText(body.supplierId), employeeId: nullableText(body.employeeId), supplyId: nullableText(body.supplyId), manufacturingOperationId: nullableText(body.manufacturingOperationId), stockMovementId: nullableText(body.stockMovementId), supplierNameSnapshot: nullableText(body.supplier), amount, currency: nullableText(body.currency) ?? 'EGP', date: operationDate, dueDate: nullableText(body.dueDate) ? date(body.dueDate) : undefined, status: nullableText(body.status) ?? 'pending', paymentMethod: nullableText(body.paymentMethod), description: nullableText(body.description), notes: nullableText(body.notes) }); }
    case 'payroll': return payrollRepository.save({ id, number: text(body.number) ?? `PAY-${Date.now()}`, employeeId: text(body.employeeId) ?? '', periodStart: date(body.periodStart) ?? new Date(), periodEnd: date(body.periodEnd) ?? new Date(), basicSalary: numberValue(body.basicSalary) ?? 0, allowances: numberValue(body.allowances) ?? 0, deductions: numberValue(body.deductions) ?? 0, netSalary: numberValue(body.netSalary) ?? 0, status: text(body.status) ?? 'draft', paymentMethod: text(body.paymentMethod), paidAt: date(body.paidAt), notes: text(body.notes) });
    case 'users': {
      const password = text(body.temporaryPassword) ?? text(body.password);
      if (!password) throw new Error('PASSWORD_REQUIRED');
      const name = text(body.name) ?? '';
      const email = text(body.email)?.toLowerCase() ?? '';
      const phone = text(body.phone) ?? '';
      const job = text(body.job) ?? '';
      const roleId = text(body.roleId) ?? 'employee';
      const status = text(body.status) ?? 'active';
      const employeeId = text(body.employeeId);
      if (!name.trim() || !email || !validEmail(email) || !phone.trim()) throw new Error('INVALID_DATA');
      if (!userRoles.has(roleId)) throw new Error('INVALID_ROLE');
      if (!userStatuses.has(status)) throw new Error('INVALID_STATUS');
      const result = await prisma.$transaction(async (tx) => {
        let linkedEmployeeId = employeeId;
        if (!linkedEmployeeId) {
          const employee = await tx.employee.create({ data: { id: randomUUID(), code: `EMP-${Date.now()}`, fullName: name, email, phone, role: job || roleId, department: 'عام', status: status === 'active' ? 'active' : 'inactive', imageUrl: text(body.imageUrl) } });
          linkedEmployeeId = employee.id;
        }
        const user = await tx.user.create({ data: { id, name, email, passwordHash: await hashPassword(password), roleId, employeeId: linkedEmployeeId, status, imageUrl: text(body.imageUrl), phone, job } });
        return user;
      });
      await usersRepository.setPermissionOverrides(id, typeof body.permissionOverrides === 'object' && body.permissionOverrides ? Object.fromEntries(Object.entries(body.permissionOverrides).map(([key, value]) => [key, value ? 'allow' : 'deny'])) : {});
      return usersRepository.findById(result.id);
    }
    default: throw new Error('NOT_FOUND');
  }
}

async function update(resource: string, id: string, body: Record<string, unknown>, employeeId?: string) {
  switch (resource) {
    case 'clients': return clientsRepository.update(id, fields(body, ['name', 'company', 'email', 'phone', 'address', 'clientType', 'notes', 'status']));
    case 'suppliers': return suppliersRepository.update(id, { ...fields(body, ['name', 'company', 'contactName', 'email', 'phone', 'address', 'productsSnapshot', 'status', 'notes']), ...(body.products !== undefined ? { productsSnapshot: body.products } : {}) });
    case 'employees': return employeesRepository.update(id, { ...fields(body, ['fullName', 'email', 'phone', 'role', 'department', 'salary', 'status', 'imageUrl', 'notes']), ...(body.hireDate !== undefined ? { hireDate: text(body.hireDate) ? date(body.hireDate) : null } : {}) });
    case 'projects': return projectsRepository.update(id, { ...fields(body, ['name', 'description', 'clientId', 'managerId', 'status', 'budget', 'progress']), ...(body.startDate !== undefined ? { startDate: date(body.startDate) } : {}), ...(body.dueDate !== undefined ? { dueDate: date(body.dueDate) } : {}) });
    case 'supplies': {
      if (body.inventoryApplied && !employeeId) throw new Error('EMPLOYEE_LINK_REQUIRED');
      return suppliesRepository.saveWithInventory({ ...fields(body, ['projectId', 'status', 'paymentStatus', 'paidAmount', 'notes', 'inventoryApplied', 'clientId', 'subtotalCost', 'subtotalSellingPrice', 'totalCost', 'totalSellingPrice', 'totalProfit']), ...(body.date !== undefined ? { date: date(body.date) } : {}) }, supplyItems(body), employeeId ?? '', id);
    }
    case 'products': return warehouseRepository.products.update(id, fields(body, ['name', 'category', 'description', 'currentQuantity', 'minimumQuantity', 'unit', 'purchasePrice', 'sellingPrice', 'currency', 'storageLocation', 'supplierId', 'supplierNameSnapshot', 'imageUrl']));
    case 'reports': return reportsRepository.updateWithAttachments(id, fields(body, ['title', 'type', 'projectId', 'employeeId', 'description', 'content', 'status']), body.attachments !== undefined ? reportAttachments(body) : undefined);
    case 'manufacturing': { if (!employeeId) throw new Error('EMPLOYEE_LINK_REQUIRED'); const materials = Array.isArray(body.materials) ? body.materials.flatMap((item) => { if (!item || typeof item !== 'object') return []; const v = item as Record<string, unknown>; const productId = text(v.productId); if (!productId) return []; return [{ id: text(v.id), productId, requiredQuantity: numberValue(v.requiredQuantity) ?? 0, usedQuantity: numberValue(v.usedQuantity) ?? 0, unit: text(v.unit) ?? '' }]; }) : []; return manufacturingRepository.saveWithMaterials({ ...fields(body, ['name', 'description', 'projectId', 'employeeId', 'status', 'progress', 'cost', 'currency']), ...(body.startDate !== undefined ? { startDate: date(body.startDate) } : {}), ...(body.expectedEndDate !== undefined ? { expectedEndDate: date(body.expectedEndDate) } : {}) }, materials, employeeId, id); }
    case 'finance': { const patch = fields(body, ['name', 'type', 'category', 'amount', 'currency', 'status', 'paymentMethod', 'description', 'notes']); for (const key of ['projectId','clientId','supplierId','employeeId','supplyId','manufacturingOperationId','stockMovementId'] as const) if (body[key] !== undefined) (patch as Record<string, unknown>)[key] = nullableText(body[key]) ?? null; if (body.supplier !== undefined) (patch as Record<string, unknown>).supplierNameSnapshot = nullableText(body.supplier) ?? null; if (body.date !== undefined) (patch as Record<string, unknown>).date = date(body.date); if (body.dueDate !== undefined) (patch as Record<string, unknown>).dueDate = nullableText(body.dueDate) ? date(body.dueDate) : null; if (patch.amount !== undefined && (!Number.isFinite(Number(patch.amount)) || Number(patch.amount) <= 0)) throw new Error('INVALID_DATA'); return financeRepository.update(id, patch as Prisma.FinanceTransactionUncheckedUpdateInput); }
    case 'payroll': return payrollRepository.save({ ...fields(body, ['employeeId', 'basicSalary', 'allowances', 'deductions', 'status', 'paymentMethod', 'notes']), ...(body.periodStart !== undefined ? { periodStart: date(body.periodStart) } : {}), ...(body.periodEnd !== undefined ? { periodEnd: date(body.periodEnd) } : {}), ...(body.paidAt !== undefined ? { paidAt: date(body.paidAt) } : {}) }, id);
    case 'users': {
      const password = text(body.temporaryPassword) ?? text(body.password);
      const existing = await usersRepository.findById(id);
      const nextRoleId = text(body.roleId) ?? existing?.roleId;
      const nextStatus = text(body.status) ?? existing?.status;
      if (!existing) throw new Error('NOT_FOUND');
      if (body.name !== undefined && !text(body.name)?.trim()) throw new Error('INVALID_DATA');
      if (body.email !== undefined && (!text(body.email) || !validEmail(text(body.email)!))) throw new Error('INVALID_EMAIL');
      if (nextRoleId && !userRoles.has(nextRoleId)) throw new Error('INVALID_ROLE');
      if (nextStatus && !userStatuses.has(nextStatus)) throw new Error('INVALID_STATUS');
      if (existing?.roleId === 'admin' && existing.status === 'active' && (nextRoleId !== 'admin' || nextStatus !== 'active') && await usersRepository.countActiveAdmins() <= 1) {
        throw new Error('LAST_ACTIVE_ADMIN');
      }
      const data = { ...fields(body, ['name', 'email', 'roleId', 'employeeId', 'status', 'imageUrl', 'phone', 'job']), ...(password ? { passwordHash: await hashPassword(password) } : {}) };
      const updated = await usersRepository.update(id, data);
      const linkedEmployeeId = text(body.employeeId) ?? existing?.employeeId;
      if (linkedEmployeeId) {
        await employeesRepository.update(linkedEmployeeId, { ...(text(body.name) !== undefined ? { fullName: text(body.name)! } : {}), ...(text(body.email) !== undefined ? { email: text(body.email)! } : {}), ...(text(body.phone) !== undefined ? { phone: text(body.phone)! } : {}), ...(text(body.job) !== undefined ? { role: text(body.job)! } : {}), ...(text(body.imageUrl) !== undefined ? { imageUrl: text(body.imageUrl) } : {}), ...(text(body.status) !== undefined ? { status: text(body.status) === 'active' ? 'active' : 'inactive' } : {}) });
      }
      if (body.permissionOverrides !== undefined) await usersRepository.setPermissionOverrides(id, typeof body.permissionOverrides === 'object' && body.permissionOverrides ? Object.fromEntries(Object.entries(body.permissionOverrides).map(([key, value]) => [key, value ? 'allow' : 'deny'])) : {});
      return usersRepository.findById(updated.id);
    }
    case 'company': {
      const companyData = fields(body, ['name', 'summary', 'industry', 'foundedYear', 'headquarters', 'email', 'phone', 'address', 'logoUrl', 'vision', 'mission']);
      const hasSections = ['values', 'documents', 'goals', 'timelineEvents', 'galleryItems'].some((key) => body[key] !== undefined);
      if (!hasSections) return companyRepository.update(id, companyData);
      return prisma.$transaction(async (tx) => {
        await tx.company.update({ where: { id }, data: companyData });
        if (body.values !== undefined) { const items = Array.isArray(body.values) ? body.values : []; await tx.companyValue.deleteMany({ where: { companyId: id } }); if (items.length) await tx.companyValue.createMany({ data: items.map((value) => { const v = asRecord(value); return { id: typeof v.id === 'string' && v.id ? v.id : randomUUID(), companyId: id, title: String(v.title || ''), description: String(v.description || '') }; }) }); }
        if (body.documents !== undefined) { const items = Array.isArray(body.documents) ? body.documents : []; await tx.companyDocument.deleteMany({ where: { companyId: id } }); if (items.length) await tx.companyDocument.createMany({ data: items.map((value) => { const v = asRecord(value); return { id: typeof v.id === 'string' && v.id ? v.id : randomUUID(), companyId: id, name: String(v.name || ''), type: String(v.type || 'other'), status: String(v.status || 'draft'), description: v.description ? String(v.description) : null, fileUrl: v.fileUrl ? String(v.fileUrl) : null, issueDate: v.addedAt ? date(String(v.addedAt)) : null }; }) }); }
        if (body.goals !== undefined) { const items = Array.isArray(body.goals) ? body.goals : []; await tx.companyGoal.deleteMany({ where: { companyId: id } }); if (items.length) await tx.companyGoal.createMany({ data: items.map((value) => { const v = asRecord(value); return { id: typeof v.id === 'string' && v.id ? v.id : randomUUID(), companyId: id, title: String(v.title || ''), description: String(v.description || ''), status: String(v.status || 'planned'), period: v.period ? String(v.period) : null }; }) }); }
        if (body.timelineEvents !== undefined) { const items = Array.isArray(body.timelineEvents) ? body.timelineEvents : []; await tx.companyTimelineEvent.deleteMany({ where: { companyId: id } }); if (items.length) await tx.companyTimelineEvent.createMany({ data: items.map((value) => { const v = asRecord(value); return { id: typeof v.id === 'string' && v.id ? v.id : randomUUID(), companyId: id, title: String(v.title || ''), description: String(v.description || ''), type: String(v.type || 'founding'), date: date(String(v.year || new Date().toISOString())) || new Date() }; }) }); }
        if (body.galleryItems !== undefined) { const items = Array.isArray(body.galleryItems) ? body.galleryItems : []; await tx.companyGalleryItem.deleteMany({ where: { companyId: id } }); if (items.length) await tx.companyGalleryItem.createMany({ data: items.map((value) => { const v = asRecord(value); return { id: typeof v.id === 'string' && v.id ? v.id : randomUUID(), companyId: id, title: String(v.title || ''), description: v.description ? String(v.description) : null, category: String(v.category || 'company'), imageUrl: String(v.imageUrl || '') }; }) }); }
        return tx.company.findUniqueOrThrow({ where: { id }, include: { values: true, documents: true, goals: true, timelineEvents: true, galleryItems: true, organizationalRoles: { include: { employee: true } } } });
      }).then(serialize);
    }
    default: throw new Error('NOT_FOUND');
  }
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const params = await context.params;
    const resource = params.path[0];
    await requirePermission(permissionForResource(resource), 'view');
    const id = params.path[1];
    const result = id
      ? await (async () => {
          switch (resource) {
            case 'clients': return clientsRepository.findById(id);
            case 'suppliers': return suppliersRepository.findById(id);
            case 'employees': return employeesRepository.findById(id);
            case 'projects': return projectsRepository.findById(id);
            case 'supplies': return suppliesRepository.findById(id);
            case 'products': return warehouseRepository.products.findById(id);
            case 'reports': return reportsRepository.findById(id);
            case 'manufacturing': return manufacturingRepository.findById(id);
            case 'finance': return financeRepository.findById(id);
            case 'payroll': return payrollRepository.findById(id);
            default: throw new Error('NOT_FOUND');
          }
        })()
      : await list(resource);
    return NextResponse.json(result);
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const params = await context.params;
    const resource = params.path[0];
    const user = await requirePermission(permissionForResource(resource), 'create');
    if (resource === 'payroll' && user.roleId !== 'admin') return NextResponse.json({ error: 'تسجيل الرواتب مسموح لمدير النظام فقط' }, { status: 403 });
    if (resource === 'users' && user.roleId !== 'admin') await requirePermission('settings', 'manage');
    const result = await create(resource, await request.json(), user.employeeId ?? undefined);
    if (!result) throw new Error('NOT_FOUND');
    await recordMutation(resource, 'created', result.id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const params = await context.params;
    const resource = params.path[0];
    const id = params.path[1];
    const user = await requirePermission(permissionForResource(resource), 'edit');
    if (resource === 'payroll' && user.roleId !== 'admin') return NextResponse.json({ error: 'تعديل الرواتب مسموح لمدير النظام فقط' }, { status: 403 });
    if (resource === 'users') {
      if (user.roleId !== 'admin') await requirePermission('settings', 'manage');
      const target = await usersRepository.findById(id);
      if (target?.roleId === 'admin' && target.id !== user.id) return NextResponse.json({ error: 'لا يمكن لمدير النظام تعديل بيانات مدير نظام آخر.' }, { status: 403 });
    }
    const body = await request.json();
    const result = await update(resource, id, body, user.employeeId ?? undefined);
    await recordMutation(resource, body.permissionOverrides !== undefined ? 'changed_permissions' : 'updated', id);
    return NextResponse.json(result);
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const params = await context.params;
    const resource = params.path[0];
    const id = params.path[1];
    const user = await requirePermission(permissionForResource(resource), 'delete');
    if (resource === 'payroll' && user.roleId !== 'admin') return NextResponse.json({ error: 'إدارة وحذف الرواتب مسموح لمدير النظام فقط' }, { status: 403 });
    if (resource === 'activity') {
      if (user.roleId !== 'admin') return NextResponse.json({ error: 'حذف سجل النشاط مسموح لمدير النظام فقط' }, { status: 403 });
      if (id === 'all') await activityRepository.deleteAll();
      else if (id) await activityRepository.delete(id);
      else return NextResponse.json({ error: 'معرّف النشاط غير صحيح' }, { status: 422 });
      return NextResponse.json({ success: true });
    }
    if (resource === 'users') {
      if (user.roleId !== 'admin') return NextResponse.json({ error: 'حذف المستخدمين مسموح لمدير النظام فقط' }, { status: 403 });
      const target = await usersRepository.findById(id);
      if (!target) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
      if (target.roleId === 'admin' && target.id !== user.id) return NextResponse.json({ error: 'لا يمكن لمدير النظام حذف مدير نظام آخر. يجب أن يحذف المدير حسابه بنفسه.' }, { status: 403 });
    }
    if (resource === 'employees') {
      if (user.roleId !== 'admin') return NextResponse.json({ error: 'حذف الموظفين مسموح لمدير النظام فقط' }, { status: 403 });
      const target = await employeesRepository.findById(id);
      if (!target) return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 });
      if (target.user?.roleId === 'admin') throw new Error('ADMIN_EMPLOYEE_DELETE_FORBIDDEN');
    }
    switch (resource) {
      case 'clients': await clientsRepository.delete(id); break;
      case 'suppliers': await suppliersRepository.delete(id); break;
      case 'employees': await employeesRepository.delete(id); break;
      case 'projects': await projectsRepository.delete(id); break;
      case 'supplies': if (!user.employeeId) throw new Error('EMPLOYEE_LINK_REQUIRED'); await suppliesRepository.deleteWithInventory(id, user.employeeId); break;
      case 'products': await warehouseRepository.products.delete(id); break;
      case 'reports': await reportsRepository.delete(id); break;
      case 'manufacturing': await manufacturingRepository.delete(id, user.employeeId ?? undefined); break;
      case 'finance': await financeRepository.delete(id); break;
      case 'payroll': await payrollRepository.delete(id); break;
      case 'users': await usersRepository.delete(id); break;
      default: throw new Error('NOT_FOUND');
    }
    if (!(resource === 'users' && id === user.id)) await recordMutation(resource, 'deleted', id);
    return NextResponse.json({ success: true });
  } catch (error) { return errorResponse(error); }
}
