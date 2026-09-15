'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Building2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { CompanyLogo } from '@/components/common/company-logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        setError(result?.error ?? 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('تعذر تسجيل الدخول، حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_40%,_#e2e8f0_100%)] p-4">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_25px_80px_-30px_rgba(15,23,42,0.35)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-300">YMA Group</p>
                <h1 className="text-2xl font-semibold">Management Suite</h1>
              </div>
            </div>

            <div className="space-y-6 pt-8">
              <div>
                <p className="text-sm font-medium text-blue-200">نظام داخلي متكامل</p>
                <h2 className="mt-2 text-4xl font-bold leading-tight">تحكم أعمـال الشركة من لوحة واحدة</h2>
              </div>

              <p className="max-w-md text-base leading-8 text-slate-300">
                تابع المشاريع، تقارير الأداء، المشتريات، المخزون، الموظفين، والمالية في واجهة حديثة ومتجاوبة.
              </p>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-slate-200">تسجيل دخول آمن ومؤمّن</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-slate-200">لوحة تحكم مرنة للتوسع مستقبلاً</span>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex justify-center">
              <CompanyLogo width={180} height={180} priority className="h-auto w-44 sm:w-48" />
            </div>
            <div className="mb-8 text-center lg:text-right">
              <p className="text-sm font-medium text-blue-600">مرحباً بعودتك</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">تسجيل الدخول</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="admin@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  كلمة المرور
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}

              <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  تذكرني
                </label>
                <Link href="#" className="font-medium text-blue-600 transition hover:text-blue-700">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
              >
                {isSubmitting ? 'جار تسجيل الدخول...' : 'دخول إلى النظام'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
