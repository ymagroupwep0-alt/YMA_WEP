'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const toneStyles: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
  emerald: 'bg-emerald-50 text-emerald-600',
};

export function DashboardKpiCard({
  title,
  value,
  change,
  trend,
  tone,
  href,
  description,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  tone: string;
  href: string;
  description: string;
}) {
  const isPositive = trend === 'up';

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[tone] || toneStyles.blue}`}>
          {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>

      <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {isPositive ? '+' : '-'}
        {change}
      </div>
    </Link>
  );
}
