import type { ToolDefinition } from "@/lib/tools";
import { ToolCard } from "./tool-card";

export function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}
