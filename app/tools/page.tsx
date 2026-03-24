import Link from "next/link";
import dynamic from "next/dynamic";
import { CategoryCard } from "@/components/ui/category-card";
import { ToolCard } from "@/components/ui/tool-card";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildMetadata } from "@/lib/seo";
import { categories, getIndexableTools, getPopularTools, getRecentTools } from "@/lib/tools";

const SearchBox = dynamic(() => import("@/components/ui/search-box").then((module) => module.SearchBox));

export const metadata = buildMetadata({
  title: "Tools",
  description: "Browse free online tools for images, PDFs, text, developers, generators, calculators, and more.",
  pathname: "/tools",
  keywords: ["tools", "free online tools", "browse tools", "tool directory"],
});

export default function ToolsPage() {
  const publicTools = getIndexableTools();
  const popularTools = getPopularTools(9);
  const recentTools = getRecentTools(6);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: "Tools", pathname: "/tools" },
  ]);
  const toolsCollectionJsonLd = buildCollectionPageJsonLd({
    name: "Tools Directory",
    description: "Browse free online tools by category or search for the task you need.",
    pathname: "/tools",
    items: popularTools.map((tool) => ({
      name: tool.name,
      pathname: `/tools/${tool.slug}`,
    })),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsCollectionJsonLd) }}
      />

      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          Tools
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Browse free online tools</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
          Find tools for images, PDFs, text, developer workflows, generators, calculators, converters, and more.
        </p>
        <div className="mt-8 max-w-4xl">
          <SearchBox
            tools={publicTools}
            title="Find a tool fast"
            description="Search by tool name, keyword, category, or task."
            placeholder="Search tools (e.g. compress image, merge pdf)"
            maxResults={8}
            suggestedTools={popularTools}
            showCategoryFilter
            compact
          />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Popular Tools
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Start with popular tools</h2>
          </div>
          <Link href="/" className="text-sm font-semibold text-[color:var(--primary)]">
            Back to homepage
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Categories
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Browse by category</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} count={0} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Recent Tools
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Recently added tools</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
