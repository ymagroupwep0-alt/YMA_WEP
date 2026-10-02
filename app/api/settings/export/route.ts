import * as archiver from 'archiver';
import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import { Readable, PassThrough } from 'node:stream';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ExportRow = Record<string, unknown>;
type TableDefinition = { delegate: string; folder: string; sheet: string };

const tables: TableDefinition[] = [
  { delegate: 'project', folder: 'المشاريع', sheet: 'المشاريع' },
  { delegate: 'projectMember', folder: 'المشاريع', sheet: 'أعضاء المشاريع' },
  { delegate: 'manufacturingOperation', folder: 'التصنيع', sheet: 'عمليات التصنيع' },
  { delegate: 'manufacturingMaterial', folder: 'التصنيع', sheet: 'خامات التصنيع' },
  { delegate: 'manufacturingStage', folder: 'التصنيع', sheet: 'مراحل التصنيع' },
  { delegate: 'financeTransaction', folder: 'المالية', sheet: 'المعاملات المالية' },
  { delegate: 'payrollRecord', folder: 'المالية', sheet: 'الرواتب' },
  { delegate: 'warehouseProduct', folder: 'المخزن', sheet: 'المنتجات' },
  { delegate: 'stockMovement', folder: 'المخزن', sheet: 'حركات المخزون' },
  { delegate: 'employee', folder: 'الموظفون', sheet: 'الموظفون' },
  { delegate: 'client', folder: 'العملاء والموردون', sheet: 'العملاء' },
  { delegate: 'supplier', folder: 'العملاء والموردون', sheet: 'الموردون' },
  { delegate: 'supply', folder: 'المستلزمات', sheet: 'التوريدات' },
  { delegate: 'supplyItem', folder: 'المستلزمات', sheet: 'بنود التوريدات' },
  { delegate: 'supplyTimelineEvent', folder: 'المستلزمات', sheet: 'سجل التوريدات' },
  { delegate: 'profitSnapshot', folder: 'الأرباح', sheet: 'ملخص الأرباح' },
  { delegate: 'company', folder: 'الشركة', sheet: 'الشركة' },
  { delegate: 'companyValue', folder: 'الشركة', sheet: 'قيم الشركة' },
  { delegate: 'companyDocument', folder: 'الشركة', sheet: 'مستندات الشركة' },
  { delegate: 'companyGoal', folder: 'الشركة', sheet: 'أهداف الشركة' },
  { delegate: 'companyTimelineEvent', folder: 'الشركة', sheet: 'الجدول الزمني' },
  { delegate: 'companyGalleryItem', folder: 'الشركة', sheet: 'معرض الشركة' },
  { delegate: 'companyOrganizationalRole', folder: 'الشركة', sheet: 'الهيكل التنظيمي' },
  { delegate: 'activityLog', folder: 'حركة النظام', sheet: 'سجل النشاط' },
  { delegate: 'notification', folder: 'حركة النظام', sheet: 'الإشعارات' },
  { delegate: 'user', folder: 'الإعدادات', sheet: 'المستخدمون' },
  { delegate: 'role', folder: 'الإعدادات', sheet: 'الأدوار' },
  { delegate: 'permission', folder: 'الإعدادات', sheet: 'الصلاحيات' },
  { delegate: 'rolePermission', folder: 'الإعدادات', sheet: 'صلاحيات الأدوار' },
  { delegate: 'userPermissionOverride', folder: 'الإعدادات', sheet: 'استثناءات الصلاحيات' },
];

const safeSegment = (value: string) => {
  const safe = value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '').trim();
  return (safe || 'بدون اسم').slice(0, 100);
};

const toCellValue = (value: unknown): string | number | boolean | Date => {
  if (value instanceof Date) return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  return JSON.stringify(value);
};

const makeWorkbook = async (sheets: Array<{ name: string; rows: ExportRow[] }>) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'YMA System';
  workbook.created = new Date();

  for (const { name, rows } of sheets) {
    const worksheet = workbook.addWorksheet(name.slice(0, 31));
    if (rows.length === 0) {
      worksheet.addRow(['لا توجد بيانات']);
      continue;
    }

    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    worksheet.addRow(columns);
    for (const row of rows) worksheet.addRow(columns.map((column) => toCellValue(row[column])));
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    worksheet.autoFilter = { from: 'A1', to: `${worksheet.getColumn(columns.length).letter}1` };
    worksheet.getRow(1).font = { bold: true };
    worksheet.columns.forEach((column) => { column.width = Math.min(Math.max(column.header?.toString().length ?? 12, 14), 36); });
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
};

const getStoragePath = (fileUrl: string, storageUrl: string) => {
  try {
    const url = new URL(fileUrl);
    const storage = new URL(storageUrl);
    const prefix = '/storage/v1/object/public/uploads/';
    if (url.origin !== storage.origin || !url.pathname.startsWith(prefix)) return null;
    const objectPath = decodeURIComponent(url.pathname.slice(prefix.length));
    if (!objectPath || objectPath.split('/').some((part) => !part || part === '.' || part === '..')) return null;
    return objectPath;
  } catch {
    return null;
  }
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
  if (user.roleId !== 'admin') return Response.json({ error: 'تصدير بيانات النظام متاح لمدير النظام فقط' }, { status: 403 });

  try {
    const client = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      : null;
    const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const delegateMap = prisma as unknown as Record<string, { findMany: () => Promise<ExportRow[]> }>;
    const [loadedTables, reports, reportAttachments, reportEvents] = await Promise.all([
      Promise.all(tables.map(async (table) => [table.delegate, await delegateMap[table.delegate].findMany()] as const)),
      prisma.report.findMany(),
      prisma.reportAttachment.findMany(),
      prisma.reportActivityEvent.findMany(),
    ]);
    const dataByDelegate = new Map(loadedTables);
    const rowsByFolder = new Map<string, Array<{ name: string; rows: ExportRow[] }>>();
    for (const table of tables) {
      const rows = dataByDelegate.get(table.delegate) ?? [];
      const exportRows = table.delegate === 'user'
        ? rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'passwordHash')))
        : rows;
      const sheets = rowsByFolder.get(table.folder) ?? [];
      sheets.push({ name: table.sheet, rows: exportRows });
      rowsByFolder.set(table.folder, sheets);
    }

    const output = new PassThrough();
    const archive = new archiver.ZipArchive({ zlib: { level: 6 } });
    archive.on('warning', (error) => { if (error.code !== 'ENOENT') output.destroy(error); });
    archive.on('error', (error) => output.destroy(error));
    archive.pipe(output);

    const date = new Date().toISOString().slice(0, 10);
    const root = `YMA_System_Export_${date}`;
    const addAsset = async (folder: string, fileUrl: string, filename: string, missing: string[]) => {
      const storagePath = storageUrl ? getStoragePath(fileUrl, storageUrl) : null;
      if (!client || !storagePath) {
        missing.push(`${filename}: رابط الملف غير متاح للتنزيل من مخزن النظام`);
        return;
      }
      const { data, error } = await client.storage.from('uploads').download(storagePath);
      if (error || !data) {
        missing.push(`${filename}: تعذر تنزيل الملف من مخزن النظام`);
        return;
      }
      archive.append(Buffer.from(await data.arrayBuffer()), { name: `${root}/${folder}/${safeSegment(filename)}` });
    };

    const generate = async () => {
      const dashboardWorkbook = await makeWorkbook([{ name: 'ملخص التصدير', rows: tables.map((table) => ({ القسم: table.folder, نوع_البيانات: table.sheet, عدد_السجلات: (dataByDelegate.get(table.delegate) ?? []).length })) }]);
      archive.append(dashboardWorkbook, { name: `${root}/لوحة التحكم/ملخص النظام.xlsx` });

      for (const [folder, sheets] of rowsByFolder) {
        const workbookBuffer = await makeWorkbook(sheets);
        archive.append(workbookBuffer, { name: `${root}/${folder}/بيانات ${safeSegment(folder)}.xlsx` });
      }

      const missingAssets: string[] = [];
      for (const table of tables) {
        const rows = dataByDelegate.get(table.delegate) ?? [];
        for (const row of rows) {
          for (const key of ['fileUrl', 'imageUrl', 'logoUrl']) {
            const value = row[key];
            if (typeof value !== 'string' || !value) continue;
            const label = `${table.delegate}-${String(row.id ?? 'record')}-${key}`;
            const extension = (() => { try { return new URL(value).pathname.split('.').pop()?.match(/^[a-zA-Z0-9]{1,8}$/)?.[0] ?? 'bin'; } catch { return 'bin'; } })();
            await addAsset(`${table.folder}/الملفات`, value, `${label}.${extension}`, missingAssets);
          }
        }
      }

      for (const report of reports) {
        const reportFolder = `التقارير/${safeSegment(report.title)}-${safeSegment(report.id)}`;
        const attachments = reportAttachments.filter((attachment) => attachment.reportId === report.id);
        const events = reportEvents.filter((event) => event.reportId === report.id);
        const reportText = [
          `العنوان: ${report.title}`,
          `الكود: ${report.code}`,
          `النوع: ${report.type}`,
          `الحالة: ${report.status}`,
          `الوصف: ${report.description ?? ''}`,
          '',
          'محتوى التقرير:',
          report.content ?? '',
          '',
          'سجل التقرير:',
          ...events.map((event) => `${event.createdAt.toISOString()} | ${event.action} | ${event.description}`),
        ].join('\n');
        archive.append(reportText, { name: `${root}/${reportFolder}/التقرير.txt` });
        for (const attachment of attachments) {
          await addAsset(reportFolder, attachment.fileUrl, attachment.fileName, missingAssets);
        }
      }

      if (missingAssets.length) archive.append(missingAssets.join('\n'), { name: `${root}/تعذر تنزيل بعض الملفات.txt` });
      await archive.finalize();
    };

    void generate().catch((error: unknown) => output.destroy(error instanceof Error ? error : new Error('تعذر إنشاء ملف التصدير')));
    const stream = Readable.toWeb(output) as ReadableStream<Uint8Array>;
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="YMA_System_Export_${date}.zip"; filename*=UTF-8''YMA_System_Export_${date}.zip`,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('System export failed:', error);
    return Response.json({ error: 'تعذر إنشاء نسخة بيانات النظام' }, { status: 500 });
  }
}