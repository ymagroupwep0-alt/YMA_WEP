'use client';

import { useState } from 'react';
import { PencilLine, Plus, Save, Trash2, X } from 'lucide-react';
import { SectionCard } from '@/components/common/section-card';
import { companyGoalStatusLabels, type CompanyGoal, type GoalStatus } from '@/data/company';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';

const goalStatusOptions: GoalStatus[] = ['planned', 'in_progress', 'completed'];

export function CompanyGoalsSection({
  goals,
  onChange,
}: {
  goals: CompanyGoal[];
  onChange: (nextGoals: CompanyGoal[]) => void;
}) {
  const { check } = usePermissionGuard('company');
  const [draft, setDraft] = useState({
    id: '',
    title: '',
    description: '',
    period: '',
    status: 'planned' as GoalStatus,
  });

  const handleSubmit = () => {
    if (!check(draft.id ? 'edit' : 'create')) return;
    const title = draft.title.trim();
    const description = draft.description.trim();
    const period = draft.period.trim();

    if (!title || !description || !period) {
      return;
    }

    if (draft.id) {
      onChange(
        goals.map((goal) =>
          goal.id === draft.id
            ? { ...goal, title, description, period, status: draft.status }
            : goal,
        ),
      );
    } else {
      onChange([
        {
          id: `goal-${Date.now()}`,
          title,
          description,
          period,
          status: draft.status,
        },
        ...goals,
      ]);
    }

    setDraft({ id: '', title: '', description: '', period: '', status: 'planned' });
  };

  const handleEdit = (goal: CompanyGoal) => {
    setDraft({ ...goal });
  };

  const handleDelete = (id: string) => {
    if (!check('delete')) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الهدف؟')) return;
    onChange(goals.filter((goal) => goal.id !== id));
    if (draft.id === id) {
      setDraft({ id: '', title: '', description: '', period: '', status: 'planned' });
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

  return (
    <SectionCard title="الأهداف والخطط المستقبلية">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="mb-4 flex items-center gap-2 text-slate-800">
            <Plus className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-bold">{draft.id ? 'تعديل هدف' : 'إضافة هدف جديد'}</h4>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-sm text-slate-700">
              <span>عنوان الهدف</span>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>الوصف</span>
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={4} className={inputClass} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                <span>الفترة الزمنية</span>
                <input value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} className={inputClass} />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>الحالة</span>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as GoalStatus })} className={inputClass}>
                  {goalStatusOptions.map((status) => (
                    <option key={status} value={status}>{companyGoalStatusLabels[status]}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              {draft.id ? (
                <button type="button" onClick={() => setDraft({ id: '', title: '', description: '', period: '', status: 'planned' })} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
                  <X className="h-4 w-4" />
                  إلغاء
                </button>
              ) : null}
              <button type="button" onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                {draft.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {draft.id ? 'حفظ التغييرات' : 'إضافة الهدف'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-lg font-bold text-slate-900">{goal.title}</h5>
                  <p className="mt-1 text-xs text-slate-500">{goal.period}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${goal.status === 'planned' ? 'bg-slate-200 text-slate-700' : goal.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {companyGoalStatusLabels[goal.status]}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{goal.description}</p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" onClick={() => handleEdit(goal)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-amber-600">
                  <PencilLine className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(goal.id)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
