"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMsUntilMidnight } from "@/lib/engagement-store";

interface ToolMeta {
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
}

function useCountdown() {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      const ms = getMsUntilMidnight();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1_000);
      setTimeStr(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, []);

  return timeStr;
}

export function ToolOfTheDay({ tool }: { tool: ToolMeta }) {
  const countdown = useCountdown();

  return (
    <section className="app-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800">
            ✨ Tool of the Day
          </span>
          {countdown && (
            <span className="text-xs text-[color:var(--muted)]">
              Changes in: <span className="font-mono font-semibold text-[color:var(--foreground)]">{countdown}</span>
            </span>
          )}
        </div>
        <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{tool.name}</h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-[color:var(--muted)]">
          {tool.shortDescription}
        </p>
        <Link
          href={`/tools/${tool.slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            boxShadow: "0 0 0 0 color-mix(in srgb, var(--primary) 40%, transparent)",
            animation: "glowPulse 2.4s ease-in-out infinite",
          }}
        >
          Try Today&apos;s Tool →
        </Link>
      </div>
    </section>
  );
}
