"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export function ToolLoadingPanel() {
  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="h-5 w-32 rounded-full bg-stone-100" />
      <div className="mt-4 h-9 w-56 rounded-xl bg-stone-100" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded bg-stone-100" />
        <div className="h-4 w-11/12 rounded bg-stone-100" />
      </div>
    </div>
  );
}

// Keep large tool implementations out of the initial route chunk until a tool page actually mounts.
export function buildLazyTool<TProps>(
  loader: () => Promise<ComponentType<TProps>>,
) {
  return dynamic(async () => ({ default: await loader() }), {
    loading: () => <ToolLoadingPanel />,
  });
}
