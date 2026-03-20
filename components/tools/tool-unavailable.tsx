import { getToolRequiredEnvVars, type ToolDefinition } from "@/lib/tools";

export function ToolUnavailable({ tool }: { tool: ToolDefinition }) {
  const requiredEnvVars = getToolRequiredEnvVars(tool);

  return (
    <section className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
          Temporarily unavailable
        </span>
        <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Service-backed
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">{tool.name} is not enabled on this deployment</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
        {tool.statusNote ?? "This tool depends on server-side configuration that is not enabled on the current deployment."}
      </p>
      <div className="mt-5 rounded-2xl bg-stone-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Launch behavior
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          This route stays accessible so the workflow can be documented clearly, but it is kept out of
          search indexing and featured discovery until the required service is configured.
        </p>
      </div>
      {requiredEnvVars.length ? (
        <div className="mt-4 rounded-2xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Required environment
          </p>
          <p className="mt-2 text-sm text-slate-700">{requiredEnvVars.join(", ")}</p>
        </div>
      ) : null}
    </section>
  );
}
