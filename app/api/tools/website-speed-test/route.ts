import { enforceRateLimit, fetchPageSpeedReport, jsonError, jsonSuccess, summarizePageSpeedReport } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, {
      key: "website-speed-test",
      windowMs: 10 * 60 * 1000,
      maxRequests: 12,
      message: "Website speed tests are temporarily rate limited. Please wait a few minutes and try again.",
    });

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url") ?? "";
    const report = await fetchPageSpeedReport(url);
    return jsonSuccess(summarizePageSpeedReport(report));
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/website-speed-test", tool: "website-speed-test", request, upstreamService: "pagespeed-insights" },
      error,
    );
    return jsonError(error, "Unable to run a speed test for that URL.");
  }
}
