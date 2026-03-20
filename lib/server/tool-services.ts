import "server-only";

import { lookup, resolve4, resolve6, resolveCaa, resolveCname, resolveMx, resolveNs, resolveSoa, resolveSrv, resolveTxt } from "node:dns/promises";
import { isIP } from "node:net";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

type JsonRecord = Record<string, unknown>;
type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: string; code: string };
type UploadedFileOptions = {
  label?: string;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxBytes?: number;
};
type RateLimitOptions = {
  key: string;
  windowMs: number;
  maxRequests: number;
  message?: string;
};
type FetchTimeoutOptions = RequestInit & {
  timeoutMs?: number;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

const blockedHostnames = new Set(["localhost", "localhost.localdomain"]);
const blockedHostnameSuffixes = [".localhost", ".local", ".internal", ".home", ".home.arpa"];
const MAX_PUBLIC_FILE_BYTES = 25 * 1024 * 1024;
const DEFAULT_FETCH_TIMEOUT_MS = 12_000;
const RATE_LIMIT_TIMEOUT_MS = 5_000;

export class ToolServiceError extends Error {
  status: number;
  code: string;
  headers?: HeadersInit;
  extra?: JsonRecord;

  constructor(message: string, options?: { status?: number; code?: string; headers?: HeadersInit; extra?: JsonRecord }) {
    super(message);
    this.name = "ToolServiceError";
    this.status = options?.status ?? 400;
    this.code = options?.code ?? "REQUEST_FAILED";
    this.headers = options?.headers;
    this.extra = options?.extra;
  }
}

export function jsonSuccess<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data } satisfies ApiSuccess<T>, init);
}

export function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ToolServiceError("Enter a valid website URL first.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new ToolServiceError("Only HTTP and HTTPS website URLs are supported.");
  }

  return url;
}

export async function normalizePublicHttpUrl(value: string) {
  const url = normalizeHttpUrl(value);
  await assertSafePublicTarget(url);
  return url;
}

export function jsonError(errorOrMessage: unknown, fallbackMessage = "Something went wrong.", status = 400, extra?: JsonRecord) {
  if (errorOrMessage instanceof ToolServiceError) {
    return Response.json(
      {
        ok: false,
        error: errorOrMessage.message,
        code: errorOrMessage.code,
        ...errorOrMessage.extra,
        ...extra,
      } satisfies ApiFailure & JsonRecord,
      { status: errorOrMessage.status, headers: errorOrMessage.headers },
    );
  }

  const message = errorOrMessage instanceof Error ? errorOrMessage.message : fallbackMessage;
  return Response.json(
    { ok: false, error: message || fallbackMessage, code: "REQUEST_FAILED", ...extra } satisfies ApiFailure & JsonRecord,
    { status },
  );
}

export function requireEnvVar(name: string, unavailableMessage: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ToolServiceError(unavailableMessage, {
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  }
  return value;
}

function getRateLimitBackendConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

function getClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) {
    return cfIp;
  }

  return "unknown";
}

async function incrementDurableRateLimit(key: string, ttlMs: number) {
  const backend = getRateLimitBackendConfig();
  if (!backend) {
    if (process.env.NODE_ENV === "production") {
      throw new ToolServiceError("Rate limiting is not configured on this deployment yet.", {
        status: 503,
        code: "SERVICE_UNAVAILABLE",
      });
    }

    return { count: 1 };
  }

  const response = await fetchWithTimeout(`${backend.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${backend.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, ttlMs],
    ]),
    timeoutMs: RATE_LIMIT_TIMEOUT_MS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ToolServiceError("The rate-limit service is temporarily unavailable.", {
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  }

  const payload = (await response.json()) as Array<{ result?: number | string }>;
  const count = Number(payload[0]?.result ?? 0);
  if (!Number.isFinite(count) || count < 1) {
    throw new ToolServiceError("The rate-limit service returned an unreadable response.", {
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  }

  return { count };
}

export async function enforceRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const bucket = Math.floor(now / options.windowMs);
  const resetAt = (bucket + 1) * options.windowMs;
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
  const clientKey = `${options.key}:${getClientAddress(request)}:${bucket}`;
  const { count } = await incrementDurableRateLimit(clientKey, options.windowMs + 5_000);

  if (count > options.maxRequests) {
    throw new ToolServiceError(
      options.message ?? "Too many requests from this connection. Please wait a moment and try again.",
      {
        status: 429,
        code: "RATE_LIMITED",
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
        extra: {
          retryAfterSeconds,
        },
      },
    );
  }
}

export async function fetchWithTimeout(input: string | URL, init: FetchTimeoutOptions = {}) {
  const controller = new AbortController();
  const timeoutMs = init.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ToolServiceError("That request took too long to complete. Please try again.", {
        status: 504,
        code: "UPSTREAM_TIMEOUT",
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function formatByteLimit(maxBytes: number) {
  if (maxBytes >= 1024 * 1024) {
    return `${Math.round((maxBytes / (1024 * 1024)) * 10) / 10} MB`;
  }
  if (maxBytes >= 1024) {
    return `${Math.round(maxBytes / 1024)} KB`;
  }
  return `${maxBytes} bytes`;
}

function hasAllowedExtension(fileName: string, allowedExtensions: string[]) {
  const lowerName = fileName.toLowerCase();
  return allowedExtensions.some((extension) => lowerName.endsWith(extension.toLowerCase()));
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  return blockedHostnames.has(normalized) || blockedHostnameSuffixes.some((suffix) => normalized.endsWith(suffix));
}

function isPrivateIpv4(address: string) {
  const [a, b] = address.split(".").map((part) => Number(part));
  if ([a, b].some((part) => Number.isNaN(part))) return true;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.") ||
    normalized.startsWith("::ffff:172.")
  );
}

function assertPublicIpAddress(address: string) {
  const family = isIP(address);
  if (!family) {
    throw new ToolServiceError("Enter a valid public website URL.");
  }

  if ((family === 4 && isPrivateIpv4(address)) || (family === 6 && isPrivateIpv6(address))) {
    throw new ToolServiceError("Private, localhost, and internal network targets are not allowed.", {
      status: 400,
      code: "UNSAFE_TARGET",
    });
  }
}

async function assertSafePublicTarget(url: URL) {
  if (url.username || url.password) {
    throw new ToolServiceError("Authenticated URLs are not allowed.");
  }

  if (isBlockedHostname(url.hostname)) {
    throw new ToolServiceError("Localhost and internal network targets are not allowed.", {
      status: 400,
      code: "UNSAFE_TARGET",
    });
  }

  if (isIP(url.hostname)) {
    assertPublicIpAddress(url.hostname);
    return;
  }

  let resolved;
  try {
    resolved = await lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw new ToolServiceError("Enter a valid public website URL.");
  }

  if (!resolved.length) {
    throw new ToolServiceError("Enter a valid public website URL.");
  }

  resolved.forEach((entry) => assertPublicIpAddress(entry.address));
}

export async function readUploadedFile(formData: FormData, fieldName: string, options: UploadedFileOptions = {}) {
  const file = formData.get(fieldName);
  if (!(file instanceof File)) {
    throw new ToolServiceError("Upload a file before running this tool.");
  }

  const label = options.label ?? "file";
  if (!file.size) {
    throw new ToolServiceError(`The uploaded ${label} is empty.`);
  }
  if (file.size > MAX_PUBLIC_FILE_BYTES) {
    throw new ToolServiceError(`The uploaded ${label} is too large for this tool. Keep it under ${formatByteLimit(MAX_PUBLIC_FILE_BYTES)}.`);
  }
  if (options.maxBytes && file.size > options.maxBytes) {
    throw new ToolServiceError(`The uploaded ${label} is too large. Keep it under ${formatByteLimit(options.maxBytes)}.`);
  }
  if (options.allowedMimeTypes?.length && !options.allowedMimeTypes.includes(file.type)) {
    if (!options.allowedExtensions?.length || !hasAllowedExtension(file.name, options.allowedExtensions)) {
      throw new ToolServiceError(`Upload a supported ${label} file.`);
    }
  }
  if (options.allowedExtensions?.length && !hasAllowedExtension(file.name, options.allowedExtensions)) {
    throw new ToolServiceError(`Upload a supported ${label} file.`);
  }

  return file;
}

function splitParagraphs(text: string) {
  return text
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function wrapText(font: Awaited<ReturnType<PDFDocument["embedFont"]>>, text: string, fontSize: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
      continue;
    }

    lines.push(word);
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

export async function convertWordToPdf(file: File) {
  const isDocx =
    file.name.toLowerCase().endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (!isDocx) {
    throw new ToolServiceError("Upload a DOCX Word document to continue.");
  }

  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const rawText = result.value.trim();
  if (!rawText) {
    throw new ToolServiceError("This Word document did not contain readable text for the current PDF export.");
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize = { width: 595.28, height: 841.89 };
  const margin = 48;
  const bodyFontSize = 11;
  const lineHeight = 16;
  let page = pdf.addPage([pageSize.width, pageSize.height]);
  let cursorY = pageSize.height - margin;

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY - requiredHeight >= margin) {
      return;
    }
    page = pdf.addPage([pageSize.width, pageSize.height]);
    cursorY = pageSize.height - margin;
  };

  const paragraphs = splitParagraphs(rawText);
  paragraphs.forEach((paragraph, index) => {
    const isHeading = paragraph.length < 90 && /^[A-Z0-9\s\-:]+$/.test(paragraph);
    const activeFont = isHeading ? titleFont : font;
    const activeSize = isHeading ? 14 : bodyFontSize;
    const lines = wrapText(activeFont, paragraph, activeSize, pageSize.width - margin * 2);
    ensureSpace(lines.length * lineHeight + lineHeight);

    lines.forEach((line) => {
      page.drawText(line, {
        x: margin,
        y: cursorY,
        font: activeFont,
        size: activeSize,
        color: rgb(0.12, 0.15, 0.19),
      });
      cursorY -= lineHeight;
    });

    cursorY -= index === paragraphs.length - 1 ? 0 : lineHeight * 0.6;
  });

  const bytes = await pdf.save({ useObjectStreams: true });
  return {
    bytes,
    text: rawText,
    name: `${file.name.replace(/\.docx$/i, "")}.pdf`,
  };
}

export async function convertPdfToWord(file: File) {
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    throw new ToolServiceError("Upload a PDF file to continue.");
  }

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const strings = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean);

    pageTexts.push(strings.join(" ").trim());
  }

  const text = pageTexts.filter(Boolean).join("\n\n").trim();
  if (!text) {
    throw new ToolServiceError("No selectable text was found in this PDF. Try the PDF OCR tool for scanned pages.");
  }

  const doc = new Document({
    sections: [
      {
        children: splitParagraphs(text).map((paragraph) =>
          new Paragraph({
            children: [new TextRun(paragraph)],
          }),
        ),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return {
    bytes: new Uint8Array(buffer),
    text,
    name: `${file.name.replace(/\.pdf$/i, "")}.docx`,
  };
}

export async function compressPdf(file: File) {
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    throw new ToolServiceError("Upload a PDF file to continue.");
  }

  const source = await PDFDocument.load(await file.arrayBuffer());
  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(source, source.getPageIndices());
  copiedPages.forEach((page) => output.addPage(page));
  output.setTitle("");
  output.setSubject("");
  output.setKeywords([]);
  output.setProducer("Toolbox Hub Server PDF Compressor");

  const bytes = await output.save({ useObjectStreams: true });
  return {
    bytes,
    name: `${file.name.replace(/\.pdf$/i, "")}-optimized.pdf`,
  };
}

export async function lookupDnsRecords(hostname: string) {
  const cleanHost = hostname.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  if (!cleanHost) {
    throw new ToolServiceError("Enter a valid hostname first.");
  }
  if (!/^(?=.{1,253}$)[a-z0-9.-]+$/i.test(cleanHost) || cleanHost.includes("..")) {
    throw new ToolServiceError("Enter a valid public hostname first.");
  }
  if (isBlockedHostname(cleanHost) || isIP(cleanHost)) {
    throw new ToolServiceError("Localhost, private IPs, and internal network targets are not allowed.", {
      status: 400,
      code: "UNSAFE_TARGET",
    });
  }

  const [a, aaaa, mx, ns, txt, cname, caa, srv, soa] = await Promise.allSettled([
    resolve4(cleanHost),
    resolve6(cleanHost),
    resolveMx(cleanHost),
    resolveNs(cleanHost),
    resolveTxt(cleanHost),
    resolveCname(cleanHost),
    resolveCaa(cleanHost),
    resolveSrv(cleanHost),
    resolveSoa(cleanHost),
  ]);

  const unwrap = <T,>(result: PromiseSettledResult<T>, fallback: T) =>
    result.status === "fulfilled" ? result.value : fallback;

  return {
    hostname: cleanHost,
    a: unwrap(a, [] as string[]),
    aaaa: unwrap(aaaa, [] as string[]),
    mx: unwrap(mx, [] as Awaited<ReturnType<typeof resolveMx>>),
    ns: unwrap(ns, [] as string[]),
    txt: unwrap(txt, [] as string[][]),
    cname: unwrap(cname, [] as string[]),
    caa: unwrap(caa, [] as Awaited<ReturnType<typeof resolveCaa>>),
    srv: unwrap(srv, [] as Awaited<ReturnType<typeof resolveSrv>>),
    soa: soa.status === "fulfilled" ? soa.value : null,
  };
}

export async function fetchPageSpeedReport(url: string) {
  const normalizedUrl = await normalizePublicHttpUrl(url);
  const apiKey = process.env.PAGESPEED_API_KEY?.trim();
  const query = new URLSearchParams();
  query.set("url", normalizedUrl.toString());
  query.set("strategy", "mobile");
  ["performance", "accessibility", "best-practices", "seo"].forEach((category) => query.append("category", category));
  if (apiKey) {
    query.set("key", apiKey);
  }

  const response = await fetchWithTimeout(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${query.toString()}`, {
    next: { revalidate: 1800 },
    timeoutMs: 20_000,
  });

  if (!response.ok) {
    throw new ToolServiceError(
      apiKey
        ? "The website speed service could not return a report for that URL right now."
        : "The website speed service is temporarily unavailable. Add a PageSpeed API key or try again later.",
      { status: response.status === 429 ? 503 : 502, code: "UPSTREAM_UNAVAILABLE" },
    );
  }

  return (await response.json()) as Record<string, unknown>;
}

export function summarizePageSpeedReport(report: Record<string, unknown>) {
  const lighthouse = (report.lighthouseResult ?? {}) as Record<string, unknown>;
  const categories = (lighthouse.categories ?? {}) as Record<string, { score?: number }>;
  const audits = (lighthouse.audits ?? {}) as Record<string, { title?: string; displayValue?: string; score?: number; description?: string }>;

  return {
    finalUrl: String(report.id ?? ""),
    performanceScore: Math.round((categories.performance?.score ?? 0) * 100),
    accessibilityScore: Math.round((categories.accessibility?.score ?? 0) * 100),
    bestPracticesScore: Math.round((categories["best-practices"]?.score ?? 0) * 100),
    seoScore: Math.round((categories.seo?.score ?? 0) * 100),
    metrics: {
      firstContentfulPaint: audits["first-contentful-paint"]?.displayValue ?? "Unavailable",
      largestContentfulPaint: audits["largest-contentful-paint"]?.displayValue ?? "Unavailable",
      totalBlockingTime: audits["total-blocking-time"]?.displayValue ?? "Unavailable",
      cumulativeLayoutShift: audits["cumulative-layout-shift"]?.displayValue ?? "Unavailable",
      speedIndex: audits["speed-index"]?.displayValue ?? "Unavailable",
      interactive: audits.interactive?.displayValue ?? "Unavailable",
    },
    notes: [
      audits["uses-responsive-images"]?.title,
      audits.viewport?.title,
      audits["font-size"]?.title,
      audits["tap-targets"]?.title,
    ].filter(Boolean),
    rawAudits: audits,
  };
}

export async function fetchScreenshot(url: string) {
  const normalizedUrl = await normalizePublicHttpUrl(url);
  const serviceUrl = requireEnvVar(
    "SCREENSHOT_SERVICE_URL",
    "Website screenshots are not enabled on this deployment yet.",
  );
  const screenshotUrl = new URL(serviceUrl);
  screenshotUrl.searchParams.set("url", normalizedUrl.toString());
  const response = await fetchWithTimeout(screenshotUrl, {
    next: { revalidate: 3600 },
    headers: (() => {
      const headerName = process.env.SCREENSHOT_SERVICE_AUTH_HEADER?.trim();
      const headerValue = process.env.SCREENSHOT_SERVICE_API_KEY?.trim();
      return headerName && headerValue ? { [headerName]: headerValue } : {};
    })(),
    timeoutMs: 20_000,
  });

  if (!response.ok) {
    throw new ToolServiceError("The website screenshot service could not capture that page right now.", {
      status: 502,
      code: "UPSTREAM_UNAVAILABLE",
    });
  }

  return {
    contentType: response.headers.get("content-type") || "image/png",
    bytes: new Uint8Array(await response.arrayBuffer()),
    name: `${normalizedUrl.hostname.replace(/[^a-z0-9.-]+/gi, "-")}-screenshot.png`,
  };
}

export async function analyzeMobileFriendliness(url: string) {
  const normalizedUrl = await normalizePublicHttpUrl(url);
  const [pageSpeed, htmlResponse] = await Promise.all([
    fetchPageSpeedReport(normalizedUrl.toString()),
    fetchWithTimeout(normalizedUrl.toString(), { next: { revalidate: 1800 }, timeoutMs: 10_000 }),
  ]);

  const summary = summarizePageSpeedReport(pageSpeed);
  const html = htmlResponse.ok ? await htmlResponse.text() : "";
  const hasViewportMeta = /<meta[^>]+name=["']viewport["']/i.test(html);
  const flags = [
    { label: "Viewport meta tag present", passed: hasViewportMeta },
    { label: "Accessibility score >= 85", passed: summary.accessibilityScore >= 85 },
    { label: "SEO score >= 85", passed: summary.seoScore >= 85 },
    { label: "Performance score >= 60", passed: summary.performanceScore >= 60 },
  ];
  const passed = flags.filter((flag) => flag.passed).length;

  return {
    finalUrl: summary.finalUrl,
    hasViewportMeta,
    performanceScore: summary.performanceScore,
    accessibilityScore: summary.accessibilityScore,
    seoScore: summary.seoScore,
    flags,
    verdict:
      passed >= 3
        ? "Likely mobile friendly"
        : passed === 2
          ? "Mixed mobile signals"
          : "Needs mobile improvements",
    notes: summary.notes,
  };
}

export async function removeImageBackground(file: File) {
  const apiKey = requireEnvVar(
    "REMOVE_BG_API_KEY",
    "Background removal is not enabled on this deployment yet.",
  );

  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");
  formData.append("format", "png");

  const response = await fetchWithTimeout("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
    timeoutMs: 20_000,
  });

  if (!response.ok) {
    throw new ToolServiceError("The background-removal service could not process that image right now.", {
      status: 502,
      code: "UPSTREAM_UNAVAILABLE",
    });
  }

  return {
    contentType: response.headers.get("content-type") || "image/png",
    bytes: new Uint8Array(await response.arrayBuffer()),
    name: `${file.name.replace(/\.[^.]+$/, "")}-no-background.png`,
  };
}

export async function runPdfOcr(file: File) {
  const apiKey = requireEnvVar(
    "OCR_SPACE_API_KEY",
    "PDF OCR is not enabled on this deployment yet.",
  );

  const formData = new FormData();
  formData.append("file", file);
  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2");
  formData.append("scale", "true");
  formData.append("language", "eng");
  formData.append("filetype", "PDF");

  const response = await fetchWithTimeout("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      apikey: apiKey,
    },
    body: formData,
    timeoutMs: 25_000,
  });

  if (!response.ok) {
    throw new ToolServiceError("The OCR service could not process that PDF right now.", {
      status: 502,
      code: "UPSTREAM_UNAVAILABLE",
    });
  }

  const data = (await response.json()) as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string[] | string;
    ParsedResults?: Array<{ ParsedText?: string }>;
  };

  if (data.IsErroredOnProcessing) {
    const message = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(" ") : data.ErrorMessage;
    throw new ToolServiceError(message || "OCR processing failed for this PDF.");
  }

  const text = (data.ParsedResults ?? [])
    .map((result) => result.ParsedText?.trim() ?? "")
    .filter(Boolean)
    .join("\n\n")
    .trim();

  if (!text) {
    throw new ToolServiceError("OCR completed, but no readable text was returned.");
  }

  return text;
}
