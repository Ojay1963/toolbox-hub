import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { CategorySidebar } from "@/components/ui/category-sidebar";
import { FaqList } from "@/components/ui/faq-list";
import { ToolCard } from "@/components/ui/tool-card";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildMetadata,
} from "@/lib/seo";
import {
  categories,
  getCategory,
  getPopularTools,
  getRecentTools,
  getToolsByCategory,
  getTrendingTools,
  shouldIndexTool,
} from "@/lib/tools";

const categoryPageTitles: Record<string, string> = {
  "image-tools": "Free Image Tools — Compress, Resize, Convert & Edit Images Online | Toolbox Hub",
  "pdf-tools": "Free PDF Tools — Merge, Split, Convert & Compress PDFs Online | Toolbox Hub",
  "text-tools": "Free Text Tools — Word Counter, Formatter, Sorter & More | Toolbox Hub",
  "developer-tools": "Free Developer Tools — JSON Formatter, Base64 Encoder & More | Toolbox Hub",
  "generator-tools": "Free Generator Tools — QR Code, Password, UUID & More | Toolbox Hub",
  "calculator-tools": "Free Calculator Tools — Loan, GPA, Percentage & More | Toolbox Hub",
  "converter-tools": "Free Converter Tools — Unit, Currency & File Converter Online | Toolbox Hub",
  "internet-tools": "Free Internet Tools — DNS Lookup, Speed Test & More | Toolbox Hub",
};

const categoryPageDescriptions: Record<string, string> = {
  "image-tools": "Free online image tools for compressing, resizing, cropping, converting, and editing images in your browser. No signup required. Compress JPG, resize PNG, remove backgrounds, make GIFs, and more.",
  "pdf-tools": "Free online PDF tools to merge, split, compress, convert, and edit PDF files instantly in your browser. No signup required. Merge PDFs, convert to Word, compress large files, and extract pages.",
  "text-tools": "Free online text tools for word counting, character counting, case conversion, sorting lines, and formatting text. No signup required. Work with written content faster in your browser.",
  "developer-tools": "Free online developer tools for formatting JSON, encoding Base64, hashing files, validating regex, and more. No signup required. Fast browser-based utilities for everyday development tasks.",
  "generator-tools": "Free online generator tools for QR codes, passwords, UUIDs, random usernames, placeholder text, and more. No signup required. Generate useful values instantly in your browser.",
  "calculator-tools": "Free online calculators for loans, GPA, percentages, BMI, age, dates, and everyday math. No signup required. Get instant results in your browser for personal finance, school, and planning.",
  "converter-tools": "Free online converter tools for units, currencies, temperatures, timestamps, and file formats. No signup required. Convert between common values quickly in your browser.",
  "internet-tools": "Free online internet tools for DNS lookups, website speed tests, mobile-friendly checks, and URL inspections. No signup required. Run quick web checks in your browser.",
};

const categoryActionH1s: Record<string, string> = {
  "image-tools": "Free Image Tools — Compress, Resize, Convert and Edit Images Online",
  "pdf-tools": "Free PDF Tools — Merge, Split, Convert and Compress PDFs Online",
  "text-tools": "Free Text Tools — Word Counter, Formatter, Sorter and More",
  "developer-tools": "Free Developer Tools — JSON Formatter, Base64 Encoder and More",
  "generator-tools": "Free Generator Tools — QR Code, Password, UUID and More",
  "calculator-tools": "Free Calculator Tools — Loan Calculator, GPA, Percentage and More",
  "converter-tools": "Free Converter Tools — Unit, Currency and File Converter Online",
  "internet-tools": "Free Internet Tools — DNS Lookup, Speed Test and More",
};

const categoryIntros: Record<string, string> = {
  "image-tools":
    "Toolbox Hub image tools cover every common image editing task from a single free directory. Compress JPGs and PNGs before uploading them to a website, resize photos to match a template or profile size, crop portraits to remove distracting edges, convert between JPG, PNG, and WebP for the format that fits your workflow, and use tools like the background remover, watermark tool, and GIF maker for more specialised jobs. Every image tool runs in your browser with no signup required, so you can complete a quick edit without installing software or creating an account. Browse the full list below and use the search box to narrow results to the specific task you need.",
  "pdf-tools":
    "Toolbox Hub PDF tools give you a fast and free way to handle the most common PDF editing tasks in the browser. Merge multiple PDF files into one document for cleaner sharing, split a long file into smaller sections, compress a PDF that is too large to email, convert between PDF and Word for editing, and extract or rebuild pages with the JPG conversion tools. Each tool runs in your browser without requiring an account or installation. Whether you need to prepare a file for a client, combine pages for a report, or reduce a scan for an upload limit, the tools below cover the standard PDF workflows people reach for most often.",
  "text-tools":
    "Toolbox Hub text tools are built for writers, students, developers, and anyone who works with written content and needs a fast browser-based result. Count words and characters, check reading time, convert text between cases, sort or deduplicate lines, remove extra whitespace, and perform other quick text edits without copying content into a heavy application. Every tool runs in your browser with no account required. Whether you are preparing blog copy, cleaning up a data export, checking an assignment word count, or formatting a list for a project, the text tools below cover the common tasks that come up most often in everyday writing and editing workflows.",
  "developer-tools":
    "Toolbox Hub developer tools are designed for quick browser-based tasks that developers, designers, and technical users hit regularly. Format and validate JSON with clear error messages, encode and decode Base64 strings, convert between color formats, check regular expressions, hash files, inspect MIME types, and work through a range of other lightweight utility tasks without leaving the browser or installing a separate app. Every tool runs client-side where possible and does not require a login. Use these tools for fast formatting during development, quick conversions during debugging, or lightweight checks when you need a clean result before moving on to the next task.",
  "generator-tools":
    "Toolbox Hub generator tools let you create passwords, QR codes, UUIDs, random usernames, placeholder text, random colors, and more — all in a free browser-based workflow with no signup required. Generators are useful when you need a specific value quickly without writing code or opening a heavier tool. Generate a strong password for a new account, create a QR code for a URL or contact card, build a unique identifier for a project, or grab random placeholder names and colors for a design mockup. Every generator page explains the output format clearly and lets you copy or download the result immediately. Browse the full list below or search the category to find the specific generator you need.",
  "calculator-tools":
    "Toolbox Hub calculator tools cover the common financial, health, educational, and date-based calculations that come up in everyday planning. Calculate loan payments and total interest for a mortgage or car purchase, check a GPA for a school term, find percentages for a tip or discount, estimate a BMI, plan around dates with an age calculator, and work through other standard number tasks without installing anything. Each calculator runs in your browser with no account required. Whether you need a quick answer for a purchase decision, a school assignment, or a personal finance check, the tools below give you clear results with explanations of what the numbers mean.",
  "converter-tools":
    "Toolbox Hub converter tools make it fast to switch between units, formats, and values in a free browser-based workflow. Convert length, weight, temperature, area, and speed between metric and imperial units, switch between currencies, change timestamps and time zones, and handle other common conversions without downloading a separate app. Every converter runs in your browser with no signup required so you can get a result immediately. Whether you are checking a recipe measurement, planning an international trip, working on a technical document, or switching between file formats, the tools below cover the most frequently needed conversions in one accessible directory.",
  "internet-tools":
    "Toolbox Hub internet tools help you check, test, and inspect web-related details directly from your browser. Look up DNS records for a domain, test a website's speed and performance, check whether a site is mobile-friendly, inspect URL redirect chains, verify SSL details, and run other lightweight web checks that come up in site management, development, and technical troubleshooting. Each tool is free to use and does not require an account. Whether you are diagnosing a domain issue, preparing a site for launch, checking a live URL, or testing basic web performance, the tools below cover the standard internet checks that developers and site owners need most often.",
};

const SearchBox = dynamic(() => import("@/components/ui/search-box").then((module) => module.SearchBox));
const CategoryDirectory = dynamic(() => import("@/components/ui/category-directory").then((module) => module.CategoryDirectory));

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
  const categoryTools = getToolsByCategory(category.slug).filter((tool) => shouldIndexTool(tool));

  const pageTitle = categoryPageTitles[category.slug] ?? `${category.title} — Free Online Tools | Toolbox Hub`;
  const pageDescription = categoryPageDescriptions[category.slug]
    ?? `${category.description} Browse clear how-to steps, FAQs, and related links for tools in this category.`;

  return buildMetadata({
    title: pageTitle,
    description: pageDescription,
    pathname: `/category/${category.slug}`,
    keywords: [
      category.name,
      category.title,
      "free online tools",
      "no signup required",
      "browser-based tools",
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

  const categoryTools = getToolsByCategory(category.slug).filter((tool) => shouldIndexTool(tool));
  const popularInCategory = getPopularTools(6, category.slug);
  const recentInCategory = getRecentTools(4, category.slug);
  const trendingInCategory = getTrendingTools(4, category.slug);
  const spotlightTools =
    category.slug === "image-tools"
      ? ["background-remover", "gif-maker", "image-color-palette-generator", "blur-image-tool"]
        .map((slug) => categoryTools.find((tool) => tool.slug === slug))
        .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool))
      : [];
  const relatedCategories = categories.filter((item) => item.slug !== category.slug).slice(0, 4);
  const featuredLinks = popularInCategory.slice(0, 4);
  const categoryFaq = [
    {
      question: `What kind of tools are in ${category.name}?`,
      answer: `${category.name} includes tools for common tasks in this category, all collected in one place.`,
    },
    {
      question: `Are all ${category.name.toLowerCase()} fully local?`,
      answer: "Some tools run right in your browser, while others may need an online request to finish the job.",
    },
    {
      question: `How do I find related tools outside ${category.name}?`,
      answer: "Use the related categories and links on this page to find similar tools.",
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
    <div className="site-shell mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <CategorySidebar
          activeCategory={category.slug}
          title="Browse Categories"
          description="Move between sections without losing your place in the directory."
        />
        <div className="min-w-0 space-y-8">
      <section className="site-hero mobile-category-hero app-panel min-w-0 rounded-[2rem] p-7 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                Category hub
              </span>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
              {category.name}
            </p>
            <h1 className="mobile-category-title mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              {categoryActionH1s[category.slug] ?? category.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              {categoryIntros[category.slug] ?? category.hero}
            </p>
            <div className="mobile-category-actions mt-6 flex flex-wrap gap-3">
              <Link
                href="#tools-list"
                className="mobile-category-action-link rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
              >
                View all tools
              </Link>
              <Link
                href="#category-search"
                className="mobile-category-action-link rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)] dark:bg-slate-800 dark:border-slate-700/60"
              >
                Search this category
              </Link>
              {featuredLinks.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="mobile-category-action-link rounded-full border border-[color:var(--border)] bg-white/92 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)] dark:bg-slate-800 dark:border-slate-700/60"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
            {spotlightTools.length ? (
              <div className="mt-6 rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--primary-dark)]">
                  Spotlight
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight">Featured image tools</h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                  Jump straight into the image tools people usually want first.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {spotlightTools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="rounded-[1.25rem] border border-[color:var(--border)] bg-white/90 px-4 py-4 transition hover:border-[color:var(--primary)] dark:bg-slate-800/80 dark:border-slate-700/60"
                    >
                      <p className="text-sm font-bold tracking-tight text-[color:var(--foreground)]">{tool.name}</p>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{tool.shortDescription}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="min-w-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl bg-[color:var(--soft)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
                Browse tools
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                Open the featured picks below or use the directory search to narrow this category quickly.
              </p>
            </div>
            <div className="rounded-3xl bg-[color:var(--surface-alt)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
                Helpful next steps
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                Each category page includes related links, search, and lighter browsing paths for mobile and desktop.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="category-search" className="mt-8 scroll-mt-28">
        <SearchBox
          tools={categoryTools}
          title={`Search inside ${category.name}`}
          description={`Search only within ${category.name.toLowerCase()} tools and jump to the right page faster.`}
          maxResults={6}
          compact
          suggestedTools={[...popularInCategory, ...recentInCategory].filter(
            (tool, index, collection) => collection.findIndex((candidate) => candidate.slug === tool.slug) === index,
          )}
        />
      </section>

      <section id="tools-list" className="site-card mobile-tools-list-section app-panel scroll-mt-28 rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Tools list
            </p>
            <h2 className="site-section-title mt-2 text-2xl font-bold tracking-tight">
              All {category.name.toLowerCase()} tools
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              Start here if you want the full list right away. Open any tool directly or filter the list to narrow it down.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <CategoryDirectory
            tools={categoryTools}
            title="Browse the full category"
            description="Search inside this category and reveal more tools only when you need them."
          />
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
                Featured tools
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Start with the strongest options
              </h2>
            </div>
            <Link href="/" className="text-sm font-semibold text-[color:var(--primary)]">
              Back to homepage
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {popularInCategory.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
        <div className="min-w-0 space-y-6">
          <AdPlaceholder
            slot={`category-${category.slug}-sidebar`}
            label="Advertisement"
            format="sidebar"
          />
          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Category overview</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {category.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedCategories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--foreground)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Explore more</h2>
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
          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Trending in {category.name}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              A few useful picks in this category.
            </p>
            <div className="mt-4 space-y-3">
              {trendingInCategory.map((tool) => (
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
          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Recent additions</h2>
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
          label="Advertisement"
          format="leaderboard"
        />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="site-card app-panel rounded-[2rem] p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            Category FAQ
          </p>
          <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Questions about {category.name}</h2>
          <div className="mt-6">
            <FaqList items={categoryFaq} />
          </div>
        </div>
        <div className="site-card app-panel rounded-[2rem] p-6">
          <h2 className="site-section-title text-lg font-bold tracking-tight">Explore nearby categories</h2>
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
      </div>
    </div>
  );
}
