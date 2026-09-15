'use client';

import { useState } from 'react';
import { CalendarClock, PencilLine, Plus, Save, Trash2, X } from 'lucide-react';
import { SectionCard } from '@/components/common/section-card';
import { companyTimelineTypeLabels, type CompanyTimelineEvent, type TimelineEventType } from '@/data/company';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';

const timelineTypes: TimelineEventType[] = ['founding', 'expansion', 'project', 'achievement', 'office'];

export function CompanyTimelineSection({
  events,
  onChange,
}: {
  events: CompanyTimelineEvent[];
  onChange: (nextEvents: CompanyTimelineEvent[]) => void;
}) {
  const { check } = usePermissionGuard('company');
  const [draft, setDraft] = useState({ id: '', year: '', title: '', description: '', type: 'founding' as TimelineEventType });

  const handleSubmit = () => {
    if (!check(draft.id ? 'edit' : 'create')) return;
    if (!draft.year.trim() || !draft.title.trim() || !draft.description.trim()) {
      return;
    }

    if (draft.id) {
      onChange(
        events.map((event) =>
          event.id === draft.id ? { ...event, year: draft.year, title: draft.title, description: draft.description, type: draft.type } : event,
        ),
      );
    } else {
      onChange([
        {
          id: `event-${Date.now()}`,
          year: draft.year,
          title: draft.title,
          description: draft.description,
          type: draft.type,
        },
        ...events,
      ]);
    }

    setDraft({ id: '', year: '', title: '', description: '', type: 'founding' });
  };

  const handleEdit = (event: CompanyTimelineEvent) => {
    if (!check('edit')) return;
    setDraft({ ...event });
  };

  const handleDelete = (id: string) => {
    if (!check('delete')) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الحدث؟')) return;
    onChange(events.filter((event) => event.id !== id));
    if (draft.id === id) {
      setDraft({ id: '', year: '', title: '', description: '', type: 'founding' });
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

  return (
    <SectionCard title="Timeline تطور الشركة">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="mb-4 flex items-center gap-2 text-slate-800">
            <CalendarClock className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-bold">{draft.id ? 'تعديل الحدث' : 'إضافة حدث جديد'}</h4>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                <span>السنة / التاريخ</span>
                <input value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} className={inputClass} />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>نوع الحدث</span>
                <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as TimelineEventType })} className={inputClass}>
                  {timelineTypes.map((type) => (
                    <option key={type} value={type}>{companyTimelineTypeLabels[type]}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              <span>عنوان الحدث</span>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>الوصف</span>
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={4} className={inputClass} />
            </label>

            <div className="flex items-center justify-end gap-3">
              {draft.id ? (
                <button type="button" onClick={() => setDraft({ id: '', year: '', title: '', description: '', type: 'founding' })} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
                  <X className="h-4 w-4" />
                  إلغاء
                </button>
              ) : null}
              <button type="button" onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                {draft.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {draft.id ? 'حفظ التغييرات' : 'إضافة الحدث'}
              </button>
            </div>
          </div>
        </div>

        <div className="relative before:absolute before:bottom-0 before:right-6 before:top-0 before:w-px before:bg-slate-200">
          <div className="space-y-5">
            {events.map((event) => (
              <div key={event.id} className="relative flex gap-4 pr-7">
                <div className="absolute right-0 top-3 h-3.5 w-3.5 rounded-full border-4 border-white bg-blue-600 shadow-md shadow-blue-200" />
                <div className="w-full rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">{event.year}</p>
                      <h5 className="mt-1 text-lg font-bold text-slate-900">{event.title}</h5>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                      {companyTimelineTypeLabels[event.type]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button type="button" onClick={() => handleEdit(event)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-amber-600">
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(event.id)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
