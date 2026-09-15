/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Trash2, Plus, Eye } from 'lucide-react';
import { SectionCard } from '@/components/common/section-card';
import { companyGalleryCategoryLabels, type CompanyGalleryItem, type GalleryCategory } from '@/data/company';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';

const galleryCategories: GalleryCategory[] = ['company', 'projects', 'team', 'events'];

export function CompanyGallerySection({
  items,
  onChange,
}: {
  items: CompanyGalleryItem[];
  onChange: (nextItems: CompanyGalleryItem[]) => void;
}) {
  const { check } = usePermissionGuard('company');
  const [draft, setDraft] = useState({ category: 'company' as GalleryCategory, title: '', description: '', imageUrl: '' });
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    setPreviewUrl(draft.imageUrl || '');
  }, [draft.imageUrl]);

  const handleAddItem = () => {
    if (!check('create')) return;
    const title = draft.title.trim();
    const description = draft.description.trim();
    const imageUrl = draft.imageUrl.trim();

    if (!title || !description || !imageUrl) {
      return;
    }

    onChange([
      {
        id: `gallery-${Date.now()}`,
        category: draft.category,
        title,
        description,
        imageUrl,
      },
      ...items,
    ]);

    setDraft({ category: 'company', title: '', description: '', imageUrl: '' });
    setPreviewUrl('');
  };

  const handleDelete = (id: string) => {
    if (!check('delete')) return;
    if (!window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <SectionCard title="معرض الشركة" action={<span className="text-xs text-slate-500">{items.length} صورة</span>}>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="mb-4 flex items-center gap-2 text-slate-800">
            <ImagePlus className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-bold">إضافة صورة جديدة</h4>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-sm text-slate-700">
              <span>التصنيف</span>
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as GalleryCategory })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                {galleryCategories.map((category) => (
                  <option key={category} value={category}>{companyGalleryCategoryLabels[category]}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span>العنوان</span>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="مثال: فريق الإدارة" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span>الوصف</span>
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} placeholder="وصف مختصر للصورة" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span>رابط الصورة</span>
              <input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>

            {previewUrl ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img src={previewUrl} alt={draft.title || 'معاينة الصورة'} className="h-44 w-full object-cover" />
              </div>
            ) : null}

            <button type="button" onClick={handleAddItem} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              إضافة صورة
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative">
                <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
                <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-medium text-white">
                  {companyGalleryCategoryLabels[item.category]}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-base font-bold text-slate-900">{item.title}</h5>
                  <button type="button" onClick={() => handleDelete(item.id)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:text-rose-600" aria-label="حذف الصورة">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <button type="button" onClick={() => window.open(item.imageUrl, '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600">
                    <Eye className="h-3.5 w-3.5" />
                    معاينة
                  </button>
                  <a href={item.imageUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">عرض الصورة</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
