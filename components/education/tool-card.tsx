import Link from "next/link";
import type { EducationTool } from "@/lib/education-tools";

export function EducationToolCard({
  tool,
  compact = false,
}: {
  tool: EducationTool;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Link
        href={`/tools/education/${tool.slug}`}
        className="mobile-compact-tool-card app-panel-muted group block rounded-2xl px-4 py-3 transition hover:border-[color:var(--primary)]"
      >
        <p className="text-sm font-semibold text-[color:var(--foreground)] transition group-hover:text-[color:var(--primary)]">
          {tool.name}
        </p>
        <p className="mt-1 text-xs leading-6 text-[color:var(--muted)]">{tool.shortDescription}</p>
      </Link>
    );
  }

  return (
    <Link
      href={`/tools/education/${tool.slug}`}
      className="mobile-tool-card app-panel group rounded-3xl p-5 transition hover:-translate-y-1 hover:border-[color:var(--primary)]/35 hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
          {tool.group.replace(/-/g, " ")}
        </span>
        {tool.implementation === "full" ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Full tool
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight">{tool.name}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{tool.shortDescription}</p>
      <p className="mt-4 text-sm font-semibold text-[color:var(--primary)] transition group-hover:text-[color:var(--primary-dark)]">
        Open tool
      </p>
    </Link>
  );
}
