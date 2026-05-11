import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_FILE_PATTERN = /\.[a-z0-9]+$/i;
const TRACKING_PARAM_PATTERN = /^(utm_|fbclid$|gclid$|msclkid$|yclid$|mc_cid$|mc_eid$|ref$|source$)/i;

function getCanonicalSiteUrl() {
  const rawValue =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "https://toolboxhubapp.com";
  const withProtocol = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;

  try {
    return new URL(withProtocol.replace(/\/+$/, ""));
  } catch {
    return new URL("https://toolboxhubapp.com");
  }
}

function shouldSkipProxy(pathname: string) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE_PATTERN.test(pathname)
  );
}

export function proxy(request: NextRequest) {
  const canonicalSiteUrl = getCanonicalSiteUrl();
  const requestUrl = request.nextUrl.clone();
  const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(requestUrl.hostname);

  if (shouldSkipProxy(requestUrl.pathname)) {
    return NextResponse.next();
  }

  let shouldRedirect = false;

  if (!isLocalHost && requestUrl.hostname.toLowerCase() !== canonicalSiteUrl.hostname.toLowerCase()) {
    requestUrl.hostname = canonicalSiteUrl.hostname;
    requestUrl.port = canonicalSiteUrl.port;
    shouldRedirect = true;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (!isLocalHost && (requestUrl.protocol !== canonicalSiteUrl.protocol || forwardedProto === "http")) {
    requestUrl.protocol = canonicalSiteUrl.protocol;
    shouldRedirect = true;
  }

  for (const key of Array.from(requestUrl.searchParams.keys())) {
    if (TRACKING_PARAM_PATTERN.test(key)) {
      requestUrl.searchParams.delete(key);
      shouldRedirect = true;
    }
  }

  if (!shouldRedirect) {
    return NextResponse.next();
  }

  return NextResponse.redirect(requestUrl, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)"],
};
