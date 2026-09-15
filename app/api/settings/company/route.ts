import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authorization';
import { logActivity } from '@/lib/activity-log';
import { companyRepository } from '@/lib/repositories/prisma';

export async function GET() {
  try {
    await requirePermission('company', 'view');
    return NextResponse.json(await companyRepository.getOrCreate());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'تعذر تحميل بيانات الشركة' }, { status: 403 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requirePermission('company', 'edit');
    const company = await companyRepository.getOrCreate();
    const body = await request.json() as Record<string, unknown>;
    const data = Object.fromEntries(['name', 'email', 'phone', 'address', 'logoUrl'].filter((field) => typeof body[field] === 'string').map((field) => [field, (body[field] as string).trim() || null]));
    const updated = await companyRepository.update(company.id, data);
    await logActivity({ action: 'updated', module: 'company', entityType: 'company_settings', entityId: company.id, description: 'updated company settings' });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'تعذر حفظ بيانات الشركة' }, { status: 403 });
  }
}
