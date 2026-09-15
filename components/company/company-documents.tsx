'use client';

import { useState } from 'react';
import { FileText, Link2, Plus, Trash2 } from 'lucide-react';
import { SectionCard } from '@/components/common/section-card';
import { companyDocumentStatusLabels, companyDocumentTypeLabels, type CompanyDocument, type CompanyDocumentStatus, type CompanyDocumentType } from '@/data/company';
import { usePermissionGuard } from '@/components/permissions/use-permission-guard';

const documentTypes: CompanyDocumentType[] = ['company_profile', 'certificates', 'licenses', 'other'];
const documentStatuses: CompanyDocumentStatus[] = ['active', 'draft', 'expired'];

export function CompanyDocumentsSection({
  documents,
  onChange,
}: {
  documents: CompanyDocument[];
  onChange: (nextDocuments: CompanyDocument[]) => void;
}) {
  const { check } = usePermissionGuard('company');
  const [draft, setDraft] = useState({
    name: '',
    type: 'company_profile' as CompanyDocumentType,
    addedAt: new Date().toISOString().slice(0, 10),
    description: '',
    status: 'active' as CompanyDocumentStatus,
    fileUrl: '',
  });

  const handleAddDocument = () => {
    if (!check('create')) return;
    if (!draft.name.trim() || !draft.description.trim()) {
      return;
    }

    onChange([
      {
        id: `doc-${Date.now()}`,
        name: draft.name,
        type: draft.type,
        addedAt: draft.addedAt,
        description: draft.description,
        status: draft.status,
        fileUrl: draft.fileUrl || 'https://example.com/document.pdf',
      },
      ...documents,
    ]);

    setDraft({
      name: '',
      type: 'company_profile',
      addedAt: new Date().toISOString().slice(0, 10),
      description: '',
      status: 'active',
      fileUrl: '',
    });
  };

  const handleDelete = (id: string) => {
    if (!check('delete')) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا المستند؟')) return;
    if (!check('delete')) return;
    onChange(documents.filter((document) => document.id !== id));
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

  return (
    <SectionCard title="مستندات الشركة">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="mb-4 flex items-center gap-2 text-slate-800">
            <Plus className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-bold">إضافة مستند</h4>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-sm text-slate-700">
              <span>اسم المستند</span>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                <span>نوع المستند</span>
                <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as CompanyDocumentType })} className={inputClass}>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{companyDocumentTypeLabels[type]}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>تاريخ الإضافة</span>
                <input type="date" value={draft.addedAt} onChange={(e) => setDraft({ ...draft, addedAt: e.target.value })} className={inputClass} />
              </label>
            </div>
            <label className="space-y-2 text-sm text-slate-700">
              <span>الوصف</span>
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} className={inputClass} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                <span>حالة المستند</span>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as CompanyDocumentStatus })} className={inputClass}>
                  {documentStatuses.map((status) => (
                    <option key={status} value={status}>{companyDocumentStatusLabels[status]}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>رابط الملف (اختياري)</span>
                <input value={draft.fileUrl} onChange={(e) => setDraft({ ...draft, fileUrl: e.target.value })} placeholder="https://example.com/file.pdf" className={inputClass} />
              </label>
            </div>

            <button type="button" onClick={handleAddDocument} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              إضافة مستند
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {documents.map((document) => (
            <div key={document.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-slate-900">{document.name}</h5>
                    <p className="mt-1 text-xs text-slate-500">{companyDocumentTypeLabels[document.type]} • {document.addedAt}</p>
                  </div>
                </div>
                <button type="button" onClick={() => handleDelete(document.id)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">{document.description}</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${document.status === 'active' ? 'bg-emerald-100 text-emerald-700' : document.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                  {companyDocumentStatusLabels[document.status]}
                </span>
                {document.fileUrl ? (
                  <a href={document.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                    <Link2 className="h-4 w-4" />
                    عرض المستند
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
