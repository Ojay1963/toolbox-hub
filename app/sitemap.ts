import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/seo";
import { categories, getPopularTools, getRecentTools, getTrendingTools, isExpandedSeoTool, tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const popularSlugs = new Set(getPopularTools(30).map((tool) => tool.slug));
  const recentSlugs = new Set(getRecentTools(50).map((tool) => tool.slug));
  const trendingSlugs = new Set(getTrendingTools(40).map((tool) => tool.slug));

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
      priority: 0.88,
    })),
    ...tools.map((tool) => ({
      url: `${siteMetadata.siteUrl}/tools/${tool.slug}`,
      lastModified,
      changeFrequency:
        isExpandedSeoTool(tool) || tool.implementationStatus === "working-local" || tool.implementationStatus === "reduced-scope-local"
          ? ("weekly" as const)
          : ("monthly" as const),
      priority: popularSlugs.has(tool.slug)
        ? 0.92
        : trendingSlugs.has(tool.slug)
          ? 0.88
        : recentSlugs.has(tool.slug)
          ? 0.84
          : isExpandedSeoTool(tool)
            ? 0.82
          : tool.implementationStatus === "working-local"
            ? 0.78
            : tool.implementationStatus === "reduced-scope-local"
              ? 0.7
              : 0.62,
    })),
  ];
}
