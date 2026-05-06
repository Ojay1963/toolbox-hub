import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EducationToolPage } from "@/components/education/tool-page";
import {
  educationTools,
  getEducationArticle,
  getEducationFaq,
  getEducationHowTo,
  getEducationTool,
  getPopularEducationTools,
  getRelatedEducationTools,
} from "@/lib/education-tools";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildHowToJsonLd,
  buildMetadata,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  return educationTools.map((tool) => ({ toolSlug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ toolSlug: string }>;
}): Promise<Metadata> {
  const { toolSlug } = await params;
  const tool = getEducationTool(toolSlug);
  if (!tool) {
    return {};
  }

  return buildMetadata({
    title: tool.seoTitle,
    description: tool.seoDescription,
    pathname: `/tools/education/${tool.slug}`,
    keywords: tool.keywords,
  });
}

export default async function EducationToolDetailPage({
  params,
}: {
  params: Promise<{ toolSlug: string }>;
}) {
  const { toolSlug } = await params;
  const tool = getEducationTool(toolSlug);

  if (!tool) {
    notFound();
  }

  const relatedTools = getRelatedEducationTools(tool.slug, 4);
  const popularTools = getPopularEducationTools(6).filter((item) => item.slug !== tool.slug);
  const faq = getEducationFaq(tool);
  const howTo = getEducationHowTo(tool);
  const article = getEducationArticle(tool);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: "Tools", pathname: "/tools" },
    { name: "Educational Tools", pathname: "/tools/education" },
    { name: tool.name, pathname: `/tools/education/${tool.slug}` },
  ]);
  const faqJsonLd = buildFaqJsonLd(faq);
  const howToJsonLd = buildHowToJsonLd(`How to use ${tool.name}`, tool.seoDescription, howTo, `/tools/education/${tool.slug}`);
  const softwareJsonLd = buildSoftwareApplicationJsonLd({
    name: tool.name,
    description: tool.seoDescription,
    pathname: `/tools/education/${tool.slug}`,
    category: "EducationalApplication",
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <EducationToolPage
        tool={tool}
        relatedTools={relatedTools}
        popularTools={popularTools}
        howTo={howTo}
        article={article}
        faq={faq}
      />
    </>
  );
}
