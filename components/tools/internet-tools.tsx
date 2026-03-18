"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buttonClass,
  EmptyState,
  Notice,
  OutputBlock,
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
