import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { logActivity } from '@/lib/activity-log';
import { notificationsRepository } from '@/lib/repositories/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  return NextResponse.json(await notificationsRepository.listForUser(user.id));
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const body = await request.json() as { id?: unknown; all?: unknown };
  if (body.all === true) {
    await notificationsRepository.markAllRead(user.id);
    await logActivity({ action: 'updated', module: 'notifications', entityType: 'notification', entityId: 'all', description: 'marked all notifications as read' });
  } else if (typeof body.id === 'string') {
    await notificationsRepository.markRead(user.id, body.id);
    await logActivity({ action: 'updated', module: 'notifications', entityType: 'notification', entityId: body.id, description: 'marked notification as read' });
  } else {
    return NextResponse.json({ error: 'إشعار غير صحيح' }, { status: 422 });
  }
  return NextResponse.json({ success: true });
}
