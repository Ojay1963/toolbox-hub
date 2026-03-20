"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  buttonClass,
  EmptyState,
  Field,
  formatNumber,
  inputClass,
  Notice,
  OutputBlock,
  secondaryButtonClass,
  textareaClass,
  ToolShell,
  useCopyToClipboard,
} from "@/components/tools/common";

type BrowserNetworkInfo = {
  online: string;
  language: string;
  platform: string;
  cookiesEnabled: string;
  host: string;
  connectionType?: string;
  effectiveType?: string;
  downlink?: string;
  rtt?: string;
};

type ConnectionLike = {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
};

function readBrowserNetworkInfo(): BrowserNetworkInfo {
  const navigatorConnection = (
    navigator as Navigator & {
      connection?: ConnectionLike;
      mozConnection?: ConnectionLike;
      webkitConnection?: ConnectionLike;
    }
  ).connection ??
    (navigator as Navigator & { mozConnection?: ConnectionLike }).mozConnection ??
    (navigator as Navigator & { webkitConnection?: ConnectionLike }).webkitConnection;

  return {
    online: navigator.onLine ? "Online" : "Offline",
    language: navigator.language || "Unknown",
    platform: navigator.platform || "Unknown",
    cookiesEnabled: navigator.cookieEnabled ? "Enabled" : "Disabled",
    host: window.location.hostname || "Local environment",
    connectionType: navigatorConnection?.type,
    effectiveType: navigatorConnection?.effectiveType,
    downlink:
      typeof navigatorConnection?.downlink === "number"
        ? `${navigatorConnection.downlink} Mb/s`
        : undefined,
    rtt:
      typeof navigatorConnection?.rtt === "number"
        ? `${navigatorConnection.rtt} ms`
        : undefined,
  };
}

function extractCandidateAddress(candidate: string) {
  const match = candidate.match(
    /candidate:\S+\s+\d+\s+\S+\s+\d+\s+([a-fA-F0-9:.]+)\s+\d+\s+typ\s+(host|srflx|relay)/,
  );
  if (!match) {
    return null;
  }

  return {
    address: match[1],
    type: match[2],
  };
}

async function collectBrowserIpCandidates() {
  const constructor = window.RTCPeerConnection;
  if (!constructor) {
    return [];
  }

  const connection = new constructor({ iceServers: [] });
  const addresses = new Map<string, string>();

  try {
    connection.createDataChannel("probe");
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    await new Promise<void>((resolve) => {
      const timer = window.setTimeout(() => resolve(), 1200);

      connection.onicecandidate = (event) => {
        if (!event.candidate?.candidate) {
          window.clearTimeout(timer);
          resolve();
          return;
        }

        const extracted = extractCandidateAddress(event.candidate.candidate);
        if (extracted) {
          addresses.set(extracted.address, extracted.type);
        }
      };
    });
  } finally {
    connection.close();
  }

  return Array.from(addresses.entries()).map(([address, type]) => ({ address, type }));
}

const mimeReference: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  svg: ["image/svg+xml"],
  pdf: ["application/pdf"],
  txt: ["text/plain"],
  html: ["text/html"],
  css: ["text/css"],
  js: ["text/javascript", "application/javascript"],
  json: ["application/json"],
  csv: ["text/csv"],
  xml: ["application/xml", "text/xml"],
  mp3: ["audio/mpeg"],
  mp4: ["video/mp4"],
  zip: ["application/zip"],
};

type UrlCheckResult = {
  finalUrl?: string;
  status?: number;
  statusText?: string;
  redirected?: boolean;
  type?: string;
  location?: string;
};

type ParsedUserAgent = {
  browser: string;
  browserVersion: string;
  engine: string;
  os: string;
  deviceType: string;
  raw: string;
};

async function getApiError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || "This service is temporarily unavailable. Please try again shortly.";
  } catch {
    return "This service is temporarily unavailable. Please try again shortly.";
  }
}

function normalizeTargetUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Enter a full URL to check.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

async function checkUrlStatus(targetUrl: string): Promise<UrlCheckResult> {
  const response = await fetch(targetUrl, {
    method: "GET",
    redirect: "follow",
    mode: "cors",
    cache: "no-store",
  });

  return {
    finalUrl: response.url,
    status: response.status,
    statusText: response.statusText,
    redirected: response.redirected,
    type: response.type,
  };
}

async function checkUrlRedirect(targetUrl: string): Promise<UrlCheckResult> {
  const response = await fetch(targetUrl, {
    method: "GET",
    redirect: "manual",
    mode: "cors",
    cache: "no-store",
  });

  const location = response.headers.get("location") || undefined;

  return {
    finalUrl: response.url,
    status: response.status,
    statusText: response.statusText,
    redirected: response.redirected,
    type: response.type,
    location,
  };
}

async function fetchWebpageSource(targetUrl: string) {
  const response = await fetch(targetUrl, {
    method: "GET",
    mode: "cors",
    cache: "no-store",
    redirect: "follow",
  });

  return {
    finalUrl: response.url,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get("content-type") || "Unavailable",
    source: await response.text(),
  };
}

function parseUserAgent(userAgent: string): ParsedUserAgent {
  const value = userAgent.trim();
  if (!value) {
    throw new Error("Paste a user agent string first.");
  }

  const browserMatchers = [
    { name: "Microsoft Edge", pattern: /(Edg|Edge)\/([\d.]+)/ },
    { name: "Opera", pattern: /(OPR)\/([\d.]+)/ },
    { name: "Google Chrome", pattern: /(Chrome)\/([\d.]+)/ },
    { name: "Mozilla Firefox", pattern: /(Firefox)\/([\d.]+)/ },
    { name: "Safari", pattern: /Version\/([\d.]+).*Safari/ },
  ];

  let browser = "Unknown browser";
  let browserVersion = "Unknown";

  for (const matcher of browserMatchers) {
    const match = value.match(matcher.pattern);
    if (match) {
      browser = matcher.name;
      browserVersion = match[2] ?? match[1] ?? "Unknown";
      break;
    }
  }

  const engine = /AppleWebKit/i.test(value)
    ? "WebKit"
    : /Gecko\//i.test(value)
      ? "Gecko"
      : /Trident/i.test(value)
        ? "Trident"
        : "Unknown engine";

  const os = /Windows NT 10/i.test(value)
    ? "Windows 10/11"
    : /Windows NT/i.test(value)
      ? "Windows"
      : /Android/i.test(value)
        ? "Android"
        : /iPhone|iPad|iPod/i.test(value)
          ? "iOS"
          : /Mac OS X|Macintosh/i.test(value)
            ? "macOS"
            : /Linux/i.test(value)
              ? "Linux"
              : "Unknown OS";

  const deviceType = /Mobile|iPhone|Android/i.test(value)
    ? "Mobile"
    : /iPad|Tablet/i.test(value)
      ? "Tablet"
      : "Desktop";

  return {
    browser,
    browserVersion,
    engine,
    os,
    deviceType,
    raw: value,
  };
}

export function IpAddressLookupTool() {
  const [browserInfo, setBrowserInfo] = useState<BrowserNetworkInfo | null>(null);
  const [candidates, setCandidates] = useState<Array<{ address: string; type: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    setBrowserInfo(readBrowserNetworkInfo());
  }, []);

  const candidateOutput = useMemo(
    () => candidates.map((item) => `${item.address} (${item.type})`).join("\n"),
    [candidates],
  );

  async function handleInspect() {
    setLoading(true);
    setError("");

    try {
      setBrowserInfo(readBrowserNetworkInfo());
      const nextCandidates = await collectBrowserIpCandidates();
      setCandidates(nextCandidates);
      if (!nextCandidates.length) {
        setError(
          "No browser-visible IP candidates were exposed. This is normal on many networks and browsers.",
        );
      }
    } catch {
      setCandidates([]);
      setError("This browser did not expose local network candidates for inspection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      title="IP Address Lookup"
      description="Inspect browser-visible network information locally. This reduced-scope tool does not claim public IP or geolocation lookups without an external service."
    >
      <Notice>
        Reduced scope only. This page can show browser-visible network details and possible local
        IP candidates, but it does not perform a real public-IP lookup.
      </Notice>
      <button type="button" className={buttonClass} onClick={handleInspect} disabled={loading}>
        {loading ? "Inspecting browser network info..." : "Inspect browser network info"}
      </button>
      {browserInfo ? (
        <div className="grid gap-4 md:grid-cols-2">
          <OutputBlock title="Status" value={browserInfo.online} multiline={false} />
          <OutputBlock title="Language" value={browserInfo.language} multiline={false} />
          <OutputBlock title="Platform" value={browserInfo.platform} multiline={false} />
          <OutputBlock title="Cookies" value={browserInfo.cookiesEnabled} multiline={false} />
          <OutputBlock title="Current host" value={browserInfo.host} multiline={false} />
          <OutputBlock
            title="Connection hints"
            value={[
              browserInfo.connectionType ? `Type: ${browserInfo.connectionType}` : "",
              browserInfo.effectiveType ? `Effective type: ${browserInfo.effectiveType}` : "",
              browserInfo.downlink ? `Downlink: ${browserInfo.downlink}` : "",
              browserInfo.rtt ? `RTT: ${browserInfo.rtt}` : "",
            ]
              .filter(Boolean)
              .join(" | ") || "No additional connection hints exposed by this browser."}
            multiline={false}
          />
        </div>
      ) : (
        <EmptyState
          title="Inspect local browser network info"
          description="Run the tool to read the limited network details this browser exposes."
        />
      )}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {candidateOutput ? (
        <>
          <OutputBlock title="Possible browser-visible IP candidates" value={candidateOutput} />
          <button
            type="button"
            className={buttonClass}
            onClick={() => copy("IP candidate list", candidateOutput)}
          >
            Copy candidate list
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : (
        <EmptyState
          title="No IP candidates exposed yet"
          description="Many browsers no longer expose local or public IP candidates, so an empty result is expected on some devices."
        />
      )}
    </ToolShell>
  );
}

export function DnsLookupTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  async function handleLookup() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/tools/dns-lookup?hostname=${encodeURIComponent(input.trim())}`);
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }
      const payload = (await response.json()) as { ok: true; data: Record<string, unknown> };
      setResult(payload.data);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "DNS lookup is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  const output = result ? JSON.stringify(result, null, 2) : "";

  return (
    <ToolShell
      title="DNS Lookup"
      description="Look up common DNS records through a server route so the browser can inspect host information without faking results."
    >
      <Field label="Hostname" hint="Enter a hostname such as example.com. Protocols and paths are ignored automatically.">
        <input className={inputClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="example.com" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleLookup} disabled={!input.trim() || loading}>
        {loading ? "Looking up DNS..." : "Lookup DNS"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input.trim() ? (
        <EmptyState title="Enter a hostname to inspect DNS records" description="This server route can resolve common DNS records such as A, AAAA, MX, TXT, NS, CNAME, and SOA." />
      ) : result ? (
        <>
          <OutputBlock title="DNS records" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("DNS records", output)}>Copy records</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

function StatusCheckTool({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<UrlCheckResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  async function handleCheck() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const targetUrl = normalizeTargetUrl(input);
      const nextResult = await checkUrlStatus(targetUrl);
      setResult(nextResult);
    } catch (checkError) {
      setError(
        checkError instanceof Error
          ? `${checkError.message} Browser checks also depend on the target allowing CORS, so some live URLs cannot be inspected from this page.`
          : "Unable to check that URL from the browser.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title={title} description={description}>
      <Notice>
        Reduced scope only. Browser-based checks work only for URLs that allow cross-origin requests.
        Many sites will block this, and blocked results are reported honestly instead of guessed.
      </Notice>
      <Field label="URL to check" hint="Enter a full URL or hostname. HTTPS is added automatically when missing.">
        <input className={inputClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://example.com" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleCheck} disabled={loading}>
        {loading ? "Checking status..." : "Check status"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input.trim() ? (
        <EmptyState title="Enter a URL to inspect it" description="The tool will attempt a real browser fetch and only show a status when the target allows that request." />
      ) : result ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <OutputBlock title="HTTP status" value={result.status ? `${result.status} ${result.statusText ?? ""}`.trim() : "Unavailable"} multiline={false} />
            <OutputBlock title="Final URL" value={result.finalUrl || "Unavailable"} multiline={false} />
            <OutputBlock title="Fetch type" value={result.type || "Unavailable"} multiline={false} />
            <OutputBlock title="Redirected" value={result.redirected ? "Yes" : "No"} multiline={false} />
          </div>
          <button
            type="button"
            className={buttonClass}
            onClick={() =>
              copy(
                "status result",
                JSON.stringify(
                  {
                    status: result.status,
                    statusText: result.statusText,
                    finalUrl: result.finalUrl,
                    type: result.type,
                    redirected: result.redirected,
                  },
                  null,
                  2,
                ),
              )
            }
          >
            Copy result
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function HttpStatusCodeCheckerTool() {
  return (
    <StatusCheckTool
      title="HTTP Status Code Checker"
      description="Check a URL status from the browser when the target site allows it. This reduced-scope version does not fake results for blocked URLs."
    />
  );
}

export function UrlStatusCheckerTool() {
  return (
    <StatusCheckTool
      title="URL Status Checker"
      description="Check reachable URL response status from the browser with honest cross-origin and visibility limits."
    />
  );
}

export function UrlRedirectCheckerTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<UrlCheckResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const targetUrl = normalizeTargetUrl(input);
      const nextResult = await checkUrlRedirect(targetUrl);
      setResult(nextResult);
      if (nextResult.type === "opaqueredirect") {
        setError("The browser detected a redirect response, but the redirect target is hidden by cross-origin restrictions.");
      }
    } catch (checkError) {
      setError(
        checkError instanceof Error
          ? `${checkError.message} Browser redirect checks are limited by CORS and may fail for many external URLs.`
          : "Unable to inspect redirects for that URL from the browser.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="URL Redirect Checker" description="Inspect redirect behavior where the browser can access it. This reduced-scope version reports only what the browser is allowed to expose.">
      <Notice>
        Reduced scope only. Full redirect-chain inspection usually needs a server. This page shows
        only the redirect details the browser can genuinely access for the entered URL.
      </Notice>
      <Field label="URL to inspect" hint="Enter a full URL or hostname. HTTPS is added automatically when missing.">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://example.com" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleCheck} disabled={loading}>
        {loading ? "Checking redirects..." : "Check redirects"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input.trim() ? (
        <EmptyState title="Enter a URL to inspect redirects" description="The tool will try a real browser request and report the redirect status only when the response is visible to the page." />
      ) : result ? (
        <div className="grid gap-4 md:grid-cols-2">
          <OutputBlock title="Response status" value={result.status ? `${result.status} ${result.statusText ?? ""}`.trim() : "Unavailable"} multiline={false} />
          <OutputBlock title="Response type" value={result.type || "Unavailable"} multiline={false} />
          <OutputBlock title="Response URL" value={result.finalUrl || "Unavailable"} multiline={false} />
          <OutputBlock title="Location header" value={result.location || "Not exposed"} multiline={false} />
        </div>
      ) : null}
    </ToolShell>
  );
}

export function WebpageSourceViewerTool() {
  const [input, setInput] = useState("");
  const [source, setSource] = useState("");
  const [meta, setMeta] = useState<{ finalUrl: string; status: string; contentType: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  async function handleFetch() {
    setLoading(true);
    setError("");
    setSource("");
    setMeta(null);

    try {
      const targetUrl = normalizeTargetUrl(input);
      const result = await fetchWebpageSource(targetUrl);
      setSource(result.source);
      setMeta({
        finalUrl: result.finalUrl,
        status: `${result.status} ${result.statusText}`.trim(),
        contentType: result.contentType,
      });
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? `${fetchError.message} Browsers can read remote page source only when the target allows CORS access.`
          : "Unable to fetch source for that URL from the browser.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="Webpage Source Viewer" description="Fetch visible webpage source from the browser when the remote site allows it. This reduced-scope version does not fake blocked results.">
      <Notice>
        Reduced scope only. This tool can read remote source only when the target allows browser access.
        Many websites block this through CORS, and blocked requests are reported honestly.
      </Notice>
      <Field label="URL to fetch" hint="Enter a full URL or hostname. HTTPS is added automatically when missing.">
        <input className={inputClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://example.com" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleFetch} disabled={loading}>
        {loading ? "Fetching source..." : "Fetch source"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input.trim() ? (
        <EmptyState title="Enter a URL to view its source" description="The tool will attempt a real browser fetch and only show source when the response is accessible to this page." />
      ) : source && meta ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <OutputBlock title="HTTP status" value={meta.status} multiline={false} />
            <OutputBlock title="Final URL" value={meta.finalUrl} multiline={false} />
            <OutputBlock title="Content type" value={meta.contentType} multiline={false} />
          </div>
          <Field label="Fetched source">
            <textarea className={`${textareaClass} min-h-72 font-mono`} value={source} readOnly />
          </Field>
          <button type="button" className={buttonClass} onClick={() => copy("page source", source)}>Copy source</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function WebsiteScreenshotTool() {
  const [input, setInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  async function handleCapture() {
    setLoading(true);
    setError("");

    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const response = await fetch(`/api/tools/website-screenshot-tool?url=${encodeURIComponent(input.trim())}`);
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }
      const blob = await response.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (captureError) {
      setPreviewUrl("");
      setError(captureError instanceof Error ? captureError.message : "Unable to capture a screenshot for that site.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="Website Screenshot Tool" description="Capture a website screenshot through a backend rendering service and review the image before downloading it.">
      <Field label="Website URL">
        <input className={inputClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://example.com" />
      </Field>
      <Notice>
        Server-assisted rendering. If screenshot capture is not enabled for this deployment, the page will
        show a clear unavailable message instead of a fake preview.
      </Notice>
      <button type="button" className={buttonClass} onClick={handleCapture} disabled={!input.trim() || loading}>
        {loading ? "Capturing screenshot..." : "Capture screenshot"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input.trim() ? (
        <EmptyState title="Enter a website URL to capture it" description="The backend will request a rendered screenshot and return it as an image download when available." />
      ) : previewUrl ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Screenshot preview</p>
            <img src={previewUrl} alt="Website screenshot preview" className="mt-3 w-full rounded-2xl border border-[color:var(--border)]" />
          </div>
          <a className={`${secondaryButtonClass} inline-flex`} href={previewUrl} download="website-screenshot.png">
            Download screenshot
          </a>
        </div>
      ) : null}
    </ToolShell>
  );
}

export function WebsiteSpeedTestTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    finalUrl: string;
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    seoScore: number;
    metrics: Record<string, string>;
    notes: string[];
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/tools/website-speed-test?url=${encodeURIComponent(input.trim())}`);
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }
      const payload = (await response.json()) as {
        ok: true;
        data: {
          finalUrl: string;
          performanceScore: number;
          accessibilityScore: number;
          bestPracticesScore: number;
          seoScore: number;
          metrics: Record<string, string>;
          notes: string[];
        };
      };
      setResult(payload.data);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Website speed testing is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      title="Website Speed Test"
      description="Run a backend website speed check and review real mobile performance, accessibility, best-practices, and SEO scores without faking results."
    >
      <Field
        label="Website URL"
        hint="Enter a full page URL to request a live mobile performance report."
        >
          <input
            className={inputClass}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="https://example.com"
          />
        </Field>
        <button type="button" className={buttonClass} onClick={handleRun} disabled={!input.trim() || loading}>
          {loading ? "Running speed test..." : "Run speed test"}
        </button>
        <Notice>
          Server-assisted analysis powered by PageSpeed data. Results reflect the latest mobile report available to the backend.
        </Notice>
        {error ? <Notice tone="error">{error}</Notice> : null}
        {!input.trim() ? (
          <EmptyState title="Enter a URL to test it" description="The report includes core performance metrics plus performance, accessibility, best-practices, and SEO scores when the backend service is available." />
        ) : result ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <OutputBlock title="Performance" value={`${result.performanceScore}/100`} multiline={false} />
              <OutputBlock title="Accessibility" value={`${result.accessibilityScore}/100`} multiline={false} />
              <OutputBlock title="Best practices" value={`${result.bestPracticesScore}/100`} multiline={false} />
              <OutputBlock title="SEO" value={`${result.seoScore}/100`} multiline={false} />
            </div>
            <OutputBlock title="Metrics" value={Object.entries(result.metrics).map(([label, value]) => `${label}: ${value}`).join("\n")} />
            {result.notes.length ? <OutputBlock title="Notable checks" value={result.notes.join("\n")} /> : null}
          </>
        ) : null}
      </ToolShell>
    );
  }

export function MobileFriendlyCheckerTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    finalUrl: string;
    verdict: string;
    hasViewportMeta: boolean;
    performanceScore: number;
    accessibilityScore: number;
    seoScore: number;
    flags: Array<{ label: string; passed: boolean }>;
    notes: string[];
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/tools/mobile-friendly-checker?url=${encodeURIComponent(input.trim())}`);
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }
      const payload = (await response.json()) as {
        ok: true;
        data: {
          finalUrl: string;
          verdict: string;
          hasViewportMeta: boolean;
          performanceScore: number;
          accessibilityScore: number;
          seoScore: number;
          flags: Array<{ label: string; passed: boolean }>;
          notes: string[];
        };
      };
      setResult(payload.data);
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "Mobile-friendly analysis is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      title="Mobile Friendly Checker"
      description="Check mobile-friendly signals through the backend using real page HTML inspection plus PageSpeed mobile analysis."
    >
      <Field
        label="Website URL"
        hint="Enter a page URL to request a mobile-focused report."
        >
          <input
            className={inputClass}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="https://example.com"
          />
        </Field>
        <button type="button" className={buttonClass} onClick={handleCheck} disabled={!input.trim() || loading}>
          {loading ? "Checking mobile friendliness..." : "Check mobile friendliness"}
        </button>
        <Notice>
          Server-assisted analysis. The checker combines backend HTML inspection with PageSpeed mobile signals instead of guessing from the current browser tab.
        </Notice>
        {error ? <Notice tone="error">{error}</Notice> : null}
        {!input.trim() ? (
          <EmptyState title="Enter a URL to review it" description="The report checks for a viewport meta tag and combines that with mobile performance, accessibility, and SEO signals." />
        ) : result ? (
          <>
            <OutputBlock title="Verdict" value={result.verdict} multiline={false} />
            <div className="grid gap-4 md:grid-cols-3">
              <OutputBlock title="Viewport meta" value={result.hasViewportMeta ? "Present" : "Missing"} multiline={false} />
              <OutputBlock title="Accessibility score" value={`${formatNumber(result.accessibilityScore, 0)}/100`} multiline={false} />
              <OutputBlock title="SEO score" value={`${formatNumber(result.seoScore, 0)}/100`} multiline={false} />
            </div>
            <OutputBlock title="Checks" value={result.flags.map((flag) => `${flag.passed ? "PASS" : "FAIL"} - ${flag.label}`).join("\n")} />
            {result.notes.length ? <OutputBlock title="Related mobile notes" value={result.notes.join("\n")} /> : null}
          </>
        ) : null}
      </ToolShell>
    );
  }

export function UserAgentParserTool() {
  const [input, setInput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    setInput(navigator.userAgent);
  }, []);

  const parsed = useMemo(() => {
    try {
      return input.trim() ? parseUserAgent(input) : null;
    } catch {
      return null;
    }
  }, [input]);

  return (
    <ToolShell title="User Agent Parser" description="Parse user agent strings locally to inspect browser, engine, operating system, and device type.">
      <Field label="User agent string" hint="You can paste any UA string or use your current browser string below.">
        <textarea className="min-h-32 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Mozilla/5.0 (...)" />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={() => setInput(navigator.userAgent)}>
          Use current browser user agent
        </button>
        <button type="button" className={buttonClass} onClick={() => copy("user agent string", input)} disabled={!input.trim()}>
          Copy user agent
        </button>
      </div>
      {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      {!input.trim() ? (
        <EmptyState title="Paste a user agent string to parse it" description="The parser works fully locally and does not send the string anywhere." />
      ) : parsed ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OutputBlock title="Browser" value={parsed.browser} multiline={false} />
            <OutputBlock title="Version" value={parsed.browserVersion} multiline={false} />
            <OutputBlock title="Engine" value={parsed.engine} multiline={false} />
            <OutputBlock title="Operating system" value={parsed.os} multiline={false} />
            <OutputBlock title="Device type" value={parsed.deviceType} multiline={false} />
          </div>
          <OutputBlock title="Raw user agent" value={parsed.raw} />
        </>
      ) : (
        <Notice tone="error">Enter a readable user agent string to parse it.</Notice>
      )}
    </ToolShell>
  );
}

export function MimeTypeLookupTool() {
  const [input, setInput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const result = useMemo(() => {
    const value = input.trim().toLowerCase().replace(/^\./, "");
    if (!value) {
      return null;
    }

    const fromExtension = mimeReference[value];
    if (fromExtension) {
      return {
        label: `Extension .${value}`,
        values: fromExtension,
      };
    }

    const fromMime = Object.entries(mimeReference)
      .filter(([, mimeTypes]) => mimeTypes.includes(value))
      .map(([extension]) => extension);

    if (fromMime.length) {
      return {
        label: `MIME type ${value}`,
        values: fromMime.map((extension) => `.${extension}`),
      };
    }

    return {
      label: "",
      values: [],
    };
  }, [input]);

  return (
    <ToolShell title="MIME Type Lookup" description="Look up common MIME types from a bundled local reference table using a file extension or MIME value.">
      <Field label="Extension or MIME type" hint="Examples: png, .pdf, text/html, application/json">
        <input
          className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="png"
        />
      </Field>
      {!input.trim() ? (
        <EmptyState title="Enter a file extension or MIME type" description="The lookup uses a bundled reference list, so results are local and do not depend on live network access." />
      ) : result?.values.length ? (
        <>
          <OutputBlock title={result.label} value={result.values.join("\n")} />
          <button type="button" className={buttonClass} onClick={() => copy("MIME lookup result", result.values.join("\n"))}>
            Copy result
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : (
        <Notice tone="error">No match found in the bundled MIME reference list for that input.</Notice>
      )}
    </ToolShell>
  );
}
