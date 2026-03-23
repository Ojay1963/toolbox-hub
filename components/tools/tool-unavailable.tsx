import { type ToolDefinition } from "@/lib/tools";

export function ToolUnavailable({ tool }: { tool: ToolDefinition }) {
  return (
    <section className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
          Temporarily unavailable
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">{tool.name} is not available right now</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
        This page stays available so you can understand the workflow and choose a nearby alternative if needed.
      </p>
    </section>
  );
}
