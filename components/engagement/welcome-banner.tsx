"use client";

import { useEngagement } from "./engagement-provider";

export function WelcomeBanner({ toolCount }: { toolCount: number }) {
  const { welcomeDismissed, dismissWelcomeBanner, mounted } = useEngagement();
  if (!mounted || welcomeDismissed) return null;

  return (
    <div
      className="mb-8 flex items-start justify-between gap-4 rounded-[1.8rem] border border-[color:var(--primary)]/20 bg-[color:var(--soft)] px-5 py-4 sm:px-6 sm:py-5"
      style={{ animation: "slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) both" }}
    >
      <div className="min-w-0">
        <p className="text-base font-black tracking-tight text-[color:var(--foreground)]">
          Welcome to Toolbox Hub 👋
        </p>
        <p className="mt-1.5 text-sm leading-7 text-[color:var(--muted)]">
          {toolCount}+ free tools, no signup ever. Your tools and favourites are saved automatically.
          Start with a popular tool below or search for what you need.
        </p>
      </div>
      <button
        type="button"
        onClick={dismissWelcomeBanner}
        aria-label="Dismiss welcome banner"
        className="mt-0.5 shrink-0 text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}
