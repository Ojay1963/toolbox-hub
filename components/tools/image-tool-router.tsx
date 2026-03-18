"use client";

import dynamic from "next/dynamic";
import {
  BackgroundRemoverTool,
  BlurImageTool,
  ExifDataRemoverTool,
  ExifDataViewerTool,
  CropImageTool,
  GifMakerTool,
  ImageBorderGeneratorTool,
  ImageBrightnessAdjusterTool,
  ImageColorInverterTool,
  ImageColorPaletteGeneratorTool,
  ImageColorPickerTool,
  ImageCompressorTool,
  ImageContrastAdjusterTool,
  ImageCropperProTool,
  ImageDpiCheckerTool,
  ImageFormatConverterTool,
  ImageGrayscaleConverterTool,
  ImageHistogramAnalyzerTool,
  ImageMetadataViewerTool,
  ImageNoiseReducerTool,
  ImageResizerTool,
  ImageRotatorTool,
  ImageToBase64ConverterTool,
  ImageToWebpConverterTool,
  ImageWatermarkTool,
  JpgToPngConverterTool,
  PngToJpgConverterTool,
  VideoFrameExtractorTool,
  VideoMetadataViewerTool,
  VideoResolutionCheckerTool,
  VideoToGifConverterTool,
} from "@/components/tools/image-tools";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

function LoadingToolPanel() {
  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="h-5 w-32 rounded-full bg-stone-100" />
      <div className="mt-4 h-9 w-56 rounded-xl bg-stone-100" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded bg-stone-100" />
        <div className="h-4 w-11/12 rounded bg-stone-100" />
      </div>
    </div>
  );
}

const BarcodeScannerTool = dynamic(() => import("@/components/tools/image-lazy-tools").then((module) => module.BarcodeScannerTool), { loading: () => <LoadingToolPanel /> });
const QrCodeScannerTool = dynamic(() => import("@/components/tools/image-lazy-tools").then((module) => module.QrCodeScannerTool), { loading: () => <LoadingToolPanel /> });
const ColorContrastCheckerTool = dynamic(() => import("@/components/tools/image-lazy-tools").then((module) => module.ColorContrastCheckerTool), { loading: () => <LoadingToolPanel /> });

export function ImageToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "barcode-scanner": return <BarcodeScannerTool />;
    case "qr-code-scanner": return <QrCodeScannerTool />;
    case "color-contrast-checker": return <ColorContrastCheckerTool />;
    case "image-compressor": return <ImageCompressorTool />;
    case "image-format-converter": return <ImageFormatConverterTool />;
    case "image-cropper-pro": return <ImageCropperProTool />;
    case "gif-maker": return <GifMakerTool />;
    case "video-to-gif-converter": return <VideoToGifConverterTool />;
    case "image-color-palette-generator": return <ImageColorPaletteGeneratorTool />;
    case "exif-data-viewer": return <ExifDataViewerTool />;
    case "exif-data-remover": return <ExifDataRemoverTool />;
    case "image-color-inverter": return <ImageColorInverterTool />;
    case "image-noise-reducer": return <ImageNoiseReducerTool />;
    case "image-histogram-analyzer": return <ImageHistogramAnalyzerTool />;
    case "video-metadata-viewer": return <VideoMetadataViewerTool />;
    case "video-frame-extractor": return <VideoFrameExtractorTool />;
    case "video-resolution-checker": return <VideoResolutionCheckerTool />;
    case "image-metadata-viewer": return <ImageMetadataViewerTool />;
    case "image-dpi-checker": return <ImageDpiCheckerTool />;
    case "image-border-generator": return <ImageBorderGeneratorTool />;
    case "image-color-picker": return <ImageColorPickerTool />;
    case "blur-image-tool": return <BlurImageTool />;
    case "image-brightness-adjuster": return <ImageBrightnessAdjusterTool />;
    case "image-contrast-adjuster": return <ImageContrastAdjusterTool />;
    case "image-grayscale-converter": return <ImageGrayscaleConverterTool />;
    case "image-resizer": return <ImageResizerTool />;
    case "crop-image": return <CropImageTool />;
    case "jpg-to-png-converter": return <JpgToPngConverterTool />;
    case "png-to-jpg-converter": return <PngToJpgConverterTool />;
    case "image-to-webp-converter": return <ImageToWebpConverterTool />;
    case "background-remover": return <BackgroundRemoverTool />;
    case "image-rotator": return <ImageRotatorTool />;
    case "image-watermark-tool": return <ImageWatermarkTool />;
    case "image-to-base64-converter": return <ImageToBase64ConverterTool />;
    default: return <ToolPlaceholder tool={tool} />;
  }
}
