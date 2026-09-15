import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const toneStyles: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
  emerald: 'bg-emerald-50 text-emerald-600',
};

export function StatCard({
  title,
  value,
  change,
  trend,
  tone,
  href,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  tone: string;
  href?: string;
}) {
  const isPositive = trend === 'up';

  const content = (
    <div className={`card-surface p-5 ${href ? 'transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[tone] || toneStyles.blue}`}>
          {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
        </div>
      </div>

      <div className={`mt-5 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {isPositive ? '+' : '-'}
        {change}
      </div>
    </div>
  );

  return href ? <Link href={href} aria-label={`الانتقال إلى ${title}`} className="block">{content}</Link> : content;
}
