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

export function FavouritesRow({ allTools }: { allTools: ToolMeta[] }) {
  const { favourites, mounted } = useEngagement();
  if (!mounted || favourites.length === 0) return null;

  const toolMap = new Map(allTools.map((t) => [t.slug, t]));
  const favTools = favourites
    .map((slug) => toolMap.get(slug))
    .filter((t): t is ToolMeta => Boolean(t));

  if (favTools.length === 0) return null;

  return (
    <section className="mb-8" id="favourites">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
            Your Favourites
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Saved tools</h2>
        </div>
        <Link href="/profile#favourites" className="shrink-0 text-xs font-semibold text-[color:var(--primary)]">
          Manage →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {favTools.slice(0, 6).map((tool) => {
          const badge = categoryBadgeMap[tool.category] ?? categoryBadgeMap["text-tools"];
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              prefetch={false}
              className="app-panel-muted group flex items-center gap-3 rounded-[1.5rem] p-4 transition hover:-translate-y-0.5 hover:border-rose-200"
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
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-400 opacity-60 transition group-hover:opacity-100" aria-hidden="true">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
