import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tool-page";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildHowToJsonLd,
  buildMetadata,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo";
import { getTool, tools } from "@/lib/tools";

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) {
    return {};
  }

  return buildMetadata({
    title: tool.seoTitle,
    description: tool.seoDescription,
    pathname: `/tools/${tool.slug}`,
    keywords: [...tool.keywords, tool.name, tool.category.replace(/-/g, " ")],
  });
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) {
    notFound();
  }

  const relatedTools = tool.relatedToolSlugs
    .map((slug) => getTool(slug))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate));
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: tool.category.replace(/-/g, " "), pathname: `/category/${tool.category}` },
    { name: tool.name, pathname: `/tools/${tool.slug}` },
  ]);
  const faqJsonLd = buildFaqJsonLd(
    tool.faq.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  );
  const howToJsonLd = buildHowToJsonLd(
    `How to use ${tool.name}`,
    tool.seoDescription,
    tool.howToUse,
    `/tools/${tool.slug}`,
  );
  const softwareJsonLd = buildSoftwareApplicationJsonLd({
    name: tool.name,
    description: tool.seoDescription,
    pathname: `/tools/${tool.slug}`,
    category: "UtilityApplication",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <ToolPage tool={tool} relatedTools={relatedTools} />
    </>
  );
}
