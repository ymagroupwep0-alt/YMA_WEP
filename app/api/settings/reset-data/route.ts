import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
  if (user.roleId !== 'admin') return NextResponse.json({ error: 'إعادة ضبط بيانات النظام متاحة لمدير النظام فقط' }, { status: 403 });

  let confirmation: unknown;
  try {
    confirmation = (await request.json() as { confirmation?: unknown }).confirmation;
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }
  if (confirmation !== 'حذف بيانات النظام') {
    return NextResponse.json({ error: 'تأكيد الحذف غير صحيح' }, { status: 422 });
  }

  try {
    const deletedCount = await prisma.$transaction(async (transaction) => {
      let count = 0;
      count += (await transaction.financeTransaction.deleteMany()).count;
      count += (await transaction.stockMovement.deleteMany()).count;
      count += (await transaction.manufacturingStage.deleteMany()).count;
      count += (await transaction.manufacturingMaterial.deleteMany()).count;
      count += (await transaction.manufacturingOperation.deleteMany()).count;
      count += (await transaction.supplyItem.deleteMany()).count;
      count += (await transaction.supplyTimelineEvent.deleteMany()).count;
      count += (await transaction.supply.deleteMany()).count;
      count += (await transaction.payrollRecord.deleteMany()).count;
      count += (await transaction.projectMember.deleteMany()).count;
      count += (await transaction.reportAttachment.deleteMany()).count;
      count += (await transaction.reportActivityEvent.deleteMany()).count;
      count += (await transaction.report.deleteMany()).count;
      count += (await transaction.project.deleteMany()).count;
      count += (await transaction.warehouseProduct.deleteMany()).count;
      count += (await transaction.profitSnapshot.deleteMany()).count;
      count += (await transaction.companyValue.deleteMany()).count;
      count += (await transaction.companyDocument.deleteMany()).count;
      count += (await transaction.companyGoal.deleteMany()).count;
      count += (await transaction.companyTimelineEvent.deleteMany()).count;
      count += (await transaction.companyGalleryItem.deleteMany()).count;
      count += (await transaction.companyOrganizationalRole.deleteMany()).count;
      count += (await transaction.company.deleteMany()).count;
      count += (await transaction.activityLog.deleteMany()).count;
      count += (await transaction.notification.deleteMany()).count;
      return count;
    }, { maxWait: 10_000, timeout: 60_000 });

    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    console.error('System data reset failed:', error);
    return NextResponse.json({ error: 'تعذر حذف بيانات النظام؛ لم يتم تثبيت أي تغييرات' }, { status: 500 });
  }
}