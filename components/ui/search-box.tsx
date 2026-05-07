"use client";

import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { categories, getCategory, type ToolDefinition } from "@/lib/tools";

export function SearchBox({
  tools,
  title = "Find a tool from the registry",
  description = "Search by tool name, keyword, category, or use case to reach the right page faster.",
  maxResults = 8,
  suggestedTools = [],
  sectionId,
  showCategoryFilter = false,
  compact = false,
  placeholder = "Search by tool name or keyword",
}: {
  tools: SearchBoxEntry[];
  title?: string;
  description?: string;
  maxResults?: number;
  suggestedTools?: SearchBoxEntry[];
  sectionId?: string;
  showCategoryFilter?: boolean;
  compact?: boolean;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const deferredQuery = useDeferredValue(query);
  const inputId = useId().replace(/:/g, "");
  const suggestionList = suggestedTools.slice(0, 6);
  const normalizedTools = useMemo(() => tools.map(normalizeEntry), [tools]);
  const availableCategories = useMemo(() => {
    const categoryMap = new Map<string, string>();

    for (const tool of normalizedTools) {
      categoryMap.set(tool.categoryKey, tool.categoryLabel);
    }

    return Array.from(categoryMap.entries()).map(([slug, name]) => ({ slug, name }));
  }, [normalizedTools]);
  const filteredTools = normalizedTools.filter((tool) => {
    if (categoryFilter !== "all" && tool.categoryKey !== categoryFilter) {
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
          tool.categoryLabel,
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
        if (tool.priority === "ready") score += 15;
        if (tool.priority === "partial") score += 8;
        if (tool.categoryKey === categoryFilter) score += 10;

        return { tool, score };
      })
      .filter((entry): entry is { tool: NormalizedSearchBoxEntry; score: number } => Boolean(entry))
      .sort((left, right) => right.score - left.score || left.tool.name.localeCompare(right.tool.name))
      .slice(0, maxResults)
      .map((entry) => entry.tool);
  }, [categoryFilter, deferredQuery, filteredTools, maxResults]);
  const instantSuggestions = matches.slice(0, 4);

  const visibleSuggestions = suggestionList
    .map(normalizeEntry)
    .filter((tool) => (categoryFilter === "all" ? true : tool.categoryKey === categoryFilter))
    .slice(0, 6);
  const categoryPreviewTools = filteredTools.slice(0, 6);

  const quickQueries = ["PDF merge", "compress image", "JSON formatter", "QR code", "loan calculator", "word counter"];

  const shellClass = compact
    ? "app-panel rounded-[2rem] p-5 sm:p-6"
    : "app-panel rounded-[2rem] p-6 sm:p-8";

  return (
    <section id={sectionId} className={shellClass}>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
        Search Tools
      </p>
      <h2 className="mobile-search-title mt-2 text-3xl font-black tracking-tight">{title}</h2>
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
        placeholder={placeholder}
        aria-describedby={`${inputId}-hint`}
        className="mobile-search-input mt-5 w-full rounded-[1.4rem] border border-[color:var(--border)] bg-white/95 px-4 py-3.5 text-base outline-none transition focus:border-[color:var(--primary)] sm:text-sm"
      />
      <div id={`${inputId}-hint`} className="sr-only">
        Search for tools by name, category, or keyword.
      </div>
      {showCategoryFilter ? (
        <div className="mobile-wrap-chip-row mt-4 flex flex-wrap gap-2">
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
          {availableCategories.map((category) => (
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
      {query.trim() ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Instant suggestions
          </p>
          <div className="mobile-wrap-chip-row mt-3 flex flex-wrap gap-2">
            {instantSuggestions.length ? instantSuggestions.map((tool) => (
              <Link
                key={`instant-${tool.id}`}
                href={tool.href}
                prefetch={false}
                className="rounded-full border border-[color:var(--border)] bg-white/80 px-3 py-2 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
              >
                {tool.name}
              </Link>
            )) : (
              <span className="rounded-full border border-dashed border-[color:var(--border)] bg-white/60 px-3 py-2 text-sm text-[color:var(--muted)]">
                Keep typing to narrow the directory
              </span>
            )}
          </div>
        </div>
      ) : null}
      <div className="mt-5" aria-live="polite">
        {!query ? (
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--muted)]">
              Start with a quick search so the directory feels smaller and more focused from the first click.
            </p>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Popular searches
              </p>
            </div>
            <div className="mobile-wrap-chip-row flex flex-wrap gap-2">
              {quickQueries.map((quickQuery) => (
                <button
                  key={quickQuery}
                  type="button"
                  onClick={() => setQuery(quickQuery)}
                  className="rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-2 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
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
                <div className="mobile-wrap-chip-row mt-3 flex flex-wrap gap-2">
                  {visibleSuggestions.map((tool) => (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      prefetch={false}
                      className="rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-2 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {categoryFilter !== "all" && categoryPreviewTools.length ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  {availableCategories.find((category) => category.slug === categoryFilter)?.name ?? "Filtered"} tools
                </p>
                <div className="mobile-tool-grid mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {categoryPreviewTools.map((tool) => (
                    <SearchResultCard key={tool.id} tool={tool} compact />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : matches.length ? (
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--muted)]">
              Search results
              {categoryFilter === "all" ? "" : ` in ${availableCategories.find((category) => category.slug === categoryFilter)?.name ?? "this category"}`}.
            </p>
            <div className="mobile-tool-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {matches.map((tool) => (
                <SearchResultCard key={tool.id} tool={tool} />
              ))}
            </div>
            {(categoryFilter !== "all" || query) && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategoryFilter("all");
                  }}
                  className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--muted)]">
              No tools match that search yet. Try a broader keyword, switch categories, or use one of the popular searches below.
            </p>
            <div className="mobile-wrap-chip-row flex flex-wrap gap-2">
              {quickQueries.map((quickQuery) => (
                <button
                  key={`empty-${quickQuery}`}
                  type="button"
                  onClick={() => setQuery(quickQuery)}
                  className="rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-2 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
                >
                  {quickQuery}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type SearchBoxEntry =
  | ToolDefinition
  | {
    id?: string;
    slug?: string;
    name: string;
    shortDescription: string;
    longDescription?: string;
    keywords: string[];
    href: string;
    categoryKey: string;
    categoryLabel: string;
    badgeLabel?: string;
    priority?: "ready" | "partial";
  };

type NormalizedSearchBoxEntry = {
  id: string;
  href: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  categoryKey: string;
  categoryLabel: string;
  badgeLabel: string;
  priority: "ready" | "partial";
};

function normalizeEntry(tool: SearchBoxEntry): NormalizedSearchBoxEntry {
  if ("href" in tool && "categoryKey" in tool && "categoryLabel" in tool) {
    return {
      id: tool.id ?? `entry:${tool.href}`,
      href: tool.href,
      name: tool.name,
      shortDescription: tool.shortDescription,
      longDescription: tool.longDescription ?? tool.shortDescription,
      keywords: tool.keywords,
      categoryKey: tool.categoryKey,
      categoryLabel: tool.categoryLabel,
      badgeLabel: tool.badgeLabel ?? tool.categoryLabel,
      priority: tool.priority ?? "ready",
    };
  }

  const categoryLabel =
    getCategory(tool.category)?.name ??
    categories.find((category) => category.slug === tool.category)?.name ??
    tool.category.replace(/-/g, " ");

  return {
    id: `tool:${tool.slug}`,
    href: `/tools/${tool.slug}`,
    name: tool.name,
    shortDescription: tool.shortDescription,
    longDescription: tool.longDescription,
    keywords: tool.keywords,
    categoryKey: tool.category,
    categoryLabel,
    badgeLabel: categoryLabel,
    priority: tool.implementationStatus === "working-local" ? "ready" : "partial",
  };
}

function SearchResultCard({
  tool,
  compact = false,
}: {
  tool: NormalizedSearchBoxEntry;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Link
        href={tool.href}
        prefetch={false}
        className="mobile-compact-tool-card app-panel-muted group block rounded-2xl px-4 py-3 transition hover:border-[color:var(--primary)]"
      >
        <p className="text-sm font-semibold text-[color:var(--foreground)] transition group-hover:text-[color:var(--primary)]">
          {tool.name}
        </p>
        <p className="mt-1 text-xs leading-6 text-[color:var(--muted)]">
          {tool.shortDescription}
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={tool.href}
      prefetch={false}
      className="mobile-tool-card app-panel group rounded-3xl p-5 transition hover:-translate-y-1 hover:border-[color:var(--primary)]/35 hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
          {tool.badgeLabel}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight">{tool.name}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{tool.shortDescription}</p>
      <p className="mt-4 text-sm font-semibold text-[color:var(--primary)] transition group-hover:text-[color:var(--primary-dark)]">
        Open tool
      </p>
    </Link>
  );
}
