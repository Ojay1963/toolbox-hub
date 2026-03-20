"use client";

import { getImplementationStatusMeta, type ToolDefinition } from "@/lib/tools";

export function ToolPlaceholder({ tool }: { tool: ToolDefinition }) {
  const statusMeta = getImplementationStatusMeta(tool);

  return (
    <section className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
          Tool UI Slot
        </span>
        <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          {statusMeta.label}
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">Implementation placeholder</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
        This page is wired and production-ready for SEO, routing, metadata, internal linking, and
        content structure. The live browser-side tool logic for <strong>{tool.name}</strong> can be
        plugged in next by mapping this registry entry to a dedicated client component.
      </p>
      {tool.statusNote ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Current note: {tool.statusNote}
        </p>
      ) : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Registry source
          </p>
          <p className="mt-2 text-sm text-slate-700">lib/tools.ts entry for {tool.slug}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Next step
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Add a client component and connect it here without changing page routes or content.
          </p>
        </div>
      </div>
    </section>
  );
}
