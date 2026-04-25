import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsHook } from "@/components/monitoring/analytics-hook";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NumberInputEnhancer } from "@/components/ui/number-input-enhancer";
import { buildWebsiteJsonLd, siteMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.name,
    template: `%s | ${siteMetadata.name}`,
  },
  description: siteMetadata.description,
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: ["/icon.png"],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteMetadata.name,
    title: siteMetadata.name,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.name,
    description: siteMetadata.description,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#f6f3ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = buildWebsiteJsonLd();

  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-slate-900"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AnalyticsHook />
        <NumberInputEnhancer />
        <div className="app-shell relative min-h-screen max-w-full overflow-x-clip">
          <Header />
          <main id="main-content" className="app-main max-w-full overflow-x-clip pb-10">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
