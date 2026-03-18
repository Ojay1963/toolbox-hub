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

const supportedTypes = "image/jpeg,image/png,image/webp";

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
  return (
    <ToolShell title="Background Remover" description="This page is intentionally honest about current limits for browser-only background removal.">
      <Notice>
        Coming soon. A high-quality background remover usually needs heavier segmentation logic,
        larger client downloads, or external services. This site avoids fake AI claims and does not
        ship a poor-quality cutout workflow just to appear complete.
      </Notice>
      <EmptyState title="No deceptive one-click removal here" description="When a genuinely useful browser-first version is practical, it can plug into this page without changing the route, content, or SEO structure." />
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
