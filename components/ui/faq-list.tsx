import type { FaqItem } from "@/lib/tools";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details key={item.question} className="site-feature-card rounded-3xl border border-[color:var(--border)] bg-white/80 p-5">
          <summary className="cursor-pointer list-none text-base font-semibold tracking-tight">
            {item.question}
          </summary>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
