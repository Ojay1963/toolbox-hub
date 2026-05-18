"use client";

import { useState } from "react";
import { useEngagement } from "./engagement-provider";

export function ShareButton({
  slug,
  toolName,
  className = "",
}: {
  slug: string;
  toolName: string;
  className?: string;
}) {
  const { showToast } = useEngagement();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/tools/${slug}`;
    const shareData = {
      title: `${toolName} — Toolbox Hub`,
      text: `Check out ${toolName} on Toolbox Hub — free, no signup required.`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Link copied to clipboard!", { type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Could not copy link — try manually copying the URL.", { type: "info" });
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className={`flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] ${className}`}
    >
      {copied ? (
        <>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-emerald-600">
            <path d="M3 8l3.5 3.5L13 5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}
