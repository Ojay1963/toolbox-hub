export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/80 p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="prose-content mt-5">{children}</div>
    </section>
  );
}
