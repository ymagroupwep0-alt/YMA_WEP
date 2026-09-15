'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Search, Trash2, Truck, Users, WalletCards } from 'lucide-react';
import { ClientFormModal } from '@/components/clients/client-form-modal';
import { ClientStatusBadge } from '@/components/clients/client-status-badge';
import { Client } from '@/data/clients';
import { Supplier } from '@/data/suppliers';
import { SupplierFormModal } from '@/components/suppliers/supplier-form-modal';
import { SupplierStatusBadge } from '@/components/suppliers/supplier-status-badge';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';
import { usePersistentList } from '@/lib/client/use-persistent-list';


type ApiClient = Client & { projects?: Array<{ id: string; name: string; status: Client['associatedProjects'][number]['status']; budget: number; dueDate: string }>; supplies?: Array<{ id: string; supplyNumber: string; date: string; totalSellingPrice: number; totalProfit: number; status: string }>; financeTransactions?: Array<{ id: string; name: string; amount: number; dueDate?: string | null }>; };
type ApiSupplier = Supplier & { productsSnapshot?: string | null; products?: Array<{ id: string; name: string }>; financeTransactions?: Array<{ id: string; name: string; amount: number; status: string; date: string }>; };

const normalizeClient = (item: ApiClient): Client => ({
  id: item.id, code: item.code, name: item.name, company: item.company, phone: item.phone, email: item.email,
  address: item.address ?? '', clientType: item.clientType ?? '', notes: item.notes ?? '', dateAdded: item.dateAdded ?? '', status: item.status,
  projectCount: item.projects?.length ?? 0, projectTotal: (item.projects ?? []).reduce((sum, project) => sum + Number(project.budget || 0), 0),
  associatedProjects: (item.projects ?? []).map((project) => ({ name: project.name, status: project.status, value: Number(project.budget || 0), dueDate: project.dueDate })),
  upcomingPayments: (item.financeTransactions ?? []).filter((payment) => payment.dueDate).map((payment) => ({ title: payment.name, amount: Number(payment.amount || 0), dueDate: payment.dueDate! })),
});

const normalizeSupplier = (item: ApiSupplier): Supplier => ({
  id: item.id, code: item.code, name: item.name, contactName: item.contactName, phone: item.phone, email: item.email,
  address: item.address ?? '', products: (item.products ?? []).map((product) => product.name).filter(Boolean).join('، ') || item.productsSnapshot || '',
  supplyCount: item.financeTransactions?.length ?? 0, totalSupplyValue: (item.financeTransactions ?? []).reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
  amountDue: (item.financeTransactions ?? []).filter((transaction) => ['pending', 'partial', 'overdue'].includes(transaction.status)).reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
  status: item.status, notes: item.notes ?? '', dateAdded: item.dateAdded ?? '', supplies: [], timeline: [],
});

const currencyFormat = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

export default function ClientsPage() {
  const { can, check } = usePermissionGuard('clients-suppliers');
  const { data: apiClients, refresh: refreshClients } = usePersistentList<ApiClient>('clients');
  const clients = useMemo(() => apiClients.map(normalizeClient), [apiClients]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { data: apiSuppliers, refresh: refreshSuppliers } = usePersistentList<ApiSupplier>('suppliers');
  const suppliers = useMemo(() => apiSuppliers.map(normalizeSupplier), [apiSuppliers]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierStatus, setSupplierStatus] = useState('all');
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [tab, setTab] = useState<'clients' | 'suppliers'>('clients');
  const [clientStatus, setClientStatus] = useState('all');

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const term = search.toLowerCase();
      return (
        (clientStatus === 'all' || client.status === clientStatus) &&
        (client.name.toLowerCase().includes(term) ||
        client.company.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term))
      );
    });
  }, [clients, search, clientStatus]);

  const filteredSuppliers = useMemo(() => suppliers.filter((supplier) => {
    const term = supplierSearch.toLowerCase();
    return (supplierStatus === 'all' || supplier.status === supplierStatus) &&
      [supplier.name, supplier.contactName, supplier.email, supplier.phone].some((value) => value.toLowerCase().includes(term));
  }), [suppliers, supplierSearch, supplierStatus]);

  const totals = useMemo(() => ({
    clientValue: clients.reduce((sum, client) => sum + client.projectTotal, 0),
    supplierValue: suppliers.reduce((sum, supplier) => sum + supplier.totalSupplyValue, 0),
    outstanding: suppliers.reduce((sum, supplier) => sum + supplier.amountDue, 0),
  }), [clients, suppliers]);

  const handleClientSubmit = async (values: Omit<Client, 'id' | 'code' | 'projectCount' | 'projectTotal' | 'associatedProjects' | 'upcomingPayments' | 'dateAdded'>) => {
    if (!check(selectedClient ? 'edit' : 'create')) return;
    const response = await fetch(selectedClient ? `/api/data/clients/${selectedClient.id}` : '/api/data/clients', { method: selectedClient ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    if (!response.ok) return;
    await response.json() as Client;
    if (selectedClient) {
      await refreshClients();
      setSelectedClient(null);
      setOpen(false);
      return;
    }
    await refreshClients();
    setOpen(false);
  };

  const handleDelete = async (clientId: string) => {
    if (!check('delete')) return;
    const response = await fetch(`/api/data/clients/${clientId}`, { method: 'DELETE' });
    if (!response.ok) return;
    await refreshClients();
  };

  const handleEdit = (client: Client) => {
    if (!check('edit')) return;
    setSelectedClient(client);
    setOpen(true);
  };

  const handleSupplierSubmit = async (values: Omit<Supplier, 'id' | 'code' | 'supplyCount' | 'totalSupplyValue' | 'amountDue' | 'supplies' | 'timeline' | 'dateAdded'>) => {
    if (!check(selectedSupplier ? 'edit' : 'create')) return;
    const response = await fetch(selectedSupplier ? `/api/data/suppliers/${selectedSupplier.id}` : '/api/data/suppliers', { method: selectedSupplier ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    if (!response.ok) return;
    await response.json() as Supplier;
    if (selectedSupplier) {
      await refreshSuppliers();
    } else {
      await refreshSuppliers();
    }
    setSupplierOpen(false);
    setSelectedSupplier(null);
  };

  const handleSupplierDelete = async (supplierId: string) => {
    if (!check('delete')) return;
    const response = await fetch(`/api/data/suppliers/${supplierId}`, { method: 'DELETE' });
    if (response.ok) await refreshSuppliers();
  };

  const confirmDelete = (message: string, action: () => void) => { if (!check('delete')) return; if (window.confirm(message)) action(); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">إدارة العلاقات التجارية</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">العملاء والموردين</h1>
          <p className="mt-2 text-sm text-slate-500">تابع العملاء والموردين والتزاماتهم التجارية من مكان واحد.</p>
        </div>

        <button
          type="button"
          disabled={!can('create')}
          onClick={() => tab === 'clients' ? (setSelectedClient(null), setOpen(true)) : (setSelectedSupplier(null), setSupplierOpen(true))}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          {tab === 'clients' ? 'إضافة عميل جديد' : 'إضافة مورد جديد'}
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button type="button" onClick={() => setTab('clients')} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${tab === 'clients' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}><Users className="h-4 w-4" /> العملاء</button>
        <button type="button" onClick={() => setTab('suppliers')} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${tab === 'suppliers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}><Truck className="h-4 w-4" /> الموردون</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[['العملاء', clients.length, 'blue'], ['الموردون', suppliers.length, 'green'], ['قيمة المشاريع', currencyFormat.format(totals.clientValue), 'violet'], ['إجمالي معاملات الموردين', currencyFormat.format(totals.supplierValue), 'green'], ['المبالغ المستحقة للموردين', currencyFormat.format(totals.outstanding), 'amber']].map(([title, value, tone]) => <div key={String(title)} className="card-surface p-5"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone === 'green' ? 'bg-emerald-50 text-emerald-600' : tone === 'violet' ? 'bg-violet-50 text-violet-600' : tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{tone === 'green' ? <Truck className="h-5 w-5" /> : tone === 'amber' ? <WalletCards className="h-5 w-5" /> : <Users className="h-5 w-5" />}</div><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}
      </div>

      <div className="card-surface p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={tab === 'clients' ? search : supplierSearch}
            onChange={(e) => tab === 'clients' ? setSearch(e.target.value) : setSupplierSearch(e.target.value)}
            placeholder={tab === 'clients' ? 'بحث باسم العميل أو الشركة أو البريد أو الهاتف...' : 'بحث باسم المورد أو الشركة أو البريد أو الهاتف...'}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>
        <select value={tab === 'clients' ? clientStatus : supplierStatus} onChange={(e) => tab === 'clients' ? setClientStatus(e.target.value) : setSupplierStatus(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 sm:w-56">
          <option value="all">كل الحالات</option>
          {(tab === 'clients' ? [['active', 'نشط'], ['inactive', 'غير نشط'], ['potential', 'محتمل']] : [['active', 'نشط'], ['inactive', 'غير نشط'], ['pending', 'قيد التقييم']]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {tab === 'clients' ? <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header px-4 py-3">كود العميل</th>
                <th className="table-header px-4 py-3">اسم العميل</th>
                <th className="table-header px-4 py-3">اسم الشركة</th>
                <th className="table-header px-4 py-3">رقم الهاتف</th>
                <th className="table-header px-4 py-3">البريد الإلكتروني</th>
                <th className="table-header px-4 py-3">عدد المشاريع</th>
                <th className="table-header px-4 py-3">إجمالي قيمة المشاريع</th>
                <th className="table-header px-4 py-3">حالة العميل</th>
                <th className="table-header px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-t border-slate-200 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-900">{client.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{client.name}</td>
                  <td className="px-4 py-3 text-slate-700">{client.company}</td>
                  <td className="px-4 py-3 text-slate-700">{client.phone}</td>
                  <td className="px-4 py-3 text-slate-700">{client.email}</td>
                  <td className="px-4 py-3 text-slate-700">{client.projectCount}</td>
                  <td className="px-4 py-3 text-slate-700">{currencyFormat.format(client.projectTotal)}</td>
                  <td className="px-4 py-3">
                    <ClientStatusBadge status={client.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/clients/${client.id}`} aria-label="عرض تفاصيل العميل" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button type="button" onClick={() => handleEdit(client)} aria-label="تعديل العميل" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-amber-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => confirmDelete('هل تريد حذف هذا العميل؟', () => handleDelete(client.id))} aria-label="حذف العميل" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> : <div className="card-surface overflow-hidden"><div className="overflow-x-auto"><table className="data-table min-w-full text-sm"><thead className="bg-slate-50"><tr>{['كود المورد', 'اسم المورد / الشركة', 'المسؤول', 'الهاتف', 'عدد التوريدات', 'إجمالي التوريدات', 'المستحق', 'الحالة', 'الإجراءات'].map((heading) => <th key={heading} className="table-header px-4 py-3">{heading}</th>)}</tr></thead><tbody>{filteredSuppliers.map((supplier) => <tr key={supplier.id} className="border-t border-slate-200"><td className="px-4 py-3 font-semibold text-slate-900">{supplier.code}</td><td className="px-4 py-3 font-medium text-slate-800">{supplier.name}</td><td className="px-4 py-3 text-slate-700">{supplier.contactName}</td><td className="px-4 py-3 text-slate-700">{supplier.phone}</td><td className="px-4 py-3 text-slate-700">{supplier.supplyCount}</td><td className="px-4 py-3 text-slate-700">{currencyFormat.format(supplier.totalSupplyValue)}</td><td className="px-4 py-3 text-slate-700">{currencyFormat.format(supplier.amountDue)}</td><td className="px-4 py-3"><SupplierStatusBadge status={supplier.status} /></td><td className="px-4 py-3"><div className="flex items-center gap-2"><Link href={`/dashboard/suppliers/${supplier.id}`} aria-label="عرض تفاصيل المورد" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-blue-600"><Eye className="h-4 w-4" /></Link><button type="button" onClick={() => { setSelectedSupplier(supplier); setSupplierOpen(true); }} aria-label="تعديل المورد" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-amber-600"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => confirmDelete('هل تريد حذف هذا المورد؟', () => { void handleSupplierDelete(supplier.id); })} aria-label="حذف المورد" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div></div>}

      <ClientFormModal
        open={open}
        client={selectedClient}
        onClose={() => {
          setOpen(false);
          setSelectedClient(null);
        }}
        onSubmit={handleClientSubmit}
      />
      <SupplierFormModal open={supplierOpen} supplier={selectedSupplier} onClose={() => { setSupplierOpen(false); setSelectedSupplier(null); }} onSubmit={handleSupplierSubmit} />
    </div>
  );
}
