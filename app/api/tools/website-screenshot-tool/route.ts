import { enforceRateLimit, fetchScreenshot, jsonError } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, {
      key: "website-screenshot-tool",
      windowMs: 10 * 60 * 1000,
      maxRequests: 8,
      message: "Website screenshots are temporarily rate limited. Please wait a few minutes and try again.",
    });

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url") ?? "";
    const result = await fetchScreenshot(url);

    const body = result.bytes.buffer.slice(result.bytes.byteOffset, result.bytes.byteOffset + result.bytes.byteLength) as ArrayBuffer;
    return new Response(body, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.name}"`,
      },
    });
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/website-screenshot-tool", tool: "website-screenshot-tool", request, upstreamService: "screenshot-service" },
      error,
    );
    return jsonError(error, "Unable to capture a screenshot for that website.");
  }
}
