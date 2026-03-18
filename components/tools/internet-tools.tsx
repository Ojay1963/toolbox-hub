"use client";

import { useEffect, useMemo, useState } from "react";
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
  return (
    <ToolShell
      title="DNS Lookup"
      description="This page is intentionally honest about the limits of a browser-only tools site."
    >
      <Notice>
        Coming soon. Real DNS lookups need server-side infrastructure or an external resolver, and
        this project does not fake DNS results in the browser.
      </Notice>
      <EmptyState
        title="Future-ready placeholder"
        description="If server infrastructure is added later, a real DNS query flow can plug into this page without changing the route, SEO metadata, FAQ structure, or related-tool linking."
      />
    </ToolShell>
  );
}

export function HttpStatusCodeCheckerTool() {
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
    <ToolShell title="HTTP Status Code Checker" description="Check a URL status from the browser when the target site allows it. This reduced-scope version does not fake results for blocked URLs.">
      <Notice>
        Reduced scope only. Browser-based checks work only for URLs that allow cross-origin requests.
        Many sites will block this, and blocked results are reported honestly instead of guessed.
      </Notice>
      <Field label="URL to check" hint="Enter a full URL or hostname. HTTPS is added automatically when missing.">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://example.com" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleCheck} disabled={loading}>
        {loading ? "Checking status..." : "Check status"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input.trim() ? (
        <EmptyState title="Enter a URL to inspect it" description="The tool will attempt a real browser fetch and only show a status when the target allows that request." />
      ) : result ? (
        <div className="grid gap-4 md:grid-cols-2">
          <OutputBlock title="HTTP status" value={result.status ? `${result.status} ${result.statusText ?? ""}`.trim() : "Unavailable"} multiline={false} />
          <OutputBlock title="Final URL" value={result.finalUrl || "Unavailable"} multiline={false} />
          <OutputBlock title="Fetch type" value={result.type || "Unavailable"} multiline={false} />
          <OutputBlock title="Redirected" value={result.redirected ? "Yes" : "No"} multiline={false} />
        </div>
      ) : null}
    </ToolShell>
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

export function WebsiteScreenshotTool() {
  return (
    <ToolShell title="Website Screenshot Tool" description="This page intentionally stays honest about the limits of a browser-only tools site.">
      <Notice>
        Coming soon. Reliable screenshots of remote websites usually require server-side rendering
        or headless browser infrastructure. This project does not fake screenshot output from a URL.
      </Notice>
      <EmptyState
        title="Server-side rendering will be needed"
        description="A future version can plug a real screenshot service or headless-browser workflow into this route without changing the page URL, SEO structure, or related links."
      />
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
