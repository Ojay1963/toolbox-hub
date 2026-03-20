import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPage } from "@/components/content/blog-page";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildHowToJsonLd, buildMetadata } from "@/lib/seo";
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
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: "Guides", pathname: "/blog" },
    { name: article.title, pathname: `/blog/${article.slug}` },
  ]);
  const faqJsonLd = buildFaqJsonLd(article.faq);
  const howToJsonLd = buildHowToJsonLd(article.title, article.description, article.sections.map((section) => section.title), `/blog/${article.slug}`);

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
      <BlogPage article={article} relatedTools={relatedTools} />
    </>
  );
}
