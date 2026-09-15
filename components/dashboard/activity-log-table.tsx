'use client';

import Link from 'next/link';
import { Search, ChevronRight, CalendarRange, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { activityActionLabels, activityModuleLabels, type ActivityLogEntry } from '@/data/activity-log';

const moduleOptions = ['', ...Object.keys(activityModuleLabels)];
const actionOptions = ['', ...Object.keys(activityActionLabels)];

export function ActivityLogTable({ entries, highlightedId, initialSearch, isAdmin, deleting, onDelete, onDeleteAll }: { entries: ActivityLogEntry[]; highlightedId: string; initialSearch: string; isAdmin: boolean; deleting: boolean; onDelete: (id: string) => void; onDeleteAll: () => void }) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const term = search.toLowerCase();
      const matchSearch =
        entry.userName.toLowerCase().includes(term) ||
        entry.title.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term) ||
        entry.entityType.toLowerCase().includes(term);

      const matchModule = !selectedModule || entry.module === selectedModule;
      const matchAction = !selectedAction || entry.action === selectedAction;
      const matchDate = !selectedDate || entry.createdAt.startsWith(selectedDate.slice(0, 10));

      return matchSearch && matchModule && matchAction && matchDate;
    });
  }, [entries, search, selectedModule, selectedAction, selectedDate]);

  return (
    <div className="space-y-5">
      <div className="card-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث باسم المستخدم أو العملية أو العنصر..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="">كل الأقسام</option>
            {moduleOptions.slice(1).map((module) => (
              <option key={module} value={module}>{activityModuleLabels[module as keyof typeof activityModuleLabels]}</option>
            ))}
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="">كل العمليات</option>
            {actionOptions.slice(1).map((action) => (
              <option key={action} value={action}>{activityActionLabels[action as keyof typeof activityActionLabels]}</option>
            ))}
          </select>

          <div className="relative">
            <CalendarRange className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {isAdmin && <div className="flex justify-end border-b border-slate-100 p-4"><button type="button" disabled={deleting} onClick={onDeleteAll} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"><Trash2 className="h-4 w-4" />حذف السجل بالكامل</button></div>}
        <div className="overflow-x-auto">
          <table className="data-table min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header px-4 py-3">المستخدم</th>
                <th className="table-header px-4 py-3">العملية</th>
                <th className="table-header px-4 py-3">القسم</th>
                <th className="table-header px-4 py-3">العنصر المرتبط</th>
                <th className="table-header px-4 py-3">الوصف</th>
                <th className="table-header px-4 py-3">التاريخ والوقت</th>
                <th className="table-header px-4 py-3">الدخول</th>
                {isAdmin && <th className="table-header px-4 py-3">حذف</th>}
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className={`border-t border-slate-200 last:border-0 ${entry.id === highlightedId ? 'bg-amber-50 ring-2 ring-inset ring-amber-300' : ''}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{entry.userName}</p>
                      <p className="text-xs text-slate-500">{entry.userRole}</p>
                    </div>
                  </td>
                  {isAdmin && <td className="px-4 py-3"><button type="button" disabled={deleting} onClick={() => onDelete(entry.id)} title="حذف النشاط" className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></td>}
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                      {activityActionLabels[entry.action]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{activityModuleLabels[entry.module]}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{entry.entityType}</p>
                      <p className="text-xs text-slate-500">{entry.entityId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs">{entry.description}</td>
                  <td className="px-4 py-3 text-slate-700">{entry.createdAt}</td>
                  <td className="px-4 py-3">
                    {entry.href ? (
                      <Link href={entry.href} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-slate-50">
                        تفاصيل
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
