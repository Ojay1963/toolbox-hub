import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { CategorySidebar } from "@/components/ui/category-sidebar";
import { FaqList } from "@/components/ui/faq-list";
import { RelatedTools } from "@/components/ui/related-tools";
import { Section } from "@/components/ui/section";
import { shouldIndexTool, type ToolDefinition } from "@/lib/tools";

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
  const isPubliclyActive = shouldIndexTool(tool);
  const primaryRelatedTools = relatedTools.slice(0, 3);
  const benefits = buildToolBenefits(tool, categoryLabel);
  const useCases = buildToolUseCases(tool, categoryLabel);
  const qualityChecks = buildToolQualityChecks(tool, categoryLabel);
  const visiblePeopleAlsoSearchFor = tool.peopleAlsoSearchFor.filter(
    (item) => !item.href || shouldIndexTool(item.href.replace("/tools/", "")),
  );
  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <CategorySidebar
          activeCategory={tool.category}
          title="Browse Categories"
          description="Use the category menu to move between sections without starting over."
        />
        <div className="min-w-0 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-8">
            <section className="site-hero app-panel rounded-[2rem] p-6 sm:p-8">
              <Breadcrumbs
                items={[
                  { name: "Home", href: "/" },
                  { name: categoryLabel, href: `/category/${tool.category}` },
                  { name: tool.name, href: `/tools/${tool.slug}` },
                ]}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                  Tool workspace
                </span>
                <span className="rounded-full bg-[color:var(--surface-alt)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {categoryLabel}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
                {tool.name}
              </p>
              <h1 className="site-hero-title mt-3 text-4xl font-black tracking-tight sm:text-5xl">{tool.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
                {isPubliclyActive ? tool.longDescription : tool.shortDescription}
              </p>
              {primaryRelatedTools.length ? (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
                  Need a related workflow? Try{" "}
                  {primaryRelatedTools.map((item, index) => (
                    <span key={item.slug}>
                      {index > 0 ? (index === primaryRelatedTools.length - 1 ? ", or " : ", ") : ""}
                      <Link href={`/tools/${item.slug}`} prefetch={false} className="font-semibold text-[color:var(--primary)]">
                        {item.name}
                      </Link>
                    </span>
                  ))}
                  .
                </p>
              ) : null}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] bg-[color:var(--surface-alt)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Use case</p>
                  <p className="mt-2 text-sm font-bold text-[color:var(--foreground)]">{tool.shortDescription}</p>
                </div>
                <div className="rounded-[1.5rem] bg-[color:var(--surface-alt)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Status</p>
                  <p className="mt-2 text-sm font-bold text-[color:var(--foreground)]">
                    {isPubliclyActive ? "Ready to use" : "Browse alternatives"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[color:var(--surface-alt)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Next step</p>
                  <p className="mt-2 text-sm font-bold text-[color:var(--foreground)]">Open the tool below</p>
                </div>
              </div>
              <div className="mt-8 rounded-[1.75rem] bg-[color:var(--surface-alt)]/70 p-3 sm:p-4">
                <ToolRenderer tool={tool} />
              </div>
            </section>

            {isPubliclyActive ? (
              <>
                <Section title={`About ${tool.name}`}>
                  <p>{tool.longDescription}</p>
                  <p>
                    You can also explore{" "}
                    <Link href={`/category/${tool.category}`} prefetch={false} className="font-semibold text-[color:var(--primary)]">
                      {categoryLabel}
                    </Link>{" "}
                    for similar tools in the same category.
                  </p>
                  {relatedTools.length ? (
                    <p>
                      If you need a slightly different result, try{" "}
                      {relatedTools.map((item, index) => (
                        <span key={item.slug}>
                          {index > 0 ? (index === relatedTools.length - 1 ? ", and " : ", ") : ""}
                          <Link href={`/tools/${item.slug}`} prefetch={false} className="font-semibold text-[color:var(--primary)]">
                            {item.name}
                          </Link>
                        </span>
                      ))}
                      .
                    </p>
                  ) : null}
                </Section>

                <Section title={`How to use ${tool.name.toLowerCase()}`}>
                  <ol className="space-y-3 pl-5">
                    {tool.howToUse.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </Section>

                <Section title={`${tool.name} benefits`}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {benefits.map((item) => (
                      <div key={item.title} className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-5 py-5">
                        <h3 className="text-base font-bold tracking-tight text-[color:var(--foreground)]">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title={`Common ${tool.name.toLowerCase()} use cases`}>
                  <div className="grid gap-4 md:grid-cols-3">
                    {useCases.map((item) => (
                      <article key={item.title} className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/80 px-5 py-5">
                        <h3 className="text-base font-bold tracking-tight text-[color:var(--foreground)]">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.detail}</p>
                      </article>
                    ))}
                  </div>
                </Section>

                <Section title={`Best practices for ${tool.name.toLowerCase()}`}>
                  <p>
                    A good result usually comes from checking the input first, choosing settings that match your final use,
                    and reviewing the output before sharing it. That matters for {tool.name.toLowerCase()} because small
                    differences in files, text, URLs, or values can change what the finished result should look like.
                  </p>
                  <ul className="space-y-3 pl-5">
                    {qualityChecks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Section>

                <Section title="Privacy note">
                  <p>
                    Many Toolbox Hub workflows are designed to run directly in your browser. If a tool needs extra server
                    support, the page explains that clearly so you can decide whether it fits your workflow before you continue.
                  </p>
                  <p>
                    For more detail about how the site handles public pages and contact information, review the{" "}
                    <Link href="/privacy-policy" prefetch={false} className="font-semibold text-[color:var(--primary)]">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms-of-use" prefetch={false} className="font-semibold text-[color:var(--primary)]">
                      Terms of Use
                    </Link>
                    .
                  </p>
                </Section>
              </>
            ) : (
              <Section title="Try a working alternative">
                <p>
                  This page is not being promoted right now. You can still browse the{" "}
                  <Link href={`/category/${tool.category}`} prefetch={false} className="font-semibold text-[color:var(--primary)]">
                    {categoryLabel}
                  </Link>{" "}
                  section for tools that are ready to use today.
                </p>
                {relatedTools.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {relatedTools.slice(0, 4).map((item) => (
                      <Link
                        key={`alternative-${item.slug}`}
                        href={`/tools/${item.slug}`}
                        prefetch={false}
                        className="app-panel-muted site-feature-card rounded-2xl px-4 py-4 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--foreground)]"
                      >
                        <span className="block font-semibold text-[color:var(--foreground)]">{item.name}</span>
                        <span className="mt-1 block leading-6">{item.shortDescription}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </Section>
            )}

            {visiblePeopleAlsoSearchFor.length ? (
              <Section title="People also search for">
                <div className="flex flex-wrap gap-3">
                  {visiblePeopleAlsoSearchFor.map((item) =>
                    item.href ? (
                      <Link
                        key={`${item.phrase}-${item.href}`}
                        href={item.href}
                        prefetch={false}
                        className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-4 py-2 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--foreground)]"
                      >
                        {item.phrase}
                      </Link>
                    ) : (
                      <span
                        key={item.phrase}
                        className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-4 py-2 text-sm text-[color:var(--muted)]"
                      >
                        {item.phrase}
                      </span>
                    ),
                  )}
                </div>
              </Section>
            ) : null}

            {isPubliclyActive ? (
              <Section title={`${tool.name} FAQs`}>
                <FaqList items={tool.faq} />
              </Section>
            ) : null}

            <Section title={`Related ${categoryLabel}`}>
              <RelatedTools tools={relatedTools} />
            </Section>

            <Section title={`More ${categoryLabel}`}>
              <p>
                If you want a nearby workflow in the same topic cluster, browse more tools from the{" "}
                <Link href={`/category/${tool.category}`} prefetch={false} className="font-semibold text-[color:var(--primary)]">
                  {categoryLabel}
                </Link>{" "}
                category below.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {categoryPopularTools.slice(0, 4).map((item) => (
                  <Link
                    key={`category-popular-${item.slug}`}
                    href={`/tools/${item.slug}`}
                    prefetch={false}
                    className="app-panel-muted site-feature-card rounded-2xl px-4 py-4 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--foreground)]"
                  >
                    <span className="block font-semibold text-[color:var(--foreground)]">{item.name}</span>
                    <span className="mt-1 block leading-6">{item.shortDescription}</span>
                  </Link>
                ))}
              </div>
            </Section>
          </div>

          <div className="min-w-0 space-y-6">
            <AdPlaceholder
              slot={`tool-${tool.slug}-sidebar`}
              label="Advertisement"
              format="sidebar"
            />
            <section className="site-card app-panel rounded-[2rem] p-6">
              <h2 className="site-section-title text-lg font-bold tracking-tight">Quick notes</h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                {isPubliclyActive ? tool.shortDescription : "This page is not being promoted right now. Use the links below to open similar tools that are ready to use."}
              </p>
            </section>
            <section className="site-card app-panel rounded-[2rem] p-6">
              <h2 className="site-section-title text-lg font-bold tracking-tight">Explore more</h2>
              <div className="mt-4 space-y-5 text-sm text-[color:var(--muted)]">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                    Browse
                  </p>
                  <Link href="/" className="block transition hover:text-[color:var(--primary)]">
                    Browse all tools
                  </Link>
                  <Link href="/#search-tools" prefetch={false} className="block transition hover:text-[color:var(--primary)]">
                    Search all tools
                  </Link>
                  <Link
                    href={`/category/${tool.category}`}
                    prefetch={false}
                    className="block transition hover:text-[color:var(--primary)]"
                  >
                    More {categoryLabel}
                  </Link>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                    Related tools
                  </p>
                  {relatedTools.length ? relatedTools.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/tools/${item.slug}`}
                      prefetch={false}
                      className="block transition hover:text-[color:var(--primary)]"
                    >
                      {item.name}
                    </Link>
                  )) : (
                    <p className="leading-7">Browse the category for other working options.</p>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                    Popular in {categoryLabel}
                  </p>
                  {categoryPopularTools.map((item) => (
                    <Link
                      key={`popular-${item.slug}`}
                      href={`/tools/${item.slug}`}
                      prefetch={false}
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
                      prefetch={false}
                      className="block transition hover:text-[color:var(--primary)]"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
            {isPubliclyActive ? (
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
            ) : null}
          </div>

          <div className="xl:col-span-2">
            <AdPlaceholder
              slot={`tool-${tool.slug}-post-related-banner`}
              label="Advertisement"
              format="leaderboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildToolBenefits(tool: ToolDefinition, categoryLabel: string) {
  return [
    {
      title: "Faster task completion",
      detail: `${tool.name} keeps the workflow focused on one clear ${categoryLabel.toLowerCase()} task, so visitors can complete the job without opening a heavy editor or searching through unrelated features.`,
    },
    {
      title: "Clear next steps",
      detail: `The page includes how-to steps, FAQs, related tools, and category links so users can move from ${tool.name.toLowerCase()} to nearby workflows without going back to search results.`,
    },
    {
      title: "Mobile-friendly workflow",
      detail: `Controls, explanations, and internal links are organized for small screens as well as desktop, which helps the page serve visitors who need a quick result from a phone or tablet.`,
    },
    {
      title: "Transparent tool scope",
      detail: `If a workflow is browser-side or has limits, the page explains that context clearly. This improves trust and helps users choose the right ${categoryLabel.toLowerCase()} for the job.`,
    },
  ];
}

function buildToolUseCases(tool: ToolDefinition, categoryLabel: string) {
  const relatedNames = tool.relatedToolSlugs.slice(0, 2).map((slug) => slug.replace(/-/g, " "));

  return [
    {
      title: "Everyday quick fixes",
      detail: `Use ${tool.name} when you need a quick answer or output for a common ${categoryLabel.toLowerCase()} task and do not want to install a separate app.`,
    },
    {
      title: "Publishing and sharing",
      detail: `The tool is useful before uploading, sending, publishing, or reusing content because it gives you a cleaner result and a simple way to check what changed.`,
    },
    {
      title: "Multi-step workflows",
      detail: relatedNames.length
        ? `After this step, continue with related tools such as ${relatedNames.join(" or ")} if you need a second pass in the same workflow.`
        : `After this step, browse the ${categoryLabel.toLowerCase()} category if you need another tool that solves a nearby problem.`,
    },
  ];
}

function buildToolQualityChecks(tool: ToolDefinition, categoryLabel: string) {
  return [
    `Start with the cleanest input you have, especially for ${categoryLabel.toLowerCase()} that depend on file quality, formatting, or exact values.`,
    `Use the preview, output, or result area to confirm that ${tool.name.toLowerCase()} produced the result you expected before downloading or copying it.`,
    `Read the FAQ when a result looks unusual, because many tools have format limits, browser limits, or practical tradeoffs that are easier to understand before repeating the task.`,
    `Open the related tools section when the result is close but not final; many tasks work best as a short sequence instead of one isolated step.`,
  ];
}
