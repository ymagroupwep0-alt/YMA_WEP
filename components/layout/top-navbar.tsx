'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, X } from 'lucide-react';
import { roles } from '@/data/settings';
import type { PublicUser } from '@/lib/auth/types';

type NotificationItem = { id: string; title: string; description: string; read: boolean; createdAt: string; href?: string | null };

export function TopNavbar({ onMenuToggle, user }: { onMenuToggle: () => void; user: PublicUser }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const roleName = roles.find((role) => role.id === user.roleId)?.name ?? user.roleId;

  const loadNotifications = async () => {
    const response = await fetch('/api/notifications');
    if (response.ok) setNotifications(await response.json());
  };
  useEffect(() => { void loadNotifications(); }, []);

  const markRead = async (notification: NotificationItem) => {
    if (!notification.read) {
      await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: notification.id }) });
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    }
    if (notification.href) router.push(notification.href);
  };
  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await fetch('/api/auth/logout', { method: 'POST' }); } finally { router.replace('/login'); router.refresh(); }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuToggle} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden" aria-label="أظهار القائمة"><Menu className="h-5 w-5" /></button>
          <form onSubmit={(event) => { event.preventDefault(); if (search.trim()) router.push(`/dashboard/activity?search=${encodeURIComponent(search.trim())}`); }} className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="بحث..." className="w-48 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></form>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <button type="button" onClick={() => setNotificationsOpen((open) => !open)} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50" aria-label="الإشعارات" aria-expanded={notificationsOpen}><Bell className="h-4 w-4" />{notifications.some((item) => !item.read) && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{notifications.filter((item) => !item.read).length}</span>}</button>
            {notificationsOpen && <div className="absolute left-0 top-12 z-30 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"><div className="flex items-center justify-between border-b border-slate-100 pb-2"><p className="font-bold text-slate-900">الإشعارات</p><div className="flex items-center gap-2"><button type="button" onClick={() => void markAllRead()} className="text-xs font-semibold text-blue-600">قراءة الكل</button><button type="button" onClick={() => setNotificationsOpen(false)} aria-label="إغلاق"><X className="h-4 w-4" /></button></div></div><div className="max-h-80 overflow-y-auto">{notifications.length ? notifications.map((notification) => <button type="button" key={notification.id} onClick={() => void markRead(notification)} className={`w-full border-b border-slate-100 px-2 py-3 text-right last:border-0 ${notification.read ? 'opacity-60' : 'bg-blue-50/50'}`}><p className="text-sm font-semibold text-slate-800">{notification.title}</p><p className="mt-1 text-xs text-slate-500">{notification.description}</p></button>) : <p className="p-4 text-center text-sm text-slate-500">لا توجد إشعارات</p>}</div></div>}
          </div>
          {user.roleId === 'admin' && <button type="button" onClick={() => router.push('/dashboard/settings')} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50" aria-label="إدارة النظام"><Settings className="h-4 w-4" /></button>}
          <button type="button" onClick={() => router.push('/dashboard/settings')} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-right"><Image src={user.imageUrl || '/images/logo.png'} alt="Profile" width={36} height={36} unoptimized className="rounded-lg object-cover" /><span className="hidden sm:block"><p className="text-sm font-semibold text-slate-800">{user.name}</p><p className="text-xs text-slate-500">{roleName}</p></span><ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" /></button>
          <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">{isLoggingOut ? 'جار تسجيل الخروج...' : 'تسجيل الخروج'}</span></button>
        </div>
      </div>
    </header>
  );
}
