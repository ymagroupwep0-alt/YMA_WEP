import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { permissions, roles } from '../data/settings';
import { hashPassword } from '../lib/auth/password';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load local .env when the seed is run directly with `tsx` (npm run prisma:seed).
// Prisma CLI loads .env itself, but a direct Node/tsx process does not.
function loadDotEnv() {
  if (process.env.DATABASE_URL) return;
  const file = resolve(process.cwd(), '.env');
  if (!existsSync(file)) return;
  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('\"') && value.endsWith('\"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = process.env.INITIAL_ADMIN_NAME?.trim();
  if (!email || !password || !name) {
    throw new Error('Missing required seed environment variables: INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD, and INITIAL_ADMIN_NAME.');
  }

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { id: permission.id },
      update: { section: permission.id.split('.')[0], action: permission.id.split('.')[1], label: permission.label },
      create: { id: permission.id, section: permission.id.split('.')[0], action: permission.id.split('.')[1], label: permission.label },
    });
  }

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name, description: role.description },
      create: { id: role.id, name: role.name, description: role.description },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: role.permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
      skipDuplicates: true,
    });
  }

  const passwordHash = await hashPassword(password);
  const seededUser = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, roleId: 'admin', status: 'active' },
    create: { id: `user-${randomUUID()}`, name, email, passwordHash, roleId: 'admin', status: 'active' },
  });

  if (!seededUser.employeeId) {
    const employee = await prisma.employee.create({
      data: {
        id: randomUUID(),
        code: `EMP-ADMIN-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fullName: name,
        email,
        phone: '',
        role: 'مدير نظام',
        department: 'عام',
        status: 'active',
        imageUrl: null,
      },
    });

    await prisma.user.update({
      where: { id: seededUser.id },
      data: { employeeId: employee.id },
    });
  }

  await prisma.company.upsert({
    where: { id: 'company-main' },
    update: {},
    create: { id: 'company-main', name: 'YMA Group', summary: '', industry: '', foundedYear: new Date().getFullYear(), headquarters: '', email: null, phone: null, address: null, logoUrl: null },
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
