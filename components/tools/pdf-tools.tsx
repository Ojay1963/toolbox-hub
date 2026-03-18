"use client";

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
} from "@/components/tools/common";

type DownloadItem = {
  name: string;
  url: string;
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

  useEffect(() => () => {
    if (download) URL.revokeObjectURL(download.url);
  }, [download]);

  async function handleCompress() {
    if (!file) {
      setError("Upload a PDF file first.");
      return;
    }

    try {
      if (download) URL.revokeObjectURL(download.url);
      const { PDFDocument } = await getPdfLib();
      const source = await PDFDocument.load(await file.arrayBuffer());
      const output = await PDFDocument.create();
      const copiedPages = await output.copyPages(source, source.getPageIndices());
      copiedPages.forEach((page) => output.addPage(page));

      output.setTitle("");
      output.setSubject("");
      output.setKeywords([]);
      output.setProducer("Toolbox Hub PDF Compressor");

      const bytes = await output.save({ useObjectStreams: true });
      const nextDownload = await pdfBytesToDownload(bytes, `${file.name.replace(/\.pdf$/i, "")}-optimized.pdf`);
      setDownload(nextDownload);
      setResultText(`Original size: ${formatFileSize(file.size)}\nOptimized size: ${formatFileSize(bytes.length)}`);
      setError("");
    } catch {
      setError("Unable to optimize this PDF.");
    }
  }

  return (
    <ToolShell title="PDF Compressor" description="Run a basic local PDF optimization pass. This can help some files, but browser-side compression will not reduce every PDF equally well.">
      <Field label="PDF file">
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Notice>Reduced-scope local optimization only. This tool re-saves the PDF cleanly and can reduce size in some cases, but it is not a full desktop-grade PDF compressor.</Notice>
      <button type="button" className={buttonClass} onClick={handleCompress} disabled={!file}>
        Optimize PDF
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
  return (
    <ToolShell title="Protect PDF" description="Password-protecting PDFs reliably is not yet available in this browser-only implementation.">
      <Notice>
        Coming soon. Reliable PDF password protection is not practical with the current no-API,
        browser-only tool stack, so this page stays honest instead of pretending to encrypt files.
      </Notice>
      <EmptyState title="No fake PDF protection here" description="If a robust local encryption workflow becomes practical in this project, it can be added without changing the route or SEO structure." />
    </ToolShell>
  );
}
