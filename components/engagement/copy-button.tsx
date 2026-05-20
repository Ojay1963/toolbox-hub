"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy to clipboard"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300"
          : "border-[color:var(--border)] bg-white/80 text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] dark:bg-slate-800/80"
      } ${className}`}
    >
      {copied ? (
        <>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M3 8l3 3 7-7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
            <rect x="5" y="5" width="9" height="9" rx="1.5" />
            <path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
