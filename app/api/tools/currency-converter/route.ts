import { getCurrencyConversion } from "@/lib/server/currency-service";
import { enforceRateLimit, jsonError, jsonSuccess } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, {
      key: "currency-converter",
      windowMs: 5 * 60 * 1000,
      maxRequests: 60,
      message: "Currency conversion is temporarily rate limited. Please wait a moment and try again.",
    });

    const { searchParams } = new URL(request.url);
    const base = searchParams.get("base") ?? "USD";
    const target = searchParams.get("target") ?? "EUR";
    const amount = Number(searchParams.get("amount") ?? "1");
    const date = searchParams.get("date") ?? undefined;
    const result = await getCurrencyConversion({ base, target, amount, date });
    return jsonSuccess(result);
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/currency-converter", tool: "currency-converter", request, upstreamService: "exchange-rate-provider" },
      error,
    );
    return jsonError(error, "Unable to fetch live currency rates.");
  }
}
