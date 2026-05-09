"use client";

import { buildLazyTool } from "@/components/tools/lazy-tool";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

const IpAddressLookupTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.IpAddressLookupTool));
const HttpStatusCodeCheckerTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.HttpStatusCodeCheckerTool));
const UrlStatusCheckerTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.UrlStatusCheckerTool));
const UrlRedirectCheckerTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.UrlRedirectCheckerTool));
const WebpageSourceViewerTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.WebpageSourceViewerTool));
const WebsiteScreenshotTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.WebsiteScreenshotTool));
const WebsiteSpeedTestTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.WebsiteSpeedTestTool));
const MobileFriendlyCheckerTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.MobileFriendlyCheckerTool));
const UserAgentParserTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.UserAgentParserTool));
const DnsLookupTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.DnsLookupTool));
const MimeTypeLookupTool = buildLazyTool(() => import("@/components/tools/internet-tools").then((module) => module.MimeTypeLookupTool));

export function InternetToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "ip-address-lookup": return <IpAddressLookupTool />;
    case "http-status-code-checker": return <HttpStatusCodeCheckerTool />;
    case "url-status-checker": return <UrlStatusCheckerTool />;
    case "url-redirect-checker": return <UrlRedirectCheckerTool />;
    case "webpage-source-viewer": return <WebpageSourceViewerTool />;
    case "website-screenshot-tool": return <WebsiteScreenshotTool />;
    case "website-speed-test": return <WebsiteSpeedTestTool />;
    case "mobile-friendly-checker": return <MobileFriendlyCheckerTool />;
    case "user-agent-parser": return <UserAgentParserTool />;
    case "dns-lookup": return <DnsLookupTool />;
    case "mime-type-lookup": return <MimeTypeLookupTool />;
    default: return <ToolPlaceholder tool={tool} />;
  }
}
