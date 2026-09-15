'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarClock, Factory, Package, UserRound } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ManufacturingStatusBadge } from '@/components/manufacturing/manufacturing-status-badge';
import { ManufacturingMaterial, ManufacturingProcess, ManufacturingStage } from '@/data/manufacturing';

type ProductLike = {
  id?: string;
  code?: string;
  name?: string;
  currentQuantity?: number;
  minimumQuantity?: number;
  unit?: string;
};

type MaterialLike = {
  id?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  code?: string;
  name?: string;
  requiredQuantity?: number | string;
  usedQuantity?: number | string;
  unit?: string;
  cost?: number | string;
  availability?: string;
  product?: ProductLike | null;
};

type StageLike = {
  id?: string;
  name?: string;
  status?: string;
  owner?: string;
  ownerNameSnapshot?: string;
  startDate?: string | null;
  completedAt?: string | null;
  endDate?: string | null;
  progress?: number | string;
};

const normalizeDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
};

const normalizeMaterial = (material: MaterialLike): ManufacturingMaterial => {
  const product = material.product ?? null;
  const productName = product?.name ?? material.productName ?? material.name ?? '—';
  const productCode = product?.code ?? material.productCode ?? material.code ?? '—';

  let availability: 'متوفر' | 'جزئي' | 'غير متوفر' = 'متوفر';
  if (typeof material.availability === 'string' && material.availability) {
    availability = material.availability === 'جزئي' || material.availability === 'غير متوفر' ? material.availability : 'متوفر';
  } else if (product && typeof product.currentQuantity === 'number') {
    availability = product.currentQuantity > 0 ? 'متوفر' : 'غير متوفر';
  }

  return {
    ...material,
    id: material.id ?? `${material.productId ?? 'mat'}-${Math.random().toString(36).slice(2, 8)}`,
    name: productName,
    code: productCode,
    requiredQuantity: Number(material.requiredQuantity ?? 0),
    usedQuantity: Number(material.usedQuantity ?? 0),
    unit: material.unit ?? product?.unit ?? 'وحدة',
    cost: Number(material.cost ?? 0),
    availability,
    product,
  };
};

const normalizeStage = (stage: StageLike): ManufacturingStage => {
  const normalizedStatus = stage.status === 'قيد التنفيذ' || stage.status === 'مكتملة' || stage.status === 'لم تبدأ'
    ? stage.status
    : 'لم تبدأ';

  const { completedAt, ownerNameSnapshot, ...rest } = stage;

  return {
    ...rest,
    id: stage.id ?? `${stage.name}-${Math.random().toString(36).slice(2, 8)}`,
    name: stage.name ?? 'مرحلة',
    status: normalizedStatus,
    owner: ownerNameSnapshot ?? stage.owner ?? '—',
    startDate: normalizeDate(stage.startDate),
    endDate: normalizeDate(completedAt ?? stage.endDate ?? undefined),
    progress: Number(stage.progress ?? 0),
  };
};

const normalizeProcess = (payload: Record<string, unknown>): ManufacturingProcess => {
  const project = payload.project as { name?: string } | null | undefined;
  const employee = payload.employee as { fullName?: string; name?: string } | null | undefined;
  const materials = Array.isArray(payload.materials) ? payload.materials.map((item) => normalizeMaterial(item as MaterialLike)) : [];
  const stages = Array.isArray(payload.stages) ? payload.stages.map((item) => normalizeStage(item as StageLike)) : [];

  return {
    id: String(payload.id ?? ''),
    code: String(payload.code ?? ''),
    name: String(payload.name ?? ''),
    projectId: String(payload.projectId ?? ''),
    projectName: project?.name ?? '',
    employeeId: String(payload.employeeId ?? ''),
    employeeName: employee?.fullName ?? employee?.name ?? '',
    description: String(payload.description ?? ''),
    status: (payload.status as ManufacturingProcess['status']) ?? 'new',
    activity: Array.isArray(payload.activity) ? payload.activity : Array.isArray(payload.activities) ? payload.activities : [],
    materials,
    stages,
    startDate: normalizeDate(typeof payload.startDate === 'string' ? payload.startDate : null),
    expectedEndDate: normalizeDate(typeof payload.expectedEndDate === 'string' ? payload.expectedEndDate : null),
    cost: Number(payload.cost ?? payload.materialCost ?? 0),
    progress: Number(payload.progress ?? 0),
  };
};

export default function ManufacturingDetailsPage() {
  const params = useParams();
  const [process, setProcess] = useState<ManufacturingProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/data/manufacturing/${params.id}`, { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || 'تعذر تحميل عملية التصنيع');
        setProcess(normalizeProcess(payload));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'تعذر تحميل عملية التصنيع');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.id]);

  if (loading) return <div className="card-surface p-8 text-center text-sm text-slate-500">جاري تحميل عملية التصنيع...</div>;
  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>;
  if (!process) return <div className="card-surface p-8 text-center text-sm text-slate-500">عملية التصنيع غير موجودة.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">تفاصيل عملية التصنيع</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{process.name}</h1>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{process.code}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">{process.description}</p>
        </div>
        <Link href="/dashboard/manufacturing" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          العودة إلى التصنيع
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">البيانات الأساسية</h2>
              <ManufacturingStatusBadge status={process.status} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">المشروع المرتبط</p>
                <p className="mt-2 font-bold text-slate-900">{process.projectName || '—'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">الموظف المسؤول</p>
                <p className="mt-2 font-bold text-slate-900">{process.employeeName || '—'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">تاريخ البداية</p>
                <p className="mt-2 font-bold text-slate-900">{process.startDate}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">الانتهاء المتوقع</p>
                <p className="mt-2 font-bold text-slate-900">{process.expectedEndDate}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">نسبة الإنجاز</span>
                <span className="font-bold text-blue-700">{process.progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${process.progress}%` }} />
              </div>
            </div>
          </section>

          <section className="card-surface overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 p-5">
              <Package className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">المواد المستخدمة</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[760px] w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['المادة', 'الكود', 'المطلوب', 'المستخدم', 'الوحدة', 'التكلفة', 'التوفر'].map((heading) => (
                      <th key={heading} className="table-header px-4 py-3">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {process.materials.map((material) => (
                    <tr key={material.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-slate-800">{material.name}</td>
                      <td className="px-4 py-3 text-slate-600">{material.code}</td>
                      <td className="px-4 py-3 text-slate-700">{material.requiredQuantity}</td>
                      <td className="px-4 py-3 text-slate-700">{material.usedQuantity}</td>
                      <td className="px-4 py-3 text-slate-600">{material.unit}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">EGP {material.cost.toLocaleString('en-US')}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100">{material.availability}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card-surface overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 p-5">
              <CalendarClock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">المراحل</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[760px] w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['اسم المرحلة', 'الحالة', 'المسؤول', 'تاريخ البداية', 'تاريخ الانتهاء'].map((heading) => (
                      <th key={heading} className="table-header px-4 py-3">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {process.stages.map((stage) => (
                    <tr key={stage.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-slate-800">{stage.name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">{stage.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{stage.owner}</td>
                      <td className="px-4 py-3 text-slate-600">{stage.startDate}</td>
                      <td className="px-4 py-3 text-slate-600">{stage.endDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Factory className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">الأحداث والتحديثات</h2>
            </div>
            <div className="space-y-4">
              {process.activity.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <span className="text-xs font-medium text-slate-500">{item.date}</span>
                  </div>
                  {item.note && <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="card-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">المؤشرات السريعة</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-slate-500">إجمالي المواد</span>
                <span className="font-bold text-slate-900">{process.materials.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-slate-500">عدد المراحل</span>
                <span className="font-bold text-slate-900">{process.stages.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-slate-500">التكلفة الإجمالية</span>
                <span className="font-bold text-slate-900">EGP {process.cost.toLocaleString('en-US')}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}