import { convertWordToPdf, enforceRateLimit, jsonError, readUploadedFile } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let fileSizeBytes: number | undefined;
  try {
    await enforceRateLimit(request, {
      key: "word-to-pdf",
      windowMs: 10 * 60 * 1000,
      maxRequests: 10,
      message: "Word to PDF conversion is busy right now. Please wait a few minutes and try again.",
    });

    const formData = await request.formData();
    const file = await readUploadedFile(formData, "file", {
      label: "Word document",
      allowedMimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      allowedExtensions: [".docx"],
      maxBytes: 15 * 1024 * 1024,
    });
    fileSizeBytes = file.size;
    const result = await convertWordToPdf(file);

    const body = result.bytes.buffer.slice(result.bytes.byteOffset, result.bytes.byteOffset + result.bytes.byteLength) as ArrayBuffer;
    return new Response(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${result.name}"`,
      },
    });
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/word-to-pdf", tool: "word-to-pdf", request, fileSizeBytes, upstreamService: "server-conversion" },
      error,
    );
    return jsonError(error, "Unable to convert that Word document.");
  }
}
