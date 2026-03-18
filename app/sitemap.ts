import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/seo";
import { categories, getPopularTools, getRecentTools, tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const popularSlugs = new Set(getPopularTools(20).map((tool) => tool.slug));
  const recentSlugs = new Set(getRecentTools(20).map((tool) => tool.slug));

  return [
    {
      url: siteMetadata.siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...categories.map((category) => ({
      url: `${siteMetadata.siteUrl}/category/${category.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...tools.map((tool) => ({
      url: `${siteMetadata.siteUrl}/tools/${tool.slug}`,
      lastModified,
      changeFrequency:
        tool.implementationStatus === "working-local" || tool.implementationStatus === "reduced-scope-local"
          ? ("weekly" as const)
          : ("monthly" as const),
      priority: popularSlugs.has(tool.slug)
        ? 0.9
        : recentSlugs.has(tool.slug)
          ? 0.8
          : tool.implementationStatus === "working-local"
            ? 0.75
            : tool.implementationStatus === "reduced-scope-local"
              ? 0.68
              : 0.6,
    })),
  ];
}
