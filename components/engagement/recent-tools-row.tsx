"use client";

import Link from "next/link";
import { useEngagement } from "./engagement-provider";

const categoryBadgeMap: Record<string, { short: string; tone: string }> = {
  "image-tools": { short: "IMG", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  "pdf-tools": { short: "PDF", tone: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  "text-tools": { short: "TXT", tone: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  "developer-tools": { short: "DEV", tone: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300" },
  "generator-tools": { short: "GEN", tone: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
  "calculator-tools": { short: "CAL", tone: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  "converter-tools": { short: "CNV", tone: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  "internet-tools": { short: "WEB", tone: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300" },
  "education-tools": { short: "EDU", tone: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300" },
};

interface ToolMeta {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
}

export function RecentToolsRow({ allTools }: { allTools: ToolMeta[] }) {
  const { recentTools, clearRecentTools, mounted } = useEngagement();
  if (!mounted || recentTools.length === 0) return null;

  const toolMap = new Map(allTools.map((t) => [t.slug, t]));
  const recent = recentTools
    .map((slug) => toolMap.get(slug))
    .filter((t): t is ToolMeta => Boolean(t));

  if (recent.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            Your Recent Tools
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Pick up where you left off</h2>
        </div>
        <button
          type="button"
          onClick={clearRecentTools}
          className="shrink-0 text-xs text-[color:var(--muted)] underline-offset-4 hover:text-[color:var(--primary)] hover:underline"
        >
          Clear history
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recent.map((tool) => {
          const badge = categoryBadgeMap[tool.category] ?? categoryBadgeMap["text-tools"];
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              prefetch={false}
              className="app-panel-muted group flex items-center gap-3 rounded-[1.5rem] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--primary)]"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold tracking-[0.16em] ${badge.tone}`}
              >
                {badge.short}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[color:var(--foreground)]">
                  {tool.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-[color:var(--muted)]">
                  {tool.shortDescription}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-[color:var(--primary)] opacity-0 transition group-hover:opacity-100">
                Open →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
