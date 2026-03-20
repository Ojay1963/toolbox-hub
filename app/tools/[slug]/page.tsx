import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ToolPage } from "@/components/tool-page";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildHowToJsonLd,
  buildMetadata,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo";
import {
  getCanonicalToolSlug,
  getPopularTools,
  getRecentTools,
  getTool,
  isAliasToolSlug,
  isExpandedSeoTool,
  shouldIndexTool,
  tools,
} from "@/lib/tools";

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

  const canonicalSlug = getCanonicalToolSlug(tool.slug);
  const shouldIndex = shouldIndexTool(tool);

  return buildMetadata({
    title: tool.seoTitle,
    description: tool.seoDescription,
    pathname: `/tools/${tool.slug}`,
    canonicalPathname: `/tools/${canonicalSlug}`,
    index: shouldIndex,
    keywords: [
      ...tool.keywords,
      tool.name,
      tool.category.replace(/-/g, " "),
      ...(isExpandedSeoTool(tool) ? [`how to use ${tool.name.toLowerCase()}`, `${tool.name.toLowerCase()} examples`] : []),
    ],
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
  if (isAliasToolSlug(tool.slug)) {
    permanentRedirect(`/tools/${getCanonicalToolSlug(tool.slug)}`);
  }

  const relatedTools = tool.relatedToolSlugs
    .map((slug) => getTool(slug))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate));
  const categoryPopularTools = getPopularTools(4, tool.category).filter((item) => item.slug !== tool.slug);
  const categoryRecentTools = getRecentTools(4, tool.category).filter((item) => item.slug !== tool.slug);
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
      <ToolPage
        tool={tool}
        relatedTools={relatedTools}
        categoryPopularTools={categoryPopularTools}
        categoryRecentTools={categoryRecentTools}
      />
    </>
  );
}
