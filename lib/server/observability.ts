import "server-only";

import { ToolServiceError } from "@/lib/server/tool-services";

type ToolRouteLogContext = {
  route: string;
  tool: string;
  request: Request;
  fileSizeBytes?: number;
  upstreamService?: string;
  extra?: Record<string, unknown>;
};

type NormalizedError = {
  statusCode: number;
  code: string;
  message: string;
  upstreamFailureType: string;
  timeout: boolean;
  fetchFailure: boolean;
};

function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ToolServiceError) {
    return {
      statusCode: error.status,
      code: error.code,
      message: error.message,
      upstreamFailureType:
        error.code === "UPSTREAM_TIMEOUT"
          ? "timeout"
          : error.code === "UPSTREAM_UNAVAILABLE"
            ? "upstream-unavailable"
            : error.code === "RATE_LIMITED"
              ? "rate-limited"
              : error.code === "SERVICE_UNAVAILABLE"
                ? "service-unavailable"
                : "tool-service-error",
      timeout: error.code === "UPSTREAM_TIMEOUT",
      fetchFailure: error.code === "UPSTREAM_TIMEOUT" || error.code === "UPSTREAM_UNAVAILABLE",
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      code: "UNEXPECTED_ERROR",
      message: error.message,
      upstreamFailureType: error.name === "AbortError" ? "timeout" : "unexpected-error",
      timeout: error.name === "AbortError",
      fetchFailure: error.name === "AbortError" || /fetch/i.test(error.message),
    };
  }

  return {
    statusCode: 500,
    code: "UNEXPECTED_ERROR",
    message: "Unexpected route failure.",
    upstreamFailureType: "unexpected-error",
    timeout: false,
    fetchFailure: false,
  };
}

function getLogLevel(statusCode: number) {
  if (statusCode >= 500) {
    return "error";
  }
  if (statusCode >= 400) {
    return "warn";
  }
  return "info";
}

async function emitMonitoringHook(payload: Record<string, unknown>) {
  const endpoint = process.env.OBSERVABILITY_WEBHOOK_URL?.trim();
  if (!endpoint) {
    return;
  }

  const headerName = process.env.OBSERVABILITY_WEBHOOK_AUTH_HEADER?.trim();
  const headerValue = process.env.OBSERVABILITY_WEBHOOK_AUTH_TOKEN?.trim();

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(headerName && headerValue ? { [headerName]: headerValue } : {}),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Avoid recursive logging loops if the monitoring hook itself is unavailable.
  }
}

export function logToolRouteError(context: ToolRouteLogContext, error: unknown) {
  const normalized = normalizeError(error);
  const payload = {
    timestamp: new Date().toISOString(),
    level: getLogLevel(normalized.statusCode),
    event: "tool.route.error",
    route: context.route,
    tool: context.tool,
    method: context.request.method,
    pathname: new URL(context.request.url).pathname,
    statusCode: normalized.statusCode,
    errorCode: normalized.code,
    upstreamService: context.upstreamService ?? null,
    upstreamFailureType: normalized.upstreamFailureType,
    timeout: normalized.timeout,
    fetchFailure: normalized.fetchFailure,
    fileSizeBytes: context.fileSizeBytes ?? null,
    message: normalized.message,
    ...context.extra,
  };

  const logger = payload.level === "error" ? console.error : console.warn;
  logger(JSON.stringify(payload));
  void emitMonitoringHook(payload);
}

export function logToolRouteEvent(event: string, context: ToolRouteLogContext & { statusCode: number }) {
  const payload = {
    timestamp: new Date().toISOString(),
    level: getLogLevel(context.statusCode),
    event,
    route: context.route,
    tool: context.tool,
    method: context.request.method,
    pathname: new URL(context.request.url).pathname,
    statusCode: context.statusCode,
    fileSizeBytes: context.fileSizeBytes ?? null,
    upstreamService: context.upstreamService ?? null,
    ...context.extra,
  };

  if (context.statusCode >= 400) {
    console.warn(JSON.stringify(payload));
  } else {
    console.info(JSON.stringify(payload));
  }
}
