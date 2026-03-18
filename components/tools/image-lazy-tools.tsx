"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buttonClass,
  EmptyState,
  Field,
  Notice,
  OutputBlock,
  secondaryButtonClass,
  ToolShell,
  useCopyToClipboard,
} from "@/components/tools/common";

type DetectedCode = {
  rawValue?: string;
  format?: string;
};

type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<DetectedCode[]>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

function getBarcodeDetectorConstructor() {
  return (globalThis as typeof globalThis & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector ?? null;
}

function formatDetectedCodes(codes: DetectedCode[]) {
  return codes
    .map((code, index) => `${index + 1}. ${code.rawValue || "Unknown value"}${code.format ? ` (${code.format})` : ""}`)
    .join("\n");
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
    if (!detectorRef.current || !videoRef.current || !streamRef.current) return;

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
      {!imageFile && !output ? <EmptyState title="Start the camera or upload an image" description="Point the live camera at a readable code or upload a clear screenshot for local detection." /> : null}
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
