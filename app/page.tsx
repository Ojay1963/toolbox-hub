import Link from "next/link";
import dynamic from "next/dynamic";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { FaqList } from "@/components/ui/faq-list";
import { CategoryCard } from "@/components/ui/category-card";
import { ToolCard } from "@/components/ui/tool-card";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildMetadata,
  siteMetadata,
} from "@/lib/seo";
import {
  categories,
  getIndexableTools,
  getPopularTools,
  getRecentTools,
  getToolsByCategory,
  getTrendingTools,
  tools,
} from "@/lib/tools";

const SearchBox = dynamic(() => import("@/components/ui/search-box").then((module) => module.SearchBox));

export const metadata = buildMetadata({
  title: "Free Online Tools for Images, PDFs, Text, Developers, and More",
  description:
    `Use ${siteMetadata.indexableToolCount} public tool pages for image editing, PDF tasks, text cleanup, generators, calculators, converters, and developer workflows.`,
  pathname: "/",
  keywords: ["free online tools", "browser tools", "seo-friendly tools"],
});

export default function HomePage() {
  const totalTools = tools.length;
  const publicTools = getIndexableTools();
  const publicToolSlugs = new Set(publicTools.map((tool) => tool.slug));
  const indexableToolsCount = publicTools.length;
  const featuredCategories = categories.map((category) => ({
    category,
    count: getToolsByCategory(category.slug).filter((tool) => publicToolSlugs.has(tool.slug)).length,
  }));
  const publicCategoryCountBySlug = new Map(
    featuredCategories.map(({ category, count }) => [category.slug, count]),
  );
  const popularTools = getPopularTools(6);
  const latestTools = getRecentTools(6);
  const trendingTools = getTrendingTools(6);
  const searchSuggestions = [...popularTools, ...latestTools].filter(
    (tool, index, collection) => collection.findIndex((candidate) => candidate.slug === tool.slug) === index,
  );
  const discoveryCategories = categories.map((category) => ({
    category,
    tools: getPopularTools(2, category.slug),
  }));
  const workingToolsCount = publicTools.filter((tool) => tool.implementationStatus === "working-local").length;
  const reducedScopeCount = publicTools.filter((tool) => tool.implementationStatus === "reduced-scope-local").length;
  const homepageFaq = [
    {
      question: "Do these tools require an account?",
      answer: "No. The site is intentionally built without auth so people can open a page and use a tool immediately.",
    },
    {
      question: "Are files uploaded to a server?",
      answer: "Many tools are designed for local browser-side processing. Where a tool has limits, the page explains that clearly instead of pretending otherwise.",
    },
    {
      question: `Are all ${totalTools} tools identical in scope?`,
      answer: "No. Some are fully working locally, some are reduced-scope by design, and a small number stay honest as future-ready placeholders until a reliable implementation is practical.",
    },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([{ name: "Home", pathname: "/" }]);
  const homepageCollectionJsonLd = buildCollectionPageJsonLd({
    name: "Free Online Tools Directory",
    description:
      "A browsable collection of free online tools for PDFs, images, text, developers, generators, calculators, converters, and internet tasks.",
    pathname: "/",
    items: popularTools.map((tool) => ({
      name: tool.name,
      pathname: `/tools/${tool.slug}`,
    })),
  });
  const homepageFaqJsonLd = buildFaqJsonLd(homepageFaq);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-7 shadow-sm sm:p-10 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
              Free online tools
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              Free online tools for PDF, image, text, developer, and calculator tasks.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              Toolbox Hub gives you a clean set of practical tools that work fast on desktop and
              mobile. Use browser-first workflows for common file, text, coding, conversion, and
              calculation tasks without a login or bloated interface.
            </p>
            <div className="mt-6 max-w-3xl">
              <SearchBox
                tools={publicTools}
                title={`Search ${indexableToolsCount} public tool pages without digging through menus`}
                description="Search by tool name, keyword, category, or task. Popular tools and recent additions are suggested before you type, and results stay focused on public launch-ready pages."
                maxResults={6}
                suggestedTools={searchSuggestions}
                sectionId="search-tools"
                showCategoryFilter
                showStatusFilter
              />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/category/text-tools"
                className="rounded-full bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
              >
                Start with text tools
              </Link>
              <Link
                href="/category/pdf-tools"
                className="rounded-full border border-[color:var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
              >
                Explore PDF tools
              </Link>
              <Link
                href="/category/converter-tools"
                className="rounded-full border border-[color:var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
              >
                Browse converters
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl bg-[color:var(--soft)] p-5">
              <p className="text-3xl font-black">{workingToolsCount}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">fully working local tools</p>
            </div>
            <div className="rounded-3xl bg-white p-5">
              <p className="text-3xl font-black">{indexableToolsCount}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">indexable tool pages</p>
            </div>
            <div className="rounded-3xl bg-white p-5">
              <p className="text-3xl font-black">{reducedScopeCount}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">honestly reduced-scope tools</p>
            </div>
            <AdPlaceholder
              slot="homepage-hero-rail"
              label="Hero sponsor slot"
              format="rectangle"
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Trending tools
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Fastest paths into the directory</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              These tools balance popularity, freshness, and real implementation quality so new visitors
              can start with a small confident set instead of facing the full directory at once.
            </p>
          </div>
          <Link href="/#search-tools" className="text-sm font-semibold text-[color:var(--primary)]">
            Search all tools
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trendingTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Featured categories
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Start from the right section</h2>
          </div>
          <Link href="/category/text-tools" className="text-sm font-semibold text-[color:var(--primary)]">
            Explore a category
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredCategories.map(({ category, count }) => (
            <CategoryCard
              key={category.slug}
              category={category}
              count={count}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Discovery paths
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Popular tools inside each section</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Instead of showing every tool at once, these short lists surface a couple of strong
          entry points in each category so discovery stays focused.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {discoveryCategories.map(({ category, tools: categoryTools }) => (
            <section key={category.slug} className="rounded-3xl border border-[color:var(--border)] bg-white/88 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold tracking-tight">{category.name}</h3>
                <Link href={`/category/${category.slug}`} className="text-sm font-semibold text-[color:var(--primary)]">
                  View all
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {categoryTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="block text-sm leading-6 text-[color:var(--muted)] transition hover:text-[color:var(--primary)]"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-xs text-[color:var(--muted)]">
                {publicCategoryCountBySlug.get(category.slug) ?? 0} public tool pages in this category
              </p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Browse by workflow
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Choose a smaller path instead of the whole site</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Category chips keep discovery lightweight. Open the section that matches your task first,
          then use search or local filters inside that category.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {featuredCategories.map(({ category, count }) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-full border border-[color:var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
            >
              {category.name} ({count})
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Popular tools
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Popular starting points</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          These tools are weighted toward broad usefulness, strong local implementations, and clear
          starting points for new visitors.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <AdPlaceholder
          slot="homepage-mid-banner"
          label="Homepage banner slot"
          format="leaderboard"
        />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            Latest tools
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Recently added without the noise of a full dump</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
            Recent additions help returning visitors spot new capabilities without scrolling through
            the full directory.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {latestTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} compact />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <AdPlaceholder
            slot="homepage-sidebar-rail"
            label="Homepage sidebar slot"
            format="sidebar"
          />
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight">Browse by intent</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              If the homepage still feels broad, jump straight into one category and keep the next
              search scoped there.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--foreground)]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-7 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Why people use this site
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Built for speed, clarity, and honest scope</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-stone-50 p-5">
            <h3 className="text-lg font-bold tracking-tight">Fast to open</h3>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              The site keeps pages lightweight and static where possible so people can get to the tool they need quickly.
            </p>
          </div>
          <div className="rounded-3xl bg-stone-50 p-5">
            <h3 className="text-lg font-bold tracking-tight">Clear about limitations</h3>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Reduced-scope and future-ready tools are labeled clearly instead of pretending to offer live data or high-quality conversion they do not have.
            </p>
          </div>
          <div className="rounded-3xl bg-stone-50 p-5">
            <h3 className="text-lg font-bold tracking-tight">Easy to navigate</h3>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Categories, related tools, search, and internal links make it easy to move from one task to the next without friction.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          FAQ
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Common questions</h2>
        <div className="mt-6">
          <FaqList items={homepageFaq} />
        </div>
      </section>
    </div>
  );
}
