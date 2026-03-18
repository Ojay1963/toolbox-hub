import Link from "next/link";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { FaqList } from "@/components/ui/faq-list";
import { RelatedTools } from "@/components/ui/related-tools";
import { Section } from "@/components/ui/section";
import type { ToolDefinition } from "@/lib/tools";

export function ToolPage({
  tool,
  relatedTools,
}: {
  tool: ToolDefinition;
  relatedTools: ToolDefinition[];
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-sm sm:p-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]"
          >
            <Link href="/" className="transition hover:text-[color:var(--primary)]">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/category/${tool.category}`}
              className="transition hover:text-[color:var(--primary)]"
            >
              {tool.category.replace(/-/g, " ")}
            </Link>
            <span>/</span>
            <span className="text-[color:var(--foreground)]">{tool.name}</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            {tool.name}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{tool.name}</h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
              {tool.implementationStatus}
            </span>
          </div>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
            {tool.longDescription}
          </p>
          <div className="mt-8">
            <ToolRenderer tool={tool} />
          </div>
        </section>

        <Section title="About this tool">
          <p>{tool.longDescription}</p>
          <p>
            This page belongs to the{" "}
            <Link href={`/category/${tool.category}`} className="font-semibold text-[color:var(--primary)]">
              {tool.category.replace(/-/g, " ")}
            </Link>{" "}
            category, so you can move to similar workflows if you need another option or a related task.
          </p>
        </Section>

        <Section title="How to use">
          <p>
            Follow these steps to use {tool.name.toLowerCase()} with the current browser-first
            workflow.
          </p>
          <ol className="space-y-3 pl-5">
            {tool.howToUse.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Section>

        <Section title="FAQ">
          <FaqList items={tool.faq} />
        </Section>

        <Section title="Related tools">
          <RelatedTools tools={relatedTools} />
        </Section>
      </div>

      <div className="space-y-6">
        <AdPlaceholder
          slot={`tool-${tool.slug}-sidebar`}
          label="Tool sidebar slot"
          format="sidebar"
        />
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight">Quick notes</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{tool.shortDescription}</p>
          {tool.statusNote ? (
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{tool.statusNote}</p>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              This tool is planned to fit the same fast, mobile-friendly, browser-first
              architecture used across the site.
            </p>
          )}
        </section>
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight">Internal links</h2>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            <Link href="/" className="block transition hover:text-[color:var(--primary)]">
              Browse all tools
            </Link>
            <Link
              href={`/category/${tool.category}`}
              className="block transition hover:text-[color:var(--primary)]"
            >
              Explore more {tool.category.replace(/-/g, " ")}
            </Link>
            {relatedTools.map((item) => (
              <Link
                key={item.slug}
                href={`/tools/${item.slug}`}
                className="block transition hover:text-[color:var(--primary)]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight">Keywords covered</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {tool.keywords.slice(0, 8).map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--muted)]"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="lg:col-span-2">
        <AdPlaceholder
          slot={`tool-${tool.slug}-post-related-banner`}
          label="Tool content banner"
          format="leaderboard"
        />
      </div>
    </div>
  );
}
