import type { ToolDefinition } from "@/lib/tools";
import { ToolCard } from "./tool-card";

export function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (!tools.length) {
    return null;
  }

  const [featuredTool, ...supportingTools] = tools;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ToolCard tool={featuredTool} />
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/88 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--primary-dark)]">
            Also try
          </p>
          <div className="mt-4 space-y-3">
            {supportingTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
