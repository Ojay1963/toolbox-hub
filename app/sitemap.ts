import type { MetadataRoute } from "next";
import { blogArticles } from "@/lib/blog";
import { siteMetadata } from "@/lib/seo";
import {
  categories,
  getPopularTools,
  getRecentTools,
  getTrendingTools,
  isDeprioritizedTool,
  isExpandedSeoTool,
  shouldIncludeToolInSitemap,
  tools,
} from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const popularTools = getPopularTools(36);
  const recentTools = getRecentTools(24);
  const trendingTools = getTrendingTools(32);
  const popularSlugs = new Set(popularTools.map((tool) => tool.slug));
  const recentSlugs = new Set(recentTools.map((tool) => tool.slug));
  const trendingSlugs = new Set(trendingTools.map((tool) => tool.slug));
  const categoryLeaderSlugs = new Set(
    categories.flatMap((category) => getPopularTools(6, category.slug).map((tool) => tool.slug)),
  );
  const curatedToolSlugs = new Set(
    tools
      .filter((tool) => shouldIncludeToolInSitemap(tool))
      .filter((tool) => tool.implementationStatus === "working-local")
      .filter((tool) => !isDeprioritizedTool(tool))
      .filter(
        (tool) =>
          popularSlugs.has(tool.slug) ||
          trendingSlugs.has(tool.slug) ||
          recentSlugs.has(tool.slug) ||
          categoryLeaderSlugs.has(tool.slug) ||
          isExpandedSeoTool(tool),
      )
      .map((tool) => tool.slug),
  );
  const staticPages = ["/about", "/blog", "/contact", "/privacy-policy", "/terms-of-use", "/disclaimer", "/tools"];
  const highValueCategorySlugs = new Set(["image-tools", "pdf-tools", "text-tools", "developer-tools"]);

  return [
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
      .filter((tool) => curatedToolSlugs.has(tool.slug))
      .map((tool) => ({
        url: `${siteMetadata.siteUrl}/tools/${tool.slug}`,
        lastModified,
        changeFrequency:
          popularSlugs.has(tool.slug) || trendingSlugs.has(tool.slug)
            ? ("weekly" as const)
            : ("monthly" as const),
        priority: popularSlugs.has(tool.slug)
          ? 0.94
          : trendingSlugs.has(tool.slug)
            ? 0.89
            : categoryLeaderSlugs.has(tool.slug)
              ? 0.83
              : recentSlugs.has(tool.slug)
                ? 0.79
                : isExpandedSeoTool(tool)
                  ? 0.76
                  : 0.72,
      })),
  ];
}
