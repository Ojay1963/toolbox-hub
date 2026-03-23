import type { Metadata } from "next";
import { getIndexableTools } from "@/lib/tools";

function normalizeSiteUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

function normalizeEmail(value?: string) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return undefined;
  }

  return trimmed;
}

function resolveSiteUrl() {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeSiteUrl(process.env.VERCEL_URL) ||
    "http://localhost:3000"
  );
}

const resolvedSiteUrl = resolveSiteUrl();
const siteUrlHostname = new URL(resolvedSiteUrl).hostname.toLowerCase();
const isLocalSiteUrl = /^(localhost|127\.0\.0\.1)$/.test(siteUrlHostname);
const isPreviewDeployment = process.env.VERCEL_ENV === "preview";
const indexableToolCount = getIndexableTools().length;
const resolvedContactEmail = normalizeEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL);

export const siteMetadata = {
  name: "Toolbox Hub",
  description:
    `A fast, SEO-friendly collection of ${indexableToolCount} public tool pages for images, PDFs, text, developers, generators, calculators, converters, and internet tasks.`,
  siteUrl: resolvedSiteUrl,
  indexableToolCount,
  contactEmail: resolvedContactEmail,
  isLocalSiteUrl,
  shouldAllowIndexing: !isLocalSiteUrl && !isPreviewDeployment,
};

export function getPublicContactEmail() {
  return resolvedContactEmail;
}

export function absoluteUrl(pathname: string) {
  return new URL(pathname, siteMetadata.siteUrl).toString();
}

export function buildMetadata({
  title,
  description,
  pathname,
  keywords,
  index = true,
  canonicalPathname,
}: {
  title: string;
  description: string;
  pathname: string;
  keywords?: string[];
  index?: boolean;
  canonicalPathname?: string;
}): Metadata {
  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    robots: {
      index,
      follow: true,
    },
    alternates: {
      canonical: absoluteUrl(canonicalPathname ?? pathname),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonicalPathname ?? pathname),
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
