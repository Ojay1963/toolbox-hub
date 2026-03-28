import Link from "next/link";
import dynamic from "next/dynamic";
import { FaqList } from "@/components/ui/faq-list";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqJsonLd, buildMetadata, siteMetadata } from "@/lib/seo";
import { categories, getIndexableTools, getPopularTools, getTool } from "@/lib/tools";

const SearchBox = dynamic(() => import("@/components/ui/search-box").then((module) => module.SearchBox));

const homepageFaq = [
  {
    question: "Do these tools require an account?",
    answer: "No. You can open a tool page and use it right away without creating an account.",
  },
  {
    question: "Can I use these tools on mobile?",
    answer: "Yes. The homepage and tool pages are designed to stay easy to browse and use on phones, tablets, and desktop screens.",
  },
  {
    question: "What can I do first on Toolbox Hub?",
    answer: "Start with popular tools, use the search box, or open a category that matches your task.",
  },
];

const featuredToolSlugs = [
  "image-compressor",
  "image-resizer",
  "pdf-merge",
  "pdf-compressor",
  "json-formatter",
  "qr-code-generator",
  "background-remover",
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
};

export const metadata = buildMetadata({
  title: "Free Online Tools for Images, PDFs, Text, Developers, and More",
  description:
    `Use ${siteMetadata.indexableToolCount} public tool pages for image editing, PDF tasks, text cleanup, generators, calculators, converters, and developer workflows.`,
  pathname: "/",
  keywords: ["free online tools", "browser tools", "seo-friendly tools"],
});

export default function HomePage() {
  const publicTools = getIndexableTools();
  const suggestedTools = getPopularTools(8);
  const popularTools = featuredToolSlugs
    .map((slug) => getTool(slug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));
  const simplifiedCategories = categories.filter((category) =>
    ["image-tools", "pdf-tools", "text-tools", "developer-tools", "generator-tools", "calculator-tools"].includes(category.slug),
  );

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

      <section className="site-hero rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-7 shadow-sm sm:p-10 lg:p-12">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
            Free online tools
          </p>
          <h1 className="site-hero-title mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Free Online Tools for Images, PDFs, Text & More
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
            Quickly compress images, merge PDFs, format JSON, and more - no sign-up required.
          </p>
          <div className="site-inline-links mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#popular-tools"
              className="site-action-link rounded-full bg-[color:var(--primary)] px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
            >
              Start Using Tools
            </Link>
            <Link
              href="/#browse-categories"
              className="site-action-link rounded-full border border-[color:var(--border)] bg-white px-6 py-3.5 text-center text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
            >
              Browse Categories
            </Link>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
            You can compress images using our{" "}
            <Link href="/tools/image-compressor" className="font-semibold text-[color:var(--primary)]">
              Image Compressor
            </Link>{" "}
            or resize them with the{" "}
            <Link href="/tools/image-resizer" className="font-semibold text-[color:var(--primary)]">
              Image Resizer
            </Link>
            . If you work with documents, try{" "}
            <Link href="/tools/pdf-merge" className="font-semibold text-[color:var(--primary)]">
              PDF Merge
            </Link>{" "}
            or{" "}
            <Link href="/tools/pdf-compressor" className="font-semibold text-[color:var(--primary)]">
              PDF Compressor
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="popular-tools" className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Popular Tools
        </p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Popular Tools</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Start with the most used tools.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularTools.map((tool) => {
            const badge = categoryBadgeMap[tool.category] ?? categoryBadgeMap["text-tools"];

            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="site-feature-card group rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[color:var(--primary)]/35 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`rounded-2xl px-3 py-2 text-xs font-bold tracking-[0.18em] ${badge.tone}`}>
                    {badge.short}
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--primary)] transition group-hover:text-[color:var(--primary-dark)]">
                    Open
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight">{tool.name}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{tool.shortDescription}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="search-tools" className="mt-10">
        <SearchBox
          tools={publicTools}
          title="Find Your Tool Fast"
          description="Search by tool name, task, or keyword to jump straight into the right workflow."
          placeholder="Search tools (e.g. compress image, merge pdf)"
          maxResults={8}
          suggestedTools={suggestedTools}
          showCategoryFilter
        />
      </section>

      <section id="browse-categories" className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Categories
        </p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Browse Categories</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Pick the section that matches your task and get to a useful tool faster.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {simplifiedCategories.map((category) => {
            const badge = categoryBadgeMap[category.slug] ?? categoryBadgeMap["text-tools"];

            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}#tools-list`}
                className="site-feature-card group rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[color:var(--primary)]/35 hover:shadow-lg"
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

      <section className="site-card mt-10 rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-7 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          Why use Toolbox Hub?
        </p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Why use Toolbox Hub?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            "Free to use",
            "No sign-up required",
            "Works directly in your browser",
            "Fast and simple tools",
          ].map((item) => (
            <div key={item} className="rounded-3xl bg-stone-50 px-5 py-4 text-sm font-semibold text-[color:var(--foreground)]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
          FAQ
        </p>
        <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Common questions</h2>
        <div className="mt-6">
          <FaqList items={homepageFaq} />
        </div>
      </section>
    </div>
  );
}
