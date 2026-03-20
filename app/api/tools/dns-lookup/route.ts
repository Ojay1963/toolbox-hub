import { enforceRateLimit, jsonError, jsonSuccess, lookupDnsRecords } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, {
      key: "dns-lookup",
      windowMs: 5 * 60 * 1000,
      maxRequests: 40,
      message: "DNS lookups are temporarily rate limited. Please wait a moment and try again.",
    });

    const { searchParams } = new URL(request.url);
    const hostname = searchParams.get("hostname") ?? "";
    const result = await lookupDnsRecords(hostname);
    return jsonSuccess(result);
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/dns-lookup", tool: "dns-lookup", request, upstreamService: "dns" },
      error,
    );
    return jsonError(error, "Unable to resolve DNS records for that hostname.");
  }
}
