"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import { ToolCard } from "@/components/ui/tool-card";
import type { ToolDefinition } from "@/lib/tools";

type DirectoryFilter = "all" | "working-local" | "reduced-scope-local" | "planned";

export function CategoryDirectory({
  tools,
  title = "Browse the full directory",
  description = "Use light filters to narrow the full category list without scrolling through every tool at once.",
}: {
  tools: ToolDefinition[];
  title?: string;
  description?: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DirectoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(12);
  const deferredQuery = useDeferredValue(query);
  const inputId = useId().replace(/:/g, "");

  const filteredTools = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "planned"
            ? tool.implementationStatus === "planned-local" || tool.implementationStatus === "coming-soon"
            : tool.implementationStatus === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [tool.name, tool.shortDescription, tool.category, ...tool.keywords]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [deferredQuery, filter, tools]);

  const visibleTools = filteredTools.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTools.length;

  const filterOptions: Array<{ key: DirectoryFilter; label: string }> = [
    { key: "all", label: `All (${tools.length})` },
    {
      key: "working-local",
      label: `Working (${tools.filter((tool) => tool.implementationStatus === "working-local").length})`,
    },
    {
      key: "reduced-scope-local",
      label: `Reduced (${tools.filter((tool) => tool.implementationStatus === "reduced-scope-local").length})`,
    },
    {
      key: "planned",
      label: `Planned (${tools.filter((tool) => tool.implementationStatus === "planned-local" || tool.implementationStatus === "coming-soon").length})`,
    },
  ];

  return (
    <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            Category directory
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
            {description}
          </p>
        </div>
        <p className="text-sm text-[color:var(--muted)]">
          Showing {visibleTools.length} of {filteredTools.length} matching tools
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <label htmlFor={inputId} className="sr-only">
          Filter tools in this category by name or keyword
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(12);
          }}
          placeholder="Filter this category by name or keyword"
          aria-describedby={`${inputId}-hint`}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
        />
        <div id={`${inputId}-hint`} className="sr-only">
          Use this field to narrow the tools shown in the category directory.
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={filter === option.key}
              onClick={() => {
                setFilter(option.key);
                setVisibleCount(12);
              }}
              className={`rounded-full px-3 py-2 text-sm transition ${
                filter === option.key
                  ? "bg-[color:var(--primary)] text-white"
                  : "border border-[color:var(--border)] bg-white text-[color:var(--muted)] hover:border-[color:var(--primary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {!filteredTools.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--border)] bg-stone-50 p-5 text-sm text-[color:var(--muted)]">
          No tools match this filter yet. Try a broader keyword or switch the status filter back to
          all.
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
            {visibleTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} compact />
            ))}
          </div>
          {hasMore ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + 12)}
                className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
              >
                Show 12 more tools
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
