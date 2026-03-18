import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { FaqList } from "@/components/ui/faq-list";
import { SearchBox } from "@/components/ui/search-box";
import { ToolCard } from "@/components/ui/tool-card";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildMetadata,
} from "@/lib/seo";
import { categories, getCategory, getPopularTools, getRecentTools, getToolsByCategory } from "@/lib/tools";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    return {};
  }
  const categoryTools = getToolsByCategory(category.slug);

  return buildMetadata({
    title: `${category.title} - ${categoryTools.length} Tools`,
    description: `${category.description} Browse ${categoryTools.length} tools with internal links, how-to content, FAQs, and clear implementation scope notes.`,
    pathname: `/category/${category.slug}`,
    keywords: [
      category.name,
      category.title,
      "free online tools",
      "browser tools",
      ...categoryTools.slice(0, 5).map((tool) => tool.name),
    ],
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    notFound();
  }

  const categoryTools = getToolsByCategory(category.slug);
  const workingCount = categoryTools.filter(
    (tool) => tool.implementationStatus === "working-local",
  ).length;
  const popularInCategory = getPopularTools(6, category.slug);
  const recentInCategory = getRecentTools(4, category.slug);
  const relatedCategories = categories.filter((item) => item.slug !== category.slug).slice(0, 4);
  const featuredLinks = popularInCategory.slice(0, 4);
  const categoryFaq = [
    {
      question: `What kind of tools are in ${category.name}?`,
      answer: `${category.name} includes focused utilities that fit the same mobile-friendly, SEO-aware site structure used across the rest of the directory.`,
    },
    {
      question: `Are all ${category.name.toLowerCase()} fully local?`,
      answer: "Many are fully local, while some are reduced-scope or future-ready if a reliable browser-only implementation is not practical yet.",
    },
    {
      question: `How do I find related tools outside ${category.name}?`,
      answer: "Use the internal links to other categories and related tools throughout the site to move between similar tasks quickly.",
    },
  ];
  const crossLinks = getPopularTools(6).filter((tool) => tool.category !== category.slug).slice(0, 6);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: category.name, pathname: `/category/${category.slug}` },
  ]);
  const categoryCollectionJsonLd = buildCollectionPageJsonLd({
    name: category.title,
    description: category.description,
    pathname: `/category/${category.slug}`,
    items: categoryTools.map((tool) => ({
      name: tool.name,
      pathname: `/tools/${tool.slug}`,
    })),
  });
  const categoryFaqJsonLd = buildFaqJsonLd(categoryFaq);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryCollectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryFaqJsonLd) }}
      />
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8 shadow-sm sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
              {category.name}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{category.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              {category.hero}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              {category.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {featuredLinks.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl bg-[color:var(--soft)] p-5">
              <p className="text-3xl font-black">{categoryTools.length}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">tools in this category</p>
            </div>
            <div className="rounded-3xl bg-white p-5">
              <p className="text-3xl font-black">{workingCount}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">working local tools</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SearchBox
          tools={categoryTools}
          title={`Search inside ${category.name}`}
          description={`Search only within ${category.name.toLowerCase()} so it is easier to find the right tool without leaving this section.`}
          maxResults={6}
          suggestedTools={[...popularInCategory, ...recentInCategory].filter(
            (tool, index, collection) => collection.findIndex((candidate) => candidate.slug === tool.slug) === index,
          )}
        />
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
                Tool grid
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                {categoryTools.length} tools in this category
              </h2>
            </div>
            <Link href="/" className="text-sm font-semibold text-[color:var(--primary)]">
              Back to homepage
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categoryTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
          <div className="mt-8 rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Popular in this category
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {popularInCategory.map((tool) => (
                <ToolCard key={`popular-${tool.slug}`} tool={tool} />
              ))}
            </div>
          </div>
        </section>
        <div className="space-y-6">
          <AdPlaceholder
            slot={`category-${category.slug}-sidebar`}
            label="Category sidebar slot"
            format="sidebar"
          />
          <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight">Category overview</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {category.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedCategories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  className="rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--foreground)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
          <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight">Internal links</h2>
            <div className="mt-4 space-y-3">
              {crossLinks.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="block text-sm text-[color:var(--muted)] transition hover:text-[color:var(--primary)]"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </section>
          <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/85 p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight">Recent additions</h2>
            <div className="mt-4 space-y-3">
              {recentInCategory.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="block text-sm text-[color:var(--muted)] transition hover:text-[color:var(--primary)]"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="mt-10">
        <AdPlaceholder
          slot={`category-${category.slug}-content-banner`}
          label="Category content banner"
          format="leaderboard"
        />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            Category FAQ
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Questions about {category.name}</h2>
          <div className="mt-6">
            <FaqList items={categoryFaq} />
          </div>
        </div>
        <div className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight">Explore nearby categories</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            Move between related sections to find another tool without starting your search over.
          </p>
          <div className="mt-4 space-y-3">
            {relatedCategories.map((item) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className="block text-sm font-semibold text-[color:var(--foreground)] transition hover:text-[color:var(--primary)]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
