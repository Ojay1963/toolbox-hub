import Link from "next/link";
import dynamic from "next/dynamic";
import { EducationToolCard } from "@/components/education/tool-card";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { FaqList } from "@/components/ui/faq-list";
import { getEducationHomepageSpotlight } from "@/lib/education-tools";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqJsonLd, buildMetadata } from "@/lib/seo";
import { discoveryCategories, getDiscoveryEntries, getDiscoverySuggestedEntries } from "@/lib/tool-discovery";
import { getPopularTools, getRecentTools, getTool, getTrendingTools, shouldIndexTool, type ToolDefinition } from "@/lib/tools";

const SearchBox = dynamic(() => import("@/components/ui/search-box").then((module) => module.SearchBox));

const homepageFaq = [
  {
    question: "Do I need to create an account before using the tools?",
    answer:
      "No. Toolbox Hub is built around quick browser-based workflows, so you can open a tool and start using it right away without creating an account.",
  },
  {
    question: "Are the tools safe for mobile and low-friction use?",
    answer:
      "Yes. The main tool flows are designed to stay touch-friendly on phones and tablets, with large tap targets, simple controls, and layouts that avoid horizontal scrolling.",
  },
  {
    question: "Do my files always leave my device?",
    answer:
      "Many tools run directly in your browser. When a tool needs server help, the page explains that clearly so you know when local processing is not the full workflow.",
  },
  {
    question: "How should I choose the right tool quickly?",
    answer:
      "Use the homepage search, browse a category, or start with the most used tools section. Each tool page also links to related alternatives so you can keep moving without starting over.",
  },
];

const featuredToolSlugs = [
  "image-compressor",
  "image-resizer",
  "pdf-merge",
  "json-formatter",
  "qr-code-generator",
  "percentage-calculator",
];

const categoryBadgeMap: Record<string, { short: string; tone: string }> = {
  "image-tools": { short: "IMG", tone: "bg-emerald-100 text-emerald-800" },
  "pdf-tools": { short: "PDF", tone: "bg-amber-100 text-amber-800" },
  "text-tools": { short: "TXT", tone: "bg-sky-100 text-sky-800" },
  "developer-tools": { short: "DEV", tone: "bg-slate-200 text-slate-800" },
  "generator-tools": { short: "GEN", tone: "bg-rose-100 text-rose-800" },
  "calculator-tools": { short: "CAL", tone: "bg-violet-100 text-violet-800" },
  "converter-tools": { short: "CNV", tone: "bg-orange-100 text-orange-800" },
  "internet-tools": { short: "WEB", tone: "bg-cyan-100 text-cyan-800" },
  "education-tools": { short: "EDU", tone: "bg-lime-100 text-lime-800" },
};

function getTrustHighlights(toolCount: number) {
  return [
    {
      title: `${toolCount}+ Free Tools`,
      detail: "Useful workflows across images, PDFs, text, developer tasks, generators, and calculators.",
    },
  {
    title: "No Signup Required",
    detail: "Open a tool and start working immediately without an account wall or dashboard.",
  },
  {
    title: "Mobile Friendly",
    detail: "Touch-first cards, tap-friendly controls, and clean layouts that hold up on smaller screens.",
  },
  {
    title: "Fast Browser Tools",
    detail: "Many tasks run directly in your browser for quick results and fewer unnecessary steps.",
  },
  ];
}

export const metadata = buildMetadata({
  title: "Fast Free Online Tools That Work Instantly",
  description:
    "Compress images, merge PDFs, format JSON, generate QR codes, calculate values, convert files, and more directly in your browser with no signup required.",
  pathname: "/",
  keywords: [
    "fast free online tools",
    "browser tools",
    "image tools",
    "pdf tools",
    "developer tools",
    "calculator tools",
  ],
});

export default function HomePage() {
  const publicTools = getDiscoveryEntries();
  const trustHighlights = getTrustHighlights(publicTools.length);
  const suggestedTools = getDiscoverySuggestedEntries(8);
  const educationSpotlightTools = getEducationHomepageSpotlight(6);
  const popularTools = featuredToolSlugs
    .map((slug) => getTool(slug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool))
    .filter((tool) => shouldIndexTool(tool));
  const mostUsedTools = getPopularTools(6);
  const newTools = getRecentTools(6);
  const trendingTools = getTrendingTools(6);
  const simplifiedCategories = discoveryCategories.filter((category) =>
    [
      "education-tools",
      "image-tools",
      "pdf-tools",
      "text-tools",
      "developer-tools",
      "generator-tools",
      "calculator-tools",
    ].includes(category.slug),
  );

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([{ name: "Home", pathname: "/" }]);
  const homepageCollectionJsonLd = buildCollectionPageJsonLd({
    name: "Free Online Tools Directory",
    description:
      "A browsable collection of free online tools for PDFs, images, text, developers, generators, calculators, converters, and internet tasks.",
    pathname: "/",
    items: mostUsedTools.map((tool) => ({
      name: tool.name,
      pathname: `/tools/${tool.slug}`,
    })),
  });
  const homepageFaqJsonLd = buildFaqJsonLd(homepageFaq);

  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageCollectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqJsonLd) }}
      />

      <section className="site-hero app-panel rounded-[2rem] p-7 sm:p-10 lg:p-12">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
            Free online tools
          </p>
          <h1 className="site-hero-title mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Fast Free Online Tools That Work Instantly
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
            Compress images, merge PDFs, format JSON, generate QR codes, calculate values, convert files, and more
            {" "}directly in your browser with no signup required.
          </p>
          <div className="site-inline-links mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#popular-tools"
              className="site-action-link rounded-full bg-[color:var(--primary)] px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
            >
              Browse Popular Tools
            </Link>
            <Link
              href="/#search-tools"
              className="site-action-link rounded-full border border-[color:var(--border)] bg-white px-6 py-3.5 text-center text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
            >
              Search All Tools
            </Link>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
            Start with{" "}
            <Link href="/tools/image-compressor" className="font-semibold text-[color:var(--primary)]">
              Image Compressor
            </Link>
            ,{" "}
            <Link href="/tools/pdf-merge" className="font-semibold text-[color:var(--primary)]">
              PDF Merge
            </Link>
            ,{" "}
            <Link href="/tools/json-formatter" className="font-semibold text-[color:var(--primary)]">
              JSON Formatter
            </Link>
            , or{" "}
            <Link href="/tools/qr-code-generator" className="font-semibold text-[color:var(--primary)]">
              QR Code Generator
            </Link>
            {" "}if you want fast examples of the workflows people use most.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {trustHighlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-4 py-4"
            >
              <p className="text-sm font-bold tracking-tight text-[color:var(--foreground)]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="popular-tools" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Popular Tools
            </p>
            <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Start with trusted, high-use workflows</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              These are the tools that make the site feel immediately useful: strong descriptions, clear use cases, and fast paths into common tasks.
            </p>
          </div>
          <Link href="/tools" className="text-sm font-semibold text-[color:var(--primary)]">
            Open full directory
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularTools.map((tool) => (
            <FeatureToolCard key={tool.slug} tool={tool} mode="featured" />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="app-panel rounded-[2rem] p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            Most Used Tools
          </p>
          <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Most used tools right now</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            Popular across quick uploads, formatting tasks, calculators, and lightweight browser workflows.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {mostUsedTools.map((tool) => (
              <FeatureToolCard key={`most-used-${tool.slug}`} tool={tool} mode="compact" />
            ))}
          </div>
        </div>
        <div className="app-panel rounded-[2rem] p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            New Tools
          </p>
          <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Fresh additions to explore</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            Recently added tools that expand the directory without making the experience feel crowded.
          </p>
          <div className="mt-5 space-y-3">
            {newTools.map((tool) => (
              <Link
                key={`new-${tool.slug}`}
                href={`/tools/${tool.slug}`}
                prefetch={false}
                className="site-feature-card app-panel-muted group block rounded-[1.5rem] px-4 py-4 transition hover:border-[color:var(--primary)] hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold tracking-tight text-[color:var(--foreground)]">{tool.name}</p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{tool.shortDescription}</p>
                  </div>
                  <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                    New
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <AdPlaceholder
          slot="homepage-leaderboard-top"
          label="Advertisement"
          format="leaderboard"
        />
      </section>

      <section id="search-tools" className="mt-10">
        <SearchBox
          tools={publicTools}
          title="Search tools with instant suggestions"
          description="Type a task, tool name, or keyword and Toolbox Hub will surface matching tools, categories, and quick suggestions as you go."
          placeholder="Search tools, tasks, or keywords"
          maxResults={8}
          suggestedTools={suggestedTools}
          showCategoryFilter
        />
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Trending
            </p>
            <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Browse what people open next</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              A mix of reliable high-traffic tools and newer workflows that fit naturally into common browser-based tasks.
            </p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-[color:var(--primary)]">
            Read guides
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {trendingTools.map((tool) => (
            <FeatureToolCard key={`trending-${tool.slug}`} tool={tool} mode="compact" />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Educational Tools
            </p>
            <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Helpful tools for students and study workflows</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Open free tools for grades, writing, revision, typing practice, and study planning without leaving the clean browser workflow.
            </p>
          </div>
          <Link href="/tools/education" className="text-sm font-semibold text-[color:var(--primary)]">
            Browse all educational tools
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {educationSpotlightTools.map((tool) => (
            <EducationToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section id="browse-categories" className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Categories
        </p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Browse categories without guesswork</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Jump into the part of the directory that matches your task, then keep exploring through related tools and practical internal links.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {simplifiedCategories.map((category) => {
            const badge = categoryBadgeMap[category.slug] ?? categoryBadgeMap["text-tools"];

            return (
              <Link
                key={category.slug}
                href={category.href}
                className="site-feature-card app-panel group rounded-[2rem] p-5 transition hover:-translate-y-1 hover:border-[color:var(--primary)]/35 hover:shadow-lg"
              >
                <div className={`inline-flex rounded-2xl px-3 py-2 text-xs font-bold tracking-[0.18em] ${badge.tone}`}>
                  {badge.short}
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight">{category.name}</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{category.hero}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="site-card app-panel mt-10 rounded-[2rem] p-7 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Trust & Site Info
            </p>
            <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">A cleaner, more transparent tools website</h2>
          </div>
          <Link href="/about" className="text-sm font-semibold text-[color:var(--primary)]">
            About Toolbox Hub
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.6rem] bg-[color:var(--surface-alt)] px-5 py-5 text-sm leading-7 text-[color:var(--muted)]">
            Toolbox Hub is built around fast, public, browser-based tools with clear legal pages, contact information, and straightforward descriptions instead of thin placeholder content.
          </div>
          <div className="rounded-[1.6rem] bg-[color:var(--surface-alt)] px-5 py-5 text-sm leading-7 text-[color:var(--muted)]">
            You can review the{" "}
            <Link href="/privacy-policy" className="font-semibold text-[color:var(--primary)]">
              Privacy Policy
            </Link>
            ,{" "}
            <Link href="/terms-of-use" className="font-semibold text-[color:var(--primary)]">
              Terms of Use
            </Link>
            ,{" "}
            <Link href="/disclaimer" className="font-semibold text-[color:var(--primary)]">
              Disclaimer
            </Link>
            , or{" "}
            <Link href="/contact" className="font-semibold text-[color:var(--primary)]">
              Contact page
            </Link>
            {" "}at any point.
          </div>
        </div>
      </section>

      <section className="mt-10">
        <AdPlaceholder
          slot="homepage-banner-bottom"
          label="Advertisement"
          format="banner"
        />
      </section>

      <section className="site-card app-panel mt-10 rounded-[2rem] p-7 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          FAQ
        </p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Common questions about Toolbox Hub</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          A quick overview of what to expect from the tools, the browser-based workflow, and the way the site handles common tasks.
        </p>
        <div className="mt-6">
          <FaqList items={homepageFaq} />
        </div>
      </section>
    </div>
  );
}

function FeatureToolCard({
  tool,
  mode,
}: {
  tool: ToolDefinition;
  mode: "featured" | "compact";
}) {
  const badge = categoryBadgeMap[tool.category] ?? categoryBadgeMap["text-tools"];

  if (mode === "compact") {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        prefetch={false}
        className="site-feature-card app-panel-muted group rounded-[1.6rem] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--primary)]"
      >
        <div className="flex items-center gap-3">
          <div className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl px-3 text-xs font-bold tracking-[0.18em] ${badge.tone}`}>
            {badge.short}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-[color:var(--foreground)]">{tool.name}</h3>
            <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{tool.shortDescription}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      prefetch={false}
      className="site-feature-card app-panel group rounded-[2rem] p-5 transition hover:-translate-y-1 hover:border-[color:var(--primary)]/35 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl px-3 text-xs font-bold tracking-[0.18em] ${badge.tone}`}>
            {badge.short}
          </div>
          <div className="flex flex-wrap gap-2">
            {tool.keywords.slice(0, 2).map((keyword) => (
              <span
                key={`${tool.slug}-${keyword}`}
                className="rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <span className="text-sm font-semibold text-[color:var(--primary)] transition group-hover:text-[color:var(--primary-dark)]">
          Open
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold tracking-tight">{tool.name}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{tool.shortDescription}</p>
      <p className="mt-4 text-sm font-semibold text-[color:var(--primary)]">
        {tool.category.replace(/-/g, " ")}
      </p>
    </Link>
  );
}
