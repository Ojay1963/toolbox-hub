import { enforceRateLimit, jsonError, jsonSuccess, readUploadedFile, runPdfOcr } from "@/lib/server/tool-services";
import { logToolRouteError } from "@/lib/server/observability";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let fileSizeBytes: number | undefined;
  try {
    // OCR is one of the costliest upload flows, so keep the per-IP window tight.
    await enforceRateLimit(request, {
      key: "pdf-ocr",
      windowMs: 10 * 60 * 1000,
      maxRequests: 6,
      message: "PDF OCR is temporarily rate limited. Please wait a few minutes before trying again.",
    });

    const formData = await request.formData();
    const file = await readUploadedFile(formData, "file", {
      label: "PDF",
      allowedMimeTypes: ["application/pdf"],
      allowedExtensions: [".pdf"],
      maxBytes: 20 * 1024 * 1024,
    });
    fileSizeBytes = file.size;
    const text = await runPdfOcr(file);
    return jsonSuccess({ text, fileName: `${file.name.replace(/\.pdf$/i, "")}-ocr.txt` });
  } catch (error) {
    logToolRouteError(
      { route: "/api/tools/pdf-ocr", tool: "pdf-ocr", request, fileSizeBytes, upstreamService: "ocr.space" },
      error,
    );
    return jsonError(error, "Unable to run OCR on that PDF.");
  }
}
