"use client";

import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { getCategory, type ToolDefinition } from "@/lib/tools";

export function CategoryDirectory({
  tools,
  title = "Browse the full directory",
  description = "Use light filters to narrow the full category list without scrolling through every tool at once.",
  eyebrow = "Category directory",
  browseLabel = "Browse tools in this section",
  placeholder = "Filter this category by name or keyword",
  emptyMessage = "No tools match that search yet. Try a broader keyword.",
}: {
  tools: DirectoryEntry[];
  title?: string;
  description?: string;
  eyebrow?: string;
  browseLabel?: string;
  placeholder?: string;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const deferredQuery = useDeferredValue(query);
  const inputId = useId().replace(/:/g, "");
  const normalizedTools = useMemo(() => tools.map(normalizeDirectoryEntry), [tools]);

  const filteredTools = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return normalizedTools.filter((tool) => {
      if (!normalizedQuery) {
        return true;
      }

      const haystack = [tool.name, tool.shortDescription, tool.categoryLabel, ...tool.keywords]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [deferredQuery, normalizedTools]);

  const visibleTools = filteredTools.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTools.length;
  return (
    <section className="mobile-directory-shell app-panel rounded-[2rem] p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
            {description}
          </p>
        </div>
        <p className="text-sm text-[color:var(--muted)]">{browseLabel}</p>
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
          placeholder={placeholder}
          aria-describedby={`${inputId}-hint`}
          className="mobile-search-input w-full rounded-[1.4rem] border border-[color:var(--border)] bg-white/95 px-4 py-3.5 text-base outline-none transition focus:border-[color:var(--primary)] sm:text-sm"
        />
        <div id={`${inputId}-hint`} className="sr-only">
          Use this field to narrow the tools shown in the category directory.
        </div>
      </div>

      {!filteredTools.length ? (
        <div className="app-panel-muted mt-6 rounded-2xl p-5 text-sm text-[color:var(--muted)]">
          {emptyMessage}
        </div>
      ) : (
        <>
          <div className="mobile-tool-grid mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
            {visibleTools.map((tool) => (
              <DirectoryCard key={tool.id} tool={tool} compact />
            ))}
          </div>
          {hasMore ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + 12)}
                className="mobile-show-more-button rounded-2xl border border-[color:var(--border)] bg-white/92 px-4 py-3.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
              >
                Show more tools
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

type DirectoryEntry =
  | ToolDefinition
  | {
    id?: string;
    slug?: string;
    name: string;
    shortDescription: string;
    keywords: string[];
    href: string;
    categoryLabel: string;
    badgeLabel?: string;
  };

type NormalizedDirectoryEntry = {
  id: string;
  href: string;
  name: string;
  shortDescription: string;
  keywords: string[];
  categoryLabel: string;
  badgeLabel: string;
};

function normalizeDirectoryEntry(tool: DirectoryEntry): NormalizedDirectoryEntry {
  if ("href" in tool && "categoryLabel" in tool) {
    return {
      id: tool.id ?? `entry:${tool.href}`,
      href: tool.href,
      name: tool.name,
      shortDescription: tool.shortDescription,
      keywords: tool.keywords,
      categoryLabel: tool.categoryLabel,
      badgeLabel: tool.badgeLabel ?? tool.categoryLabel,
    };
  }

  const categoryLabel = getCategory(tool.category)?.name ?? tool.category.replace(/-/g, " ");

  return {
    id: `tool:${tool.slug}`,
    href: `/tools/${tool.slug}`,
    name: tool.name,
    shortDescription: tool.shortDescription,
    keywords: tool.keywords,
    categoryLabel,
    badgeLabel: categoryLabel,
  };
}

function DirectoryCard({
  tool,
  compact = false,
}: {
  tool: NormalizedDirectoryEntry;
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
