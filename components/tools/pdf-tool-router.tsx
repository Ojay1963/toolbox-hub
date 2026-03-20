"use client";

import {
  ImageToPdfConverterTool,
  JpgToPdfTool,
  PdfBookmarkExtractorTool,
  PdfCompressorTool,
  PdfMergeTool,
  PdfMetadataEditorTool,
  PdfOcrPlaceholderTool,
  PdfPageCounterTool,
  PdfPageExtractorTool,
  PdfPageNumberAdderTool,
  PdfPageReorderTool,
  PdfPageRotatorTool,
  PdfPageSizeCheckerTool,
  PdfSplitTool,
  PdfTextExtractorTool,
  PdfToJpgTool,
  PdfToWordConverterTool,
  PdfUnlockTool,
  PdfWatermarkTool,
  ProtectPdfTool,
  WordToPdfConverterPlaceholderTool,
} from "@/components/tools/pdf-tools";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

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
