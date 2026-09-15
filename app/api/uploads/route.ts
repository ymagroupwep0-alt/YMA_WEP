import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authorization';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const mode = typeof formData.get('mode') === 'string' ? formData.get('mode') as string : 'create';
    const folder = mode === 'account' ? 'profiles' : mode === 'company' ? 'company' : mode === 'product' ? 'products' : 'reports';
    if (mode === 'account') {
      if (!await getCurrentUser()) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    } else if (mode === 'company') {
      await requirePermission('company', 'edit');
    } else if (mode === 'product') {
      await requirePermission('warehouse', 'edit');
    } else {
      await requirePermission('reports', mode === 'edit' ? 'edit' : 'create');
    }
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 422 });
    if ((mode === 'account' || mode === 'company' || mode === 'product') && !file.type.startsWith('image/')) return NextResponse.json({ error: 'يجب اختيار صورة' }, { status: 422 });
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'حجم الملف يجب ألا يتجاوز 15 ميجابايت' }, { status: 413 });
    const ext = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const filename = `${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ name: file.name, url: `/uploads/${folder}/${filename}`, mimeType: file.type || 'application/octet-stream', fileSize: file.size, isImage: file.type.startsWith('image/') });
  } catch (error) {
    console.error('Report upload failed', error);
    return NextResponse.json({ error: 'تعذر رفع الملف' }, { status: 500 });
  }
}
