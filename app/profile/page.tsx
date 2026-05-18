"use client";

import Link from "next/link";
import { useEngagement } from "@/components/engagement/engagement-provider";
import { ALL_BADGES } from "@/lib/engagement-store";

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

export default function ProfilePage() {
  const { streak, badges, favourites, recentTools, mounted, toggleFavourite } = useEngagement();

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-[2rem] bg-[color:var(--surface-alt)]" />
      </div>
    );
  }

  const earnedBadges = ALL_BADGES.filter((b) => badges.includes(b.id));
  const lockedBadges = ALL_BADGES.filter((b) => !badges.includes(b.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          Your Profile
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">My Toolbox</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
          Your personal stats, badges, and saved tools — stored locally on this device, no login needed.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="app-panel rounded-[2rem] p-5 text-center">
          <p className="text-4xl font-black text-[color:var(--primary)]">
            {streak > 0 ? `🔥 ${streak}` : "0"}
          </p>
          <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">
            Day streak
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            {streak >= 7 ? "On fire! Keep it up." : streak > 1 ? "Come back tomorrow!" : "Start today"}
          </p>
        </div>
        <div className="app-panel rounded-[2rem] p-5 text-center">
          <p className="text-4xl font-black text-[color:var(--primary)]">
            {earnedBadges.length}
          </p>
          <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">
            Badges earned
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            of {ALL_BADGES.length} total
          </p>
        </div>
        <div className="app-panel rounded-[2rem] p-5 text-center">
          <p className="text-4xl font-black text-[color:var(--primary)]">
            {favourites.length}
          </p>
          <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">
            Saved tools
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            {recentTools.length} used recently
          </p>
        </div>
      </div>

      {/* Badges */}
      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          My Badges
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Achievements</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="app-panel rounded-[1.8rem] p-5"
              style={{ animation: "badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
            >
              <p className="text-4xl">{badge.emoji}</p>
              <p className="mt-3 text-base font-bold text-[color:var(--foreground)]">{badge.name}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{badge.description}</p>
            </div>
          ))}
          {lockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="rounded-[1.8rem] border border-dashed border-[color:var(--border)] p-5 opacity-50"
            >
              <p className="text-4xl grayscale">{badge.emoji}</p>
              <p className="mt-3 text-base font-bold text-[color:var(--foreground)]">{badge.name}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{badge.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Favourites */}
      <section className="mt-10" id="favourites">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">
              ★ Favourites
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Saved tools</h2>
          </div>
        </div>
        {favourites.length === 0 ? (
          <div className="mt-5 rounded-[1.8rem] border border-dashed border-[color:var(--border)] p-8 text-center">
            <p className="text-sm text-[color:var(--muted)]">
              No saved tools yet. Click the ♡ heart on any tool to save it here.
            </p>
            <Link
              href="/tools"
              className="mt-4 inline-block text-sm font-semibold text-[color:var(--primary)]"
            >
              Browse tools →
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favourites.map((slug) => {
              return (
                <div key={slug} className="app-panel-muted flex items-center gap-3 rounded-[1.5rem] p-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/tools/${slug}`}
                      className="text-sm font-bold text-[color:var(--foreground)] hover:text-[color:var(--primary)]"
                    >
                      {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Link>
                    <p className="mt-0.5 text-xs text-[color:var(--muted)] font-mono">/tools/{slug}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavourite(slug)}
                    aria-label="Remove from favourites"
                    className="shrink-0 text-rose-400 hover:text-rose-600"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent tools */}
      {recentTools.length > 0 && (
        <section className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            🕐 Recent
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Recently used</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTools.map((slug) => (
              <Link
                key={slug}
                href={`/tools/${slug}`}
                className="app-panel-muted block rounded-[1.5rem] p-4 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <p className="text-xs text-[color:var(--muted)]">
          All data is stored locally on this device. Nothing is sent to a server.
        </p>
        <Link href="/tools" className="mt-3 inline-block text-sm font-semibold text-[color:var(--primary)]">
          Browse all tools →
        </Link>
      </div>
    </div>
  );
}
