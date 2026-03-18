"use client";

import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { ToolCard } from "@/components/ui/tool-card";
import { categories, type ToolCategorySlug, type ToolDefinition } from "@/lib/tools";

export function SearchBox({
  tools,
  title = "Find a tool from the registry",
  description = "Search by tool name, keyword, category, or use case. New tools show up here as soon as they are added to the central registry.",
  maxResults = 8,
  suggestedTools = [],
  sectionId,
  showCategoryFilter = false,
  showStatusFilter = false,
  compact = false,
}: {
  tools: ToolDefinition[];
  title?: string;
  description?: string;
  maxResults?: number;
  suggestedTools?: ToolDefinition[];
  sectionId?: string;
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ToolCategorySlug>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ToolDefinition["implementationStatus"]>("all");
  const deferredQuery = useDeferredValue(query);
  const inputId = useId().replace(/:/g, "");
  const suggestionList = suggestedTools.slice(0, 6);
  const filteredTools = tools.filter((tool) => {
    if (categoryFilter !== "all" && tool.category !== categoryFilter) {
      return false;
    }
    if (statusFilter !== "all" && tool.implementationStatus !== statusFilter) {
      return false;
    }
    return true;
  });

  const matches = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return filteredTools
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
        if (tool.category === categoryFilter) score += 10;

        return { tool, score };
      })
      .filter((entry): entry is { tool: ToolDefinition; score: number } => Boolean(entry))
      .sort((left, right) => right.score - left.score || left.tool.name.localeCompare(right.tool.name))
      .slice(0, maxResults)
      .map((entry) => entry.tool);
  }, [categoryFilter, deferredQuery, filteredTools, maxResults]);

  const totalMatches = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) {
      return 0;
    }

    return filteredTools.filter((tool) =>
      [tool.name, tool.shortDescription, tool.longDescription, tool.category, ...tool.keywords]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ).length;
  }, [deferredQuery, filteredTools]);

  const visibleSuggestions =
    suggestionList
      .filter((tool) => (categoryFilter === "all" ? true : tool.category === categoryFilter))
      .filter((tool) => (statusFilter === "all" ? true : tool.implementationStatus === statusFilter))
      .slice(0, 6);

  const quickQueries = ["PDF", "image", "text", "JSON", "hash", "calculator"];

  const shellClass = compact
    ? "rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-5 shadow-sm sm:p-6"
    : "rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm sm:p-8";

  return (
    <section id={sectionId} className={shellClass}>
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
      {showCategoryFilter ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={categoryFilter === "all"}
            className={`rounded-full px-3 py-2 text-sm transition ${
              categoryFilter === "all"
                ? "bg-[color:var(--primary)] text-white"
                : "border border-[color:var(--border)] text-[color:var(--muted)] hover:border-[color:var(--primary)]"
            }`}
            onClick={() => setCategoryFilter("all")}
          >
            All tools
          </button>
          {categories
            .filter((category) => tools.some((tool) => tool.category === category.slug))
            .map((category) => (
              <button
                key={category.slug}
                type="button"
                aria-pressed={categoryFilter === category.slug}
                className={`rounded-full px-3 py-2 text-sm transition ${
                  categoryFilter === category.slug
                    ? "bg-[color:var(--primary)] text-white"
                    : "border border-[color:var(--border)] text-[color:var(--muted)] hover:border-[color:var(--primary)]"
                }`}
                onClick={() => setCategoryFilter(category.slug)}
              >
                {category.name}
              </button>
            ))}
        </div>
      ) : null}
      {showStatusFilter ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { value: "all", label: "All statuses" },
            { value: "working-local", label: "Working only" },
            { value: "reduced-scope-local", label: "Reduced scope" },
            { value: "planned-local", label: "Planned" },
            { value: "coming-soon", label: "Coming soon" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={statusFilter === option.value}
              className={`rounded-full px-3 py-2 text-sm transition ${
                statusFilter === option.value
                  ? "bg-[color:var(--primary)] text-white"
                  : "border border-[color:var(--border)] text-[color:var(--muted)] hover:border-[color:var(--primary)]"
              }`}
              onClick={() => setStatusFilter(option.value as "all" | ToolDefinition["implementationStatus"])}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-5" aria-live="polite">
        {!query ? (
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--muted)]">
              Start with a quick search so the directory feels smaller and more focused from the first click.
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQueries.map((quickQuery) => (
                <button
                  key={quickQuery}
                  type="button"
                  onClick={() => setQuery(quickQuery)}
                  className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
                >
                  {quickQuery}
                </button>
              ))}
            </div>
            {visibleSuggestions.length ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Suggested tools
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {visibleSuggestions.map((tool) => (
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
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--muted)]">
              Showing {matches.length} of {totalMatches} result{totalMatches === 1 ? "" : "s"}
              {categoryFilter === "all" ? "" : ` in ${categories.find((category) => category.slug === categoryFilter)?.name ?? "this category"}`}.
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {matches.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
            {(categoryFilter !== "all" || statusFilter !== "all" || query) && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                  className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)]"
                >
                  Clear filters
                </button>
              </div>
            )}
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
