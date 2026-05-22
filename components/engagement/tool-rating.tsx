"use client";

import { useState } from "react";
import { useEngagement } from "./engagement-provider";

export function ToolRating({ slug }: { slug: string }) {
  const { ratings, vote, getVoteCounts, mounted } = useEngagement();
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!mounted) return null;

  const userVote = ratings[slug];
  const counts = getVoteCounts(slug);
  const total = counts.up + counts.down;
  const pct = total > 0 ? Math.round((counts.up / total) * 100) : 0;

  const handleThumbsDown = () => {
    if (!userVote) vote(slug, "down");
  };

  const handleFeedback = () => {
    if (feedback.trim()) {
      setFeedbackSent(true);
    }
  };

  return (
    <div className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-5 py-5">
      <p className="text-sm font-semibold text-[color:var(--foreground)]">Was this tool helpful?</p>

      {!userVote ? (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => vote(slug, "up")}
            className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={handleThumbsDown}
            className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--muted)] transition hover:border-rose-300 hover:text-rose-600 dark:bg-slate-800/80"
          >
            No
          </button>
          <p className="text-xs text-[color:var(--muted)]">
            {pct}% helpful ({total.toLocaleString()} votes)
          </p>
        </div>
      ) : userVote === "up" ? (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
          Thanks! Glad it helped — {pct}% found this helpful ({total.toLocaleString()} votes)
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {!feedbackSent ? (
            <>
              <p className="text-sm text-[color:var(--muted)]">What could be better?</p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what didn't work..."
                rows={3}
                className="w-full rounded-[1rem] border border-[color:var(--border)] bg-white/90 px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={handleFeedback}
                className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
              >
                Send feedback
              </button>
            </>
          ) : (
            <p className="text-sm text-[color:var(--muted)]">Thanks for the feedback — we appreciate it!</p>
          )}
        </div>
      )}
    </div>
  );
}
