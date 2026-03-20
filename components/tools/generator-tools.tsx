"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  buttonClass,
  EmptyState,
  Field,
  inputClass,
  Notice,
  OutputBlock,
  secondaryButtonClass,
  textareaClass,
  ToolShell,
  useCopyToClipboard,
} from "@/components/tools/common";

const givenNames = ["Alex", "Jordan", "Taylor", "Morgan", "Avery", "Riley", "Cameron", "Jamie", "Logan", "Casey"];
const familyNames = ["Parker", "Johnson", "Reed", "Mitchell", "Bennett", "Hayes", "Coleman", "Murphy", "Bailey", "Foster"];
const fakeAddressProfiles = [
  {
    country: "United States",
    code: "US",
    cities: ["Austin, TX", "Portland, OR", "Tampa, FL", "Denver, CO", "Raleigh, NC"],
    streets: ["Maple", "Cedar", "Sunset", "Pine", "Lakeview", "Willow"],
    streetSuffixes: ["St", "Ave", "Blvd", "Dr", "Ln"],
    postalCode: () => String(getRandomInt(90000) + 10000),
  },
  {
    country: "United Kingdom",
    code: "UK",
    cities: ["London", "Manchester", "Bristol", "Leeds", "Birmingham"],
    streets: ["Baker", "Oak", "Queens", "Station", "Highfield", "King"],
    streetSuffixes: ["Road", "Street", "Close", "Lane", "Way"],
    postalCode: () => `${String.fromCharCode(65 + getRandomInt(26))}${String.fromCharCode(65 + getRandomInt(26))}${getRandomInt(9) + 1} ${getRandomInt(9)}${String.fromCharCode(65 + getRandomInt(26))}${String.fromCharCode(65 + getRandomInt(26))}`,
  },
  {
    country: "Canada",
    code: "CA",
    cities: ["Toronto, ON", "Calgary, AB", "Ottawa, ON", "Halifax, NS", "Vancouver, BC"],
    streets: ["Spruce", "Harbour", "Elm", "Victoria", "Northgate", "River"],
    streetSuffixes: ["Street", "Avenue", "Drive", "Trail", "Court"],
    postalCode: () => `${String.fromCharCode(65 + getRandomInt(26))}${getRandomInt(10)}${String.fromCharCode(65 + getRandomInt(26))} ${getRandomInt(10)}${String.fromCharCode(65 + getRandomInt(26))}${getRandomInt(10)}`,
  },
  {
    country: "Nigeria",
    code: "NG",
    cities: ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Enugu"],
    streets: ["Ademola", "Broad", "Unity", "Palm", "Freedom", "Chiefs"],
    streetSuffixes: ["Road", "Close", "Street", "Way", "Crescent"],
    postalCode: () => String(getRandomInt(900000) + 100000),
  },
  {
    country: "India",
    code: "IN",
    cities: ["Mumbai", "Bengaluru", "Hyderabad", "Pune", "Jaipur"],
    streets: ["MG", "Lake", "Temple", "Station", "Garden", "Nehru"],
    streetSuffixes: ["Road", "Nagar", "Street", "Marg", "Layout"],
    postalCode: () => String(getRandomInt(900000) + 100000),
  },
  {
    country: "Australia",
    code: "AU",
    cities: ["Sydney NSW", "Melbourne VIC", "Brisbane QLD", "Perth WA", "Adelaide SA"],
    streets: ["Jacaranda", "Harbour", "Coastal", "Kingfisher", "Banksia", "Wattle"],
    streetSuffixes: ["Street", "Road", "Drive", "Place", "Terrace"],
    postalCode: () => String(getRandomInt(9000) + 1000),
  },
] as const;
const usernameWords = ["pixel", "swift", "luna", "forge", "delta", "echo", "mint", "nova", "orbit", "atlas"];
const gamerStyleWords = ["shadow", "vortex", "blaze", "phantom", "glitch", "raven", "venom", "frost", "striker", "omega"];
const professionalStyleWords = ["studio", "works", "group", "logic", "labs", "consult", "digital", "systems", "office", "craft"];
const shortUsernameParts = ["ax", "zen", "flux", "nova", "byte", "arc", "lynx", "vibe", "echo", "zeno"];
const nicknameWords = ["Ace", "Blaze", "Scout", "Nova", "Dash", "Skye", "Jinx", "Milo", "Rex", "Zee"];
const quoteBank = [
  "Consistency beats intensity when you are building something real.",
  "Small tools can remove big friction.",
  "Clarity is a feature, not an extra.",
  "Reliable work compounds quietly over time.",
  "Good systems make future work easier.",
  "Simple can still be production-ready.",
];
const passphraseWords = ["river", "sunset", "maple", "signal", "harbor", "velvet", "ember", "forest", "copper", "cloud"];
const blogTitleTemplates = [
  "How to {topic} Without Wasting Time",
  "{topic}: A Simple Guide for Beginners",
  "7 Smart Ways to Improve {topic}",
  "What Most People Get Wrong About {topic}",
  "The Practical Guide to {topic} in 2026",
  "{topic} Tips You Can Start Using Today",
];
const youtubeTagModifiers = ["tips", "tutorial", "guide", "beginner", "explained", "ideas", "strategy", "checklist"];
const hashtagModifiers = ["tips", "daily", "creator", "style", "love", "goals", "community", "online"];
const productPrefixes = ["Nova", "Bright", "Peak", "True", "Flex", "Pure", "Spark", "Swift"];
const productSuffixes = ["Flow", "Forge", "Nest", "Pulse", "Shift", "Craft", "Wave", "Labs"];
const domainTlds = [".com", ".co", ".io", ".site", ".app"];
const code39Patterns: Record<string, string> = {
  "0": "101001101101",
  "1": "110100101011",
  "2": "101100101011",
  "3": "110110010101",
  "4": "101001101011",
  "5": "110100110101",
  "6": "101100110101",
  "7": "101001011011",
  "8": "110100101101",
  "9": "101100101101",
  A: "110101001011",
  B: "101101001011",
  C: "110110100101",
  D: "101011001011",
  E: "110101100101",
  F: "101101100101",
  G: "101010011011",
  H: "110101001101",
  I: "101101001101",
  J: "101011001101",
  K: "110101010011",
  L: "101101010011",
  M: "110110101001",
  N: "101011010011",
  O: "110101101001",
  P: "101101101001",
  Q: "101010110011",
  R: "110101011001",
  S: "101101011001",
  T: "101011011001",
  U: "110010101011",
  V: "100110101011",
  W: "110011010101",
  X: "100101101011",
  Y: "110010110101",
  Z: "100110110101",
  "-": "100101011011",
  ".": "110010101101",
  " ": "100110101101",
  $: "100100100101",
  "/": "100100101001",
  "+": "100101001001",
  "%": "101001001001",
  "*": "100101101101",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pickRandom<T>(values: readonly T[]) {
  return values[getRandomInt(values.length)];
}

function toSlugParts(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function dedupePreserveOrder(values: string[]) {
  return Array.from(new Set(values));
}

type UsernameStyle = "gamer" | "professional" | "short";

function titleCaseWord(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function capitalizeParts(parts: string[]) {
  return parts.map((part) => titleCaseWord(part)).join("");
}

function normalizeKeyword(value: string) {
  return toSlugParts(value).slice(0, 2);
}

function pickUsernameKeywordPart(keywordParts: string[]) {
  if (!keywordParts.length) return "";
  return pickRandom(keywordParts);
}

function buildGamerUsername(keywordParts: string[]) {
  const base = pickUsernameKeywordPart(keywordParts) || pickRandom(usernameWords);
  const accent = pickRandom(gamerStyleWords);
  const suffix = String(getRandomInt(900) + 100);
  return pickRandom([
    `${base}${accent}${suffix}`,
    `${accent}_${base}${suffix}`,
    `${capitalizeParts([base, accent])}${suffix}`,
    `x${capitalizeParts([base, accent])}`,
  ]);
}

function buildProfessionalUsername(keywordParts: string[]) {
  const lead = pickUsernameKeywordPart(keywordParts) || pickRandom(usernameWords);
  const tail = pickRandom(professionalStyleWords);
  const number = getRandomInt(90) + 10;
  return pickRandom([
    `${lead}.${tail}`,
    `${lead}${tail}`,
    `${lead}_${tail}${number}`,
    `${capitalizeParts([lead, tail])}`,
  ]);
}

function buildShortUsername(keywordParts: string[]) {
  const lead = pickUsernameKeywordPart(keywordParts) || pickRandom(shortUsernameParts);
  const tail = pickRandom(shortUsernameParts);
  const suffix = getRandomInt(90) + 10;
  return pickRandom([
    `${lead}${tail}`,
    `${lead}${suffix}`,
    `${lead}${tail[0]}`,
    `${tail}${lead[0]}${suffix}`,
  ]);
}

function buildUsernameSuggestions(style: UsernameStyle, keyword: string, count: number) {
  const keywordParts = normalizeKeyword(keyword);
  const total = clamp(count, 10, 24);
  const next: string[] = [];

  while (next.length < total * 3 && next.length < 200) {
    const candidate =
      style === "gamer"
        ? buildGamerUsername(keywordParts)
        : style === "professional"
          ? buildProfessionalUsername(keywordParts)
          : buildShortUsername(keywordParts);
    next.push(candidate.replace(/[^a-zA-Z0-9._-]/g, ""));
  }

  return dedupePreserveOrder(next).slice(0, total);
}

function buildFakeAddress(profile: (typeof fakeAddressProfiles)[number]) {
  const first = pickRandom(givenNames);
  const last = pickRandom(familyNames);
  const streetNumber = getRandomInt(899) + 101;
  const street = pickRandom(profile.streets);
  const suffix = pickRandom(profile.streetSuffixes);
  const city = pickRandom(profile.cities);

  return [
    `${first} ${last}`,
    `${streetNumber} ${street} ${suffix}`,
    city,
    `${profile.postalCode()}`,
    profile.country,
  ].join("\n");
}

function buildDownloadLink(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

function getRandomInt(max: number) {
  return crypto.getRandomValues(new Uint32Array(1))[0] % max;
}

function sanitizeCode39Value(value: string) {
  return value.toUpperCase().replace(/\*/g, "");
}

function isValidCode39(value: string) {
  return /^[0-9A-Z .\-$/+%]+$/.test(value);
}

function renderCode39Barcode({
  value,
  moduleWidth,
  barHeight,
  showLabel,
}: {
  value: string;
  moduleWidth: number;
  barHeight: number;
  showLabel: boolean;
}) {
  const encoded = `*${sanitizeCode39Value(value)}*`;
  const quietZone = moduleWidth * 10;
  const labelHeight = showLabel ? 28 : 0;
  const patterns = encoded.split("").map((character) => code39Patterns[character]).filter(Boolean);
  const totalModules = patterns.reduce((sum, pattern) => sum + pattern.length, 0) + Math.max(0, patterns.length - 1);
  const canvas = document.createElement("canvas");
  canvas.width = quietZone * 2 + totalModules * moduleWidth;
  canvas.height = barHeight + labelHeight + 24;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  let x = quietZone;
  context.fillStyle = "#111827";
  for (const pattern of patterns) {
    for (const bit of pattern) {
      if (bit === "1") {
        context.fillRect(x, 12, moduleWidth, barHeight);
      }
      x += moduleWidth;
    }
    x += moduleWidth;
  }

  if (showLabel) {
    context.font = "16px monospace";
    context.textAlign = "center";
    context.fillText(sanitizeCode39Value(value), canvas.width / 2, barHeight + 34);
  }

  return {
    encoded,
    dataUrl: canvas.toDataURL("image/png"),
  };
}

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    let characters = "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) characters += "0123456789";
    if (includeSymbols) characters += "!@#$%^&*()_+-=[]{}<>?";
    if (!characters) return;

    const values = crypto.getRandomValues(new Uint32Array(length));
    const result = Array.from(values, (value) => characters[value % characters.length]).join("");
    setPassword(result);
  }

  return (
    <ToolShell title="Password Generator" description="Create strong random passwords using browser-side secure randomness.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Password length">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="6" max="64" value={length} onChange={(event) => setLength(Number(event.target.value))} />
        </Field>
        <div className="space-y-2 text-sm text-[color:var(--foreground)]">
          <label className="flex items-center gap-2"><input type="checkbox" checked={includeUppercase} onChange={(event) => setIncludeUppercase(event.target.checked)} /> Include uppercase</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={includeNumbers} onChange={(event) => setIncludeNumbers(event.target.checked)} /> Include numbers</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={includeSymbols} onChange={(event) => setIncludeSymbols(event.target.checked)} /> Include symbols</label>
        </div>
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate password
      </button>
      {!password ? (
        <EmptyState title="Generate a password" description="Choose the options you want and create a strong password locally." />
      ) : (
        <>
          <OutputBlock title="Generated password" value={password} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("password", password)}>Copy password</button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      )}
    </ToolShell>
  );
}

export function QrCodeGeneratorTool() {
  const [value, setValue] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!value.trim()) {
      setError("Enter text or a URL to generate a QR code.");
      setDataUrl("");
      return;
    }

    try {
      const { default: QRCode } = await import("qrcode");
      const url = await QRCode.toDataURL(value, {
        width: 320,
        margin: 2,
      });
      setDataUrl(url);
      setError("");
    } catch {
      setError("Unable to generate a QR code for that input.");
      setDataUrl("");
    }
  }

  return (
    <ToolShell title="QR Code Generator" description="Generate QR codes locally in the browser and download them as PNG images.">
      <Field label="Text or URL">
        <textarea className="min-h-32 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={value} onChange={(event) => setValue(event.target.value)} placeholder="https://example.com" />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleGenerate}>
          Generate QR code
        </button>
        <button type="button" className={secondaryButtonClass} onClick={() => dataUrl && buildDownloadLink(dataUrl, "qr-code.png")} disabled={!dataUrl}>
          Download PNG
        </button>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!value ? (
        <EmptyState title="Nothing to encode yet" description="Enter text or a link, then generate a QR code and download it as an image." />
      ) : dataUrl ? (
        <div className="rounded-2xl bg-stone-50 p-4">
          <img src={dataUrl} alt="Generated QR code" className="h-64 w-64 rounded-2xl border border-[color:var(--border)]" />
        </div>
      ) : null}
    </ToolShell>
  );
}

export function BarcodeGeneratorTool() {
  const [value, setValue] = useState("TOOLS-2026");
  const [moduleWidth, setModuleWidth] = useState(3);
  const [barHeight, setBarHeight] = useState(120);
  const [showLabel, setShowLabel] = useState(true);
  const [dataUrl, setDataUrl] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const cleaned = sanitizeCode39Value(value.trim());
    if (!cleaned) {
      setError("Enter text to generate a barcode.");
      setDataUrl("");
      setOutput("");
      return;
    }
    if (!isValidCode39(cleaned)) {
      setError("Code 39 supports A-Z, 0-9, spaces, and - . $ / + % characters.");
      setDataUrl("");
      setOutput("");
      return;
    }

    try {
      const next = renderCode39Barcode({
        value: cleaned,
        moduleWidth: clamp(moduleWidth, 2, 6),
        barHeight: clamp(barHeight, 60, 220),
        showLabel,
      });
      setDataUrl(next.dataUrl);
      setOutput(`Format: Code 39\nEncoded value: ${cleaned}\nFramed output: ${next.encoded}`);
      setError("");
    } catch (renderingError) {
      setError(renderingError instanceof Error ? renderingError.message : "Unable to render the barcode.");
      setDataUrl("");
      setOutput("");
    }
  }

  return (
    <ToolShell title="Barcode Generator" description="Generate a lightweight Code 39 barcode locally in the browser and download it as a PNG image without any server upload.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Field label="Barcode text" hint="Example: TOOLS-2026 or INV 2048">
          <input className={inputClass} value={value} onChange={(event) => setValue(event.target.value)} placeholder="TOOLS-2026" />
        </Field>
        <Field label="Module width">
          <input className={inputClass} type="number" min="2" max="6" value={moduleWidth} onChange={(event) => setModuleWidth(Number(event.target.value))} />
        </Field>
        <Field label="Bar height">
          <input className={inputClass} type="number" min="60" max="220" value={barHeight} onChange={(event) => setBarHeight(Number(event.target.value))} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-[color:var(--foreground)]">
        <input type="checkbox" checked={showLabel} onChange={(event) => setShowLabel(event.target.checked)} />
        Show readable text below the bars
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleGenerate}>Generate barcode</button>
        <button type="button" className={secondaryButtonClass} onClick={() => dataUrl && buildDownloadLink(dataUrl, "barcode-code39.png")} disabled={!dataUrl}>Download PNG</button>
        <button type="button" className={secondaryButtonClass} onClick={() => output && copy("barcode details", output)} disabled={!output}>Copy details</button>
      </div>
      <Notice>Code 39 is a practical browser-only format for inventory labels and simple alphanumeric barcodes.</Notice>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!dataUrl ? (
        <EmptyState title="Generate a barcode preview" description="Enter a supported Code 39 value and create a downloadable barcode image locally." />
      ) : (
        <>
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Barcode preview</p>
            <img src={dataUrl} alt={`Generated barcode for ${sanitizeCode39Value(value)}`} className="mt-3 w-full rounded-2xl border border-[color:var(--border)] bg-white object-contain p-4" />
          </div>
          <OutputBlock title="Barcode details" value={output} />
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [values, setValues] = useState<string[]>([]);
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const total = Math.max(1, Math.min(50, count));
    setValues(Array.from({ length: total }, () => crypto.randomUUID()));
  }

  const output = useMemo(() => values.join("\n"), [values]);

  return (
    <ToolShell title="UUID Generator" description="Generate one or more UUIDs locally using browser-supported random UUID generation.">
      <Field label="How many UUIDs?">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="1" max="50" value={count} onChange={(event) => setCount(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate UUIDs
      </button>
      {!values.length ? (
        <EmptyState title="No UUIDs generated yet" description="Choose how many IDs you need and generate them instantly." />
      ) : (
        <>
          <OutputBlock title="UUID list" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("UUID list", output)}>Copy UUIDs</button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      )}
    </ToolShell>
  );
}

export function RandomNameGeneratorTool() {
  const [count, setCount] = useState(5);
  const [names, setNames] = useState<string[]>([]);
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const total = Math.max(1, Math.min(20, count));
    const next = Array.from({ length: total }, () => {
      const first = givenNames[getRandomInt(givenNames.length)];
      const last = familyNames[getRandomInt(familyNames.length)];
      return `${first} ${last}`;
    });
    setNames(next);
  }

  const output = useMemo(() => names.join("\n"), [names]);

  return (
    <ToolShell title="Random Name Generator" description="Generate sample names from a bundled local list without using live APIs or a database.">
      <Field label="How many names?">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="1" max="20" value={count} onChange={(event) => setCount(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate names
      </button>
      {!names.length ? (
        <EmptyState title="No names generated yet" description="Generate sample names locally for demos, examples, and placeholders." />
      ) : (
        <>
          <OutputBlock title="Generated names" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("name list", output)}>Copy names</button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      )}
    </ToolShell>
  );
}

export function FakeAddressGeneratorTool() {
  const [countryCode, setCountryCode] = useState("US");
  const [count, setCount] = useState(5);
  const [values, setValues] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const total = Math.max(1, Math.min(20, count));
    const profile = fakeAddressProfiles.find((item) => item.code === countryCode);
    if (!profile) {
      setError("Choose a supported country or region first.");
      setValues([]);
      return;
    }

    setValues(Array.from({ length: total }, () => buildFakeAddress(profile)));
    setError("");
  }

  const output = useMemo(
    () => values.map((value, index) => `Address ${index + 1}\n${value}`).join("\n\n"),
    [values],
  );

  return (
    <ToolShell title="Fake Address Generator" description="Generate realistic sample names and mailing addresses locally for demos, testing, and placeholders without using any live data source.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Country or region">
          <select className={inputClass} value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
            {fakeAddressProfiles.map((profile) => (
              <option key={profile.code} value={profile.code}>{profile.country}</option>
            ))}
          </select>
        </Field>
        <Field label="How many addresses?">
          <input className={inputClass} type="number" min="1" max="20" value={count} onChange={(event) => setCount(Number(event.target.value))} />
        </Field>
      </div>
      <Notice>These are fake sample addresses for UI testing and mock content only. They are not verified delivery addresses.</Notice>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate addresses
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!values.length ? (
        <EmptyState title="No fake addresses generated yet" description="Choose a country or region, set how many entries you need, and create a local sample address list." />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {values.map((value, index) => (
              <div key={`${countryCode}-${index}-${value}`} className="rounded-2xl border border-[color:var(--border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Address {index + 1}</p>
                <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-700">{value}</pre>
              </div>
            ))}
          </div>
          <OutputBlock title="Address list" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("fake address list", output)}>Copy addresses</button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      )}
    </ToolShell>
  );
}

export function RandomNumberGeneratorTool() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(5);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    if (min > max) {
      setError("Minimum value cannot be greater than maximum value.");
      setNumbers([]);
      return;
    }

    const rangeSize = max - min + 1;
    if (!allowDuplicates && count > rangeSize) {
      setError("Turn on duplicates or reduce the count so the range has enough unique numbers.");
      setNumbers([]);
      return;
    }

    const result: number[] = [];
    const seen = new Set<number>();
    while (result.length < count) {
      const value = getRandomInt(rangeSize) + min;
      if (!allowDuplicates && seen.has(value)) {
        continue;
      }
      seen.add(value);
      result.push(value);
    }

    setNumbers(result);
    setError("");
  }

  const output = useMemo(() => numbers.join(", "), [numbers]);

  return (
    <ToolShell title="Random Number Generator" description="Generate random integers in a chosen range with optional duplicate control.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Minimum"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={min} onChange={(event) => setMin(Number(event.target.value))} /></Field>
        <Field label="Maximum"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={max} onChange={(event) => setMax(Number(event.target.value))} /></Field>
        <Field label="Count"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="1" max="100" value={count} onChange={(event) => setCount(Number(event.target.value))} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-[color:var(--foreground)]">
        <input type="checkbox" checked={allowDuplicates} onChange={(event) => setAllowDuplicates(event.target.checked)} />
        Allow duplicates
      </label>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate numbers
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!numbers.length ? (
        <EmptyState title="Generate a result list" description="Pick a range and count to create random numbers." />
      ) : (
        <>
          <OutputBlock title="Generated numbers" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("number list", output)}>Copy numbers</button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      )}
    </ToolShell>
  );
}

export function UsernameGeneratorTool() {
  const [count, setCount] = useState(6);
  const [values, setValues] = useState<string[]>([]);
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const total = Math.max(1, Math.min(20, count));
    const next = Array.from({ length: total }, () => {
      const word = usernameWords[getRandomInt(usernameWords.length)];
      const suffix = String(getRandomInt(9000) + 1000);
      return `${word}${suffix}`;
    });
    setValues(next);
  }

  const output = useMemo(() => values.join("\n"), [values]);

  return (
    <ToolShell title="Username Generator" description="Generate simple username ideas from bundled local patterns and random suffixes.">
      <Field label="How many usernames?">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="1" max="20" value={count} onChange={(event) => setCount(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate usernames
      </button>
      {!values.length ? <EmptyState title="No usernames generated yet" description="Generate handle ideas locally without relying on any live availability check." /> : <>
        <OutputBlock title="Username ideas" value={output} />
        <button type="button" className={buttonClass} onClick={() => copy("username ideas", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function RandomUsernameGeneratorTool() {
  const [keyword, setKeyword] = useState("");
  const [style, setStyle] = useState<UsernameStyle>("gamer");
  const [count, setCount] = useState(10);
  const [values, setValues] = useState<string[]>([]);
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    setValues(buildUsernameSuggestions(style, keyword, count));
  }

  const output = useMemo(() => values.join("\n"), [values]);

  return (
    <ToolShell title="Random Username Generator" description="Generate batches of username ideas locally with style-based patterns, optional keywords, and no external API calls.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Username style">
          <select className={inputClass} value={style} onChange={(event) => setStyle(event.target.value as UsernameStyle)}>
            <option value="gamer">Gamer style</option>
            <option value="professional">Professional style</option>
            <option value="short">Short usernames</option>
          </select>
        </Field>
        <Field label="Optional keyword" hint="Weave in a topic, nickname, brand, or favorite word.">
          <input className={inputClass} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="phoenix, design, atlas" maxLength={24} />
        </Field>
        <Field label="Suggestions to generate" hint="At least 10 suggestions are generated each time.">
          <input className={inputClass} type="number" min="10" max="24" value={count} onChange={(event) => setCount(Number(event.target.value) || 10)} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleGenerate}>
          Generate usernames
        </button>
        <button type="button" className={secondaryButtonClass} onClick={handleGenerate} disabled={!values.length}>
          Regenerate
        </button>
        <button type="button" className={secondaryButtonClass} onClick={() => copy("username suggestions", output)} disabled={!output}>
          Copy suggestions
        </button>
      </div>

      {!values.length ? (
        <EmptyState title="No username suggestions yet" description="Pick a style, optionally add a keyword, and generate at least 10 local username ideas you can copy or refine." />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {values.map((value) => (
              <div key={value} className="rounded-2xl border border-[color:var(--border)] bg-white p-4">
                <p className="break-all text-base font-semibold text-[color:var(--foreground)]">{value}</p>
                <button type="button" className="mt-3 text-sm font-medium text-[color:var(--primary)]" onClick={() => copy("username", value)}>
                  Copy this username
                </button>
              </div>
            ))}
          </div>
          <OutputBlock title="Username list" value={output} />
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function NicknameGeneratorTool() {
  const [count, setCount] = useState(6);
  const [values, setValues] = useState<string[]>([]);
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const total = Math.max(1, Math.min(20, count));
    setValues(Array.from({ length: total }, () => nicknameWords[getRandomInt(nicknameWords.length)]));
  }

  const output = useMemo(() => values.join("\n"), [values]);

  return (
    <ToolShell title="Nickname Generator" description="Generate nickname ideas from a bundled local word list.">
      <Field label="How many nicknames?">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="1" max="20" value={count} onChange={(event) => setCount(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate nicknames
      </button>
      {!values.length ? <EmptyState title="No nicknames generated yet" description="Generate nickname ideas for profiles, placeholders, or fun naming prompts." /> : <>
        <OutputBlock title="Nickname ideas" value={output} />
        <button type="button" className={buttonClass} onClick={() => copy("nickname ideas", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function RandomColorGeneratorTool() {
  const [values, setValues] = useState<string[]>([]);
  const { copied, copy } = useCopyToClipboard();

  function makeHex() {
    return `#${Array.from({ length: 3 }, () => getRandomInt(256).toString(16).padStart(2, "0")).join("")}`;
  }

  function handleGenerate() {
    setValues(Array.from({ length: 5 }, () => makeHex()));
  }

  const output = useMemo(() => values.join("\n"), [values]);

  return (
    <ToolShell title="Random Color Generator" description="Generate random HEX colors locally and copy the values you want to use.">
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate colors
      </button>
      {!values.length ? <EmptyState title="No colors generated yet" description="Generate a small palette of random colors with copy-ready HEX values." /> : <>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {values.map((value) => (
            <div key={value} className="rounded-2xl border border-[color:var(--border)] bg-white p-3">
              <div className="h-20 rounded-xl border border-[color:var(--border)]" style={{ backgroundColor: value }} />
              <p className="mt-3 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <OutputBlock title="HEX values" value={output} />
        <button type="button" className={buttonClass} onClick={() => copy("HEX values", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function RandomColorPaletteGeneratorTool() {
  const [count, setCount] = useState(5);
  const [colors, setColors] = useState<string[]>([]);
  const [paletteUrl, setPaletteUrl] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function makeHex() {
    return `#${Array.from({ length: 3 }, () => getRandomInt(256).toString(16).padStart(2, "0")).join("")}`;
  }

  function generatePalettePreview(values: string[]) {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 240;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available in this browser.");
    }

    const stripeWidth = canvas.width / values.length;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    values.forEach((value, index) => {
      context.fillStyle = value;
      context.fillRect(index * stripeWidth, 0, stripeWidth, 150);
      context.fillStyle = "#111827";
      context.font = "600 20px Georgia";
      context.fillText(value, index * stripeWidth + 18, 200);
    });
    return canvas.toDataURL("image/png");
  }

  useEffect(() => () => {
    if (paletteUrl.startsWith("blob:")) {
      URL.revokeObjectURL(paletteUrl);
    }
  }, [paletteUrl]);

  function handleGenerate() {
    const safeCount = clamp(count, 3, 8);
    if (!Number.isFinite(safeCount)) {
      setError("Choose between 3 and 8 colors.");
      setColors([]);
      setPaletteUrl("");
      return;
    }

    const next = Array.from({ length: safeCount }, () => makeHex());
    setColors(next);
    setPaletteUrl(generatePalettePreview(next));
    setError("");
  }

  const output = useMemo(() => colors.join("\n"), [colors]);

  return (
    <ToolShell title="Random Color Palette Generator" description="Generate a downloadable multi-color palette locally and preview the swatches instantly without any external dependency.">
      <Field label="Number of colors">
        <input className={inputClass} type="number" min="3" max="8" value={count} onChange={(event) => setCount(Number(event.target.value))} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleGenerate}>Generate palette</button>
        <button type="button" className={secondaryButtonClass} onClick={() => paletteUrl && buildDownloadLink(paletteUrl, "random-color-palette.png")} disabled={!paletteUrl}>Download PNG</button>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!colors.length ? <EmptyState title="No palette generated yet" description="Choose how many colors you want, then generate a random palette and download the preview image." /> : <>
        {paletteUrl ? <div className="rounded-2xl bg-stone-50 p-4"><img src={paletteUrl} alt="Generated random color palette preview" className="w-full rounded-2xl border border-[color:var(--border)]" /></div> : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {colors.map((color) => (
            <div key={color} className="rounded-2xl border border-[color:var(--border)] bg-white p-3">
              <div className="h-20 rounded-xl border border-[color:var(--border)]" style={{ backgroundColor: color }} />
              <p className="mt-3 text-sm font-semibold">{color}</p>
            </div>
          ))}
        </div>
        <OutputBlock title="Palette values" value={output} />
        <button type="button" className={buttonClass} onClick={() => copy("palette values", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function RandomPasswordPhraseGeneratorTool() {
  const [wordCount, setWordCount] = useState(4);
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const total = Math.max(3, Math.min(8, wordCount));
    setOutput(Array.from({ length: total }, () => passphraseWords[getRandomInt(passphraseWords.length)]).join("-"));
  }

  return (
    <ToolShell title="Random Password Phrase Generator" description="Generate simple passphrase-style passwords from bundled local words and browser randomness.">
      <Field label="Words per passphrase">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="3" max="8" value={wordCount} onChange={(event) => setWordCount(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate passphrase
      </button>
      {!output ? <EmptyState title="No passphrase generated yet" description="Generate a multi-word passphrase locally using browser-side randomness." /> : <>
        <OutputBlock title="Generated passphrase" value={output} multiline={false} />
        <button type="button" className={buttonClass} onClick={() => copy("passphrase", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function RandomQuoteGeneratorTool() {
  const [quote, setQuote] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    setQuote(quoteBank[getRandomInt(quoteBank.length)]);
  }

  return (
    <ToolShell title="Random Quote Generator" description="Generate quotes from a bundled local quote list with no external API dependency.">
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate quote
      </button>
      {!quote ? <EmptyState title="No quote generated yet" description="Generate a quote locally for inspiration, placeholders, or demos." /> : <>
        <OutputBlock title="Generated quote" value={quote} />
        <button type="button" className={buttonClass} onClick={() => copy("quote", quote)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function BlogTitleGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(6);
  const [titles, setTitles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const cleanedTopic = topic.trim();
    if (!cleanedTopic) {
      setError("Enter a topic or keyword to generate blog title ideas.");
      setTitles([]);
      return;
    }

    const total = clamp(count, 3, 10);
    const next = Array.from({ length: total }, (_, index) => {
      const template = blogTitleTemplates[index % blogTitleTemplates.length];
      return template.replaceAll("{topic}", cleanedTopic);
    });

    setTitles(dedupePreserveOrder(next));
    setError("");
  }

  const output = useMemo(() => titles.join("\n"), [titles]);

  return (
    <ToolShell title="Blog Title Generator" description="Generate blog title ideas locally from reusable templates and your chosen topic.">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
        <Field label="Topic or keyword">
          <input className={inputClass} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="email marketing" />
        </Field>
        <Field label="Ideas to generate">
          <input className={inputClass} type="number" min="3" max="10" value={count} onChange={(event) => setCount(Number(event.target.value))} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate blog titles</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!titles.length ? <EmptyState title="No title ideas yet" description="Enter a topic and generate a small batch of blog titles you can refine or reuse." /> : <>
        <OutputBlock title="Title ideas" value={output} />
        <button type="button" className={buttonClass} onClick={() => copy("blog title ideas", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function YouTubeTagGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const parts = toSlugParts(topic);
    if (!parts.length) {
      setError("Enter a topic or keyword to generate YouTube tags.");
      setTags([]);
      return;
    }

    const base = parts.join(" ");
    const next = dedupePreserveOrder([
      base,
      `${base} tutorial`,
      `${base} tips`,
      `${base} guide`,
      `${parts.join("")} ${pickRandom(youtubeTagModifiers)}`,
      `${parts[0]} ${pickRandom(youtubeTagModifiers)}`,
      `${base} for beginners`,
      `best ${base}`,
    ]).slice(0, 8);

    setTags(next);
    setError("");
  }

  const output = useMemo(() => tags.join(", "), [tags]);

  return (
    <ToolShell title="YouTube Tag Generator" description="Generate YouTube tag ideas locally from your main topic without using live platform data.">
      <Field label="Video topic or keyword">
        <input className={inputClass} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="personal finance tips" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate tags</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!tags.length ? <EmptyState title="No tags generated yet" description="Enter a topic to build a local list of YouTube tag suggestions." /> : <>
        <OutputBlock title="Suggested tags" value={output} multiline={false} />
        <button type="button" className={buttonClass} onClick={() => copy("YouTube tags", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function InstagramHashtagGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const parts = toSlugParts(topic);
    if (!parts.length) {
      setError("Enter a topic or keyword to generate hashtags.");
      setTags([]);
      return;
    }

    const base = parts.join("");
    const next = dedupePreserveOrder([
      `#${base}`,
      `#${base}${pickRandom(hashtagModifiers)}`,
      `#${parts[0]}tips`,
      `#${parts[0]}creator`,
      `#${base}daily`,
      `#${base}community`,
      `#${base}love`,
      `#${parts.join("")}online`,
    ]).slice(0, 8);

    setTags(next);
    setError("");
  }

  const output = useMemo(() => tags.join(" "), [tags]);

  return (
    <ToolShell title="Instagram Hashtag Generator" description="Generate Instagram hashtag ideas locally from your topic using reusable keyword patterns.">
      <Field label="Topic or niche">
        <input className={inputClass} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="fitness coaching" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate hashtags</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!tags.length ? <EmptyState title="No hashtags generated yet" description="Enter a topic and generate a local set of Instagram hashtag suggestions." /> : <>
        <OutputBlock title="Suggested hashtags" value={output} />
        <button type="button" className={buttonClass} onClick={() => copy("Instagram hashtags", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function ProductNameGeneratorTool() {
  const [keyword, setKeyword] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const parts = toSlugParts(keyword);
    if (!parts.length) {
      setError("Enter a product theme or keyword first.");
      setNames([]);
      return;
    }

    const root = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    const next = dedupePreserveOrder([
      `${pickRandom(productPrefixes)}${root}`,
      `${root}${pickRandom(productSuffixes)}`,
      `${pickRandom(productPrefixes)}${pickRandom(productSuffixes)}`,
      `${root}${pickRandom(productPrefixes)}`,
      `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}${pickRandom(productSuffixes)}`,
      `${pickRandom(productPrefixes)}${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} Labs`,
    ]).slice(0, 6);

    setNames(next);
    setError("");
  }

  const output = useMemo(() => names.join("\n"), [names]);

  return (
    <ToolShell title="Product Name Generator" description="Generate product name ideas locally from your keyword and a reusable set of naming patterns.">
      <Field label="Product keyword or theme">
        <input className={inputClass} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="analytics" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate product names</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!names.length ? <EmptyState title="No product names yet" description="Enter a product theme to generate short local name ideas." /> : <>
        <OutputBlock title="Product name ideas" value={output} />
        <button type="button" className={buttonClass} onClick={() => copy("product name ideas", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function DomainNameGeneratorTool() {
  const [keyword, setKeyword] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const parts = toSlugParts(keyword);
    if (!parts.length) {
      setError("Enter a keyword or brand theme to generate domain ideas.");
      setDomains([]);
      return;
    }

    const base = parts.join("");
    const variants = dedupePreserveOrder([
      base,
      `${base}hq`,
      `${base}hub`,
      `${parts[0]}labs`,
      `${parts[0]}online`,
    ]);

    const next = variants.flatMap((variant, index) => [`${variant}${domainTlds[index % domainTlds.length]}`]).slice(0, 5);
    setDomains(next);
    setError("");
  }

  const output = useMemo(() => domains.join("\n"), [domains]);

  return (
    <ToolShell title="Domain Name Generator" description="Generate domain-style name ideas locally without claiming live availability checks.">
      <Field label="Keyword or brand theme">
        <input className={inputClass} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="creator studio" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate domain ideas</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!domains.length ? <EmptyState title="No domain ideas yet" description="Enter a keyword to build a small local list of domain-style suggestions." /> : <>
        <OutputBlock title="Domain ideas" value={output} />
        <Notice>These are idea suggestions only. This tool does not check live domain availability.</Notice>
        <button type="button" className={buttonClass} onClick={() => copy("domain ideas", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function RandomTeamGeneratorTool() {
  const [namesInput, setNamesInput] = useState("");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const names = dedupePreserveOrder(
      namesInput
        .split(/\r?\n|,/)
        .map((value) => value.trim())
        .filter(Boolean),
    );

    if (names.length < 2) {
      setError("Enter at least two names to build teams.");
      setTeams([]);
      return;
    }

    const totalTeams = clamp(teamCount, 2, Math.min(10, names.length));
    const shuffled = [...names];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = getRandomInt(index + 1);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    const next = Array.from({ length: totalTeams }, () => [] as string[]);
    shuffled.forEach((name, index) => {
      next[index % totalTeams].push(name);
    });

    setTeams(next);
    setError("");
  }

  const output = useMemo(
    () => teams.map((team, index) => `Team ${index + 1}: ${team.join(", ")}`).join("\n"),
    [teams],
  );

  return (
    <ToolShell title="Random Team Generator" description="Split names into random teams locally without uploading participant data anywhere.">
      <Field label="Names" hint="Add one name per line or separate names with commas.">
        <textarea className={textareaClass} value={namesInput} onChange={(event) => setNamesInput(event.target.value)} placeholder={"Alex\nJordan\nTaylor\nMorgan"} />
      </Field>
      <Field label="Number of teams">
        <input className={inputClass} type="number" min="2" max="10" value={teamCount} onChange={(event) => setTeamCount(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate teams</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!teams.length ? <EmptyState title="No teams generated yet" description="Add a participant list and choose how many teams you want." /> : <>
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team, index) => (
            <div key={`team-${index + 1}`} className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Team {index + 1}</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {team.map((member) => <li key={`${index + 1}-${member}`}>{member}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <OutputBlock title="Team list" value={output} />
        <button type="button" className={buttonClass} onClick={() => copy("team list", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function DiceRollerTool() {
  const [diceCount, setDiceCount] = useState(2);
  const [sides, setSides] = useState(6);
  const [rolls, setRolls] = useState<number[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const total = useMemo(() => rolls.reduce((sum, value) => sum + value, 0), [rolls]);
  const output = useMemo(() => (rolls.length ? `${rolls.join(", ")} | Total: ${total}` : ""), [rolls, total]);

  function handleRoll() {
    const safeDiceCount = clamp(diceCount, 1, 10);
    const safeSides = clamp(sides, 2, 100);
    if (!Number.isFinite(safeDiceCount) || !Number.isFinite(safeSides)) {
      setError("Enter valid dice values before rolling.");
      setRolls([]);
      return;
    }
    setRolls(Array.from({ length: safeDiceCount }, () => getRandomInt(safeSides) + 1));
    setError("");
  }

  return (
    <ToolShell title="Dice Roller" description="Roll one or more virtual dice locally with adjustable dice count and side count.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="How many dice?">
          <input className={inputClass} type="number" min="1" max="10" value={diceCount} onChange={(event) => setDiceCount(Number(event.target.value))} />
        </Field>
        <Field label="Sides per die">
          <input className={inputClass} type="number" min="2" max="100" value={sides} onChange={(event) => setSides(Number(event.target.value))} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleRoll}>Roll dice</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!rolls.length ? <EmptyState title="No roll yet" description="Choose how many dice and sides you want, then roll to generate a result." /> : <>
        <OutputBlock title="Roll result" value={output} multiline={false} />
        <button type="button" className={buttonClass} onClick={() => copy("dice roll", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function CoinFlipGeneratorTool() {
  const [flipCount, setFlipCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const { copied, copy } = useCopyToClipboard();

  function handleFlip() {
    const total = clamp(flipCount, 1, 25);
    setResults(Array.from({ length: total }, () => (getRandomInt(2) === 0 ? "Heads" : "Tails")));
  }

  const heads = results.filter((result) => result === "Heads").length;
  const tails = results.length - heads;
  const output = useMemo(() => results.join(", "), [results]);

  return (
    <ToolShell title="Coin Flip Generator" description="Flip one or more virtual coins locally and review the result summary instantly.">
      <Field label="How many flips?">
        <input className={inputClass} type="number" min="1" max="25" value={flipCount} onChange={(event) => setFlipCount(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleFlip}>Flip coin</button>
      {!results.length ? <EmptyState title="No coin flip yet" description="Choose how many flips you want and generate the result locally." /> : <>
        <OutputBlock title="Flip results" value={output} multiline={false} />
        <Notice>{`Heads: ${heads} | Tails: ${tails}`}</Notice>
        <button type="button" className={buttonClass} onClick={() => copy("coin flip results", output)}>Copy output</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function WheelSpinnerRandomPickerTool() {
  const [optionsInput, setOptionsInput] = useState("");
  const [picked, setPicked] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handlePick() {
    const values = dedupePreserveOrder(
      optionsInput
        .split(/\r?\n|,/)
        .map((value) => value.trim())
        .filter(Boolean),
    );

    if (values.length < 2) {
      setError("Enter at least two options before spinning the picker.");
      setPicked("");
      setOptions([]);
      return;
    }

    setOptions(values);
    setPicked(values[getRandomInt(values.length)]);
    setError("");
  }

  const output = picked ? `Picked: ${picked}` : "";

  return (
    <ToolShell title="Wheel Spinner Random Picker" description="Pick a random option locally from a list of choices using lightweight browser-side randomness.">
      <Field label="Options" hint="Add one option per line or separate them with commas.">
        <textarea className={textareaClass} value={optionsInput} onChange={(event) => setOptionsInput(event.target.value)} placeholder={"Option 1\nOption 2\nOption 3"} />
      </Field>
      <button type="button" className={buttonClass} onClick={handlePick}>Spin picker</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!picked ? <EmptyState title="No option picked yet" description="Enter a short option list and spin the picker to choose a result." /> : <>
        <OutputBlock title="Selected option" value={output} multiline={false} />
        <div className="rounded-2xl bg-stone-50 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Available options</p>
          <p className="mt-2 break-words">{options.join(", ")}</p>
        </div>
        <button type="button" className={buttonClass} onClick={() => copy("selected option", output)}>Copy result</button>
        {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
      </>}
    </ToolShell>
  );
}

export function CountdownTimerGeneratorTool() {
  const [targetDateTime, setTargetDateTime] = useState("");
  const [label, setLabel] = useState("Launch countdown");
  const { copied, copy } = useCopyToClipboard();

  const result = useMemo(() => {
    if (!targetDateTime) {
      return { output: "", error: "" };
    }

    const target = new Date(targetDateTime);
    if (Number.isNaN(target.getTime())) {
      return { output: "", error: "Enter a valid target date and time." };
    }

    const now = new Date();
    const differenceMs = target.getTime() - now.getTime();
    if (differenceMs <= 0) {
      return { output: "", error: "Choose a target date and time that is still in the future." };
    }

    const totalSeconds = Math.floor(differenceMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      output: `${label || "Countdown"}\nTarget: ${target.toLocaleString()}\nRemaining now: ${days} day(s), ${hours} hour(s), ${minutes} minute(s), ${seconds} second(s)`,
      error: "",
    };
  }, [label, targetDateTime]);

  return (
    <ToolShell title="Countdown Timer Generator" description="Generate a countdown summary for a future date and time using local browser time.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Countdown label">
          <input className={inputClass} value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Product launch" />
        </Field>
        <Field label="Target date and time">
          <input className={inputClass} type="datetime-local" value={targetDateTime} onChange={(event) => setTargetDateTime(event.target.value)} />
        </Field>
      </div>
      {!targetDateTime ? (
        <EmptyState title="Pick a future target date" description="Set a label and future date/time to generate a countdown summary you can reuse." />
      ) : result.error ? (
        <Notice tone="error">{result.error}</Notice>
      ) : (
        <>
          <OutputBlock title="Countdown summary" value={result.output} />
          <button type="button" className={buttonClass} onClick={() => copy("countdown summary", result.output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}
