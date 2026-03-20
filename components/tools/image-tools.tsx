"use client";
/* eslint-disable @next/next/no-img-element */

import type { MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buttonClass,
  EmptyState,
  Field,
  formatFileSize,
  Notice,
  OutputBlock,
  secondaryButtonClass,
  ToolShell,
  useCopyToClipboard,
} from "@/components/tools/common";

type ProcessedImage = {
  url: string;
  blob: Blob;
  width: number;
  height: number;
};

type LoadedImage = {
  image: HTMLImageElement;
  url: string;
};

type LoadedVideo = {
  video: HTMLVideoElement;
  url: string;
};

type DetectedCode = {
  rawValue?: string;
  format?: string;
};

type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<DetectedCode[]>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

const supportedTypes = "image/jpeg,image/png,image/webp";

async function getApiError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || "This service is temporarily unavailable. Please try again shortly.";
  } catch {
    return "This service is temporarily unavailable. Please try again shortly.";
  }
}

function revokeUrl(url?: string) {
  if (url) URL.revokeObjectURL(url);
}

async function loadImage(file: File): Promise<LoadedImage> {
  const objectUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load that image file."));
    img.src = objectUrl;
  });
  return { image, url: objectUrl };
}

async function loadVideo(file: File): Promise<LoadedVideo> {
  const objectUrl = URL.createObjectURL(file);
  const video = await new Promise<HTMLVideoElement>((resolve, reject) => {
    const element = document.createElement("video");
    element.preload = "metadata";
    element.muted = true;
    element.playsInline = true;
    element.onloadedmetadata = () => resolve(element);
    element.onerror = () => reject(new Error("Could not load that video file."));
    element.src = objectUrl;
  });
  return { video, url: objectUrl };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not create an output image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function processImage({
  file,
  type,
  quality,
  draw,
  width,
  height,
}: {
  file: File;
  type: string;
  quality?: number;
  draw: (context: CanvasRenderingContext2D, image: HTMLImageElement) => void;
  width?: number;
  height?: number;
}) {
  const { image, url } = await loadImage(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width ?? image.width;
    canvas.height = height ?? image.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");
    draw(context, image);
    const blob = await canvasToBlob(canvas, type, quality);
    return {
      blob,
      width: canvas.width,
      height: canvas.height,
      url: URL.createObjectURL(blob),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadProcessedImage(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
}

function ImageComparison({
  originalUrl,
  processed,
}: {
  originalUrl: string;
  processed?: ProcessedImage | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Original preview
        </p>
        <img src={originalUrl} alt="Original uploaded preview" className="mt-3 max-h-80 w-full rounded-2xl object-contain" />
      </div>
      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Output preview
        </p>
        {processed ? (
          <img src={processed.url} alt="Processed output preview" className="mt-3 max-h-80 w-full rounded-2xl object-contain" />
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted)]">
            Run the tool to generate an output preview.
          </div>
        )}
      </div>
    </div>
  );
}

function ImageDownloadPanel({
  processed,
  filename,
}: {
  processed?: ProcessedImage | null;
  filename: string;
}) {
  if (!processed) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={buttonClass} onClick={() => downloadProcessedImage(processed.url, filename)}>
        Download output
      </button>
      <OutputBlock title="Output size" value={`${processed.width} x ${processed.height} • ${formatFileSize(processed.blob.size)}`} multiline={false} />
    </div>
  );
}

function useFilePreview(file: File | null) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return previewUrl;
}

function imageInputClass() {
  return "w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]";
}

function getOutputExtension(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "png";
}

async function applyCanvasFilterTool({
  file,
  outputType,
  filter,
  quality = 0.92,
}: {
  file: File;
  outputType?: string;
  filter: string;
  quality?: number;
}) {
  return processImage({
    file,
    type: outputType ?? file.type ?? "image/png",
    quality,
    draw: (context, image) => {
      context.filter = filter;
      context.drawImage(image, 0, 0);
      context.filter = "none";
    },
  });
}

async function fileToArrayBuffer(file: File) {
  return file.arrayBuffer();
}

function getBarcodeDetectorConstructor() {
  return (globalThis as typeof globalThis & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector ?? null;
}

function formatDetectedCodes(codes: DetectedCode[]) {
  return codes
    .map((code, index) => `${index + 1}. ${code.rawValue || "Unknown value"}${code.format ? ` (${code.format})` : ""}`)
    .join("\n");
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed.split("").map((part) => part + part).join("").toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }
  return "";
}

function hexToRgb(hex: string) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const value = normalized.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function getRelativeLuminance(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const channels = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function getContrastRatio(foreground: string, background: string) {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);
  if (foregroundLuminance === null || backgroundLuminance === null) return null;
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function formatDpiValue(value?: number | null) {
  return value ? `${Math.round(value)} DPI` : "Not embedded";
}

async function createGifFromFrames({
  frames,
  width,
  height,
  delay,
}: {
  frames: ImageData[];
  width: number;
  height: number;
  delay: number;
}) {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const gif = GIFEncoder();

  for (const frame of frames) {
    const palette = quantize(frame.data, 256);
    const index = applyPalette(frame.data, palette);
    gif.writeFrame(index, width, height, {
      palette,
      delay,
    });
  }

  gif.finish();
  const bytes = gif.bytesView();
  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

function getJpegDensity(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  if (view.getUint16(0) !== 0xffd8) {
    return null;
  }

  let offset = 2;
  while (offset + 9 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = view.getUint8(offset + 1);
    const segmentLength = view.getUint16(offset + 2);
    if (marker === 0xe0) {
      const identifier = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7),
      );
      if (identifier === "JFIF") {
        const units = view.getUint8(offset + 11);
        const xDensity = view.getUint16(offset + 12);
        const yDensity = view.getUint16(offset + 14);
        if (units === 1) {
          return { xDpi: xDensity, yDpi: yDensity };
        }
        if (units === 2) {
          return { xDpi: xDensity * 2.54, yDpi: yDensity * 2.54 };
        }
      }
    }
    offset += 2 + segmentLength;
  }

  return null;
}

function getPngDensity(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const signature = "89504e470d0a1a0a";
  const inputSignature = Array.from({ length: 8 }, (_, index) => view.getUint8(index).toString(16).padStart(2, "0")).join("");
  if (inputSignature !== signature) {
    return null;
  }

  let offset = 8;
  while (offset + 12 <= view.byteLength) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7),
    );

    if (type === "pHYs" && length >= 9) {
      const pixelsPerUnitX = view.getUint32(offset + 8);
      const pixelsPerUnitY = view.getUint32(offset + 12);
      const unitSpecifier = view.getUint8(offset + 16);
      if (unitSpecifier === 1) {
        return {
          xDpi: pixelsPerUnitX * 0.0254,
          yDpi: pixelsPerUnitY * 0.0254,
        };
      }
      return null;
    }

    offset += 12 + length;
  }

  return null;
}

async function readImageDetails(file: File) {
  const [{ image, url }, buffer] = await Promise.all([loadImage(file), fileToArrayBuffer(file)]);
  try {
    const density =
      file.type === "image/jpeg"
        ? getJpegDensity(buffer)
        : file.type === "image/png"
          ? getPngDensity(buffer)
          : null;

    return {
      width: image.width,
      height: image.height,
      xDpi: density?.xDpi ?? null,
      yDpi: density?.yDpi ?? null,
      type: file.type || "Unknown",
      size: file.size,
      lastModified: file.lastModified,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function readVideoDetails(file: File) {
  const { video, url } = await loadVideo(file);
  try {
    return {
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
      type: file.type || "Unknown",
      size: file.size,
      lastModified: file.lastModified,
      aspectRatio: video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 0,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function extractVideoFrame(file: File, timeInSeconds: number, type = "image/png") {
  const { video, url } = await loadVideo(file);
  try {
    const safeTime = Math.max(0, Math.min(timeInSeconds, Math.max(0, video.duration || 0)));
    await new Promise<void>((resolve) => {
      video.currentTime = safeTime;
      video.onseeked = () => resolve();
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available in this browser.");
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, type, 0.92);
    return {
      blob,
      width: canvas.width,
      height: canvas.height,
      url: URL.createObjectURL(blob),
      capturedAt: safeTime,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const exifTagMap = new Map<number, string>([
  [0x010f, "Camera make"],
  [0x0110, "Camera model"],
  [0x0112, "Orientation"],
  [0x011a, "X resolution"],
  [0x011b, "Y resolution"],
  [0x0128, "Resolution unit"],
  [0x0131, "Software"],
  [0x0132, "Modified date"],
  [0x829a, "Exposure time"],
  [0x829d, "F number"],
  [0x8769, "Exif IFD"],
  [0x8825, "GPS IFD"],
  [0x8827, "ISO"],
  [0x9003, "Date taken"],
  [0x920a, "Focal length"],
  [0xa002, "Pixel width"],
  [0xa003, "Pixel height"],
]);

const gpsTagMap = new Map<number, string>([
  [0x0001, "GPS latitude ref"],
  [0x0002, "GPS latitude"],
  [0x0003, "GPS longitude ref"],
  [0x0004, "GPS longitude"],
]);

function readAscii(view: DataView, offset: number, count: number) {
  const chars: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const code = view.getUint8(offset + index);
    if (code === 0) break;
    chars.push(String.fromCharCode(code));
  }
  return chars.join("").trim();
}

function readExifEntryValue(view: DataView, tiffOffset: number, entryOffset: number, littleEndian: boolean) {
  const type = view.getUint16(entryOffset + 2, littleEndian);
  const count = view.getUint32(entryOffset + 4, littleEndian);
  const typeSizeMap: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 };
  const typeSize = typeSizeMap[type] ?? 0;
  const valueByteLength = typeSize * count;
  const valueOffset = valueByteLength <= 4 ? entryOffset + 8 : tiffOffset + view.getUint32(entryOffset + 8, littleEndian);

  if (type === 2) {
    return readAscii(view, valueOffset, count);
  }
  if (type === 3) {
    return count === 1
      ? view.getUint16(valueOffset, littleEndian)
      : Array.from({ length: count }, (_, index) => view.getUint16(valueOffset + index * 2, littleEndian));
  }
  if (type === 4) {
    return count === 1
      ? view.getUint32(valueOffset, littleEndian)
      : Array.from({ length: count }, (_, index) => view.getUint32(valueOffset + index * 4, littleEndian));
  }
  if (type === 5) {
    const rationals = Array.from({ length: count }, (_, index) => {
      const base = valueOffset + index * 8;
      const numerator = view.getUint32(base, littleEndian);
      const denominator = view.getUint32(base + 4, littleEndian);
      return denominator ? numerator / denominator : 0;
    });
    return count === 1 ? rationals[0] : rationals;
  }
  return null;
}

function formatExifValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return String(value);
}

function convertGpsCoordinate(values: number[], ref?: string) {
  if (values.length < 3) return "";
  const decimal = values[0] + values[1] / 60 + values[2] / 3600;
  const signed = ref === "S" || ref === "W" ? -decimal : decimal;
  return signed.toFixed(6);
}

function extractJpegExif(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return {} as Record<string, string>;
  }

  let offset = 2;
  while (offset + 10 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const segmentLength = view.getUint16(offset + 2);
    if (marker === 0xe1 && readAscii(view, offset + 4, 6) === "Exif") {
      const tiffOffset = offset + 10;
      const byteOrder = readAscii(view, tiffOffset, 2);
      const littleEndian = byteOrder === "II";
      const firstIfdOffset = tiffOffset + view.getUint32(tiffOffset + 4, littleEndian);
      const output: Record<string, string> = {};

      const parseIfd = (ifdOffset: number, tagMap: Map<number, string>) => {
        const entryCount = view.getUint16(ifdOffset, littleEndian);
        for (let index = 0; index < entryCount; index += 1) {
          const entryOffset = ifdOffset + 2 + index * 12;
          const tag = view.getUint16(entryOffset, littleEndian);
          const name = tagMap.get(tag);
          const rawValue = readExifEntryValue(view, tiffOffset, entryOffset, littleEndian);
          if (name && rawValue !== null && rawValue !== "") {
            output[name] = formatExifValue(rawValue);
          }
          if (tag === 0x8769 && typeof rawValue === "number") {
            parseIfd(tiffOffset + rawValue, exifTagMap);
          }
          if (tag === 0x8825 && typeof rawValue === "number") {
            parseIfd(tiffOffset + rawValue, gpsTagMap);
          }
        }
      };

      parseIfd(firstIfdOffset, exifTagMap);
      const latitude = output["GPS latitude"] ? convertGpsCoordinate(
        output["GPS latitude"].split(", ").map(Number),
        output["GPS latitude ref"],
      ) : "";
      const longitude = output["GPS longitude"] ? convertGpsCoordinate(
        output["GPS longitude"].split(", ").map(Number),
        output["GPS longitude ref"],
      ) : "";
      if (latitude && longitude) {
        output["GPS coordinates"] = `${latitude}, ${longitude}`;
      }
      delete output["Exif IFD"];
      delete output["GPS IFD"];
      return output;
    }
    offset += 2 + segmentLength;
  }

  return {} as Record<string, string>;
}

async function readExifData(file: File) {
  const buffer = await file.arrayBuffer();
  if (file.type !== "image/jpeg") {
    return {
      supported: false,
      data: {} as Record<string, string>,
    };
  }

  return {
    supported: true,
    data: extractJpegExif(buffer),
  };
}

async function processPixelImage({
  file,
  pixelTransform,
  type,
}: {
  file: File;
  pixelTransform: (data: Uint8ClampedArray, width: number, height: number) => Uint8ClampedArray | void;
  type?: string;
}) {
  return processImage({
    file,
    type: type ?? file.type ?? "image/png",
    quality: 0.92,
    draw: (context, image) => {
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
      const transformed = pixelTransform(imageData.data, context.canvas.width, context.canvas.height);
      if (transformed) {
        imageData.data.set(transformed);
      }
      context.putImageData(imageData, 0, 0);
    },
  });
}

function createHistogramChart({
  red,
  green,
  blue,
}: {
  red: number[];
  green: number[];
  blue: number[];
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 320;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  const maxValue = Math.max(...red, ...green, ...blue, 1);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#d6d3d1";
  context.lineWidth = 1;
  context.strokeRect(32, 20, canvas.width - 52, canvas.height - 44);

  const drawSeries = (values: number[], color: string) => {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 2;
    values.forEach((value, index) => {
      const x = 32 + (index / 255) * (canvas.width - 52);
      const y = canvas.height - 24 - (value / maxValue) * (canvas.height - 52);
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();
  };

  drawSeries(red, "#dc2626");
  drawSeries(green, "#16a34a");
  drawSeries(blue, "#2563eb");
  return canvas;
}

export function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleCompress() {
    if (!file) {
      setError("Upload a JPG, PNG, or WebP image first.");
      return;
    }

    const outputType = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
    try {
      revokeUrl(processed?.url);
      const next = await processImage({
        file,
        type: outputType,
        quality,
        draw: (context, image) => {
          context.drawImage(image, 0, 0);
        },
      });
      setProcessed(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to compress this image.");
    }
  }

  return (
    <ToolShell title="Image Compressor" description="Compress JPG, PNG, or WebP files locally in the browser. PNG compression is naturally more limited than lossy JPG or WebP compression.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label={`Compression quality (${Math.round(quality * 100)}%)`}>
        <input className="w-full" type="range" min="0.2" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleCompress} disabled={!file}>
        Compress image
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload an image to compress" description="Choose a JPG, PNG, or WebP file to generate a smaller browser-side export." />
      ) : (
        <>
          <Notice>Original file size: {formatFileSize(file.size)}</Notice>
          <ImageComparison originalUrl={previewUrl} processed={processed} />
          <ImageDownloadPanel processed={processed} filename={`compressed-${file.name.replace(/\.[^.]+$/, "")}.${processed?.blob.type.split("/")[1] ?? "jpg"}`} />
        </>
      )}
    </ToolShell>
  );
}

export function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => {
    let active = true;
    if (!file) return;
    loadImage(file)
      .then(({ image, url }) => {
        if (active) {
          setWidth(image.width);
          setHeight(image.height);
        }
        URL.revokeObjectURL(url);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [file]);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleResize() {
    if (!file || width <= 0 || height <= 0) {
      setError("Upload an image and enter valid dimensions.");
      return;
    }

    try {
      revokeUrl(processed?.url);
      const next = await processImage({
        file,
        type: file.type || "image/png",
        quality: 0.92,
        width,
        height,
        draw: (context, image) => {
          context.drawImage(image, 0, 0, width, height);
        },
      });
      setProcessed(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resize this image.");
    }
  }

  return (
    <ToolShell title="Image Resizer" description="Resize JPG, PNG, and WebP files locally with optional aspect-ratio locking.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Width (px)">
          <input
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            type="number"
            min="1"
            value={width || ""}
            onChange={(event) => {
              const nextWidth = Number(event.target.value);
              setWidth(nextWidth);
              if (lockRatio && file && width > 0 && height > 0) {
                setHeight(Math.max(1, Math.round((nextWidth / width) * height)));
              }
            }}
          />
        </Field>
        <Field label="Height (px)">
          <input
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            type="number"
            min="1"
            value={height || ""}
            onChange={(event) => {
              const nextHeight = Number(event.target.value);
              setHeight(nextHeight);
              if (lockRatio && file && width > 0 && height > 0) {
                setWidth(Math.max(1, Math.round((nextHeight / height) * width)));
              }
            }}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-[color:var(--foreground)]">
        <input type="checkbox" checked={lockRatio} onChange={(event) => setLockRatio(event.target.checked)} />
        Lock aspect ratio while editing dimensions
      </label>
      <button type="button" className={buttonClass} onClick={handleResize} disabled={!file}>
        Resize image
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to resize" description="The original dimensions will appear automatically, and you can export a resized version locally." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`resized-${file.name}`} />
      </>}
    </ToolShell>
  );
}

export function CropImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => {
    let active = true;
    if (!file) return;
    loadImage(file)
      .then(({ image, url }) => {
        if (active) {
          setCropX(0);
          setCropY(0);
          setCropWidth(image.width);
          setCropHeight(image.height);
        }
        URL.revokeObjectURL(url);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [file]);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleCrop() {
    if (!file || cropWidth <= 0 || cropHeight <= 0) {
      setError("Upload an image and set a valid crop area.");
      return;
    }

    try {
      revokeUrl(processed?.url);
      const next = await processImage({
        file,
        type: file.type || "image/png",
        width: cropWidth,
        height: cropHeight,
        draw: (context, image) => {
          context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        },
      });
      setProcessed(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to crop this image.");
    }
  }

  return (
    <ToolShell title="Crop Image" description="Crop JPG, PNG, or WebP files locally using numeric crop controls for a reliable browser-only workflow.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="X position"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="0" value={cropX} onChange={(event) => setCropX(Number(event.target.value))} /></Field>
        <Field label="Y position"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="0" value={cropY} onChange={(event) => setCropY(Number(event.target.value))} /></Field>
        <Field label="Crop width"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="1" value={cropWidth} onChange={(event) => setCropWidth(Number(event.target.value))} /></Field>
        <Field label="Crop height"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="1" value={cropHeight} onChange={(event) => setCropHeight(Number(event.target.value))} /></Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleCrop} disabled={!file}>
        Crop image
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to crop" description="The original image dimensions will populate the crop fields so you can adjust them before exporting." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`cropped-${file.name}`} />
      </>}
    </ToolShell>
  );
}

function FormatConverterTool({
  title,
  description,
  accept,
  outputType,
  outputExtension,
  backgroundForJpg = false,
  quality = 0.92,
}: {
  title: string;
  description: string;
  accept: string;
  outputType: string;
  outputExtension: string;
  backgroundForJpg?: boolean;
  quality?: number;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleConvert() {
    if (!file) {
      setError("Upload a supported image first.");
      return;
    }
    try {
      revokeUrl(processed?.url);
      const next = await processImage({
        file,
        type: outputType,
        quality,
        draw: (context, image) => {
          if (backgroundForJpg) {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, image.width, image.height);
          }
          context.drawImage(image, 0, 0);
        },
      });
      setProcessed(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to convert this image.");
    }
  }

  return (
    <ToolShell title={title} description={description}>
      <Field label="Supported file types" hint={accept.replaceAll("image/", "").toUpperCase().replaceAll(",", ", ")}>
        <input type="file" accept={accept} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleConvert} disabled={!file}>
        Convert image
      </button>
      {backgroundForJpg ? <Notice>Transparent PNG areas will be flattened onto a white background when exported as JPG.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to convert" description="After conversion, you can preview the result and download the new file directly from the browser." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`${file.name.replace(/\.[^.]+$/, "")}.${outputExtension}`} />
      </>}
    </ToolShell>
  );
}

export function JpgToPngConverterTool() {
  return (
    <FormatConverterTool
      title="JPG to PNG Converter"
      description="Convert JPG images to PNG locally with browser-side rendering and export."
      accept="image/jpeg"
      outputType="image/png"
      outputExtension="png"
    />
  );
}

export function PngToJpgConverterTool() {
  return (
    <FormatConverterTool
      title="PNG to JPG Converter"
      description="Convert PNG images to JPG locally. Transparent pixels are flattened to white because JPG does not support transparency."
      accept="image/png"
      outputType="image/jpeg"
      outputExtension="jpg"
      backgroundForJpg
      quality={0.9}
    />
  );
}

export function ImageToWebpConverterTool() {
  return (
    <FormatConverterTool
      title="Image to WebP Converter"
      description="Convert JPG, PNG, or WebP-compatible images to WebP with browser-side processing."
      accept={supportedTypes}
      outputType="image/webp"
      outputExtension="webp"
      quality={0.9}
    />
  );
}

export function ImageRotatorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleRotate() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    try {
      const { image, url } = await loadImage(file);
      const rotated = angle % 180 === 0
        ? { width: image.width, height: image.height }
        : { width: image.height, height: image.width };
      const canvas = document.createElement("canvas");
      canvas.width = rotated.width;
      canvas.height = rotated.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not available in this browser.");
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((angle * Math.PI) / 180);
      context.drawImage(image, -image.width / 2, -image.height / 2);
      const blob = await canvasToBlob(canvas, file.type || "image/png", 0.92);
      URL.revokeObjectURL(url);
      revokeUrl(processed?.url);
      setProcessed({
        blob,
        url: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to rotate this image.");
    }
  }

  return (
    <ToolShell title="Image Rotator" description="Rotate supported image files by 90, 180, or 270 degrees directly in the browser.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Rotation angle">
        <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={angle} onChange={(event) => setAngle(Number(event.target.value))}>
          <option value={90}>90 degrees</option>
          <option value={180}>180 degrees</option>
          <option value={270}>270 degrees</option>
        </select>
      </Field>
      <button type="button" className={buttonClass} onClick={handleRotate} disabled={!file}>
        Rotate image
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to rotate" description="Choose a supported file and apply a standard rotation angle." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`rotated-${file.name}`} />
      </>}
    </ToolShell>
  );
}

export function ImageWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("");
  const [position, setPosition] = useState("bottom-right");
  const [fontSize, setFontSize] = useState(32);
  const [opacity, setOpacity] = useState(0.45);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleWatermark() {
    if (!file || !watermarkText.trim()) {
      setError("Upload an image and enter watermark text.");
      return;
    }
    try {
      revokeUrl(processed?.url);
      const next = await processImage({
        file,
        type: file.type || "image/png",
        quality: 0.92,
        draw: (context, image) => {
          context.drawImage(image, 0, 0);
          context.globalAlpha = opacity;
          context.fillStyle = "#ffffff";
          context.strokeStyle = "#111827";
          context.lineWidth = Math.max(2, Math.round(fontSize / 12));
          context.font = `${fontSize}px Arial`;
          const metrics = context.measureText(watermarkText);
          const padding = 24;
          const xMap: Record<string, number> = {
            "top-left": padding,
            "top-right": image.width - metrics.width - padding,
            "center": (image.width - metrics.width) / 2,
            "bottom-left": padding,
            "bottom-right": image.width - metrics.width - padding,
          };
          const yMap: Record<string, number> = {
            "top-left": padding + fontSize,
            "top-right": padding + fontSize,
            "center": image.height / 2,
            "bottom-left": image.height - padding,
            "bottom-right": image.height - padding,
          };
          const x = xMap[position] ?? padding;
          const y = yMap[position] ?? image.height - padding;
          context.strokeText(watermarkText, x, y);
          context.fillText(watermarkText, x, y);
          context.globalAlpha = 1;
        },
      });
      setProcessed(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to watermark this image.");
    }
  }

  return (
    <ToolShell title="Image Watermark Tool" description="Add a simple text watermark to JPG, PNG, or WebP images locally in the browser.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Watermark text">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={watermarkText} onChange={(event) => setWatermarkText(event.target.value)} placeholder="Sample watermark" />
        </Field>
        <Field label="Position">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={position} onChange={(event) => setPosition(event.target.value)}>
            <option value="top-left">Top left</option>
            <option value="top-right">Top right</option>
            <option value="center">Center</option>
            <option value="bottom-left">Bottom left</option>
            <option value="bottom-right">Bottom right</option>
          </select>
        </Field>
        <Field label={`Font size (${fontSize}px)`}>
          <input className="w-full" type="range" min="16" max="96" step="2" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} />
        </Field>
        <Field label={`Opacity (${Math.round(opacity * 100)}%)`}>
          <input className="w-full" type="range" min="0.15" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleWatermark} disabled={!file}>
        Apply watermark
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to watermark" description="Add text, choose a position, and export a new watermarked copy locally." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`watermarked-${file.name}`} />
      </>}
    </ToolShell>
  );
}

export function ImageToBase64ConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const previewUrl = useFilePreview(file);

  async function handleConvert() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }
    try {
      const reader = new FileReader();
      const result = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that image file."));
        reader.readAsDataURL(file);
      });
      setBase64(result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to convert this image.");
      setBase64("");
    }
  }

  return (
    <ToolShell title="Image to Base64 Converter" description="Convert JPG, PNG, or WebP files into Base64 data URLs locally and copy the result.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleConvert} disabled={!file}>
          Convert to Base64
        </button>
        <button type="button" className={secondaryButtonClass} onClick={() => copy("Base64 output", base64)} disabled={!base64}>
          Copy output
        </button>
      </div>
      {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload an image to convert" description="The tool will read the file locally and output a Base64 data URL." />
      ) : (
        <>
          {previewUrl ? (
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Image preview</p>
              <img src={previewUrl} alt="Uploaded image preview" className="mt-3 max-h-80 w-full rounded-2xl object-contain" />
            </div>
          ) : null}
          {base64 ? <OutputBlock title="Base64 data URL" value={base64} /> : <Notice>Generate the Base64 output after selecting a file.</Notice>}
        </>
      )}
    </ToolShell>
  );
}

export function BackgroundRemoverTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleRemove() {
    if (!file) {
      setError("Upload an image file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      revokeUrl(processed?.url);

      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/tools/background-remover", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const blob = await response.blob();
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("The server returned an unreadable processed image."));
        };
        element.src = url;
      });

      const outputUrl = image.src;
      setProcessed({
        blob,
        url: outputUrl,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    } catch (removeError) {
      setProcessed(null);
      setError(removeError instanceof Error ? removeError.message : "Unable to remove the background from that image.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
      <ToolShell title="Remove Background From Image" description="Upload an image, process it through the backend background-removal service, and preview or download the resulting transparent PNG.">
        <Field label="Image file" hint="Upload JPG, PNG, or WebP to remove its background through the server route.">
          <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </Field>
        <button type="button" className={buttonClass} onClick={handleRemove} disabled={!file || loading}>
          {loading ? "Removing background..." : "Remove background"}
        </button>
        <Notice>Server-assisted processing. If background removal is not enabled on this deployment, the page will show a clear unavailable message instead of faking a result.</Notice>
        {error ? <Notice tone="error">{error}</Notice> : null}
        {!file ? (
          <EmptyState
            title="Upload an image to remove its background"
            description="The processed result will be returned as a transparent PNG when the backend service is available."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Uploaded preview
            </p>
            {previewUrl ? <img src={previewUrl} alt="Uploaded image preview for background removal" className="mt-3 max-h-80 w-full rounded-2xl object-contain" /> : null}
          </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Processed result
              </p>
              {processed ? (
                <div className="mt-3 space-y-4">
                  <img src={processed.url} alt="Background-removed image preview" className="max-h-80 w-full rounded-2xl object-contain" />
                  <button type="button" className={secondaryButtonClass} onClick={() => downloadProcessedImage(processed.url, `${file.name.replace(/\.[^.]+$/, "")}-no-background.png`)}>
                    Download PNG
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-3 text-sm leading-7 text-[color:var(--muted)]">
                  <p>File selected: <span className="font-medium text-[color:var(--foreground)]">{file.name}</span> ({formatFileSize(file.size)})</p>
                  <p>Run the server-assisted background-removal step to generate a transparent PNG preview.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </ToolShell>
  );
}

export function GifToMp4ConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const previewUrl = useFilePreview(file);

  return (
    <ToolShell
      title="GIF to MP4 Converter"
      description="Preview an uploaded GIF and review the current limits of lightweight browser-side GIF-to-video conversion."
    >
      <Field
        label="Animated GIF"
        hint="Upload a GIF file to preview the kind of input this future conversion workflow will accept."
      >
        <input
          type="file"
          accept="image/gif"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </Field>
      <Notice>
        Coming soon. Reliable GIF-to-MP4 conversion in the browser can become heavy across devices and
        codecs, so this page does not fake a video export with misleading output.
      </Notice>
      {!file ? (
        <EmptyState
          title="Upload a GIF to preview the future workflow"
          description="You can inspect the selected input here today, but the route intentionally stops short of pretending it can deliver a robust MP4 conversion with the current lightweight stack."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Uploaded GIF preview
            </p>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded GIF preview for future GIF to MP4 conversion"
                className="mt-3 max-h-80 w-full rounded-2xl object-contain"
              />
            ) : null}
          </div>
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Current functionality
            </p>
            <div className="mt-3 space-y-3 text-sm leading-7 text-[color:var(--muted)]">
              <p>
                This page currently previews the uploaded GIF and explains why a dependable MP4 export
                is not shipped yet.
              </p>
              <p>
                A later version may add a real conversion workflow once codec support and performance
                tradeoffs can be handled honestly across common browsers.
              </p>
              <p>
                File selected: <span className="font-medium text-[color:var(--foreground)]">{file.name}</span>
                {" "}({formatFileSize(file.size)})
              </p>
            </div>
          </div>
        </div>
      )}
    </ToolShell>
  );
}

export function ImageFormatConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [outputType, setOutputType] = useState("image/png");
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  const outputExtension = useMemo(() => getOutputExtension(outputType), [outputType]);

  async function handleConvert() {
    if (!file) {
      setError("Upload a JPG, PNG, or WebP image first.");
      return;
    }

    try {
      revokeUrl(processed?.url);
      const next = await processImage({
        file,
        type: outputType,
        quality: outputType === "image/png" ? undefined : 0.92,
        draw: (context, image) => {
          if (outputType === "image/jpeg") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, image.width, image.height);
          }
          context.drawImage(image, 0, 0);
        },
      });
      setProcessed(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to convert this image.");
    }
  }

  return (
    <ToolShell title="Image Format Converter" description="Convert JPG, PNG, and WebP files between common browser-friendly formats using local canvas processing.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Output format">
        <select className={imageInputClass()} value={outputType} onChange={(event) => setOutputType(event.target.value)}>
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPG</option>
          <option value="image/webp">WebP</option>
        </select>
      </Field>
      <button type="button" className={buttonClass} onClick={handleConvert} disabled={!file}>
        Convert format
      </button>
      {outputType === "image/jpeg" ? <Notice>Transparent areas are flattened onto white when exporting as JPG.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload an image to convert" description="Choose a common image format, select the target format, and download the converted result." />
      ) : (
        <>
          <ImageComparison originalUrl={previewUrl} processed={processed} />
          <ImageDownloadPanel processed={processed} filename={`${file.name.replace(/\.[^.]+$/, "")}.${outputExtension}`} />
        </>
      )}
    </ToolShell>
  );
}

export function ImageColorPickerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [pickedHex, setPickedHex] = useState("");
  const [pickedRgb, setPickedRgb] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    let cancelled = false;

    if (!file) {
      setPickedHex("");
      setPickedRgb("");
      setCoordinates("");
      setError("");
      return;
    }

    loadImage(file)
      .then(({ image, url }) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) {
          setError("Canvas is not available in this browser.");
          URL.revokeObjectURL(url);
          return;
        }
        canvas.width = image.width;
        canvas.height = image.height;
        context.clearRect(0, 0, image.width, image.height);
        context.drawImage(image, 0, 0);
        setError("");
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to preview that image.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  function handlePickColor(event: MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      setError("Canvas is not available in this browser.");
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((event.clientX - bounds.left) * scaleX)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((event.clientY - bounds.top) * scaleY)));
    const [red, green, blue] = context.getImageData(x, y, 1, 1).data;
    const hex = `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0").toUpperCase()).join("")}`;
    setPickedHex(hex);
    setPickedRgb(`rgb(${red}, ${green}, ${blue})`);
    setCoordinates(`${x}, ${y}`);
  }

  return (
    <ToolShell title="Image Color Picker" description="Pick HEX and RGB colors from uploaded JPG, PNG, or WebP images directly in the browser.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload an image to sample colors" description="After the image loads, click anywhere on it to inspect that pixel's HEX and RGB values." />
      ) : (
        <>
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Click the image to pick a color</p>
            <canvas
              ref={canvasRef}
              onClick={handlePickColor}
              className="mt-3 max-h-[28rem] w-full cursor-crosshair rounded-2xl border border-[color:var(--border)] object-contain"
              aria-label="Uploaded image canvas for color picking"
            />
          </div>
          {pickedHex ? (
            <>
              <div className="rounded-2xl border border-[color:var(--border)] bg-stone-50 p-4">
                <div className="h-16 rounded-xl border border-[color:var(--border)]" style={{ backgroundColor: pickedHex }} aria-hidden="true" />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <OutputBlock title="HEX value" value={pickedHex} multiline={false} />
                <OutputBlock title="RGB value" value={pickedRgb} multiline={false} />
                <OutputBlock title="Pixel coordinates" value={coordinates} multiline={false} />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className={buttonClass} onClick={() => copy("HEX value", pickedHex)}>
                  Copy HEX
                </button>
                <button type="button" className={secondaryButtonClass} onClick={() => copy("RGB value", pickedRgb)}>
                  Copy RGB
                </button>
              </div>
              {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
            </>
          ) : (
            <Notice>Click the preview to read a color value.</Notice>
          )}
        </>
      )}
    </ToolShell>
  );
}

function FilterImageTool({
  title,
  description,
  filterLabel,
  min,
  max,
  step,
  value,
  onChange,
  filter,
  filenamePrefix,
}: {
  title: string;
  description: string;
  filterLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  filter: (value: number) => string;
  filenamePrefix: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleApply() {
    if (!file) {
      setError("Upload a JPG, PNG, or WebP image first.");
      return;
    }

    try {
      revokeUrl(processed?.url);
      const next = await applyCanvasFilterTool({
        file,
        filter: filter(value),
        outputType: file.type || "image/png",
      });
      setProcessed(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process this image.");
    }
  }

  return (
    <ToolShell title={title} description={description}>
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label={filterLabel}>
        <input className="w-full" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleApply} disabled={!file}>
        Apply effect
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload an image to edit" description="Choose a supported image, adjust the setting, and export a processed copy locally." />
      ) : (
        <>
          <ImageComparison originalUrl={previewUrl} processed={processed} />
          <ImageDownloadPanel processed={processed} filename={`${filenamePrefix}-${file.name.replace(/\.[^.]+$/, "")}.${processed ? getOutputExtension(processed.blob.type) : getOutputExtension(file.type || "image/png")}`} />
        </>
      )}
    </ToolShell>
  );
}

export function BlurImageTool() {
  const [blur, setBlur] = useState(4);

  return (
    <FilterImageTool
      title="Blur Image Tool"
      description="Apply a blur effect to JPG, PNG, or WebP images locally with canvas filtering."
      filterLabel={`Blur radius (${blur}px)`}
      min={0}
      max={20}
      step={1}
      value={blur}
      onChange={setBlur}
      filter={(value) => `blur(${value}px)`}
      filenamePrefix="blurred"
    />
  );
}

export function ImageBrightnessAdjusterTool() {
  const [brightness, setBrightness] = useState(100);

  return (
    <FilterImageTool
      title="Image Brightness Adjuster"
      description="Adjust image brightness locally in the browser with a canvas-based export workflow."
      filterLabel={`Brightness (${brightness}%)`}
      min={20}
      max={200}
      step={1}
      value={brightness}
      onChange={setBrightness}
      filter={(value) => `brightness(${value}%)`}
      filenamePrefix="brightness-adjusted"
    />
  );
}

export function ImageContrastAdjusterTool() {
  const [contrast, setContrast] = useState(100);

  return (
    <FilterImageTool
      title="Image Contrast Adjuster"
      description="Adjust image contrast locally with browser-side canvas processing and download-ready output."
      filterLabel={`Contrast (${contrast}%)`}
      min={20}
      max={200}
      step={1}
      value={contrast}
      onChange={setContrast}
      filter={(value) => `contrast(${value}%)`}
      filenamePrefix="contrast-adjusted"
    />
  );
}

export function ImageGrayscaleConverterTool() {
  const [strength, setStrength] = useState(100);

  return (
    <FilterImageTool
      title="Image Grayscale Converter"
      description="Convert images to grayscale locally in the browser with canvas-based processing."
      filterLabel={`Grayscale strength (${strength}%)`}
      min={0}
      max={100}
      step={1}
      value={strength}
      onChange={setStrength}
      filter={(value) => `grayscale(${value}%)`}
      filenamePrefix="grayscale"
    />
  );
}

export function ImageCropperProTool() {
  const [file, setFile] = useState<File | null>(null);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [preset, setPreset] = useState("free");
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => {
    let active = true;
    if (!file) return;
    loadImage(file).then(({ image, url }) => {
      if (!active) {
        URL.revokeObjectURL(url);
        return;
      }
      setCropX(0);
      setCropY(0);
      setCropWidth(image.width);
      setCropHeight(image.height);
      URL.revokeObjectURL(url);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [file]);

  useEffect(() => {
    if (!file || preset === "free") return;
    const ratioMap: Record<string, number> = {
      square: 1,
      landscape: 16 / 9,
      portrait: 4 / 5,
    };
    const ratio = ratioMap[preset];
    if (!ratio || cropWidth <= 0) return;
    setCropHeight(Math.max(1, Math.round(cropWidth / ratio)));
  }, [cropWidth, file, preset]);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleCrop() {
    if (!file || cropWidth <= 0 || cropHeight <= 0) {
      setError("Upload an image and set a valid crop size.");
      return;
    }

    try {
      revokeUrl(processed?.url);
      const next = await processImage({
        file,
        type: file.type || "image/png",
        width: cropWidth,
        height: cropHeight,
        draw: (context, image) => {
          context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        },
      });
      setProcessed(next);
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to crop this image.");
    }
  }

  return (
    <ToolShell title="Image Cropper Pro" description="Crop images locally with aspect presets and precise numeric crop controls for a more advanced browser-side workflow.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Crop preset">
        <select className={imageInputClass()} value={preset} onChange={(event) => setPreset(event.target.value)}>
          <option value="free">Free crop</option>
          <option value="square">1:1 square</option>
          <option value="landscape">16:9 landscape</option>
          <option value="portrait">4:5 portrait</option>
        </select>
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="X position"><input className={imageInputClass()} type="number" min="0" value={cropX} onChange={(event) => setCropX(Number(event.target.value))} /></Field>
        <Field label="Y position"><input className={imageInputClass()} type="number" min="0" value={cropY} onChange={(event) => setCropY(Number(event.target.value))} /></Field>
        <Field label="Crop width"><input className={imageInputClass()} type="number" min="1" value={cropWidth} onChange={(event) => setCropWidth(Number(event.target.value))} /></Field>
        <Field label="Crop height"><input className={imageInputClass()} type="number" min="1" value={cropHeight} onChange={(event) => setCropHeight(Number(event.target.value))} /></Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleCrop} disabled={!file}>Crop image</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to start cropping" description="Choose a supported image, apply a crop preset if you want one, and export the result locally." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`cropper-pro-${file.name}`} />
      </>}
    </ToolShell>
  );
}

export function GifMakerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [frameDelay, setFrameDelay] = useState(500);
  const [gifUrl, setGifUrl] = useState("");
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [previewWidth, setPreviewWidth] = useState(0);
  const [previewHeight, setPreviewHeight] = useState(0);
  const [error, setError] = useState("");

  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previewUrls.forEach((url) => URL.revokeObjectURL(url)), [previewUrls]);
  useEffect(() => () => revokeUrl(gifUrl), [gifUrl]);

  async function handleGenerate() {
    if (files.length < 2) {
      setError("Upload at least two images to create a GIF.");
      return;
    }

    try {
      const loaded = await Promise.all(files.map((file) => loadImage(file)));
      const width = loaded[0].image.width;
      const height = loaded[0].image.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas is not available in this browser.");
      }

      const frames = loaded.map(({ image, url }) => {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        const frame = context.getImageData(0, 0, width, height);
        URL.revokeObjectURL(url);
        return frame;
      });

      const blob = await createGifFromFrames({ frames, width, height, delay: frameDelay });
      revokeUrl(gifUrl);
      setGifBlob(blob);
      setGifUrl(URL.createObjectURL(blob));
      setPreviewWidth(width);
      setPreviewHeight(height);
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to generate that GIF.");
    }
  }

  return (
    <ToolShell title="GIF Maker" description="Create a real animated GIF from multiple uploaded images using browser-side processing and a lightweight encoder.">
      <Field label="Image frames" hint="Upload 2 or more JPG, PNG, or WebP images in the order you want them animated.">
        <input type="file" accept={supportedTypes} multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
      </Field>
      <Field label={`Frame delay (${frameDelay} ms)`}>
        <input className="w-full" type="range" min="100" max="1500" step="50" value={frameDelay} onChange={(event) => setFrameDelay(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate} disabled={files.length < 2}>Generate GIF</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!files.length ? (
        <EmptyState title="Upload image frames to create a GIF" description="Choose at least two images, set the frame delay, and export a real animated GIF locally." />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {previewUrls.map((url, index) => (
              <img key={`${url}-${index + 1}`} src={url} alt={`Frame ${index + 1} preview`} className="h-40 w-full rounded-2xl border border-[color:var(--border)] object-contain bg-stone-50 p-2" />
            ))}
          </div>
          {gifUrl && gifBlob ? (
            <>
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Generated GIF preview</p>
                <img src={gifUrl} alt="Generated GIF preview" className="mt-3 max-h-80 w-full rounded-2xl object-contain" />
              </div>
              <ImageDownloadPanel processed={{ url: gifUrl, blob: gifBlob, width: previewWidth, height: previewHeight }} filename="generated-animation.gif" />
            </>
          ) : null}
        </>
      )}
    </ToolShell>
  );
}

export function VideoToGifConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(3);
  const [frameCount, setFrameCount] = useState(8);
  const [frameDelay, setFrameDelay] = useState(150);
  const [gifUrl, setGifUrl] = useState("");
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(gifUrl), [gifUrl]);

  async function handleGenerate() {
    if (!file) {
      setError("Upload a video file first.");
      return;
    }

    try {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Could not read that video file."));
      });

      const safeDuration = Math.max(0.5, Math.min(duration, 8, video.duration - startTime));
      const safeFrames = Math.max(2, Math.min(frameCount, 12));
      const width = Math.min(480, video.videoWidth);
      const height = Math.round((width / video.videoWidth) * video.videoHeight);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas is not available in this browser.");
      }

      const frames: ImageData[] = [];
      for (let index = 0; index < safeFrames; index += 1) {
        const time = Math.min(video.duration, startTime + (safeDuration * index) / Math.max(1, safeFrames - 1));
        await new Promise<void>((resolve) => {
          video.currentTime = time;
          video.onseeked = () => resolve();
        });
        context.clearRect(0, 0, width, height);
        context.drawImage(video, 0, 0, width, height);
        frames.push(context.getImageData(0, 0, width, height));
      }

      const blob = await createGifFromFrames({ frames, width, height, delay: frameDelay });
      revokeUrl(gifUrl);
      URL.revokeObjectURL(video.src);
      setGifBlob(blob);
      setGifUrl(URL.createObjectURL(blob));
      setSize({ width, height });
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to convert that video into a GIF.");
    }
  }

  return (
    <ToolShell title="Video to GIF Converter" description="Convert a short uploaded video clip into a real GIF locally with browser-side frame capture and lightweight encoding.">
      <Field label="Supported file types" hint="Use short MP4 or WebM clips for the best browser-side results.">
        <input type="file" accept="video/mp4,video/webm" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Start time (s)"><input className={imageInputClass()} type="number" min="0" step="0.1" value={startTime} onChange={(event) => setStartTime(Number(event.target.value))} /></Field>
        <Field label="Clip length (s)"><input className={imageInputClass()} type="number" min="0.5" max="8" step="0.5" value={duration} onChange={(event) => setDuration(Number(event.target.value))} /></Field>
        <Field label="Frames"><input className={imageInputClass()} type="number" min="2" max="12" value={frameCount} onChange={(event) => setFrameCount(Number(event.target.value))} /></Field>
        <Field label="Frame delay (ms)"><input className={imageInputClass()} type="number" min="80" max="500" step="10" value={frameDelay} onChange={(event) => setFrameDelay(Number(event.target.value))} /></Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate} disabled={!file}>Convert to GIF</button>
      <Notice>For a fast browser-side experience, this tool is tuned for short clips and a modest frame count.</Notice>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a short video clip" description="Choose a short MP4 or WebM file, set the capture range, and export a real GIF locally." /> : <>
        {previewUrl ? (
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Video preview</p>
            <video src={previewUrl} controls className="mt-3 max-h-80 w-full rounded-2xl" onLoadedMetadata={(event) => setVideoDuration(event.currentTarget.duration)} />
            {videoDuration ? <p className="mt-3 text-sm text-[color:var(--muted)]">Video duration: {videoDuration.toFixed(2)} seconds</p> : null}
          </div>
        ) : null}
        {gifUrl && gifBlob ? (
          <>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Generated GIF preview</p>
              <img src={gifUrl} alt="Generated GIF preview from uploaded video" className="mt-3 max-h-80 w-full rounded-2xl object-contain" />
            </div>
            <ImageDownloadPanel processed={{ url: gifUrl, blob: gifBlob, width: size.width, height: size.height }} filename="video-to-gif.gif" />
          </>
        ) : null}
      </>}
    </ToolShell>
  );
}

export function ImageColorPaletteGeneratorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const previewUrl = useFilePreview(file);

  async function handleGenerate() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    try {
      const { image, url } = await loadImage(file);
      const canvas = document.createElement("canvas");
      const width = Math.max(1, Math.min(160, image.width));
      const height = Math.max(1, Math.round((width / image.width) * image.height));
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas is not available in this browser.");
      }
      context.drawImage(image, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);
      const { quantize } = await import("gifenc");
      const palette = quantize(imageData.data, 6).map((entry: number[]) => `#${entry.map((channel) => channel.toString(16).padStart(2, "0").toUpperCase()).join("")}`);
      setColors(Array.from(new Set(palette)).slice(0, 6));
      URL.revokeObjectURL(url);
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to generate a color palette for that image.");
      setColors([]);
    }
  }

  const output = useMemo(() => colors.join("\n"), [colors]);

  return (
    <ToolShell title="Image Color Palette Generator" description="Extract a compact dominant color palette from an uploaded image using local browser-side sampling.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate} disabled={!file}>Generate palette</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to extract colors" description="Generate a small palette of dominant colors directly from the uploaded image." /> : <>
        {previewUrl ? <div className="rounded-2xl bg-stone-50 p-4"><img src={previewUrl} alt="Uploaded image preview" className="max-h-80 w-full rounded-2xl object-contain" /></div> : null}
        {colors.length ? <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {colors.map((color) => (
              <div key={color} className="rounded-2xl border border-[color:var(--border)] bg-white p-3">
                <div className="h-20 rounded-xl border border-[color:var(--border)]" style={{ backgroundColor: color }} />
                <p className="mt-3 text-sm font-semibold">{color}</p>
              </div>
            ))}
          </div>
          <OutputBlock title="Palette values" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("palette values", output)}>Copy palette</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </> : null}
      </>}
    </ToolShell>
  );
}

export function ImageMetadataViewerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof readImageDetails>> | null>(null);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const previewUrl = useFilePreview(file);

  async function handleInspect() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    try {
      const next = await readImageDetails(file);
      setDetails(next);
      setError("");
    } catch (inspectionError) {
      setError(inspectionError instanceof Error ? inspectionError.message : "Unable to inspect that image.");
      setDetails(null);
    }
  }

  const output = useMemo(() => {
    if (!details) return "";
    return `Type: ${details.type}\nDimensions: ${details.width} x ${details.height}\nFile size: ${formatFileSize(details.size)}\nLast modified: ${new Date(details.lastModified).toLocaleString()}\nX DPI: ${formatDpiValue(details.xDpi)}\nY DPI: ${formatDpiValue(details.yDpi)}`;
  }, [details]);

  return (
    <ToolShell title="Image Metadata Viewer" description="Inspect basic image file details locally, including dimensions, file size, timestamps, and any embedded DPI information that is available.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleInspect} disabled={!file}>Read metadata</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to inspect it" description="The tool reads available file details locally without uploading the image anywhere." /> : <>
        {previewUrl ? <div className="rounded-2xl bg-stone-50 p-4"><img src={previewUrl} alt="Uploaded image preview" className="max-h-80 w-full rounded-2xl object-contain" /></div> : null}
        {details ? <>
          <OutputBlock title="Image details" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("image metadata", output)}>Copy details</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </> : null}
      </>}
    </ToolShell>
  );
}

export function ImageDpiCheckerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof readImageDetails>> | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  async function handleCheck() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    try {
      const next = await readImageDetails(file);
      setDetails(next);
      setError("");
    } catch (inspectionError) {
      setError(inspectionError instanceof Error ? inspectionError.message : "Unable to read the DPI for that image.");
      setDetails(null);
    }
  }

  return (
    <ToolShell title="Image DPI Checker" description="Check embedded DPI data for supported images and review the image dimensions locally in the browser.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleCheck} disabled={!file}>Check DPI</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to inspect its DPI" description="The checker reads embedded density metadata when the file format exposes it." /> : <>
        {previewUrl ? <div className="rounded-2xl bg-stone-50 p-4"><img src={previewUrl} alt="Uploaded image preview" className="max-h-80 w-full rounded-2xl object-contain" /></div> : null}
        {details ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <OutputBlock title="Width" value={`${details.width}px`} multiline={false} />
              <OutputBlock title="Height" value={`${details.height}px`} multiline={false} />
              <OutputBlock title="X DPI" value={formatDpiValue(details.xDpi)} multiline={false} />
              <OutputBlock title="Y DPI" value={formatDpiValue(details.yDpi)} multiline={false} />
            </div>
            {!details.xDpi && !details.yDpi ? <Notice>This image does not expose embedded DPI information in a format this browser-side checker can read.</Notice> : null}
          </>
        ) : null}
      </>}
    </ToolShell>
  );
}

export function ImageBorderGeneratorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [borderSize, setBorderSize] = useState(24);
  const [borderColor, setBorderColor] = useState("#111827");
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleGenerate() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    try {
      const { image, url } = await loadImage(file);
      const padding = Math.max(1, borderSize);
      const canvas = document.createElement("canvas");
      canvas.width = image.width + padding * 2;
      canvas.height = image.height + padding * 2;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not available in this browser.");
      context.fillStyle = borderColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, padding, padding);
      const blob = await canvasToBlob(canvas, file.type || "image/png", 0.92);
      URL.revokeObjectURL(url);
      revokeUrl(processed?.url);
      setProcessed({
        blob,
        width: canvas.width,
        height: canvas.height,
        url: URL.createObjectURL(blob),
      });
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to add a border to that image.");
    }
  }

  return (
    <ToolShell title="Image Border Generator" description="Add a colored border around an uploaded image locally with browser-side canvas processing.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={`Border size (${borderSize}px)`}>
          <input className="w-full" type="range" min="2" max="80" step="2" value={borderSize} onChange={(event) => setBorderSize(Number(event.target.value))} />
        </Field>
        <Field label="Border color">
          <input className={imageInputClass()} type="color" value={borderColor} onChange={(event) => setBorderColor(event.target.value)} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate} disabled={!file}>Add border</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to add a border" description="Pick the border size and color, then export a new bordered image locally." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`bordered-${file.name}`} />
      </>}
    </ToolShell>
  );
}

export function ExifDataViewerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const previewUrl = useFilePreview(file);

  async function handleRead() {
    if (!file) {
      setError("Upload a JPG image first.");
      return;
    }

    try {
      const result = await readExifData(file);
      if (!result.supported) {
        setOutput("This reduced-scope EXIF reader currently supports JPEG files best.");
        setError("");
        return;
      }
      const entries = Object.entries(result.data);
      setOutput(entries.length ? entries.map(([key, value]) => `${key}: ${value}`).join("\n") : "No readable EXIF data was found in this JPEG.");
      setError("");
    } catch (readingError) {
      setError(readingError instanceof Error ? readingError.message : "Unable to read EXIF data from that image.");
      setOutput("");
    }
  }

  function handleDownloadReport() {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    downloadProcessedImage(URL.createObjectURL(blob), "exif-report.txt");
  }

  return (
    <ToolShell title="EXIF Data Viewer" description="Inspect common JPEG EXIF metadata locally, including camera details, timestamps, and simple GPS information when available.">
      <Field label="Supported file types" hint="Best support: JPG">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleRead} disabled={!file}>Read EXIF data</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to inspect EXIF data" description="Choose a JPG image to extract a reduced-scope set of common EXIF fields locally in the browser." /> : <>
        {previewUrl ? <div className="rounded-2xl bg-stone-50 p-4"><img src={previewUrl} alt="Uploaded image preview" className="max-h-80 w-full rounded-2xl object-contain" /></div> : null}
        {output ? <>
          <OutputBlock title="EXIF data" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("EXIF data", output)}>Copy EXIF data</button>
            <button type="button" className={secondaryButtonClass} onClick={handleDownloadReport}>Download report</button>
          </div>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </> : null}
      </>}
    </ToolShell>
  );
}

export function ExifDataRemoverTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [metadataCount, setMetadataCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleRemove() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    try {
      const exif = await readExifData(file);
      setMetadataCount(Object.keys(exif.data).length);
      revokeUrl(processed?.url);
      const next = await processImage({
        file,
        type: file.type || "image/jpeg",
        quality: 0.92,
        draw: (context, image) => {
          context.drawImage(image, 0, 0);
        },
      });
      setProcessed(next);
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to remove metadata from that image.");
    }
  }

  return (
    <ToolShell title="EXIF Data Remover" description="Re-export an uploaded image locally through canvas to strip embedded metadata and create a cleaner copy for sharing.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleRemove} disabled={!file}>Remove metadata</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to strip metadata" description="This browser-side workflow redraws the image and exports a new copy without the original metadata payload." /> : <>
        {metadataCount !== null ? <Notice>{metadataCount ? `Detected ${metadataCount} readable EXIF field(s) before export.` : "No readable EXIF fields were detected before export."}</Notice> : null}
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`cleaned-${file.name.replace(/\.[^.]+$/, "")}.${getOutputExtension(processed?.blob.type ?? file.type)}`} />
      </>}
    </ToolShell>
  );
}

export function ImageColorInverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleInvert() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    try {
      revokeUrl(processed?.url);
      const next = await processPixelImage({
        file,
        pixelTransform: (data) => {
          for (let index = 0; index < data.length; index += 4) {
            data[index] = 255 - data[index];
            data[index + 1] = 255 - data[index + 1];
            data[index + 2] = 255 - data[index + 2];
          }
        },
      });
      setProcessed(next);
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to invert that image.");
    }
  }

  return (
    <ToolShell title="Image Color Inverter" description="Invert image colors locally with a lightweight pixel operation and export the negative-style result from the browser.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleInvert} disabled={!file}>Invert colors</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to invert its colors" description="Choose a supported image and generate a browser-side color-inverted copy with preview and download." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`inverted-${file.name}`} />
      </>}
    </ToolShell>
  );
}

export function ImageNoiseReducerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [strength, setStrength] = useState(1);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleReduce() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    try {
      revokeUrl(processed?.url);
      const next = await processPixelImage({
        file,
        pixelTransform: (data, width, height) => {
          let working = new Uint8ClampedArray(data);
          for (let pass = 0; pass < strength; pass += 1) {
            const nextPixels = new Uint8ClampedArray(working.length);
            for (let y = 0; y < height; y += 1) {
              for (let x = 0; x < width; x += 1) {
                let red = 0;
                let green = 0;
                let blue = 0;
                let alpha = 0;
                let count = 0;
                for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
                  for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                    const sampleX = Math.min(width - 1, Math.max(0, x + offsetX));
                    const sampleY = Math.min(height - 1, Math.max(0, y + offsetY));
                    const index = (sampleY * width + sampleX) * 4;
                    red += working[index];
                    green += working[index + 1];
                    blue += working[index + 2];
                    alpha += working[index + 3];
                    count += 1;
                  }
                }
                const outputIndex = (y * width + x) * 4;
                nextPixels[outputIndex] = Math.round(red / count);
                nextPixels[outputIndex + 1] = Math.round(green / count);
                nextPixels[outputIndex + 2] = Math.round(blue / count);
                nextPixels[outputIndex + 3] = Math.round(alpha / count);
              }
            }
            working = nextPixels;
          }
          return working;
        },
      });
      setProcessed(next);
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to reduce noise for that image.");
    }
  }

  return (
    <ToolShell title="Image Noise Reducer" description="Apply a lightweight local smoothing pass to reduce visible image noise while staying honest about reduced-scope browser-side processing.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label={`Noise reduction strength (${strength})`}>
        <input className="w-full" type="range" min="1" max="3" step="1" value={strength} onChange={(event) => setStrength(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleReduce} disabled={!file}>Reduce noise</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to reduce noise" description="Choose a supported image and apply a small number of smoothing passes for a softer, cleaner result." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        <ImageDownloadPanel processed={processed} filename={`denoised-${file.name}`} />
      </>}
    </ToolShell>
  );
}

export function ImageHistogramAnalyzerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [stats, setStats] = useState<{ brightest: number; darkest: number; pixels: number } | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleAnalyze() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    try {
      const { image, url } = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas is not available in this browser.");
      }
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const red = Array.from({ length: 256 }, () => 0);
      const green = Array.from({ length: 256 }, () => 0);
      const blue = Array.from({ length: 256 }, () => 0);

      for (let index = 0; index < imageData.data.length; index += 4) {
        red[imageData.data[index]] += 1;
        green[imageData.data[index + 1]] += 1;
        blue[imageData.data[index + 2]] += 1;
      }

      const chart = createHistogramChart({ red, green, blue });
      const blob = await canvasToBlob(chart, "image/png", 0.92);
      revokeUrl(processed?.url);
      setProcessed({
        blob,
        width: chart.width,
        height: chart.height,
        url: URL.createObjectURL(blob),
      });
      const darkest = red.findIndex((value, index) => value + green[index] + blue[index] > 0);
      const brightest = 255 - [...red].reverse().findIndex((value, index) => value + green[255 - index] + blue[255 - index] > 0);
      setStats({
        darkest: darkest === -1 ? 0 : darkest,
        brightest: brightest === -1 ? 255 : brightest,
        pixels: canvas.width * canvas.height,
      });
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to analyze that image histogram.");
    }
  }

  return (
    <ToolShell title="Image Histogram Analyzer" description="Generate a local RGB histogram chart from uploaded image pixels so you can inspect tonal distribution without leaving the browser.">
      <Field label="Supported file types" hint="JPG, PNG, WebP">
        <input type="file" accept={supportedTypes} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleAnalyze} disabled={!file}>Analyze histogram</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload an image to analyze its histogram" description="The tool reads pixel values locally and turns them into a downloadable RGB histogram chart." /> : <>
        <ImageComparison originalUrl={previewUrl} processed={processed} />
        {stats ? (
          <div className="grid gap-3 md:grid-cols-3">
            <OutputBlock title="Pixel count" value={String(stats.pixels)} multiline={false} />
            <OutputBlock title="Darkest active level" value={String(stats.darkest)} multiline={false} />
            <OutputBlock title="Brightest active level" value={String(stats.brightest)} multiline={false} />
          </div>
        ) : null}
        <ImageDownloadPanel processed={processed} filename="image-histogram.png" />
      </>}
    </ToolShell>
  );
}

export function VideoMetadataViewerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const previewUrl = useFilePreview(file);

  async function handleRead() {
    if (!file) {
      setError("Upload a video file first.");
      return;
    }

    try {
      const details = await readVideoDetails(file);
      const aspectRatio = details.aspectRatio ? details.aspectRatio.toFixed(3) : "Unknown";
      setOutput(
        `Type: ${details.type}\nResolution: ${details.width} x ${details.height}\nAspect ratio: ${aspectRatio}\nDuration: ${details.duration.toFixed(2)} seconds\nFile size: ${formatFileSize(details.size)}\nLast modified: ${new Date(details.lastModified).toLocaleString()}`,
      );
      setError("");
    } catch (readingError) {
      setError(readingError instanceof Error ? readingError.message : "Unable to inspect that video.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="Video Metadata Viewer" description="Inspect basic uploaded video details locally, including duration, file size, type, dimensions, and aspect ratio.">
      <Field label="Supported file types" hint="Use MP4 or WebM for the best browser support.">
        <input type="file" accept="video/mp4,video/webm" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleRead} disabled={!file}>Read video metadata</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a video to inspect it" description="The browser reads video metadata locally without uploading the file anywhere." /> : <>
        {previewUrl ? (
          <div className="rounded-2xl bg-stone-50 p-4">
            <video src={previewUrl} controls className="max-h-80 w-full rounded-2xl" />
          </div>
        ) : null}
        {output ? <>
          <OutputBlock title="Video details" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("video metadata", output)}>Copy metadata</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </> : null}
      </>}
    </ToolShell>
  );
}

export function VideoFrameExtractorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [timeInSeconds, setTimeInSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [capturedAt, setCapturedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(processed?.url), [processed]);

  async function handleExtract() {
    if (!file) {
      setError("Upload a video file first.");
      return;
    }

    try {
      revokeUrl(processed?.url);
      const next = await extractVideoFrame(file, timeInSeconds);
      setProcessed({
        blob: next.blob,
        width: next.width,
        height: next.height,
        url: next.url,
      });
      setCapturedAt(next.capturedAt);
      setError("");
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to extract a frame from that video.");
    }
  }

  return (
    <ToolShell title="Video Frame Extractor" description="Capture a still frame from an uploaded video locally and export the extracted frame as a PNG image.">
      <Field label="Supported file types" hint="Use MP4 or WebM for the best browser support.">
        <input type="file" accept="video/mp4,video/webm" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Capture time (seconds)">
        <input className={imageInputClass()} type="number" min="0" step="0.1" value={timeInSeconds} onChange={(event) => setTimeInSeconds(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleExtract} disabled={!file}>Extract frame</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a video to extract a frame" description="Choose a supported video, set a timestamp, and generate a downloadable still image locally." /> : <>
        {previewUrl ? (
          <div className="rounded-2xl bg-stone-50 p-4">
            <video
              src={previewUrl}
              controls
              className="max-h-80 w-full rounded-2xl"
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            />
            {duration ? <p className="mt-3 text-sm text-[color:var(--muted)]">Video duration: {duration.toFixed(2)} seconds</p> : null}
          </div>
        ) : null}
        {processed ? (
          <>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Extracted frame preview</p>
              <img src={processed.url} alt="Extracted video frame preview" className="mt-3 max-h-80 w-full rounded-2xl object-contain" />
            </div>
            {capturedAt !== null ? <Notice>Captured at {capturedAt.toFixed(2)} seconds.</Notice> : null}
            <ImageDownloadPanel processed={processed} filename="video-frame.png" />
          </>
        ) : null}
      </>}
    </ToolShell>
  );
}

export function VideoResolutionCheckerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [framePreview, setFramePreview] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState("");
  const previewUrl = useFilePreview(file);

  useEffect(() => () => revokeUrl(framePreview?.url), [framePreview]);

  async function handleCheck() {
    if (!file) {
      setError("Upload a video file first.");
      return;
    }

    try {
      const details = await readVideoDetails(file);
      const ratio = details.aspectRatio ? details.aspectRatio.toFixed(3) : "Unknown";
      setOutput(
        `Resolution: ${details.width} x ${details.height}\nAspect ratio: ${ratio}\nDuration: ${details.duration.toFixed(2)} seconds\nType: ${details.type}`,
      );
      revokeUrl(framePreview?.url);
      const frame = await extractVideoFrame(file, 0);
      setFramePreview({
        blob: frame.blob,
        width: frame.width,
        height: frame.height,
        url: frame.url,
      });
      setError("");
    } catch (checkingError) {
      setError(checkingError instanceof Error ? checkingError.message : "Unable to check that video resolution.");
      setOutput("");
      revokeUrl(framePreview?.url);
      setFramePreview(null);
    }
  }

  return (
    <ToolShell title="Video Resolution Checker" description="Read uploaded video dimensions locally and show a first-frame preview so you can confirm the detected resolution visually.">
      <Field label="Supported file types" hint="Use MP4 or WebM for the best browser support.">
        <input type="file" accept="video/mp4,video/webm" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleCheck} disabled={!file}>Check resolution</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a video to check its resolution" description="The browser can inspect supported videos locally and show the first frame as a quick preview." /> : <>
        {previewUrl ? (
          <div className="rounded-2xl bg-stone-50 p-4">
            <video src={previewUrl} controls className="max-h-80 w-full rounded-2xl" />
          </div>
        ) : null}
        {output ? <OutputBlock title="Resolution details" value={output} /> : null}
        {framePreview ? (
          <>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">First frame preview</p>
              <img src={framePreview.url} alt="First frame preview from uploaded video" className="mt-3 max-h-80 w-full rounded-2xl object-contain" />
            </div>
            <ImageDownloadPanel processed={framePreview} filename="video-preview-frame.png" />
          </>
        ) : null}
      </>}
    </ToolShell>
  );
}

function ScannerResultPanel({
  output,
  copied,
  onCopy,
}: {
  output: string;
  copied: string;
  onCopy: () => void;
}) {
  if (!output) return null;

  return (
    <>
      <OutputBlock title="Detected results" value={output} />
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={onCopy}>Copy results</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </div>
    </>
  );
}

function DetectorScannerTool({
  title,
  description,
  formats,
  uploadHint,
}: {
  title: string;
  description: string;
  formats: string[];
  uploadHint: string;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Ready to scan.");
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const { copied, copy } = useCopyToClipboard();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
  const uploadPreview = useFilePreview(imageFile);
  const detectorSupported = useMemo(
    () => Boolean(getBarcodeDetectorConstructor()) && typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia),
    [],
  );

  function stopCamera() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop();
    }
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }

  useEffect(() => stopCamera, []);

  async function scanCurrentFrame() {
    if (!detectorRef.current || !videoRef.current || !streamRef.current) {
      return;
    }

    try {
      const codes = await detectorRef.current.detect(videoRef.current);
      if (codes.length > 0) {
        setOutput(formatDetectedCodes(codes));
        setStatus(`Detected ${codes.length} result${codes.length === 1 ? "" : "s"} from the live camera feed.`);
        setError("");
      } else {
        setStatus("Scanning live camera feed...");
      }
    } catch {
      setStatus("Scanning live camera feed...");
    } finally {
      if (streamRef.current) {
        timeoutRef.current = window.setTimeout(() => {
          void scanCurrentFrame();
        }, 700);
      }
    }
  }

  async function startCamera() {
    const Detector = getBarcodeDetectorConstructor();
    if (!Detector) {
      setError("This browser does not support the Barcode Detector API yet. Try a recent Chrome or Edge build.");
      return;
    }

    try {
      stopCamera();
      detectorRef.current = new Detector({ formats });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsScanning(true);
      setStatus("Scanning live camera feed...");
      setError("");
      void scanCurrentFrame();
    } catch (cameraError) {
      stopCamera();
      setError(cameraError instanceof Error ? cameraError.message : "Unable to access the camera.");
    }
  }

  async function handleImageScan() {
    const Detector = getBarcodeDetectorConstructor();
    if (!Detector) {
      setError("This browser does not support local code detection for uploaded images.");
      return;
    }
    if (!imageFile) {
      setError("Upload an image file first.");
      return;
    }

    try {
      detectorRef.current = new Detector({ formats });
      const bitmap = await createImageBitmap(imageFile);
      const codes = await detectorRef.current.detect(bitmap);
      if ("close" in bitmap && typeof bitmap.close === "function") {
        bitmap.close();
      }
      if (!codes.length) {
        setOutput("");
        setStatus("No supported code was found in that uploaded image.");
        setError("");
        return;
      }
      setOutput(formatDetectedCodes(codes));
      setStatus(`Detected ${codes.length} result${codes.length === 1 ? "" : "s"} from the uploaded image.`);
      setError("");
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Unable to scan that image.");
      setOutput("");
    }
  }

  return (
    <ToolShell title={title} description={description}>
      <Notice>Camera scanning stays local in the browser. Uploaded images are processed in the current tab and are not sent anywhere.</Notice>
      {!detectorSupported ? <Notice tone="error">Live scanning depends on the browser Barcode Detector API. If it is unavailable, this tool cannot scan codes locally yet.</Notice> : null}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={startCamera} disabled={!detectorSupported || isScanning}>Start camera scan</button>
        <button type="button" className={secondaryButtonClass} onClick={stopCamera} disabled={!isScanning}>Stop camera</button>
      </div>
      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Camera preview</p>
        <video ref={videoRef} muted playsInline className="mt-3 aspect-video w-full rounded-2xl bg-slate-950 object-cover" aria-label={`${title} live camera preview`} />
        <p className="mt-3 text-sm text-[color:var(--muted)]">{status}</p>
      </div>
      <Field label="Scan an uploaded image instead" hint={uploadHint}>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={handleImageScan} disabled={!imageFile || !detectorSupported}>Scan uploaded image</button>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!imageFile && !output ? (
        <EmptyState title="Start the camera or upload an image" description="Point the live camera at a readable code or upload a clear screenshot for local detection." />
      ) : null}
      {uploadPreview ? (
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Uploaded image preview</p>
          <img src={uploadPreview} alt="Uploaded code preview" className="mt-3 max-h-80 w-full rounded-2xl object-contain" />
        </div>
      ) : null}
      <ScannerResultPanel output={output} copied={copied} onCopy={() => void copy("scan results", output)} />
    </ToolShell>
  );
}

export function BarcodeScannerTool() {
  return (
    <DetectorScannerTool
      title="Barcode Scanner"
      description="Scan common retail and inventory barcodes locally with your camera or from an uploaded image using native browser detection when available."
      formats={["code_39", "code_128", "ean_13", "ean_8", "upc_a", "upc_e", "itf"]}
      uploadHint="Best results come from sharp, high-contrast barcode images."
    />
  );
}

export function QrCodeScannerTool() {
  return (
    <DetectorScannerTool
      title="QR Code Scanner"
      description="Scan QR codes locally from a live camera feed or an uploaded image with a mobile-friendly browser-side workflow."
      formats={["qr_code"]}
      uploadHint="Use a centered QR code with enough margin around the edges."
    />
  );
}

export function ColorContrastCheckerTool() {
  const [foreground, setForeground] = useState("#0F172A");
  const [background, setBackground] = useState("#F8FAFC");
  const [sampleText, setSampleText] = useState("Accessible design helps more people read your content.");
  const { copied, copy } = useCopyToClipboard();

  const normalizedForeground = normalizeHexColor(foreground);
  const normalizedBackground = normalizeHexColor(background);
  const contrastRatio = normalizedForeground && normalizedBackground ? getContrastRatio(normalizedForeground, normalizedBackground) : null;
  const output = contrastRatio
    ? `Foreground: ${normalizedForeground}\nBackground: ${normalizedBackground}\nContrast ratio: ${contrastRatio.toFixed(2)}:1\nAA normal text: ${contrastRatio >= 4.5 ? "Pass" : "Fail"}\nAA large text: ${contrastRatio >= 3 ? "Pass" : "Fail"}\nAAA normal text: ${contrastRatio >= 7 ? "Pass" : "Fail"}\nAAA large text: ${contrastRatio >= 4.5 ? "Pass" : "Fail"}`
    : "";

  return (
    <ToolShell title="Color Contrast Checker" description="Compare two colors locally and review WCAG-style contrast guidance with a live preview that stays readable on mobile and desktop.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Foreground color" hint="Example: #111827">
          <div className="flex gap-3">
            <input className="h-12 w-16 rounded-2xl border border-[color:var(--border)] bg-white p-1" type="color" value={normalizedForeground || "#000000"} onChange={(event) => setForeground(event.target.value)} aria-label="Foreground color picker" />
            <input className={imageInputClass()} value={foreground} onChange={(event) => setForeground(event.target.value)} />
          </div>
        </Field>
        <Field label="Background color" hint="Example: #F8FAFC">
          <div className="flex gap-3">
            <input className="h-12 w-16 rounded-2xl border border-[color:var(--border)] bg-white p-1" type="color" value={normalizedBackground || "#FFFFFF"} onChange={(event) => setBackground(event.target.value)} aria-label="Background color picker" />
            <input className={imageInputClass()} value={background} onChange={(event) => setBackground(event.target.value)} />
          </div>
        </Field>
      </div>
      <Field label="Preview text" hint="Try a short paragraph or a button label.">
        <textarea className={`${imageInputClass()} min-h-28`} value={sampleText} onChange={(event) => setSampleText(event.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={() => {
          setForeground(background);
          setBackground(foreground);
        }}>Swap colors</button>
        <button type="button" className={secondaryButtonClass} onClick={() => void copy("contrast report", output)} disabled={!output}>Copy report</button>
      </div>
      {!normalizedForeground || !normalizedBackground ? <Notice tone="error">Enter valid 3-digit or 6-digit HEX colors for both fields.</Notice> : null}
      {normalizedForeground && normalizedBackground ? (
        <>
          <div className="rounded-2xl border border-[color:var(--border)] p-5" style={{ color: normalizedForeground, backgroundColor: normalizedBackground }}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Live preview</p>
            <p className="mt-3 text-base leading-7 sm:text-lg">{sampleText || "Your preview text will appear here."}</p>
            <button type="button" className="mt-4 rounded-xl border border-current px-4 py-2 text-sm font-semibold">Sample button</button>
          </div>
          {contrastRatio ? <OutputBlock title="Contrast report" value={output} /> : null}
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          <Notice>Helpful example: dark navy text like <code>#0F172A</code> on a pale background like <code>#F8FAFC</code> usually produces strong readability.</Notice>
        </>
      ) : null}
    </ToolShell>
  );
}
