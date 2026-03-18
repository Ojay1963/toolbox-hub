"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "@/components/ui/tool-card";
import type { ToolDefinition } from "@/lib/tools";

export function SearchBox({ tools }: { tools: ToolDefinition[] }) {
  const [query, setQuery] = useState("");
  const inputId = "tool-search";

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return tools
      .filter((tool) => {
        const haystack = [
          tool.name,
          tool.shortDescription,
          tool.longDescription,
          tool.category,
          ...tool.keywords,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalized);
      })
      .slice(0, 6);
  }, [query, tools]);

  return (
    <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
        Search Tools
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-tight">Find a tool from the registry</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
        This shared search UI reads directly from the central registry, so new tools appear here as
        soon as they are added.
      </p>
      <label htmlFor={inputId} className="sr-only">
        Search the tool directory
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by tool name or keyword"
        aria-describedby={`${inputId}-hint`}
        className="mt-5 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
      />
      <div id={`${inputId}-hint`} className="sr-only">
        Search for tools by name, category, or keyword.
      </div>
      <div className="mt-5" aria-live="polite">
        {!query ? (
          <p className="text-sm text-[color:var(--muted)]">
            Try searches like `PDF`, `converter`, `text`, or `generator`.
          </p>
        ) : matches.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--muted)]">
            No tools match that search yet. Try a broader keyword or browse the categories below.
          </p>
        )}
      </div>
    </section>
  );
}
