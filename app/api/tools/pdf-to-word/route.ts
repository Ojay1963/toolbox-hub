import { convertPdfToWord, enforceRateLimit, jsonError, readUploadedFile } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let fileSizeBytes: number | undefined;
  try {
    await enforceRateLimit(request, {
      key: "pdf-to-word",
      windowMs: 10 * 60 * 1000,
      maxRequests: 10,
      message: "PDF to Word conversion is busy right now. Please wait a few minutes and try again.",
    });

    const formData = await request.formData();
    const file = await readUploadedFile(formData, "file", {
      label: "PDF",
      allowedMimeTypes: ["application/pdf"],
      allowedExtensions: [".pdf"],
      maxBytes: 20 * 1024 * 1024,
    });
    fileSizeBytes = file.size;
    const result = await convertPdfToWord(file);

    const body = result.bytes.buffer.slice(result.bytes.byteOffset, result.bytes.byteOffset + result.bytes.byteLength) as ArrayBuffer;
    return new Response(body, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${result.name}"`,
      },
    });
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/pdf-to-word", tool: "pdf-to-word", request, fileSizeBytes, upstreamService: "server-conversion" },
      error,
    );
    return jsonError(error, "Unable to convert that PDF into Word.");
  }
}
