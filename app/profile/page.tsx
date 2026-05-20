"use client";

import Link from "next/link";
import { useEngagement } from "@/components/engagement/engagement-provider";
import { ALL_BADGES, type BadgeDef } from "@/lib/engagement-store";

function BadgeIcon({ iconType }: { iconType: BadgeDef["iconType"] }) {
  if (iconType === "fire") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9 text-orange-500" aria-hidden="true">
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.545 3.75 3.75 0 0 1 3.255 3.717Z" clipRule="evenodd" />
      </svg>
    );
  }
  if (iconType === "bolt") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9 text-yellow-500" aria-hidden="true">
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.818a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .845-.143Z" clipRule="evenodd" />
      </svg>
    );
  }
  const trophyColor =
    iconType === "trophy-gold" ? "text-yellow-400" :
    iconType === "trophy-silver" ? "text-slate-400" :
    "text-amber-700";
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`h-9 w-9 ${trophyColor}`} aria-hidden="true">
      <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.25Z" clipRule="evenodd" />
    </svg>
  );
}

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
          <p className="flex items-center justify-center gap-2 text-4xl font-black text-[color:var(--primary)]">
            {streak > 0 && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-orange-500" aria-hidden="true">
                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.545 3.75 3.75 0 0 1 3.255 3.717Z" clipRule="evenodd" />
              </svg>
            )}
            {streak > 0 ? streak : "0"}
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
              <BadgeIcon iconType={badge.iconType} />
              <p className="mt-3 text-base font-bold text-[color:var(--foreground)]">{badge.name}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{badge.description}</p>
            </div>
          ))}
          {lockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="rounded-[1.8rem] border border-dashed border-[color:var(--border)] p-5 opacity-50"
            >
              <span className="opacity-40 grayscale"><BadgeIcon iconType={badge.iconType} /></span>
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
            <p className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
              Favourites
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Saved tools</h2>
          </div>
        </div>
        {favourites.length === 0 ? (
          <div className="mt-5 rounded-[1.8rem] border border-dashed border-[color:var(--border)] p-8 text-center">
            <p className="text-sm text-[color:var(--muted)]">
              No saved tools yet. Click the heart icon on any tool to save it here.
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
          <p className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
            </svg>
            Recent
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
