import type { NextConfig } from "next";
import createBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const publicContactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim().toLowerCase();
const hasValidPublicContactEmail = Boolean(publicContactEmail && publicContactEmail.includes("@"));

if (!hasValidPublicContactEmail) {
  console.warn(
    "[tools-website] Warning: NEXT_PUBLIC_CONTACT_EMAIL is missing or invalid. Public contact email will not appear on the contact page and footer until it is set.",
  );
}

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
  experimental: {
    // Let Next.js rewrite package imports more aggressively where supported.
    optimizePackageImports: ["pdf-lib", "qrcode", "docx", "mammoth"],
  },
};

export default withBundleAnalyzer(nextConfig);
