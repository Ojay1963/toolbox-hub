"use client";

import { buildLazyTool } from "@/components/tools/lazy-tool";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

const PdfMergeTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfMergeTool));
const PdfSplitTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfSplitTool));
const PdfCompressorTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfCompressorTool));
const PdfToJpgTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfToJpgTool));
const PdfToWordConverterTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfToWordConverterTool));
const ImageToPdfConverterTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.ImageToPdfConverterTool));
const JpgToPdfTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.JpgToPdfTool));
const PdfPageRotatorTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfPageRotatorTool));
const PdfPageNumberAdderTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfPageNumberAdderTool));
const PdfWatermarkTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfWatermarkTool));
const PdfMetadataEditorTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfMetadataEditorTool));
const PdfUnlockTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfUnlockTool));
const PdfPageExtractorTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfPageExtractorTool));
const PdfPageReorderTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfPageReorderTool));
const PdfTextExtractorTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfTextExtractorTool));
const PdfBookmarkExtractorTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfBookmarkExtractorTool));
const PdfPageSizeCheckerTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfPageSizeCheckerTool));
const PdfPageCounterTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfPageCounterTool));
const PdfOcrPlaceholderTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.PdfOcrPlaceholderTool));
const WordToPdfConverterPlaceholderTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.WordToPdfConverterPlaceholderTool));
const ProtectPdfTool = buildLazyTool(() => import("@/components/tools/pdf-tools").then((module) => module.ProtectPdfTool));

export function PdfToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "pdf-merge": return <PdfMergeTool />;
    case "pdf-split": return <PdfSplitTool />;
    case "pdf-compressor": return <PdfCompressorTool />;
    case "pdf-to-jpg": return <PdfToJpgTool />;
    case "pdf-to-word": return <PdfToWordConverterTool />;
    case "pdf-to-word-converter": return <PdfToWordConverterTool />;
    case "image-to-pdf-converter": return <ImageToPdfConverterTool />;
    case "jpg-to-pdf": return <JpgToPdfTool />;
    case "pdf-page-rotator": return <PdfPageRotatorTool />;
    case "pdf-page-number-adder": return <PdfPageNumberAdderTool />;
    case "pdf-watermark-tool": return <PdfWatermarkTool />;
    case "pdf-metadata-editor": return <PdfMetadataEditorTool />;
    case "pdf-unlock-tool": return <PdfUnlockTool />;
    case "pdf-page-extractor": return <PdfPageExtractorTool />;
    case "pdf-page-reorder-tool": return <PdfPageReorderTool />;
    case "pdf-text-extractor": return <PdfTextExtractorTool />;
    case "pdf-bookmark-extractor": return <PdfBookmarkExtractorTool />;
    case "pdf-page-size-checker": return <PdfPageSizeCheckerTool />;
    case "pdf-page-counter": return <PdfPageCounterTool />;
    case "pdf-ocr-placeholder": return <PdfOcrPlaceholderTool />;
    case "word-to-pdf": return <WordToPdfConverterPlaceholderTool />;
    case "word-to-pdf-converter": return <WordToPdfConverterPlaceholderTool />;
    case "protect-pdf": return <ProtectPdfTool />;
    default: return <ToolPlaceholder tool={tool} />;
  }
}
