export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="site-card app-panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="site-section-title text-2xl font-bold tracking-tight">{title}</h2>
        <span className="rounded-full bg-[color:var(--surface-alt)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
          Section
        </span>
      </div>
      <div className="prose-content mt-5">{children}</div>
    </section>
  );
}
