"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Recommendation {
  toolName: string;
  slug: string;
  reason: string;
}

const EXAMPLES = [
  "I want to make my photo smaller",
  "I need to combine two PDF files",
  "I want to create a secure password",
  "How do I convert text to uppercase?",
  "I need to format my JSON code",
];

export default function RecommendPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Recommendation[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json() as { recommendations?: Recommendation[]; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResults(data.recommendations ?? []);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          AI Recommender
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          What do you want to do?
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[color:var(--muted)]">
          Describe your task in plain English and the AI will find the best free tools for you from the Toolbox Hub directory.
        </p>
      </div>

      <div className="app-panel rounded-[2rem] p-6 sm:p-8">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(query);
            }
          }}
          placeholder="e.g. I want to compress my image without losing quality"
          rows={3}
          className="w-full rounded-[1.4rem] border border-[color:var(--border)] bg-white/90 px-4 py-3.5 text-base leading-7 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] dark:bg-[#1e293b]"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(query)}
            disabled={loading || !query.trim()}
            className="rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[color:var(--primary-dark)] disabled:opacity-50"
          >
            {loading ? "Finding tools…" : "Find My Tool →"}
          </button>
          <span className="text-xs text-[color:var(--muted)]">or try an example:</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => handleSubmit(ex)}
              className="rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1.5 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="mt-8"
          >
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Top recommendations
            </p>
            <div className="grid gap-4">
              {results.map((rec, i) => (
                <motion.div
                  key={rec.slug}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 320, damping: 28 }}
                  className="app-panel rounded-[1.8rem] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-black tracking-tight text-[color:var(--foreground)]">
                        {rec.toolName}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{rec.reason}</p>
                    </div>
                    <Link
                      href={`/tools/${rec.slug}`}
                      className="shrink-0 rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[color:var(--primary-dark)]"
                    >
                      Open →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 text-center text-xs text-[color:var(--muted)]">
        Powered by Claude AI · All tools are free, no signup required ·{" "}
        <Link href="/tools" className="font-semibold text-[color:var(--primary)]">
          Browse all tools
        </Link>
      </div>
    </div>
  );
}
