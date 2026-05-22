import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPage } from "@/components/content/blog-page";
import { buildArticleJsonLd, buildBreadcrumbJsonLd, buildFaqJsonLd, buildHowToJsonLd, buildMetadata } from "@/lib/seo";
import { blogArticles, getBlogArticle, getBlogRelatedTools } from "@/lib/blog";

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) {
    return {};
  }

  return buildMetadata({
    title: article.title,
    description: article.description,
    pathname: `/blog/${article.slug}`,
    keywords: [article.primaryKeyword, article.title.toLowerCase(), "online tools guide"],
  });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) {
    notFound();
  }

  const relatedTools = getBlogRelatedTools(article.relatedToolSlugs);
  const readingTimeMinutes = Math.max(2, Math.round(article.sections.length * 1.5));
  const publishedAt = process.env.NEXT_PUBLIC_CONTENT_LASTMOD ?? "2026-05-01";

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: "Guides", pathname: "/blog" },
    { name: article.title, pathname: `/blog/${article.slug}` },
  ]);
  const faqJsonLd = buildFaqJsonLd(article.faq);
  const howToJsonLd = buildHowToJsonLd(article.title, article.description, article.sections.map((section) => section.title), `/blog/${article.slug}`);
  const articleJsonLd = buildArticleJsonLd({
    headline: article.h1 || article.title,
    description: article.description,
    pathname: `/blog/${article.slug}`,
    publishedAt,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPage article={article} relatedTools={relatedTools} readingTimeMinutes={readingTimeMinutes} />
    </>
  );
}
