'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ActivityLogTable } from '@/components/dashboard/activity-log-table';
import { activityActionLabels, type ActivityLogEntry } from '@/data/activity-log';

type ApiActivity = ActivityLogEntry & { user?: { name?: string; roleId?: string } };

export default function ActivityPage() {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([fetch('/api/auth/me'), fetch('/api/data/activity')]).then(async ([userResponse, activityResponse]) => {
      if (!userResponse.ok || !activityResponse.ok) throw new Error('تعذر تحميل سجل النشاط');
      const userData = await userResponse.json() as { user: { roleId: string } };
      setIsAdmin(userData.user.roleId === 'admin');
      return activityResponse.json() as Promise<ApiActivity[]>;
    }).then((items) => setEntries(items.map((item) => ({
      ...item,
      userName: item.user?.name || 'مستخدم النظام',
      userRole: item.user?.roleId || '-',
      title: activityActionLabels[item.action as keyof typeof activityActionLabels] || item.action,
      createdAt: item.createdAt?.replace('T', ' ').slice(0, 16),
    })))).catch((requestError: Error) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  const deleteActivity = async (id: string) => {
    if (!window.confirm('هل تريد حذف هذا النشاط؟')) return;
    setDeleting(true);
    const response = await fetch(`/api/data/activity/${id}`, { method: 'DELETE' });
    if (!response.ok) setError((await response.json()).error ?? 'تعذر حذف النشاط');
    else setEntries((current) => current.filter((entry) => entry.id !== id));
    setDeleting(false);
  };

  const deleteAllActivity = async () => {
    if (!window.confirm('هل تريد حذف سجل النشاط بالكامل؟ لا يمكن التراجع عن هذه العملية.')) return;
    setDeleting(true);
    const response = await fetch('/api/data/activity/all', { method: 'DELETE' });
    if (!response.ok) setError((await response.json()).error ?? 'تعذر حذف سجل النشاط');
    else setEntries([]);
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">سجل النشاط</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Activity Log</h1>
        <p className="mt-2 text-sm text-slate-500">تتبع جميع الأنشطة المهمة داخل النظام من خلال سجل مركزي ومنظم.</p>
      </div>

      {loading && <p className="py-12 text-center text-sm text-slate-500">جارٍ تحميل سجل النشاط...</p>}
      {error && <p className="card-surface p-6 text-center text-sm text-rose-700">{error}</p>}
      {!loading && !error && (entries.length ? <ActivityLogTable entries={entries} highlightedId={searchParams.get('entry') ?? ''} initialSearch={searchParams.get('search') ?? ''} isAdmin={isAdmin} deleting={deleting} onDelete={deleteActivity} onDeleteAll={deleteAllActivity} /> : <p className="card-surface p-8 text-center text-sm text-slate-500">لا توجد أنشطة مسجلة.</p>)}
    </div>
  );
}
