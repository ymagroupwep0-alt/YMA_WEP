export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
