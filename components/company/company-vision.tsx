'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Save, Trash2, X, PencilLine } from 'lucide-react';
import { SectionCard } from '@/components/common/section-card';
import type { CompanyValueItem } from '@/data/company';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';

export function CompanyVisionSection({
  vision,
  mission,
  values,
  onVisionChange,
  onMissionChange,
  onValuesChange,
}: {
  vision: string;
  mission: string;
  values: CompanyValueItem[];
  onVisionChange: (value: string) => void;
  onMissionChange: (value: string) => void;
  onValuesChange: (nextValues: CompanyValueItem[]) => void;
}) {
  const { check } = usePermissionGuard('company');
  const [draftVision, setDraftVision] = useState(vision);
  const [draftMission, setDraftMission] = useState(mission);
  const [newValue, setNewValue] = useState({ title: '', description: '' });
  const [editingValueId, setEditingValueId] = useState<string | null>(null);

  useEffect(() => {
    setDraftVision(vision);
  }, [vision]);

  useEffect(() => {
    setDraftMission(mission);
  }, [mission]);

  const valueCards = useMemo(() => values, [values]);

  const handleSaveValue = () => {
    if (!check(editingValueId ? 'edit' : 'create')) return;
    if (!newValue.title.trim() || !newValue.description.trim()) {
      return;
    }

    if (editingValueId) {
      onValuesChange(
        values.map((value) =>
          value.id === editingValueId ? { ...value, title: newValue.title, description: newValue.description } : value,
        ),
      );
    } else {
      onValuesChange([
        ...values,
        {
          id: `value-${Date.now()}`,
          title: newValue.title,
          description: newValue.description,
        },
      ]);
    }

    setNewValue({ title: '', description: '' });
    setEditingValueId(null);
  };

  const handleEditValue = (value: CompanyValueItem) => {
    if (!check('edit')) return;
    setEditingValueId(value.id);
    setNewValue({ title: value.title, description: value.description });
  };

  const handleDeleteValue = (id: string) => {
    if (!check('delete')) return;
    if (!window.confirm('هل أنت متأكد من حذف هذه القيمة؟')) return;
    onValuesChange(values.filter((value) => value.id !== id));
    if (editingValueId === id) {
      setEditingValueId(null);
      setNewValue({ title: '', description: '' });
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

  return (
    <SectionCard title="الرؤية والرسالة والقيم">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-blue-700">
            <FileText className="h-4 w-4" />
            <h4 className="text-sm font-bold">الرؤية</h4>
          </div>
          <textarea
            value={draftVision}
            onChange={(e) => {
              setDraftVision(e.target.value);
              onVisionChange(e.target.value);
            }}
            rows={5}
            className={inputClass}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-emerald-700">
            <FileText className="h-4 w-4" />
            <h4 className="text-sm font-bold">الرسالة</h4>
          </div>
          <textarea
            value={draftMission}
            onChange={(e) => {
              setDraftMission(e.target.value);
              onMissionChange(e.target.value);
            }}
            rows={5}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-slate-800">قيم الشركة</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {valueCards.map((value) => (
            <div key={value.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-bold text-slate-900">{value.title}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleEditValue(value)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-amber-600">
                    <PencilLine className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => handleDeleteValue(value.id)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
            <label className="space-y-2 text-sm text-slate-700">
              <span>اسم القيمة</span>
              <input
                value={newValue.title}
                onChange={(e) => setNewValue({ ...newValue, title: e.target.value })}
                placeholder="مثال: الابتكار"
                className={inputClass}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>الوصف</span>
              <input
                value={newValue.description}
                onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
                placeholder="وصف القيمة"
                className={inputClass}
              />
            </label>
            <button type="button" onClick={handleSaveValue} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              {editingValueId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingValueId ? 'تحديث' : 'إضافة'}
            </button>
          </div>
          {editingValueId ? (
            <button type="button" onClick={() => { setEditingValueId(null); setNewValue({ title: '', description: '' }); }} className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
              <X className="h-4 w-4" />
              إلغاء التعديل
            </button>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}
