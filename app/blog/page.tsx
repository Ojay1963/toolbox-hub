import Link from "next/link";
import { buildCollectionPageJsonLd, buildMetadata } from "@/lib/seo";
import { blogArticles } from "@/lib/blog";

export const metadata = buildMetadata({
  title: "Guides and Tutorials",
  description:
    "Read practical guides for image tools, PDF tools, JSON formatting, and other common tasks, with links to the matching tools.",
  pathname: "/blog",
  keywords: ["tools blog", "online tools guides", "image tools guide", "pdf tools guide"],
});

export default function BlogIndexPage() {
  const jsonLd = buildCollectionPageJsonLd({
    name: "Toolbox Hub Guides",
    description: "Practical guides that explain common tasks and link to the matching online tools.",
    pathname: "/blog",
    items: blogArticles.map((article) => ({
      name: article.title,
      pathname: `/blog/${article.slug}`,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-7 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
            Guides
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Guides and Tutorials</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
            Browse practical articles that explain common tasks and link you straight to the right tool.
          </p>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {blogArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-6 shadow-sm transition hover:border-[color:var(--primary)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                Guide
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">{article.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                {article.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
