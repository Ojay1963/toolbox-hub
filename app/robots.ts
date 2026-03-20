import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: siteMetadata.shouldAllowIndexing
      ? {
          userAgent: "*",
          allow: "/",
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
    ...(siteMetadata.shouldAllowIndexing ? { host: siteMetadata.siteUrl } : {}),
  };
}
