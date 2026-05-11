import type { MetadataRoute } from "next";
import { blogArticles } from "@/lib/blog";
import { educationTools } from "@/lib/education-tools";
import { absoluteUrl, canonicalPath } from "@/lib/seo";
import {
  categories,
  shouldIncludeToolInSitemap,
  tools,
} from "@/lib/tools";

// Serve sitemap.xml as a static asset and refresh it periodically instead of computing it per request.
export const dynamic = "force-static";
export const revalidate = 86400;

const contentLastModified = new Date(process.env.NEXT_PUBLIC_CONTENT_LASTMOD ?? "2026-05-11");

function sitemapEntry({
  pathname,
  changeFrequency,
  priority,
}: {
  pathname: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(canonicalPath(pathname)),
    lastModified: contentLastModified,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["/about", "/blog", "/contact", "/privacy-policy", "/terms-of-use", "/disclaimer", "/tools", "/tools/education"];
  const highValueCategorySlugs = new Set(["image-tools", "pdf-tools", "text-tools", "developer-tools"]);

  const entries: MetadataRoute.Sitemap = [
    sitemapEntry({ pathname: "/", changeFrequency: "weekly", priority: 1 }),
    ...staticPages.map((pathname) => ({
      url: absoluteUrl(canonicalPath(pathname)),
      lastModified: contentLastModified,
      changeFrequency: "monthly" as const,
      priority: pathname === "/blog" ? 0.82 : pathname === "/tools" ? 0.86 : pathname === "/contact" ? 0.62 : 0.54,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/category/${category.slug}`),
      lastModified: contentLastModified,
      changeFrequency: "weekly" as const,
      priority: highValueCategorySlugs.has(category.slug) ? 0.9 : 0.68,
    })),
    ...blogArticles.map((article) => ({
      url: absoluteUrl(`/blog/${article.slug}`),
      lastModified: contentLastModified,
      changeFrequency: "monthly" as const,
      priority: 0.86,
    })),
    ...tools
      .filter((tool) => shouldIncludeToolInSitemap(tool))
      .map((tool) => ({
        url: absoluteUrl(`/tools/${tool.slug}`),
        lastModified: contentLastModified,
        changeFrequency: "monthly" as const,
        priority:
          tool.implementationStatus === "working-local"
            ? 0.8
            : tool.implementationStatus === "reduced-scope-local"
              ? 0.72
              : 0.68,
      })),
    ...educationTools.map((tool) => ({
      url: absoluteUrl(`/tools/education/${tool.slug}`),
      lastModified: contentLastModified,
      changeFrequency: tool.popular ? ("weekly" as const) : ("monthly" as const),
      priority: tool.popular ? 0.88 : tool.implementation === "full" ? 0.82 : 0.76,
    })),
  ];

  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
  entries.forEach((entry) => {
    deduped.set(entry.url, entry);
  });

  return [...deduped.values()];
}
