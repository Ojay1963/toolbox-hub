import Link from "next/link";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { FaqList } from "@/components/ui/faq-list";
import { RelatedTools } from "@/components/ui/related-tools";
import { Section } from "@/components/ui/section";
import { type ToolDefinition } from "@/lib/tools";

export function ToolPage({
  tool,
  relatedTools,
  categoryPopularTools,
  categoryRecentTools,
}: {
  tool: ToolDefinition;
  relatedTools: ToolDefinition[];
  categoryPopularTools: ToolDefinition[];
  categoryRecentTools: ToolDefinition[];
}) {
  const categoryLabel = tool.category.replace(/-/g, " ");
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
              {categoryLabel}
            </Link>
            <span>/</span>
            <span className="text-[color:var(--foreground)]">{tool.name}</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            {tool.name}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{tool.name}</h1>
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
            Browse more options in{" "}
            <Link href={`/category/${tool.category}`} className="font-semibold text-[color:var(--primary)]">
              {categoryLabel}
            </Link>{" "}
            if you want a similar tool.
          </p>
          {relatedTools.length ? (
            <p>
              Related options include{" "}
              {relatedTools.map((item, index) => (
                <span key={item.slug}>
                  {index > 0 ? (index === relatedTools.length - 1 ? ", and " : ", ") : ""}
                  <Link href={`/tools/${item.slug}`} className="font-semibold text-[color:var(--primary)]">
                    {item.name}
                  </Link>
                </span>
              ))}
              .
            </p>
          ) : null}
        </Section>

        <Section title="How to use">
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

        <Section title={`More ${categoryLabel}`}>
          <p>
            If you want a nearby workflow in the same topic cluster, browse more tools from the{" "}
            <Link href={`/category/${tool.category}`} className="font-semibold text-[color:var(--primary)]">
              {categoryLabel}
            </Link>{" "}
            category below.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {categoryPopularTools.slice(0, 4).map((item) => (
              <Link
                key={`category-popular-${item.slug}`}
                href={`/tools/${item.slug}`}
                className="rounded-2xl border border-[color:var(--border)] bg-stone-50 px-4 py-4 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--foreground)]"
              >
                <span className="block font-semibold text-[color:var(--foreground)]">{item.name}</span>
                <span className="mt-1 block leading-6">{item.shortDescription}</span>
              </Link>
            ))}
          </div>
        </Section>
      </div>

      <div className="space-y-6">
        <AdPlaceholder
          slot={`tool-${tool.slug}-sidebar`}
          label="Advertisement"
          format="sidebar"
        />
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight">Quick notes</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{tool.shortDescription}</p>
        </section>
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight">Explore more</h2>
          <div className="mt-4 space-y-5 text-sm text-[color:var(--muted)]">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                Browse
              </p>
              <Link href="/" className="block transition hover:text-[color:var(--primary)]">
                Browse all tools
              </Link>
              <Link href="/#search-tools" className="block transition hover:text-[color:var(--primary)]">
                Search all tools
              </Link>
              <Link
                href={`/category/${tool.category}`}
                className="block transition hover:text-[color:var(--primary)]"
              >
                More {categoryLabel}
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                Related tools
              </p>
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
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                Popular in {categoryLabel}
              </p>
              {categoryPopularTools.map((item) => (
                <Link
                  key={`popular-${item.slug}`}
                  href={`/tools/${item.slug}`}
                  className="block transition hover:text-[color:var(--primary)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                More in {categoryLabel}
              </p>
              {categoryRecentTools.map((item) => (
                <Link
                  key={`recent-${item.slug}`}
                  href={`/tools/${item.slug}`}
                  className="block transition hover:text-[color:var(--primary)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
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
          label="Advertisement"
          format="leaderboard"
        />
      </div>
    </div>
  );
}
