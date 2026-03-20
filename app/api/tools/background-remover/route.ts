import { enforceRateLimit, jsonError, readUploadedFile, removeImageBackground } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let fileSizeBytes: number | undefined;
  try {
    // Best-effort in-memory limit: expensive third-party image segmentation.
    await enforceRateLimit(request, {
      key: "background-remover",
      windowMs: 10 * 60 * 1000,
      maxRequests: 8,
      message: "Background removal is busy right now. Please wait a few minutes and try again.",
    });

    const formData = await request.formData();
    const file = await readUploadedFile(formData, "file", {
      label: "image",
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
      maxBytes: 10 * 1024 * 1024,
    });
    fileSizeBytes = file.size;
    const result = await removeImageBackground(file);

    const body = result.bytes.buffer.slice(result.bytes.byteOffset, result.bytes.byteOffset + result.bytes.byteLength) as ArrayBuffer;
    return new Response(body, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.name}"`,
      },
    });
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/background-remover", tool: "background-remover", request, fileSizeBytes, upstreamService: "remove.bg" },
      error,
    );
    return jsonError(error, "Unable to remove that image background.");
  }
}
