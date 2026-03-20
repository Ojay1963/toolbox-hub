"use client";

import { type ToolDefinition } from "@/lib/tools";

export function ToolPlaceholder({ tool }: { tool: ToolDefinition }) {
  return (
    <section className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
          Coming soon
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">{tool.name} is coming soon</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
        We’re still finishing this tool. Check back soon.
      </p>
      {tool.statusNote ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          {tool.statusNote}
        </p>
      ) : null}
    </section>
  );
}
