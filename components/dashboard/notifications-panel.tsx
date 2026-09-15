'use client';

import { Bell, CheckCheck, Dot } from 'lucide-react';
import type { DashboardNotification } from '@/data/dashboard';

export function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  notifications: DashboardNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <section className="card-surface p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-900">
          <Bell className="h-4 w-4 text-blue-600" />
          <h3 className="text-lg font-bold">الإشعارات</h3>
        </div>
        <button type="button" onClick={onMarkAllAsRead} className="text-xs font-medium text-blue-600 hover:text-blue-700">
          تحديد الكل كمقروء
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
        <span className="text-slate-600">عدد غير المقروء</span>
        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{unreadCount}</span>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className={`rounded-2xl border p-3 transition ${notification.read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Dot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                  <p className="mt-1 text-xs leading-6 text-slate-600">{notification.description}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{notification.createdAt}</p>
                </div>
              </div>
              {!notification.read ? (
                <button type="button" onClick={() => onMarkAsRead(notification.id)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600">
                  <CheckCheck className="h-3.5 w-3.5" />
                  قراءة
                </button>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">مقروء</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
