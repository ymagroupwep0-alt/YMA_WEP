/* eslint-disable @next/next/no-img-element */
'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Building2, Check, LockKeyhole, Pencil, Plus, ShieldCheck, UserRound, Users, X } from 'lucide-react';
import { UserFormModal, UserFormValues } from '@/components/settings/user-form-modal';
import { UserStatusBadge } from '@/components/settings/user-status-badge';
import { permissions, RoleId, roles as initialRoles, SystemUser, UserStatus } from '@/data/settings';
import { usePermissions } from '@/components/permissions/permissions-provider';
import { canChangeUserRole, canDeleteUser, canManageUsers, canUpdateUserStatus } from '@/lib/user-management';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';
const initialAccount = { name: '', email: '', phone: '', job: '', imageUrl: '' };
const initialCompany = { name: '', email: '', phone: '', address: '', logoUrl: '' };

export default function SettingsPage() {
  const [account, setAccount] = useState(initialAccount);
  const [company, setCompany] = useState(initialCompany);
  const { currentUserId, users, setUsers: updateUsers, rolePermissions, setRolePermissions, loading, error: usersError } = usePermissions();
  const [userError, setUserError] = useState('');
  
;

  const roles = initialRoles.map((role) => ({ ...role, permissionIds: rolePermissions[role.id] ?? role.permissionIds }));

  const [selectedRole, setSelectedRole] = useState<RoleId>('admin');
  const [userOpen, setUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });

  // Account save state
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState(false);
  const [accountError, setAccountError] = useState('');

  // Company save state
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySuccess, setCompanySuccess] = useState(false);
  const [companyError, setCompanyError] = useState('');

  // Password save state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [settingsError, setSettingsError] = useState('');
  const baseRole = roles.find((role) => role.id === selectedRole) ?? roles[0];
  const currentRole = { ...baseRole, permissionIds: rolePermissions[selectedRole] ?? baseRole.permissionIds };

  const updateAccount = <K extends keyof typeof initialAccount>(field: K, value: string) => {
    setAccount((current) => ({ ...current, [field]: value }));
    setAccountError('');
  };

  const updateCompany = <K extends keyof typeof initialCompany>(field: K, value: string) => {
    setCompany((current) => ({ ...current, [field]: value }));
    setCompanyError('');
  };

  useEffect(() => {
    Promise.all([fetch('/api/settings/account'), fetch('/api/settings/company')])
      .then(async ([accountResponse, companyResponse]) => {
        if (!accountResponse.ok || !companyResponse.ok) throw new Error('تعذر تحميل إعدادات الحساب والشركة');
        const accountData = await accountResponse.json();
        const companyData = await companyResponse.json();
        setAccount({ name: accountData.name ?? '', email: accountData.email ?? '', phone: accountData.phone ?? '', job: accountData.job ?? '', imageUrl: accountData.imageUrl ?? '' });
        setCompany({ name: companyData.name ?? '', email: companyData.email ?? '', phone: companyData.phone ?? '', address: companyData.address ?? '', logoUrl: companyData.logoUrl ?? '' });
      })
      .catch((reason: Error) => setSettingsError(reason.message));
  }, []);

  const handleSaveAccount = async () => {
    setAccountLoading(true);
    setAccountError('');
    setAccountSuccess(false);
    try {
      const response = await fetch('/api/settings/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(account) });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'تعذر حفظ بيانات الحساب');
      }
      const updated = await response.json();
      setAccount({ name: updated.name ?? '', email: updated.email ?? '', phone: updated.phone ?? '', job: updated.job ?? '', imageUrl: updated.imageUrl ?? '' });
      setAccountSuccess(true);
      setTimeout(() => setAccountSuccess(false), 3000);
    } catch (reason) {
      setAccountError(reason instanceof Error ? reason.message : 'تعذر حفظ بيانات الحساب');
    } finally {
      setAccountLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    setCompanyLoading(true);
    setCompanyError('');
    setCompanySuccess(false);
    try {
      const response = await fetch('/api/settings/company', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(company) });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'تعذر حفظ بيانات الشركة');
      }
      const updated = await response.json();
      setCompany({ name: updated.name ?? '', email: updated.email ?? '', phone: updated.phone ?? '', address: updated.address ?? '', logoUrl: updated.logoUrl ?? '' });
      setCompanySuccess(true);
      setTimeout(() => setCompanySuccess(false), 3000);
    } catch (reason) {
      setCompanyError(reason instanceof Error ? reason.message : 'تعذر حفظ بيانات الشركة');
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleSavePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);
    try {
      const response = await fetch('/api/settings/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: password.current, newPassword: password.next, confirmPassword: password.confirm }) });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'تعذر تحديث كلمة المرور');
      }
      setPassword({ current: '', next: '', confirm: '' });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (reason) {
      setPasswordError(reason instanceof Error ? reason.message : 'تعذر تحديث كلمة المرور');
    } finally {
      setPasswordLoading(false);
    }
  };

  const image = async (field: 'imageUrl' | 'logoUrl', event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const payload = new FormData();
    payload.append('file', file);
    payload.append('mode', field === 'imageUrl' ? 'account' : 'company');
    const response = await fetch('/api/uploads', { method: 'POST', body: payload });
    if (!response.ok) { setSettingsError((await response.json()).error ?? 'تعذر رفع الصورة'); return; }
    const result = await response.json() as { url: string };
    if (field === 'imageUrl') setAccount((current) => ({ ...current, imageUrl: result.url }));
    else setCompany((current) => ({ ...current, logoUrl: result.url }));
    setSettingsError('');
  };

  const refreshUsers = async () => {
    const response = await fetch('/api/data/users');
    if (!response.ok) throw new Error((await response.json()).error ?? 'تعذر تحميل المستخدمين');
    const data = await response.json() as Array<SystemUser & { lastLoginAt?: string | null; permissionOverrides?: Array<{ permission: { id: string }; effect: 'allow' | 'deny' }> }>;
    updateUsers(data.map((item) => ({ ...item, temporaryPassword: '', lastLogin: item.lastLoginAt ?? 'غير متاح', permissionOverrides: Object.fromEntries((item.permissionOverrides ?? []).map(({ permission, effect }) => [permission.id, effect === 'allow'])) })));
  };

  const saveUser = async (values: UserFormValues) => {
    if (!canManageUsers(users, currentUserId, rolePermissions)) return;
    if (selectedUser && selectedUser.roleId === 'admin' && selectedUser.id !== currentUserId) {
      setUserError('لا يمكن لمدير النظام تعديل بيانات مدير نظام آخر.');
      return;
    }
    if (selectedUser && !canChangeUserRole(users, selectedUser.id, values.roleId, currentUserId, rolePermissions)) return;
    try {
      const response = await fetch(selectedUser ? `/api/data/users/${selectedUser.id}` : '/api/data/users', { method: selectedUser ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      if (!response.ok) throw new Error((await response.json()).error ?? 'تعذر حفظ المستخدم');
      await refreshUsers(); setSelectedUser(null); setUserOpen(false); setUserError('');
    } catch (reason) { setUserError(reason instanceof Error ? reason.message : 'تعذر حفظ المستخدم'); }
  };

  const cycleUserStatus = async (user: SystemUser) => { const statuses: UserStatus[] = ['active', 'inactive', 'suspended']; const next = statuses[(statuses.indexOf(user.status) + 1) % statuses.length]; if (!canUpdateUserStatus(users, user.id, next, currentUserId, rolePermissions)) return; if (!window.confirm('هل تريد تغيير حالة هذا المستخدم؟')) return; try { const response = await fetch(`/api/data/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) }); if (!response.ok) throw new Error((await response.json()).error ?? 'تعذر تحديث حالة المستخدم'); await refreshUsers(); } catch (reason) { setUserError(reason instanceof Error ? reason.message : 'تعذر تحديث حالة المستخدم'); } };

  const deleteUser = async (user: SystemUser) => { if (!canDeleteUser(users, user.id, currentUserId, rolePermissions) || !window.confirm(`هل أنت متأكد من حذف ${user.name}؟`)) return; try { const response = await fetch(`/api/data/users/${user.id}`, { method: 'DELETE' }); if (!response.ok) throw new Error((await response.json()).error ?? 'تعذر حذف المستخدم'); await refreshUsers(); } catch (reason) { setUserError(reason instanceof Error ? reason.message : 'تعذر حذف المستخدم'); } };

  const togglePermission = (permissionId: typeof permissions[number]['id']) => { if (selectedRole === 'admin' || !canManageUsers(users, currentUserId, rolePermissions)) return; const nextPermissions = currentRole.permissionIds.includes(permissionId) ? currentRole.permissionIds.filter((id) => id !== permissionId) : [...currentRole.permissionIds, permissionId]; void fetch('/api/settings/role-permissions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleId: selectedRole, permissionIds: nextPermissions }) }).then(async (response) => { if (!response.ok) throw new Error((await response.json()).error ?? 'تعذر حفظ الصلاحيات'); setRolePermissions((items) => ({ ...items, [selectedRole]: nextPermissions })); }).catch((reason: Error) => setSettingsError(reason.message)); };

  const profileImage = account.imageUrl ? <img src={account.imageUrl} alt="صورة المستخدم" className="h-20 w-20 rounded-2xl object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-700">{account.name.charAt(0)}</div>;
  const companyLogo = company.logoUrl ? <img src={company.logoUrl} alt="شعار الشركة" className="h-20 w-20 rounded-2xl object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-700">{company.name.charAt(0) || 'ش'}</div>;
  const canEditUser = (user: SystemUser) => user.id === currentUserId || user.roleId !== 'admin';

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">جار تحميل المستخدمين...</div>;
  if (usersError || settingsError) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{usersError || settingsError}</div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">إدارة النظام</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">الإعدادات</h1>
        <p className="mt-2 text-sm text-slate-500">أدر حسابك وبيانات الشركة والمستخدمين والأدوار من مكان واحد.</p>
      </div>

      {userError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{userError}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card-surface p-5">
          <div className="mb-5 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">إعدادات الحساب</h2>
          </div>
          <div className="mb-5 flex items-center gap-4">
            {profileImage}
            <label className="cursor-pointer rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-blue-300">
              تغيير الصورة
              <input type="file" accept="image/*" onChange={(event) => image('imageUrl', event)} className="hidden" />
            </label>
          </div>
          {accountError && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{accountError}</div>}
          {accountSuccess && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">تم حفظ بيانات الحساب بنجاح</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">الاسم<input value={account.name} onChange={(e) => updateAccount('name', e.target.value)} className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-medium text-slate-700">البريد الإلكتروني<input type="email" value={account.email} onChange={(e) => updateAccount('email', e.target.value)} className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-medium text-slate-700">رقم الهاتف<input value={account.phone} onChange={(e) => updateAccount('phone', e.target.value)} className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-medium text-slate-700">الوظيفة<input value={account.job} onChange={(e) => updateAccount('job', e.target.value)} className={`${inputClass} mt-2`} /></label>
          </div>
          <button type="button" onClick={handleSaveAccount} disabled={accountLoading} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            <Check className="h-4 w-4" />
            {accountLoading ? 'جار الحفظ...' : 'حفظ بيانات الحساب'}
          </button>
        </section>

        <section className="card-surface p-5">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">إعدادات الشركة</h2>
          </div>
          <div className="mb-5 flex items-center gap-4">
            {companyLogo}
            <label className="cursor-pointer rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-blue-300">
              تغيير الشعار
              <input type="file" accept="image/*" onChange={(event) => image('logoUrl', event)} className="hidden" />
            </label>
          </div>
          {companyError && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{companyError}</div>}
          {companySuccess && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">تم حفظ بيانات الشركة بنجاح</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">اسم الشركة<input value={company.name} onChange={(e) => updateCompany('name', e.target.value)} className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-medium text-slate-700">البريد الإلكتروني<input type="email" value={company.email} onChange={(e) => updateCompany('email', e.target.value)} className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-medium text-slate-700">رقم الهاتف<input value={company.phone} onChange={(e) => updateCompany('phone', e.target.value)} className={`${inputClass} mt-2`} /></label>
            <label className="text-sm font-medium text-slate-700">العنوان<input value={company.address} onChange={(e) => updateCompany('address', e.target.value)} className={`${inputClass} mt-2`} /></label>
          </div>
          <button type="button" onClick={handleSaveCompany} disabled={companyLoading} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            <Check className="h-4 w-4" />
            {companyLoading ? 'جار الحفظ...' : 'حفظ بيانات الشركة'}
          </button>
        </section>
      </div>

      <section className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">المستخدمون</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">إدارة حسابات الوصول والأدوار والصلاحيات.</p>
          </div>
          <button type="button" onClick={() => { setSelectedUser(null); setUserOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />إضافة مستخدم</button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr>{['المستخدم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'آخر تسجيل دخول', 'الإجراءات'].map((heading) => <th key={heading} className="table-header px-4 py-3">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {user.imageUrl ? <img src={user.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">{user.name.charAt(0)}</div>}
                      <span className="font-semibold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{user.email}</td>
                  <td className="px-4 py-4 font-medium text-slate-700">{roles.find((role) => role.id === user.roleId)?.name}</td>
                  <td className="px-4 py-4">
                    <button type="button" onClick={() => cycleUserStatus(user)} title="تغيير حالة الحساب">
                      <UserStatusBadge status={user.status} />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{user.lastLogin}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {canEditUser(user) && <button type="button" title="تعديل المستخدم" onClick={() => { setSelectedUser(user); setUserOpen(true); }} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"><Pencil className="h-4 w-4" /></button>}
                      {canDeleteUser(users, user.id, currentUserId, rolePermissions) && <button type="button" title="حذف المستخدم" onClick={() => void deleteUser(user)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"><X className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="card-surface p-5">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">الأدوار والصلاحيات</h2>
          </div>
          <div className="space-y-2">
            {roles.map((role) => (
              <button key={role.id} type="button" onClick={() => setSelectedRole(role.id)} className={`w-full rounded-xl border p-3 text-right transition ${selectedRole === role.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <p className="font-bold text-slate-800">{role.name}</p>
                <p className="mt-1 text-xs text-slate-500">{role.description}</p>
                <p className="mt-2 text-xs font-semibold text-blue-700">{role.permissionIds.length} صلاحيات</p>
              </button>
            ))}
          </div>
        </section>

        <section className="card-surface p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">صلاحيات {currentRole.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedRole === 'admin' ? 'دور المدير النظام له صلاحيات كاملة في النظام.' : 'إدارة الصلاحيات المتاحة لهذا الدور.'}
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{currentRole.permissionIds.length} / {permissions.length}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {permissions.map((permission) => (
              <label key={permission.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={currentRole.permissionIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} disabled={selectedRole === 'admin'} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" />
                {permission.label}
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card-surface p-5">
          <div className="mb-5 flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">تغيير كلمة المرور</h2>
          </div>
          {passwordError && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{passwordError}</div>}
          {passwordSuccess && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">تم تحديث كلمة المرور بنجاح</div>}
          <form onSubmit={handleSavePassword} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">كلمة المرور الحالية<input type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} className={`${inputClass} mt-2`} required /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">كلمة المرور الجديدة<input type="password" value={password.next} onChange={(e) => setPassword({ ...password, next: e.target.value })} className={`${inputClass} mt-2`} required /></label>
              <label className="text-sm font-medium text-slate-700">تأكيد كلمة المرور<input type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} className={`${inputClass} mt-2`} required /></label>
            </div>
            <button type="submit" disabled={passwordLoading} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{passwordLoading ? 'جار التحديث...' : 'تغيير كلمة المرور'}</button>
          </form>
        </section>

        <section className="card-surface p-5">
          <div className="mb-5 flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">الجلسات النشطة</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div>
                <p className="font-semibold text-slate-800">هذا الجهاز</p>
                <p className="mt-1 text-xs text-slate-600">Chrome • Windows • الرياض</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">نشطة الآن</span>
            </div>
          </div>
        </section>
      </div>

      {userOpen && <UserFormModal open={userOpen} onClose={() => { setUserOpen(false); setSelectedUser(null); }} onSubmit={saveUser} user={selectedUser} />}
    </div>
  );
}
