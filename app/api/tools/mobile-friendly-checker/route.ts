import { analyzeMobileFriendliness, enforceRateLimit, jsonError, jsonSuccess } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, {
      key: "mobile-friendly-checker",
      windowMs: 10 * 60 * 1000,
      maxRequests: 12,
      message: "Mobile-friendly checks are temporarily rate limited. Please wait a few minutes and try again.",
    });

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url") ?? "";
    const result = await analyzeMobileFriendliness(url);
    return jsonSuccess(result);
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/mobile-friendly-checker", tool: "mobile-friendly-checker", request, upstreamService: "pagespeed-insights" },
      error,
    );
    return jsonError(error, "Unable to analyze mobile friendliness for that URL.");
  }
}
