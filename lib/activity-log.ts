import type { ActivityAction, ActivityLogEntry, ActivityModule } from '@/data/activity-log';
import { getCurrentUser } from '@/lib/auth/session';
import { activityRepository, notificationsRepository } from '@/lib/repositories/prisma';

export async function logActivity(args: {
  action: ActivityAction;
  module: ActivityModule;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt?: Date;
}): Promise<ActivityLogEntry | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const entry = await activityRepository.create({
    id: crypto.randomUUID(),
    userId: user.id,
    action: args.action,
    module: args.module,
    entityType: args.entityType,
    entityId: args.entityId,
    description: args.description,
    metadata: args.metadata,
    createdAt: args.createdAt,
  });
  await notificationsRepository.notifyAdmins({
    title: 'نشاط جديد في النظام',
    description: args.description,
    href: `/dashboard/activity?entry=${encodeURIComponent(entry.id)}`,
  });
  return {
    id: entry.id,
    userId: entry.userId ?? '',
    userName: user.name,
    userRole: user.roleId,
    action: entry.action as ActivityAction,
    module: entry.module as ActivityModule,
    entityType: entry.entityType,
    entityId: entry.entityId,
    title: entry.action,
    description: entry.description,
    createdAt: entry.createdAt,
    metadata: entry.metadata as ActivityLogEntry['metadata'],
  };
}
