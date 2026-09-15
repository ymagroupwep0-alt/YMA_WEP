import { permissions, type PermissionId, type UserPermissionOverrides } from '@/data/settings';

type Props = { value?: UserPermissionOverrides; onChange: (value: UserPermissionOverrides) => void };

export function UserPermissionOverrides({ value = {}, onChange }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
      <p className="font-semibold text-slate-800">صلاحيات خاصة بالمستخدم</p>
      <p className="mt-1 text-xs text-slate-500">اتركها بدون اختيار لاستخدام صلاحيات الدور. التحديد يسمح أو يمنع الصلاحية لهذا المستخدم.</p>
      <button type="button" onClick={() => onChange({})} className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">إعادة جميع الصلاحيات إلى الدور</button>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {permissions.map((permission) => {
          const id = permission.id as PermissionId;
          const override = value[id];
          return (
            <label key={id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <select
                value={override === undefined ? 'inherit' : override ? 'allow' : 'deny'}
                onChange={(event) => {
                  const next = event.target.value;
                  onChange({ ...value, [id]: next === 'inherit' ? undefined : next === 'allow' });
                }}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
              >
                <option value="inherit">موروثة من الدور</option>
                <option value="allow">مسموح صراحة</option>
                <option value="deny">مرفوض صراحة</option>
              </select>
              <span>{permission.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
