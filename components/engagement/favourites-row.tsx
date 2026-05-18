"use client";

import Link from "next/link";
import { useEngagement } from "./engagement-provider";

const categoryBadgeMap: Record<string, { short: string; tone: string }> = {
  "image-tools": { short: "IMG", tone: "bg-emerald-100 text-emerald-800" },
  "pdf-tools": { short: "PDF", tone: "bg-amber-100 text-amber-800" },
  "text-tools": { short: "TXT", tone: "bg-sky-100 text-sky-800" },
  "developer-tools": { short: "DEV", tone: "bg-slate-200 text-slate-800" },
  "generator-tools": { short: "GEN", tone: "bg-rose-100 text-rose-800" },
  "calculator-tools": { short: "CAL", tone: "bg-violet-100 text-violet-800" },
  "converter-tools": { short: "CNV", tone: "bg-orange-100 text-orange-800" },
  "internet-tools": { short: "WEB", tone: "bg-cyan-100 text-cyan-800" },
  "education-tools": { short: "EDU", tone: "bg-lime-100 text-lime-800" },
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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">
            ★ Your Favourites
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
              <span className="shrink-0 text-rose-400 opacity-60 group-hover:opacity-100">★</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
