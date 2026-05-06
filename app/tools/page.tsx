import Link from "next/link";
import dynamic from "next/dynamic";
import { EducationToolCard } from "@/components/education/tool-card";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { CategoryCard } from "@/components/ui/category-card";
import { ToolCard } from "@/components/ui/tool-card";
import { getEducationHomepageSpotlight } from "@/lib/education-tools";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildMetadata } from "@/lib/seo";
import { discoveryCategories, getDiscoveryEntries, getDiscoverySuggestedEntries } from "@/lib/tool-discovery";
import { getIndexableTools, getPopularTools, getRecentTools } from "@/lib/tools";

const SearchBox = dynamic(() => import("@/components/ui/search-box").then((module) => module.SearchBox));
const CategoryDirectory = dynamic(() => import("@/components/ui/category-directory").then((module) => module.CategoryDirectory));

export const metadata = buildMetadata({
  title: "Free Online Tools Directory",
  description: "Browse a free online tools directory for images, PDFs, text, developer workflows, generators, calculators, converters, and more.",
  pathname: "/tools",
  keywords: ["free online tools directory", "tools directory", "browse free online tools", "online tools"],
});

export default function ToolsPage() {
  const publicTools = getDiscoveryEntries();
  const suggestedTools = getDiscoverySuggestedEntries(8);
  const popularTools = getPopularTools(9);
  const recentTools = getRecentTools(6);
  const educationSpotlightTools = getEducationHomepageSpotlight(4);
  const imageSpotlightTools = getIndexableTools()
    .filter((tool) =>
      [
        "background-remover",
        "gif-maker",
        "image-color-palette-generator",
        "blur-image-tool",
        "image-compressor",
        "image-resizer",
      ].includes(tool.slug),
    )
    .sort((left, right) => {
      const order = [
        "background-remover",
        "gif-maker",
        "image-color-palette-generator",
        "blur-image-tool",
        "image-compressor",
        "image-resizer",
      ];
      return order.indexOf(left.slug) - order.indexOf(right.slug);
    });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: "Tools", pathname: "/tools" },
  ]);
  const toolsCollectionJsonLd = buildCollectionPageJsonLd({
    name: "Tools Directory",
    description: "Browse free online tools by category or search for the task you need.",
    pathname: "/tools",
    items: suggestedTools.map((tool) => ({
      name: tool.name,
      pathname: tool.href,
    })),
  });

  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsCollectionJsonLd) }}
      />

      <section className="site-hero app-panel rounded-[2rem] p-7 sm:p-10">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
            Tools hub
          </span>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          Tools
        </p>
        <h1 className="site-hero-title mt-4 text-4xl font-black tracking-tight sm:text-5xl">Browse free online tools</h1>
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
            suggestedTools={suggestedTools}
            showCategoryFilter
            compact
          />
        </div>
      </section>

      <section className="mt-10">
        <AdPlaceholder
          slot="tools-directory-leaderboard-top"
          label="Advertisement"
          format="leaderboard"
        />
      </section>

      <section id="browse-categories" className="mt-10 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Categories
            </p>
            <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Browse by category first</h2>
          </div>
          <Link href="#all-tools-directory" className="text-sm font-semibold text-[color:var(--primary)]">
            Jump to full directory
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {discoveryCategories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              href={category.href}
              badgeLabel="Browse tools"
            />
          ))}
        </div>
      </section>

      <section id="all-tools-directory" className="mt-10 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Full directory
            </p>
            <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Browse every public tool</h2>
          </div>
          <Link href="/tools/education" className="text-sm font-semibold text-[color:var(--primary)]">
            Open educational tools
          </Link>
        </div>
        <div className="mt-6">
          <CategoryDirectory
            tools={publicTools}
            eyebrow="All tools"
            title="Browse the full tools directory"
            description="Open any tool immediately or filter the list by name, category, or keyword from the same page."
            browseLabel="Explore every public tool from one place"
            placeholder="Filter all tools by name, category, or keyword"
            emptyMessage="No tools match that search yet. Try a broader keyword or open the education tools category above."
          />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Educational Tools
            </p>
            <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Student tools and study helpers</h2>
          </div>
          <Link href="/tools/education" className="text-sm font-semibold text-[color:var(--primary)]">
            Open educational tools
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {educationSpotlightTools.map((tool) => (
            <EducationToolCard key={tool.slug} tool={tool} compact />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Image Favorites
            </p>
            <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Quick image tools people look for</h2>
          </div>
          <Link href="/category/image-tools" className="text-sm font-semibold text-[color:var(--primary)]">
            Open image tools
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {imageSpotlightTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} compact />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Popular Tools
            </p>
            <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Start with popular tools</h2>
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
          Recent Tools
        </p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Recently added tools</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} compact />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <AdPlaceholder
          slot="tools-directory-banner-bottom"
          label="Advertisement"
          format="banner"
        />
      </section>
    </div>
  );
}
