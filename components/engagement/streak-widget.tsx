"use client";

import Link from "next/link";
import { useEngagement } from "./engagement-provider";

export function StreakBadge({ className = "" }: { className?: string }) {
  const { streak, mounted } = useEngagement();
  if (!mounted || streak === 0) return null;

  return (
    <Link
      href="/profile"
      title={`${streak}-day streak — view your profile`}
      className={`flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 ${className}`}
    >
      <span aria-hidden="true">🔥</span>
      <span>{streak} day{streak !== 1 ? "s" : ""}</span>
    </Link>
  );
}

export function StreakCard() {
  const { streak, mounted } = useEngagement();
  if (!mounted) return null;

  const isStreakBroken = streak === 1;

  return (
    <div className="app-panel rounded-[2rem] p-6 sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
        Your Streak
      </p>
      {streak > 1 ? (
        <>
          <h2 className="mt-2 text-2xl font-black tracking-tight">
            🔥 {streak}-day streak!
          </h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
            You&apos;ve visited Toolbox Hub {streak} days in a row. Come back tomorrow to keep your streak alive.
          </p>
        </>
      ) : isStreakBroken ? (
        <>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Start a new streak today</h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
            Come back tomorrow to build your streak. Use a tool today to get started.
          </p>
        </>
      ) : null}
    </div>
  );
}
