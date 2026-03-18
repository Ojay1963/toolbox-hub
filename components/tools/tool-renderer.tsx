import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ToolDefinition } from "@/lib/tools";

function LoadingToolPanel() {
  return (
    <section className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="h-5 w-32 rounded-full bg-stone-100" />
      <div className="mt-4 h-9 w-56 rounded-xl bg-stone-100" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded bg-stone-100" />
        <div className="h-4 w-11/12 rounded bg-stone-100" />
        <div className="h-4 w-3/4 rounded bg-stone-100" />
      </div>
    </section>
  );
}

function buildDynamicRouter(
  loader: () => Promise<ComponentType<{ tool: ToolDefinition }>>,
) {
  return dynamic(async () => ({ default: await loader() }), {
    loading: () => <LoadingToolPanel />,
  });
}

const categoryRouterMap: Record<ToolDefinition["category"], ComponentType<{ tool: ToolDefinition }>> = {
  "image-tools": buildDynamicRouter(() => import("@/components/tools/image-tool-router").then((m) => m.ImageToolRouter)),
  "pdf-tools": buildDynamicRouter(() => import("@/components/tools/pdf-tool-router").then((m) => m.PdfToolRouter)),
  "text-tools": buildDynamicRouter(() => import("@/components/tools/text-tool-router").then((m) => m.TextToolRouter)),
  "developer-tools": buildDynamicRouter(() => import("@/components/tools/developer-tool-router").then((m) => m.DeveloperToolRouter)),
  "generator-tools": buildDynamicRouter(() => import("@/components/tools/generator-tool-router").then((m) => m.GeneratorToolRouter)),
  "calculator-tools": buildDynamicRouter(() => import("@/components/tools/calculator-tool-router").then((m) => m.CalculatorToolRouter)),
  "converter-tools": buildDynamicRouter(() => import("@/components/tools/converter-tool-router").then((m) => m.ConverterToolRouter)),
  "internet-tools": buildDynamicRouter(() => import("@/components/tools/internet-tool-router").then((m) => m.InternetToolRouter)),
};

export function ToolRenderer({ tool }: { tool: ToolDefinition }) {
  const ToolRouter = categoryRouterMap[tool.category];
  return <ToolRouter tool={tool} />;
}
