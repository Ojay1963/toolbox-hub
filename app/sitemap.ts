import type { MetadataRoute } from "next";
import { blogArticles } from "@/lib/blog";
import { educationTools } from "@/lib/education-tools";
import { siteMetadata } from "@/lib/seo";
import {
  categories,
  shouldIncludeToolInSitemap,
  tools,
} from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticPages = ["/about", "/blog", "/contact", "/privacy-policy", "/terms-of-use", "/disclaimer", "/tools", "/tools/education"];
  const highValueCategorySlugs = new Set(["image-tools", "pdf-tools", "text-tools", "developer-tools"]);

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteMetadata.siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...staticPages.map((pathname) => ({
      url: `${siteMetadata.siteUrl}${pathname}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: pathname === "/blog" ? 0.82 : pathname === "/tools" ? 0.86 : pathname === "/contact" ? 0.62 : 0.54,
    })),
    ...categories.map((category) => ({
      url: `${siteMetadata.siteUrl}/category/${category.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: highValueCategorySlugs.has(category.slug) ? 0.9 : 0.68,
    })),
    ...blogArticles.map((article) => ({
      url: `${siteMetadata.siteUrl}/blog/${article.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.86,
    })),
    ...tools
      .filter((tool) => shouldIncludeToolInSitemap(tool))
      .map((tool) => ({
        url: `${siteMetadata.siteUrl}/tools/${tool.slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority:
          tool.implementationStatus === "working-local"
            ? 0.8
            : tool.implementationStatus === "reduced-scope-local"
              ? 0.72
              : 0.68,
      })),
    ...educationTools.map((tool) => ({
      url: `${siteMetadata.siteUrl}/tools/education/${tool.slug}`,
      lastModified,
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
