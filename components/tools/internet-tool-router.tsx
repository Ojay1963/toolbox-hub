"use client";

import {
  DnsLookupTool,
  HttpStatusCodeCheckerTool,
  IpAddressLookupTool,
  MimeTypeLookupTool,
  UrlRedirectCheckerTool,
  UrlStatusCheckerTool,
  UserAgentParserTool,
  WebpageSourceViewerTool,
  WebsiteScreenshotTool,
} from "@/components/tools/internet-tools";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

export function InternetToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "ip-address-lookup": return <IpAddressLookupTool />;
    case "http-status-code-checker": return <HttpStatusCodeCheckerTool />;
    case "url-status-checker": return <UrlStatusCheckerTool />;
    case "url-redirect-checker": return <UrlRedirectCheckerTool />;
    case "webpage-source-viewer": return <WebpageSourceViewerTool />;
    case "website-screenshot-tool": return <WebsiteScreenshotTool />;
    case "user-agent-parser": return <UserAgentParserTool />;
    case "dns-lookup": return <DnsLookupTool />;
    case "mime-type-lookup": return <MimeTypeLookupTool />;
    default: return <ToolPlaceholder tool={tool} />;
  }
}
