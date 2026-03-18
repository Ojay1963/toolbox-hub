"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ToolCard } from "@/components/ui/tool-card";
import type { ToolDefinition } from "@/lib/tools";

export function SearchBox({
  tools,
  title = "Find a tool from the registry",
  description = "Search by tool name, keyword, category, or use case. New tools show up here as soon as they are added to the central registry.",
  maxResults = 8,
  suggestedTools = [],
  sectionId,
}: {
  tools: ToolDefinition[];
  title?: string;
  description?: string;
  maxResults?: number;
  suggestedTools?: ToolDefinition[];
  sectionId?: string;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputId = "tool-search";
  const suggestionList = suggestedTools.slice(0, 6);

  const matches = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return tools
      .map((tool) => {
        const haystack = [
          tool.name,
          tool.shortDescription,
          tool.longDescription,
          tool.category,
          ...tool.keywords,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalized)) {
          return null;
        }

        let score = 0;
        const name = tool.name.toLowerCase();
        if (name === normalized) score += 120;
        if (name.startsWith(normalized)) score += 70;
        if (tool.keywords.some((keyword) => keyword.toLowerCase().includes(normalized))) score += 35;
        if (tool.shortDescription.toLowerCase().includes(normalized)) score += 20;
        if (tool.implementationStatus === "working-local") score += 15;
        if (tool.implementationStatus === "reduced-scope-local") score += 8;

        return { tool, score };
      })
      .filter((entry): entry is { tool: ToolDefinition; score: number } => Boolean(entry))
      .sort((left, right) => right.score - left.score || left.tool.name.localeCompare(right.tool.name))
      .slice(0, maxResults)
      .map((entry) => entry.tool);
  }, [deferredQuery, maxResults, tools]);

  return (
    <section id={sectionId} className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
        Search Tools
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
        {description}
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
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--muted)]">
              Try searches like `PDF`, `converter`, `image`, `text`, or `generator`.
            </p>
            {suggestionList.length ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Suggested tools
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestionList.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
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
