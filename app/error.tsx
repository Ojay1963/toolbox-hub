"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          500
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
          Something went wrong
        </h1>
        <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
          An unexpected error occurred. You can try again or go back to the homepage to find another tool.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-[color:var(--primary)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-[color:var(--border)] bg-white px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
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
        {error.digest ? (
          <p className="mt-8 text-xs text-[color:var(--muted)]">
            Error ID: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
