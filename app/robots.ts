import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/seo";

// Keep robots.txt statically generated so Lighthouse and crawlers do not pay a dynamic response cost.
export const dynamic = "force-static";
export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  const shouldAllowIndexing =
    process.env.NODE_ENV === "production"
      ? process.env.VERCEL_ENV !== "preview"
      : siteMetadata.shouldAllowIndexing;
  const canonicalHost = new URL(siteMetadata.siteUrl).host;

  return {
    rules: shouldAllowIndexing
      ? {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/api/",
            "/*?*",
            "/*?utm_*",
            "/*?fbclid=*",
            "/*?gclid=*",
            "/*?msclkid=*",
            "/_next/data/",
          ],
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
    ...(shouldAllowIndexing ? { host: canonicalHost } : {}),
  };
}
