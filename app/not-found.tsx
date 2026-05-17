import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getPopularTools } from "@/lib/tools";

export const metadata: Metadata = buildMetadata({
  title: "Page Not Found | Toolbox Hub",
  description: "The page you were looking for does not exist. Browse free online tools for images, PDFs, text, and more.",
  pathname: "/404",
  index: false,
});

const categoryBadgeMap: Record<string, { short: string; tone: string }> = {
  "image-tools": { short: "IMG", tone: "bg-emerald-100 text-emerald-800" },
  "pdf-tools": { short: "PDF", tone: "bg-amber-100 text-amber-800" },
  "text-tools": { short: "TXT", tone: "bg-sky-100 text-sky-800" },
  "developer-tools": { short: "DEV", tone: "bg-slate-200 text-slate-800" },
  "generator-tools": { short: "GEN", tone: "bg-rose-100 text-rose-800" },
  "calculator-tools": { short: "CAL", tone: "bg-violet-100 text-violet-800" },
  "converter-tools": { short: "CNV", tone: "bg-orange-100 text-orange-800" },
  "internet-tools": { short: "WEB", tone: "bg-cyan-100 text-cyan-800" },
};

export default function NotFound() {
  const suggestedTools = getPopularTools(6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          404
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
          Page not found
        </h1>
        <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
          The page you were looking for does not exist or may have moved.
          Try the tool directory or search for what you need.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-[color:var(--primary)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
          >
            Go to homepage
          </Link>
          <Link
            href="/tools"
            className="rounded-full border border-[color:var(--border)] bg-white px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
          >
            Browse all tools
          </Link>
        </div>
      </div>

      <div className="mt-16">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Popular tools
        </p>
        <h2 className="mt-3 text-center text-2xl font-black tracking-tight">
          Try one of these instead
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suggestedTools.map((tool) => {
            const badge = categoryBadgeMap[tool.category] ?? categoryBadgeMap["text-tools"];
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                prefetch={false}
                className="app-panel site-feature-card group rounded-[1.6rem] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--primary)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl px-2 text-[11px] font-bold tracking-[0.18em] ${badge.tone}`}
                  >
                    {badge.short}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[color:var(--foreground)]">
                      {tool.name}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[color:var(--muted)]">
                      {tool.shortDescription}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
