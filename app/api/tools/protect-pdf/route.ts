import { ToolServiceError, enforceRateLimit, fetchWithTimeout, jsonError, readUploadedFile, requireEnvVar } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let fileSizeBytes: number | undefined;
  try {
    await enforceRateLimit(request, {
      key: "protect-pdf",
      windowMs: 10 * 60 * 1000,
      maxRequests: 8,
      message: "PDF protection is temporarily rate limited. Please wait a few minutes and try again.",
    });

    const serviceUrl = requireEnvVar(
      "PDF_PROTECT_SERVICE_URL",
      "PDF protection is not enabled on this deployment yet.",
    );

    const incoming = await request.formData();
    const file = await readUploadedFile(incoming, "file", {
      label: "PDF",
      allowedMimeTypes: ["application/pdf"],
      allowedExtensions: [".pdf"],
      maxBytes: 20 * 1024 * 1024,
    });
    fileSizeBytes = file.size;
    const password = String(incoming.get("password") ?? "").trim();
    if (password.length < 6) {
      throw new ToolServiceError("Enter a password with at least 6 characters.");
    }

    const outgoing = new FormData();
    outgoing.append("file", file);
    outgoing.append("password", password);

    const headerName = process.env.PDF_PROTECT_SERVICE_AUTH_HEADER?.trim();
    const headerValue = process.env.PDF_PROTECT_SERVICE_API_KEY?.trim();
    const headers: HeadersInit = headerName && headerValue ? { [headerName]: headerValue } : {};

    const response = await fetchWithTimeout(serviceUrl, {
      method: "POST",
      headers,
      body: outgoing,
      timeoutMs: 20_000,
    });

    if (!response.ok) {
      throw new ToolServiceError("The PDF protection service could not protect that file right now.", {
        status: response.status === 429 ? 503 : 502,
        code: "UPSTREAM_UNAVAILABLE",
      });
    }

    return new Response(await response.arrayBuffer(), {
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.pdf$/i, "")}-protected.pdf"`,
      },
    });
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/protect-pdf", tool: "protect-pdf", request, fileSizeBytes, upstreamService: "pdf-protect-service" },
      error,
    );
    return jsonError(error, "Unable to protect that PDF.");
  }
}
