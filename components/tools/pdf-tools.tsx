"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
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

type DownloadItem = {
  name: string;
  url: string;
};

type ImageUploadItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type PdfLibModule = typeof import("pdf-lib");
type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfLibPromise: Promise<PdfLibModule> | null = null;
let pdfJsPromise: Promise<PdfJsModule> | null = null;

function getPdfLib() {
  if (!pdfLibPromise) {
    pdfLibPromise = import("pdf-lib");
  }
  return pdfLibPromise;
}

async function getPdfJs() {
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((module) => {
      module.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return module;
    });
  }
  return pdfJsPromise;
}

function revokeDownloads(items: DownloadItem[]) {
  items.forEach((item) => URL.revokeObjectURL(item.url));
}

function downloadItem(item: DownloadItem) {
  const anchor = document.createElement("a");
  anchor.href = item.url;
  anchor.download = item.name;
  anchor.click();
}

function revokeImageUploads(items: ImageUploadItem[]) {
  items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
}

function dedupeImageFormats(types: string[]) {
  return Array.from(
    new Set(
      types.map((type) => (type ? type.replace("image/", "").toUpperCase() : "IMAGE")),
    ),
  );
}

function DownloadList({ items }: { items: DownloadItem[] }) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.url}
          type="button"
          className={`${secondaryButtonClass} w-full text-left`}
          onClick={() => downloadItem(item)}
        >
          Download {item.name}
        </button>
      ))}
    </div>
  );
}

function parsePageSelection(input: string, maxPages: number) {
  const pages = new Set<number>();
  for (const part of input.split(",").map((piece) => piece.trim()).filter(Boolean)) {
    if (part.includes("-")) {
      const [startRaw, endRaw] = part.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (Number.isNaN(start) || Number.isNaN(end)) continue;
      const low = Math.max(1, Math.min(start, end));
      const high = Math.min(maxPages, Math.max(start, end));
      for (let page = low; page <= high; page += 1) {
        pages.add(page);
      }
    } else {
      const value = Number(part);
      if (!Number.isNaN(value) && value >= 1 && value <= maxPages) {
        pages.add(value);
      }
    }
  }
  return [...pages].sort((a, b) => a - b);
}

async function pdfBytesToDownload(bytes: Uint8Array, name: string): Promise<DownloadItem> {
  return {
    name,
    url: URL.createObjectURL(new Blob([bytes.slice().buffer as ArrayBuffer], { type: "application/pdf" })),
  };
}

async function textToDownload(text: string, name: string): Promise<DownloadItem> {
  return {
    name,
    url: URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" })),
  };
}

async function getApiError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || "This service is temporarily unavailable. Please try again shortly.";
  } catch {
    return "This service is temporarily unavailable. Please try again shortly.";
  }
}

async function responseToDownloadItem(response: Response, fallbackName: string): Promise<DownloadItem> {
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/i);
  const name = match?.[1] || fallbackName;
  const blob = await response.blob();
  return {
    name,
    url: URL.createObjectURL(blob),
  };
}

async function fileToUint8Array(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

async function imageFileToCanvas(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Unable to read that image file."));
      element.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available in this browser.");
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function canvasToPngBytes(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) {
    throw new Error("Unable to export that image for PDF conversion.");
  }
  return new Uint8Array(await blob.arrayBuffer());
}

async function embedSupportedImage(pdf: Awaited<ReturnType<PdfLibModule["PDFDocument"]["create"]>>, file: File) {
  const normalizedType = file.type.toLowerCase();
  if (normalizedType === "image/jpeg" || normalizedType === "image/jpg") {
    const bytes = await fileToUint8Array(file);
    return pdf.embedJpg(bytes);
  }
  if (normalizedType === "image/png") {
    const bytes = await fileToUint8Array(file);
    return pdf.embedPng(bytes);
  }
  const canvas = await imageFileToCanvas(file);
  const pngBytes = await canvasToPngBytes(canvas);
  return pdf.embedPng(pngBytes);
}

function addImagePage(pdf: Awaited<ReturnType<PdfLibModule["PDFDocument"]["create"]>>, image: Awaited<ReturnType<typeof embedSupportedImage>>) {
  const page = pdf.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });
}

function formatPdfPointsToInches(points: number) {
  return (points / 72).toFixed(2);
}

function formatPdfPointsToMillimeters(points: number) {
  return ((points / 72) * 25.4).toFixed(1);
}

function detectCommonPageSize(width: number, height: number) {
  const normalized = [Math.min(width, height), Math.max(width, height)];
  const candidates = [
    { label: "A4", size: [595.28, 841.89] },
    { label: "Letter", size: [612, 792] },
    { label: "Legal", size: [612, 1008] },
    { label: "Tabloid", size: [792, 1224] },
    { label: "A3", size: [841.89, 1190.55] },
  ];

  const match = candidates.find(({ size }) =>
    Math.abs(size[0] - normalized[0]) <= 8 && Math.abs(size[1] - normalized[1]) <= 8,
  );

  return match?.label ?? "Custom size";
}

type PdfOutlineNode = {
  title?: string;
  items?: PdfOutlineNode[];
};

function flattenOutline(items: PdfOutlineNode[], depth = 0): string[] {
  return items.flatMap((item) => {
    const prefix = `${"  ".repeat(depth)}- `;
    const current = `${prefix}${item.title || "Untitled bookmark"}`;
    const children = item.items?.length ? flattenOutline(item.items, depth + 1) : [];
    return [current, ...children];
  });
}

export function PdfMergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleMerge() {
    if (files.length < 2) {
      setError("Upload at least two PDF files to merge.");
      return;
    }
    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument } = await getPdfLib();
      const output = await PDFDocument.create();
      for (const file of files) {
        const source = await PDFDocument.load(await file.arrayBuffer());
        const copiedPages = await output.copyPages(source, source.getPageIndices());
        copiedPages.forEach((page) => output.addPage(page));
      }
      const bytes = await output.save({ useObjectStreams: true });
      setDownload(await pdfBytesToDownload(bytes, "merged.pdf"));
      setError("");
    } catch {
      setError("Unable to merge those PDF files.");
    }
  }

  return (
    <ToolShell title="PDF Merge" description="Combine multiple PDF files locally in the browser and download one merged document.">
      <Field label="PDF files" hint="Upload two or more PDFs">
        <input type="file" accept="application/pdf" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleMerge} disabled={files.length < 2}>
        Merge PDFs
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!files.length ? (
        <EmptyState title="Upload PDFs to merge" description="The selected file order is used as the merge order." />
      ) : (
        <>
          <Notice>{files.length} file(s) selected.</Notice>
          {download ? <DownloadList items={[download]} /> : null}
        </>
      )}
    </ToolShell>
  );
}

export function PdfSplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"individual" | "extract">("individual");
  const [pageInput, setPageInput] = useState("1");
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => () => revokeDownloads(downloads), [downloads]);

  async function handleSplit() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      revokeDownloads(downloads);
      const { PDFDocument } = await getPdfLib();
      const source = await PDFDocument.load(await file.arrayBuffer());
      const nextDownloads: DownloadItem[] = [];

      if (mode === "individual") {
        for (let index = 0; index < source.getPageCount(); index += 1) {
          const output = await PDFDocument.create();
          const [page] = await output.copyPages(source, [index]);
          output.addPage(page);
          const bytes = await output.save({ useObjectStreams: true });
          nextDownloads.push(await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-page-${index + 1}.pdf`));
        }
      } else {
        const selection = parsePageSelection(pageInput, source.getPageCount()).map((page) => page - 1);
        if (!selection.length) {
          setError("Enter at least one valid page number or range.");
          setDownloads([]);
          return;
        }
        const output = await PDFDocument.create();
        const copied = await output.copyPages(source, selection);
        copied.forEach((page) => output.addPage(page));
        const bytes = await output.save({ useObjectStreams: true });
        nextDownloads.push(await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-selected-pages.pdf`));
      }

      setDownloads(nextDownloads);
      setError("");
    } catch {
      setError("Unable to split this PDF.");
    }
  }

  return (
    <ToolShell title="PDF Split" description="Split a PDF into one-page files or extract selected pages into a new document locally in the browser.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="flex flex-wrap gap-6 text-sm text-[color:var(--foreground)]">
        <label className="flex items-center gap-2"><input type="radio" checked={mode === "individual"} onChange={() => setMode("individual")} /> Split into one file per page</label>
        <label className="flex items-center gap-2"><input type="radio" checked={mode === "extract"} onChange={() => setMode("extract")} /> Extract selected pages into one PDF</label>
      </div>
      {mode === "extract" ? (
        <Field label="Pages to extract" hint="Examples: 1,3,5-7">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={pageInput} onChange={(event) => setPageInput(event.target.value)} />
        </Field>
      ) : null}
      <button type="button" className={buttonClass} onClick={handleSplit} disabled={!file}>
        Split PDF
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a PDF to split" description="Choose whether you want one file per page or a new PDF built from selected pages." /> : downloads.length ? <DownloadList items={downloads} /> : null}
    </ToolShell>
  );
}

export function PdfCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [resultText, setResultText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleCompress() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      setLoading(true);
      if (download) URL.revokeObjectURL(download.url);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/tools/pdf-compressor", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const blob = await response.blob();
      const nextDownload = {
        name: `${file.name.replace(/\.pdf$/i, "")}-optimized.pdf`,
        url: URL.createObjectURL(blob),
      };
      setDownload(nextDownload);
      setResultText(`Original size: ${formatFileSize(file.size)}\nOptimized size: ${formatFileSize(blob.size)}`);
      setError("");
    } catch (compressionError) {
      setError(compressionError instanceof Error ? compressionError.message : "Unable to optimize this PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="PDF Compressor" description="Run a reduced-scope server-side PDF optimization pass. This can help some files, but complex PDFs may still shrink only a little.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Notice>Reduced-scope optimization. This workflow creates a cleaner server-side copy and may reduce size in some cases, but it is not a full desktop-grade PDF compressor.</Notice>
        <button type="button" className={buttonClass} onClick={handleCompress} disabled={!file || loading}>
          {loading ? "Optimizing PDF..." : "Optimize PDF"}
        </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload a PDF to optimize" description="This local workflow works best for some PDFs, but highly compressed or image-heavy files may not shrink much." />
      ) : (
        <>
          {resultText ? <OutputBlock title="Optimization summary" value={resultText} /> : null}
          {download ? <DownloadList items={[download]} /> : null}
        </>
      )}
    </ToolShell>
  );
}

export function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1.5);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => () => revokeDownloads(downloads), [downloads]);

  async function handleConvert() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      revokeDownloads(downloads);
      const data = new Uint8Array(await file.arrayBuffer());
      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const nextDownloads: DownloadItem[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas rendering is not available.");
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (result) => (result ? resolve(result) : reject(new Error("Could not create JPG output."))),
            "image/jpeg",
            0.92,
          );
        });
        nextDownloads.push({
          name: `${file.name.replace(/\.pdf$/i, "")}-page-${pageNumber}.jpg`,
          url: URL.createObjectURL(blob),
        });
      }

      setDownloads(nextDownloads);
      setError("");
    } catch {
      setError("Unable to render this PDF into JPG images.");
    }
  }

  return (
    <ToolShell title="PDF to JPG" description="Render each PDF page into a JPG image locally in the browser. Higher quality scales will use more memory.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label={`Render quality scale (${scale.toFixed(1)}x)`}>
        <input className="w-full" type="range" min="1" max="2.5" step="0.25" value={scale} onChange={(event) => setScale(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleConvert} disabled={!file}>
        Convert PDF to JPG
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a PDF to convert" description="The tool will create one JPG file per page and let you download each page image." /> : downloads.length ? <DownloadList items={downloads} /> : null}
    </ToolShell>
  );
}

export function JpgToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleCreate() {
    if (!files.length) {
      setError("Upload one or more JPG images first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument } = await getPdfLib();
      const output = await PDFDocument.create();
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const image = await output.embedJpg(bytes);
        const page = output.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      const bytes = await output.save({ useObjectStreams: true });
      setDownload(await pdfBytesToDownload(bytes, "images-to-pdf.pdf"));
      setError("");
    } catch {
      setError("Unable to create a PDF from those JPG files.");
    }
  }

  return (
    <ToolShell title="JPG to PDF" description="Build a PDF locally from one or more JPG images. The selected file order becomes the page order.">
      <Field label="JPG files" hint="Upload one or more JPG images">
        <input type="file" accept="image/jpeg" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleCreate} disabled={!files.length}>
        Create PDF
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!files.length ? (
        <EmptyState title="Upload JPG images to create a PDF" description="Each selected image becomes one PDF page in the same order you choose." />
      ) : (
        <>
          <Notice>{files.length} JPG image(s) selected.</Notice>
          {download ? <DownloadList items={[download]} /> : null}
        </>
      )}
    </ToolShell>
  );
}

export function ImageToPdfConverterTool() {
  const [items, setItems] = useState<ImageUploadItem[]>([]);
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => () => {
    revokeImageUploads(items);
  }, [items]);

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  function updateFiles(nextFiles: File[]) {
    setItems((current) => {
      revokeImageUploads(current);
      return nextFiles.map((file, index) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    });
    if (download) {
      URL.revokeObjectURL(download.url);
      setDownload(null);
    }
    setResult("");
    setError("");
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
    if (download) {
      URL.revokeObjectURL(download.url);
      setDownload(null);
    }
    setResult("");
  }

  function removeItem(index: number) {
    setItems((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
    if (download) {
      URL.revokeObjectURL(download.url);
      setDownload(null);
    }
    setResult("");
  }

  async function handleCreate() {
    if (!items.length) {
      setError("Upload one or more images first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument } = await getPdfLib();
      const output = await PDFDocument.create();
      for (const item of items) {
        const image = await embedSupportedImage(output, item.file);
        addImagePage(output, image);
      }
      const bytes = await output.save({ useObjectStreams: true });
      const nextDownload = await pdfBytesToDownload(bytes, "images-to-pdf.pdf");
      setDownload(nextDownload);
      setResult(
        `Images added: ${items.length}\nFormats: ${dedupeImageFormats(items.map((item) => item.file.type)).join(", ")}\nOutput size: ${formatFileSize(bytes.length)}`,
      );
      setError("");
    } catch {
      setError("Unable to create a PDF from those images.");
      setDownload(null);
      setResult("");
    }
  }

  return (
    <ToolShell title="Image to PDF Converter" description="Convert JPG, PNG, or WEBP images into one PDF locally in the browser, reorder pages, and download the finished document.">
      <Field label="Image files" hint="Upload JPG, PNG, or WEBP images. The order below becomes the PDF page order.">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={(event) => updateFiles(Array.from(event.target.files ?? []))}
        />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleCreate} disabled={!items.length}>
          Create PDF
        </button>
        <button type="button" className={secondaryButtonClass} onClick={() => updateFiles([])} disabled={!items.length}>
          Clear images
        </button>
        <button type="button" className={secondaryButtonClass} onClick={() => copy("image order summary", items.map((item, index) => `${index + 1}. ${item.file.name}`).join("\n"))} disabled={!items.length}>
          Copy order
        </button>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!items.length ? (
        <EmptyState title="Upload images to build a PDF" description="Add one or more images, reorder them if needed, then generate one PDF file for download." />
      ) : (
        <>
          <Notice>{items.length} image(s) selected. Reorder them before generating the PDF if needed.</Notice>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-[color:var(--border)] bg-white p-4">
                <img src={item.previewUrl} alt={`Preview of ${item.file.name}`} className="h-40 w-full rounded-xl border border-[color:var(--border)] object-contain bg-stone-50" />
                <div className="mt-3 space-y-1">
                  <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">{index + 1}. {item.file.name}</p>
                  <p className="text-xs text-[color:var(--muted)]">{formatFileSize(item.file.size)} · {(item.file.type || "image").replace("image/", "").toUpperCase()}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className={secondaryButtonClass} onClick={() => moveItem(index, -1)} disabled={index === 0}>
                    Move up
                  </button>
                  <button type="button" className={secondaryButtonClass} onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}>
                    Move down
                  </button>
                  <button type="button" className={secondaryButtonClass} onClick={() => removeItem(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {result ? <OutputBlock title="PDF summary" value={result} /> : null}
          {download ? <DownloadList items={[download]} /> : null}
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function PdfPageRotatorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageInput, setPageInput] = useState("");
  const [angle, setAngle] = useState(90);
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleRotate() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument, degrees } = await getPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const pagesToRotate = pageInput.trim()
        ? parsePageSelection(pageInput, pdf.getPageCount())
        : Array.from({ length: pdf.getPageCount() }, (_, index) => index + 1);

      if (!pagesToRotate.length) {
        setError("Enter at least one valid page number or range.");
        return;
      }

      pagesToRotate.forEach((pageNumber) => {
        pdf.getPage(pageNumber - 1).setRotation(degrees(angle));
      });
      const bytes = await pdf.save({ useObjectStreams: true });
      setDownload(await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-rotated.pdf`));
      setError("");
    } catch {
      setError("Unable to rotate the selected PDF pages.");
    }
  }

  return (
    <ToolShell title="PDF Page Rotator" description="Rotate all PDF pages or only selected pages locally in the browser.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Pages to rotate" hint="Leave empty to rotate every page. Example: 1,3,5-7">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={pageInput} onChange={(event) => setPageInput(event.target.value)} />
        </Field>
        <Field label="Rotation angle">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={angle} onChange={(event) => setAngle(Number(event.target.value))}>
            <option value={90}>90 degrees</option>
            <option value={180}>180 degrees</option>
            <option value={270}>270 degrees</option>
          </select>
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleRotate} disabled={!file}>
        Rotate pages
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a PDF to rotate" description="Choose a rotation angle and optionally target only specific pages." /> : download ? <DownloadList items={[download]} /> : null}
    </ToolShell>
  );
}

export function PdfPageNumberAdderTool() {
  const [file, setFile] = useState<File | null>(null);
  const [startNumber, setStartNumber] = useState(1);
  const [position, setPosition] = useState<"top-center" | "bottom-center">("bottom-center");
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleAddNumbers() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument, StandardFonts, rgb } = await getPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      pdf.getPages().forEach((page, index) => {
        const { width, height } = page.getSize();
        const label = String(startNumber + index);
        const textWidth = font.widthOfTextAtSize(label, 12);
        const x = (width - textWidth) / 2;
        const y = position === "top-center" ? height - 24 : 18;
        page.drawText(label, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      });
      const bytes = await pdf.save({ useObjectStreams: true });
      setDownload(await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-numbered.pdf`));
      setError("");
    } catch {
      setError("Unable to add page numbers to this PDF.");
    }
  }

  return (
    <ToolShell title="PDF Page Number Adder" description="Add simple page numbers to every page in a PDF locally in the browser.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Starting page number">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={startNumber} onChange={(event) => setStartNumber(Number(event.target.value))} />
        </Field>
        <Field label="Position">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={position} onChange={(event) => setPosition(event.target.value as "top-center" | "bottom-center")}>
            <option value="bottom-center">Bottom center</option>
            <option value="top-center">Top center</option>
          </select>
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleAddNumbers} disabled={!file}>
        Add page numbers
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a PDF to number pages" description="This local version adds simple centered page numbers to every page in the document." /> : download ? <DownloadList items={[download]} /> : null}
    </ToolShell>
  );
}

export function ProtectPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleProtect() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }
    if (password.trim().length < 6) {
      setError("Enter a password with at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      if (download) URL.revokeObjectURL(download.url);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password.trim());
      const response = await fetch("/api/tools/protect-pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setDownload(await responseToDownloadItem(response, `${file.name.replace(/\.pdf$/i, "")}-protected.pdf`));
      setError("");
    } catch (protectError) {
      setDownload(null);
      setError(protectError instanceof Error ? protectError.message : "Unable to protect that PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="Protect PDF" description="Protect a PDF with a password through a server-assisted workflow when the PDF protection service is enabled for this deployment.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Open password" hint="Use at least 6 characters. This password will be required to open the protected PDF.">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter a PDF password" />
      </Field>
      <Notice>
        Server-assisted processing. If PDF protection is not enabled for this deployment,
        the page will show a clear unavailable message instead of pretending to encrypt your file.
      </Notice>
      <button type="button" className={buttonClass} onClick={handleProtect} disabled={!file || loading}>
        {loading ? "Protecting PDF..." : "Protect PDF"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : !file || !password.trim() ? (
        <EmptyState title="Upload a PDF and enter a password" description="This route supports real server-side protection, but the encryption service must be enabled for this deployment." />
      ) : download ? (
        <DownloadList items={[download]} />
      ) : (
        <EmptyState title="Ready to protect your PDF" description="Run the server-side protection step to generate an encrypted download when the backend service is available." />
      )}
    </ToolShell>
  );
}

export function PdfWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [watermark, setWatermark] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.25);
  const [position, setPosition] = useState<"center" | "top-left" | "bottom-right">("center");
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleWatermark() {
    if (!file || !watermark.trim()) {
      setError("Upload a PDF and enter watermark text first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument, StandardFonts, rgb, degrees } = await getPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);

      pdf.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const fontSize = Math.max(24, Math.round(Math.min(width, height) / 12));
        const textWidth = font.widthOfTextAtSize(watermark, fontSize);
        const textHeight = fontSize;

        const positions = {
          center: { x: (width - textWidth) / 2, y: (height - textHeight) / 2, rotate: degrees(-35) },
          "top-left": { x: 24, y: height - textHeight - 24, rotate: degrees(0) },
          "bottom-right": { x: width - textWidth - 24, y: 24, rotate: degrees(0) },
        };

        const selected = positions[position];
        page.drawText(watermark, {
          x: selected.x,
          y: selected.y,
          size: fontSize,
          font,
          rotate: selected.rotate,
          opacity,
          color: rgb(0.4, 0.4, 0.4),
        });
      });

      const bytes = await pdf.save({ useObjectStreams: true });
      setDownload(await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-watermarked.pdf`));
      setError("");
    } catch {
      setError("Unable to add a watermark to this PDF.");
    }
  }

  return (
    <ToolShell title="PDF Watermark Tool" description="Add a text watermark to each PDF page locally in the browser and download the updated file.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Watermark text">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={watermark} onChange={(event) => setWatermark(event.target.value)} />
        </Field>
        <Field label="Position">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={position} onChange={(event) => setPosition(event.target.value as "center" | "top-left" | "bottom-right")}>
            <option value="center">Center diagonal</option>
            <option value="top-left">Top left</option>
            <option value="bottom-right">Bottom right</option>
          </select>
        </Field>
        <Field label={`Opacity (${Math.round(opacity * 100)}%)`}>
          <input className="w-full" type="range" min="0.1" max="0.8" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleWatermark} disabled={!file}>
        Add watermark
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a PDF to watermark it" description="Enter text, choose the watermark style, and export a new watermarked PDF locally." /> : download ? <DownloadList items={[download]} /> : null}
    </ToolShell>
  );
}

export function PdfMetadataEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleApply() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument } = await getPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      pdf.setTitle(title.trim());
      pdf.setAuthor(author.trim());
      pdf.setSubject(subject.trim());
      pdf.setKeywords(keywords.split(",").map((item) => item.trim()).filter(Boolean));
      const bytes = await pdf.save({ useObjectStreams: true });
      setDownload(await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-metadata.pdf`));
      setError("");
    } catch {
      setError("Unable to update metadata for this PDF.");
    }
  }

  return (
    <ToolShell title="PDF Metadata Editor" description="Edit common PDF metadata fields locally in the browser and download the updated file.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Author">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={author} onChange={(event) => setAuthor(event.target.value)} />
        </Field>
        <Field label="Subject">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={subject} onChange={(event) => setSubject(event.target.value)} />
        </Field>
        <Field label="Keywords" hint="Separate multiple keywords with commas.">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={keywords} onChange={(event) => setKeywords(event.target.value)} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleApply} disabled={!file}>
        Update metadata
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a PDF to edit its metadata" description="Set title, author, subject, and keywords, then download the updated PDF." /> : download ? <DownloadList items={[download]} /> : null}
    </ToolShell>
  );
}

export function PdfUnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleInspect() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      const { PDFDocument } = await getPdfLib();
      if (download) URL.revokeObjectURL(download.url);
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const bytes = await pdf.save({ useObjectStreams: true });
      setDownload(await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-readable-copy.pdf`));
      setStatus("This PDF opened successfully in the current browser-side workflow. You can download a clean local copy, but this tool does not remove real password protection.");
      setError("");
    } catch {
      if (download) URL.revokeObjectURL(download.url);
      setDownload(null);
      setStatus("");
      setError("This PDF appears to be protected or unreadable. With the current browser-friendly stack, the site can detect that state honestly but cannot safely remove real PDF password protection.");
    }
  }

  return (
    <ToolShell title="PDF Unlock Tool" description="Inspect whether a PDF opens in the current browser-side workflow and stay honest about real password-protection limits.">
      <Notice>
        Reduced scope only. This tool can detect whether a PDF opens in the current local stack, but it does not fake password removal for protected files.
      </Notice>
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleInspect} disabled={!file}>
        Inspect PDF access
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {status ? <Notice tone="success">{status}</Notice> : null}
      {download ? <DownloadList items={[download]} /> : null}
      {!file ? <EmptyState title="Upload a PDF to inspect it" description="The tool checks whether the file opens locally and reports that result honestly." /> : null}
    </ToolShell>
  );
}

export function PdfPageExtractorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageInput, setPageInput] = useState("1");
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleExtract() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument } = await getPdfLib();
      const source = await PDFDocument.load(await file.arrayBuffer());
      const selection = parsePageSelection(pageInput, source.getPageCount()).map((page) => page - 1);
      if (!selection.length) {
        setError("Enter at least one valid page number or range.");
        return;
      }

      const output = await PDFDocument.create();
      const copied = await output.copyPages(source, selection);
      copied.forEach((page) => output.addPage(page));
      const bytes = await output.save({ useObjectStreams: true });
      setDownload(await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-extracted.pdf`));
      setError("");
    } catch {
      setError("Unable to extract the selected pages from this PDF.");
    }
  }

  return (
    <ToolShell title="PDF Page Extractor" description="Extract selected pages from a PDF into one new local output file.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Pages to extract" hint="Examples: 1,3,5-7">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={pageInput} onChange={(event) => setPageInput(event.target.value)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleExtract} disabled={!file}>
        Extract pages
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a PDF to extract pages" description="Choose the pages you want to keep and download one new PDF containing only those pages." /> : download ? <DownloadList items={[download]} /> : null}
    </ToolShell>
  );
}

export function PdfPageReorderTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState("");
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleReorder() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument } = await getPdfLib();
      const source = await PDFDocument.load(await file.arrayBuffer());
      const order = pageOrder.split(",").map((part) => Number(part.trim())).filter((value) => !Number.isNaN(value));
      const uniqueOrder = [...new Set(order)];

      if (uniqueOrder.length !== source.getPageCount() || uniqueOrder.some((page) => page < 1 || page > source.getPageCount())) {
        setError(`Enter every page exactly once using comma-separated page numbers from 1 to ${source.getPageCount()}.`);
        return;
      }

      const output = await PDFDocument.create();
      const copied = await output.copyPages(source, uniqueOrder.map((page) => page - 1));
      copied.forEach((page) => output.addPage(page));
      const bytes = await output.save({ useObjectStreams: true });
      setDownload(await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-reordered.pdf`));
      setError("");
    } catch {
      setError("Unable to reorder pages for this PDF.");
    }
  }

  return (
    <ToolShell title="PDF Page Reorder Tool" description="Reorder PDF pages locally by entering the full page sequence you want in the output file.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Page order" hint="Example for a 4-page file: 2,1,4,3">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={pageOrder} onChange={(event) => setPageOrder(event.target.value)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleReorder} disabled={!file}>
        Reorder pages
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a PDF to reorder pages" description="Enter the complete page sequence you want in the exported file." /> : download ? <DownloadList items={[download]} /> : null}
    </ToolShell>
  );
}

export function PdfTextExtractorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleExtract() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const pageTexts: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const strings = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .filter(Boolean);
        pageTexts.push(strings.join(" "));
      }

      const text = pageTexts.join("\n\n");
      setOutput(text);
      setDownload(await textToDownload(text, `${file.name.replace(/\.pdf$/i, "")}-text.txt`));
      setError("");
    } catch {
      setError("Unable to extract text from this PDF. This works best for PDFs that already contain selectable text.");
      setOutput("");
      setDownload(null);
    }
  }

  return (
    <ToolShell title="PDF Text Extractor" description="Extract selectable text from a PDF locally in the browser and copy or download the result.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleExtract} disabled={!file}>
        Extract text
      </button>
      <Notice>This tool works best for PDFs that already contain selectable text. Scanned-image PDFs may return little or no text.</Notice>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload a PDF to extract text" description="Extracted text stays local in the browser and can be copied or downloaded as a text file." />
      ) : (
        <>
          {output ? <OutputBlock title="Extracted text" value={output} /> : null}
          <div className="flex flex-wrap gap-3">
            {output ? <button type="button" className={buttonClass} onClick={() => copy("extracted text", output)}>Copy text</button> : null}
            {download ? <button type="button" className={secondaryButtonClass} onClick={() => downloadItem(download)}>Download text file</button> : null}
          </div>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function PdfToWordConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleConvert() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      setLoading(true);
      if (download) URL.revokeObjectURL(download.url);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/tools/pdf-to-word", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setDownload(await responseToDownloadItem(response, `${file.name.replace(/\.pdf$/i, "")}.docx`));
      setError("");
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Unable to convert that PDF into Word.");
      setDownload(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="PDF to Word Converter" description="Extract selectable text from a PDF through a server-assisted workflow and export it as a real DOCX file without faking full layout preservation.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
        <Notice>
          Server-assisted conversion. This version creates a real DOCX download from selectable PDF text,
          but scanned PDFs still need OCR and complex layouts may not map perfectly into Word.
        </Notice>
        <button type="button" className={buttonClass} onClick={handleConvert} disabled={!file || loading}>
          {loading ? "Converting to Word..." : "Convert to Word"}
        </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload a PDF to start" description="The server can pull selectable text from many PDFs and package it into a readable DOCX download." />
      ) : (
        <>
          {download ? (
            <>
              <Notice tone="success">
                Conversion completed. Download the generated DOCX file to review the extracted content safely.
              </Notice>
              <div className="flex flex-wrap gap-3">
                <button type="button" className={secondaryButtonClass} onClick={() => downloadItem(download)}>
                  Download .docx
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </ToolShell>
  );
}

export function PdfOcrPlaceholderTool() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleOcr() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      setLoading(true);
      if (download) URL.revokeObjectURL(download.url);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/tools/pdf-ocr", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const payload = (await response.json()) as { ok: true; data: { text: string; fileName: string } };
      setOutput(payload.data.text);
      setDownload(await textToDownload(payload.data.text, payload.data.fileName));
      setError("");
    } catch (ocrError) {
      setError(ocrError instanceof Error ? ocrError.message : "Unable to run OCR on that PDF.");
      setOutput("");
      setDownload(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="PDF OCR" description="Extract text from scanned PDFs through a server-assisted OCR workflow and review the returned text before downloading it.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Notice>
        Server-assisted OCR. If OCR is not enabled for this deployment, the page will show a clear
        unavailable message instead of pretending text extraction worked.
      </Notice>
      <button type="button" className={buttonClass} onClick={handleOcr} disabled={!file || loading}>
        {loading ? "Running OCR..." : "Run OCR"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload a scanned PDF to extract text" description="Use this workflow for image-based or scanned PDFs that do not already contain selectable text." />
      ) : output ? (
        <>
          <OutputBlock title="OCR text" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("OCR text", output)}>Copy text</button>
            {download ? <button type="button" className={secondaryButtonClass} onClick={() => downloadItem(download)}>Download text file</button> : null}
          </div>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function WordToPdfConverterPlaceholderTool() {
  const [file, setFile] = useState<File | null>(null);
  const [download, setDownload] = useState<DownloadItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  function handleFileChange(nextFile: File | null) {
    if (!nextFile) {
      setFile(null);
      setError("");
      return;
    }

    const isDocx =
      nextFile.name.toLowerCase().endsWith(".docx") ||
      nextFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isDocx) {
        setFile(null);
        setDownload(null);
        setError("Please choose a .docx Word document.");
        return;
      }

      setFile(nextFile);
      setDownload(null);
      setError("");
    }

  async function handleConvert() {
    if (!file) {
      setError("Please choose a .docx Word document first.");
      return;
    }

    try {
      setLoading(true);
      if (download) URL.revokeObjectURL(download.url);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/tools/word-to-pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setDownload(await responseToDownloadItem(response, `${file.name.replace(/\.docx$/i, "")}.pdf`));
      setError("");
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Unable to convert that Word document into PDF.");
      setDownload(null);
    } finally {
      setLoading(false);
    }
  }

      return (
      <ToolShell title="Word to PDF Converter" description="Convert DOCX files into PDF with a server-assisted workflow that extracts readable document text and formats it into a clean PDF export.">
        <Field label=".docx file" hint="Upload a DOCX file to convert it on the server and download the generated PDF.">
          <input
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          />
        </Field>
        <Notice>
          Server-assisted conversion. This version focuses on extracting readable DOCX text and placing it
          into a clean PDF document. Complex Word layouts may still simplify during export.
        </Notice>
        <button type="button" className={buttonClass} onClick={handleConvert} disabled={!file || loading}>
          {loading ? "Converting to PDF..." : "Convert to PDF"}
        </button>
        {error ? <Notice tone="error">{error}</Notice> : null}
        {!file ? (
          <EmptyState
            title="Upload a DOCX file to start"
            description="The server will extract the document text and generate a clean PDF for download."
          />
        ) : download ? (
          <DownloadList items={[download]} />
        ) : (
          <OutputBlock
            title="Uploaded document"
            value={`File: ${file.name}\nSize: ${formatFileSize(file.size)}\nStatus: Ready for server-side conversion.\nOutput: A readable PDF generated from extracted document text.`}
          />
        )}
      </ToolShell>
  );
}

export function PdfBookmarkExtractorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  async function handleExtract() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const outline = (await pdf.getOutline()) as PdfOutlineNode[] | null;
      if (!outline?.length) {
        setOutput("No bookmarks or outline entries were found in this PDF.");
      } else {
        setOutput(flattenOutline(outline).join("\n"));
      }
      setError("");
    } catch {
      setError("Unable to read bookmark data from this PDF.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="PDF Bookmark Extractor" description="Read bookmark or outline entries from supported PDFs locally and review the document navigation structure.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleExtract} disabled={!file}>
        Extract bookmarks
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload a PDF to inspect bookmarks" description="This tool reads outline entries locally when the PDF includes bookmark data." />
      ) : output ? (
        <>
          <OutputBlock title="Bookmark outline" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("bookmark outline", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function PdfPageSizeCheckerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  async function handleCheck() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      const { PDFDocument } = await getPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const lines = pdf.getPages().map((page, index) => {
        const { width, height } = page.getSize();
        return `Page ${index + 1}: ${width.toFixed(2)} x ${height.toFixed(2)} pt | ${formatPdfPointsToInches(width)} x ${formatPdfPointsToInches(height)} in | ${formatPdfPointsToMillimeters(width)} x ${formatPdfPointsToMillimeters(height)} mm | ${detectCommonPageSize(width, height)}`;
      });
      setOutput(lines.join("\n"));
      setError("");
    } catch {
      setError("Unable to read page size details from this PDF.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="PDF Page Size Checker" description="Check each PDF page size locally and compare dimensions against common paper-size labels like A4 and Letter.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleCheck} disabled={!file}>
        Check page sizes
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload a PDF to inspect page sizes" description="The checker reads page dimensions locally and reports each page with point, inch, and millimeter values." />
      ) : output ? (
        <>
          <OutputBlock title="Page size report" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("page size report", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function PdfPageCounterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  async function handleCount() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      const { PDFDocument } = await getPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      setSummary(`File: ${file.name}\nPages: ${pdf.getPageCount()}\nFile size: ${formatFileSize(file.size)}`);
      setError("");
    } catch {
      setError("Unable to count pages in this PDF.");
      setSummary("");
    }
  }

  return (
    <ToolShell title="PDF Page Counter" description="Count the total pages in an uploaded PDF locally before splitting, merging, or sharing the document.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleCount} disabled={!file}>
        Count pages
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload a PDF to count its pages" description="This lightweight browser-side utility reads the total page count and a few basic file details." />
      ) : summary ? (
        <>
          <OutputBlock title="Page count summary" value={summary} />
          <button type="button" className={buttonClass} onClick={() => copy("page count summary", summary)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}
