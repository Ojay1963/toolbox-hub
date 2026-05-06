import Link from "next/link";
import { EducationToolRenderer } from "@/components/education/tool-renderer";
import { EducationToolCard } from "@/components/education/tool-card";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { FaqList } from "@/components/ui/faq-list";
import { Section } from "@/components/ui/section";
import type { EducationFaqItem, EducationTool } from "@/lib/education-tools";

export function EducationToolPage({
  tool,
  relatedTools,
  popularTools,
  howTo,
  article,
  faq,
}: {
  tool: EducationTool;
  relatedTools: EducationTool[];
  popularTools: EducationTool[];
  howTo: string[];
  article: string[];
  faq: EducationFaqItem[];
}) {
  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <section className="site-hero app-panel rounded-[2rem] p-6 sm:p-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]">
              <Link href="/" className="transition hover:text-[color:var(--primary)]">
                Home
              </Link>
              <span>/</span>
              <Link href="/tools" className="transition hover:text-[color:var(--primary)]">
                Tools
              </Link>
              <span>/</span>
              <Link href="/tools/education" className="transition hover:text-[color:var(--primary)]">
                Education
              </Link>
              <span>/</span>
              <span className="text-[color:var(--foreground)]">{tool.name}</span>
            </nav>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                Educational Tools
              </span>
              <span className="rounded-full bg-[color:var(--surface-alt)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {tool.group.replace(/-/g, " ")}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                Free
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              {tool.name}
            </p>
            <h1 className="site-hero-title mt-3 text-4xl font-black tracking-tight sm:text-5xl">{tool.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">{tool.seoDescription}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-[color:var(--surface-alt)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Use case</p>
                <p className="mt-2 text-sm font-bold text-[color:var(--foreground)]">{tool.shortDescription}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[color:var(--surface-alt)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Price</p>
                <p className="mt-2 text-sm font-bold text-[color:var(--foreground)]">Free</p>
              </div>
              <div className="rounded-[1.5rem] bg-[color:var(--surface-alt)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Works on</p>
                <p className="mt-2 text-sm font-bold text-[color:var(--foreground)]">Phone, tablet, desktop</p>
              </div>
            </div>
            <div className="mt-8 rounded-[1.75rem] bg-[color:var(--surface-alt)]/70 p-3 sm:p-4">
              <EducationToolRenderer tool={tool} />
            </div>
          </section>

          <Section title={`About ${tool.name}`}>
            {article.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Section>

          <Section title={`How to use ${tool.name.toLowerCase()}`}>
            <ol className="space-y-3 pl-5">
              {howTo.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Section>

          <Section title={`${tool.name} FAQs`}>
            <FaqList items={faq} />
          </Section>

          <Section title="Related tools">
            <div className="grid gap-4 md:grid-cols-2">
              {relatedTools.map((item) => (
                <EducationToolCard key={item.slug} tool={item} compact />
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <AdPlaceholder
            slot={`education-tool-${tool.slug}-sidebar`}
            label="Advertisement"
            format="sidebar"
          />
          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Browse more</h2>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
              <Link href="/tools/education" className="block transition hover:text-[color:var(--primary)]">
                All educational tools
              </Link>
              <Link href="/tools" className="block transition hover:text-[color:var(--primary)]">
                All tools
              </Link>
              <Link href="/" className="block transition hover:text-[color:var(--primary)]">
                Homepage
              </Link>
            </div>
          </section>

          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Keywords covered</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tool.keywords.slice(0, 8).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-3 py-2 text-sm text-[color:var(--muted)]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>

          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Popular education tools</h2>
            <div className="mt-4 space-y-3">
              {popularTools.map((item) => (
                <Link
                  key={item.slug}
                  href={`/tools/education/${item.slug}`}
                  className="block rounded-2xl bg-[color:var(--surface-alt)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:text-[color:var(--primary)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
        </aside>

        <div className="xl:col-span-2">
          <AdPlaceholder
            slot={`education-tool-${tool.slug}-post-content`}
            label="Advertisement"
            format="leaderboard"
          />
        </div>
      </div>
    </div>
  );
}
