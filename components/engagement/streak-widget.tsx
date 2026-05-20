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
      className={`flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 dark:border-orange-800/60 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.545 3.75 3.75 0 0 1 3.255 3.717Z" clipRule="evenodd" />
      </svg>
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
            <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-orange-500" aria-hidden="true">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.545 3.75 3.75 0 0 1 3.255 3.717Z" clipRule="evenodd" />
            </svg>
            {streak}-day streak!
          </span>
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
