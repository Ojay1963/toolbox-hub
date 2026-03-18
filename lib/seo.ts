import type { Metadata } from "next";

export const siteMetadata = {
  name: "Toolbox Hub",
  description:
    "A fast, SEO-friendly collection of more than 150 free online tools for images, PDFs, text, developers, generators, calculators, converters, and internet tasks.",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, ""),
};

export function absoluteUrl(pathname: string) {
  return new URL(pathname, siteMetadata.siteUrl).toString();
}

export function buildMetadata({
  title,
  description,
  pathname,
  keywords,
}: {
  title: string;
  description: string;
  pathname: string;
  keywords?: string[];
}): Metadata {
  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: absoluteUrl(pathname),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(pathname),
      siteName: siteMetadata.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{
    name: string;
    pathname: string;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.pathname),
    })),
  };
}

export function buildFaqJsonLd(
  items: Array<{
    question: string;
    answer: string;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildHowToJsonLd(
  name: string,
  description: string,
  steps: string[],
  pathname: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    url: absoluteUrl(pathname),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step,
      text: step,
    })),
  };
}

export function buildCollectionPageJsonLd({
  name,
  description,
  pathname,
  items,
}: {
  name: string;
  description: string;
  pathname: string;
  items: Array<{ name: string; pathname: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(pathname),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.pathname),
      })),
    },
  };
}

export function buildSoftwareApplicationJsonLd({
  name,
  description,
  pathname,
  category,
}: {
  name: string;
  description: string;
  pathname: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: category,
    operatingSystem: "Any",
    description,
    url: absoluteUrl(pathname),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteMetadata.name,
    url: siteMetadata.siteUrl,
    description: siteMetadata.description,
  };
}
