"use client";

import { useState } from "react";
import {
  buttonClass,
  EmptyState,
  Field,
  inputClass,
  Notice,
  OutputBlock,
  ToolShell,
  useCopyToClipboard,
} from "@/components/tools/common";

const keywordSuggestionModifiers = [
  "tips",
  "guide",
  "examples",
  "template",
  "checklist",
  "for beginners",
  "online",
  "best practices",
];

const pageTitleTemplates = [
  "{keyword}: Simple Guide",
  "Best {keyword} Tips",
  "{keyword} Examples",
  "{keyword} Checklist",
  "How to Improve {keyword}",
  "{keyword} for Beginners",
];

const descriptionTemplates = [
  "Use {keyword} to simplify your workflow with a fast browser-based tool and clear copy-ready output.",
  "Generate better {keyword} ideas locally with a practical browser-first workflow and easy next steps.",
  "Plan your {keyword} content faster with a lightweight local tool built for drafting and SEO brainstorming.",
  "Create a polished {keyword} draft with clear examples, structured output, and easy copy actions.",
];

function leftRotate(value: number, shift: number) {
  return (value << shift) | (value >>> (32 - shift));
}

function md5Bytes(message: Uint8Array) {
  const originalBitLength = message.length * 8;
  const withPaddingLength = (((message.length + 8) >> 6) + 1) * 64;
  const bytes = new Uint8Array(withPaddingLength);
  bytes.set(message);
  bytes[message.length] = 0x80;

  const bitLengthView = new DataView(bytes.buffer);
  bitLengthView.setUint32(withPaddingLength - 8, originalBitLength >>> 0, true);
  bitLengthView.setUint32(withPaddingLength - 4, Math.floor(originalBitLength / 2 ** 32), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const constants = Array.from({ length: 64 }, (_, index) =>
    Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000),
  );

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = Array.from({ length: 16 }, (_, index) =>
      bitLengthView.getUint32(offset + index * 4, true),
    );

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let index = 0; index < 64; index += 1) {
      let f: number;
      let g: number;

      if (index < 16) {
        f = (b & c) | (~b & d);
        g = index;
      } else if (index < 32) {
        f = (d & b) | (~d & c);
        g = (5 * index + 1) % 16;
      } else if (index < 48) {
        f = b ^ c ^ d;
        g = (3 * index + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * index) % 16;
      }

      const nextD = d;
      d = c;
      c = b;
      b = (b + leftRotate((a + f + constants[index] + words[g]) >>> 0, shifts[index])) >>> 0;
      a = nextD;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  return [a0, b0, c0, d0]
    .map((word) =>
      Array.from({ length: 4 }, (_, index) => ((word >>> (index * 8)) & 0xff).toString(16).padStart(2, "0")).join(""),
    )
    .join("");
}

async function digestFile(file: File, algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512") {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (algorithm === "MD5") {
    return md5Bytes(bytes);
  }

  const digest = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toKeywordParts(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function pickKeywordModifier(seed: string) {
  const index = seed.length % keywordSuggestionModifiers.length;
  return keywordSuggestionModifiers[index];
}

function buildKeywordSuggestions(seed: string) {
  const parts = toKeywordParts(seed);
  if (!parts.length) {
    throw new Error("Enter a seed keyword or phrase first.");
  }

  const base = parts.join(" ");
  const first = parts[0];
  const joined = parts.join("");
  const suggestions = [
    base,
    ...keywordSuggestionModifiers.map((modifier) => `${base} ${modifier}`),
    `how to ${base}`,
    `${base} near me`,
    `${base} online`,
    `${base} free`,
    `${first} ${pickKeywordModifier(joined)}`,
  ];

  return [...new Set(suggestions)].slice(0, 14);
}

function parseMetaTagAttributes(tag: string) {
  const attributes = new Map<string, string>();
  for (const match of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*"([^"]*)"/g)) {
    attributes.set(match[1].toLowerCase(), match[2]);
  }
  return attributes;
}

function analyzeMetaTags(markup: string) {
  if (!markup.trim()) {
    throw new Error("Paste page head markup or meta tags before analyzing them.");
  }

  const titleMatch = markup.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaTags = [...markup.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const canonicalMatch = markup.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/i);

  const title = titleMatch?.[1]?.trim() ?? "";
  const description = metaTags
    .map(parseMetaTagAttributes)
    .find((attributes) => attributes.get("name")?.toLowerCase() === "description")
    ?.get("content") ?? "";
  const robots = metaTags
    .map(parseMetaTagAttributes)
    .find((attributes) => attributes.get("name")?.toLowerCase() === "robots")
    ?.get("content") ?? "";
  const ogTitle = metaTags
    .map(parseMetaTagAttributes)
    .find((attributes) => attributes.get("property")?.toLowerCase() === "og:title")
    ?.get("content") ?? "";

  const findings = [
    `Title: ${title || "Missing"}`,
    `Title length: ${title.length} characters`,
    `Meta description: ${description || "Missing"}`,
    `Description length: ${description.length} characters`,
    `Canonical URL: ${canonicalMatch?.[1] || "Missing"}`,
    `Robots tag: ${robots || "Missing"}`,
    `Open Graph title: ${ogTitle || "Missing"}`,
  ];

  const suggestions: string[] = [];
  if (!title) suggestions.push("Add a <title> tag.");
  if (title && (title.length < 30 || title.length > 60)) suggestions.push("Keep the title closer to 30-60 characters.");
  if (!description) suggestions.push("Add a meta description.");
  if (description && (description.length < 120 || description.length > 160)) suggestions.push("Keep the description closer to 120-160 characters.");
  if (!canonicalMatch?.[1]) suggestions.push("Add a canonical URL if the page needs one.");
  if (!ogTitle) suggestions.push("Add Open Graph tags for better social sharing.");

  return { findings, suggestions };
}

function buildPageTitles(keyword: string, brand: string) {
  const cleanedKeyword = keyword.trim();
  if (!cleanedKeyword) {
    throw new Error("Enter a topic or keyword first.");
  }
  const brandSuffix = brand.trim() ? ` | ${brand.trim()}` : "";
  return [...new Set(pageTitleTemplates.map((template) => template.replaceAll("{keyword}", cleanedKeyword) + brandSuffix))].slice(0, 6);
}

function buildDescriptions(keyword: string, audience: string) {
  const cleanedKeyword = keyword.trim();
  if (!cleanedKeyword) {
    throw new Error("Enter a topic, keyword, or product first.");
  }
  const audienceSuffix = audience.trim() ? ` Built with ${audience.trim()} in mind.` : "";
  return [...new Set(descriptionTemplates.map((template) => template.replaceAll("{keyword}", cleanedKeyword) + audienceSuffix))].slice(0, 6);
}

function FileHashTool({
  title,
  description,
  mode,
}: {
  title: string;
  description: string;
  mode: "checker" | "generator";
}) {
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<"MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512">("SHA-256");
  const [expectedHash, setExpectedHash] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  async function handleGenerate() {
    if (!file) {
      setError("Upload a file before generating a checksum.");
      setOutput("");
      return;
    }

    setIsWorking(true);
    try {
      const hash = await digestFile(file, algorithm);
      const lines = [
        `File: ${file.name}`,
        `Size: ${file.size.toLocaleString()} bytes`,
        `Algorithm: ${algorithm}`,
        `Digest: ${hash}`,
      ];
      if (mode === "checker") {
        const normalizedExpected = expectedHash.trim().toLowerCase();
        if (!normalizedExpected) {
          throw new Error("Enter the expected hash before checking the file.");
        }
        lines.push(`Match: ${normalizedExpected === hash.toLowerCase() ? "Yes" : "No"}`);
      }
      setOutput(lines.join("\n"));
      setError("");
    } catch (hashError) {
      setError(hashError instanceof Error ? hashError.message : "Unable to compute the file hash.");
      setOutput("");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <ToolShell title={title} description={description}>
      <Field label="Upload file" hint="The file is hashed locally in your browser and is not uploaded anywhere.">
        <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Hash algorithm">
        <select className={inputClass} value={algorithm} onChange={(event) => setAlgorithm(event.target.value as "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512")}>
          <option value="MD5">MD5</option>
          <option value="SHA-1">SHA-1</option>
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-384">SHA-384</option>
          <option value="SHA-512">SHA-512</option>
        </select>
      </Field>
      {mode === "checker" ? (
        <Field label="Expected hash" hint="Paste the digest you want to compare against. Uppercase and lowercase are treated the same.">
          <input className={inputClass} value={expectedHash} onChange={(event) => setExpectedHash(event.target.value)} placeholder="Paste expected checksum" />
        </Field>
      ) : null}
      <button type="button" className={buttonClass} onClick={handleGenerate} disabled={isWorking}>
        {isWorking ? "Computing hash..." : mode === "checker" ? "Check file hash" : "Generate checksum"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? <EmptyState title="Upload a file to begin" description="Choose a file, select a hash algorithm, and compute the digest locally in the browser." /> : null}
      {output ? (
        <>
          <OutputBlock title={mode === "checker" ? "File hash check" : "File checksum"} value={output} />
          <button type="button" className={buttonClass} onClick={() => copy(mode === "checker" ? "file hash check" : "file checksum", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function FileHashCheckerTool() {
  return <FileHashTool title="File Hash Checker" description="Upload a file, compute its digest locally, and compare it with an expected checksum without sending the file to a server." mode="checker" />;
}

export function FileChecksumGeneratorTool() {
  return <FileHashTool title="File Checksum Generator" description="Generate MD5 or SHA-family file checksums locally in the browser from uploaded file contents." mode="generator" />;
}

export function KeywordDifficultyCheckerPlaceholderTool() {
  return (
    <ToolShell title="Keyword Difficulty Checker" description="This page stays simple because the tool is not active on this site right now.">
      <Notice>
        This tool is not available right now.
      </Notice>
      <EmptyState
        title="Unavailable"
        description="This tool is not active on this site right now."
      />
    </ToolShell>
  );
}

export function KeywordSuggestionGeneratorTool() {
  const [seed, setSeed] = useState("email marketing");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    try {
      setOutput(buildKeywordSuggestions(seed).join("\n"));
      setError("");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate keyword suggestions.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="Keyword Suggestion Generator" description="Generate local keyword ideas from a seed phrase using reusable modifiers and question-style patterns without pretending to use live search data.">
      <Field label="Seed keyword or phrase" hint="Example: email marketing">
        <input className={inputClass} value={seed} onChange={(event) => setSeed(event.target.value)} placeholder="email marketing" />
      </Field>
      <Notice>Example ideas include modifiers like tips, guide, online, and question-style variations.</Notice>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate keyword ideas</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? <EmptyState title="No keyword ideas yet" description="Enter a seed phrase and generate a local list of brainstorming suggestions you can refine later." /> : null}
      {output ? (
        <>
          <OutputBlock title="Keyword suggestions" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("keyword suggestions", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function MetaTagAnalyzerTool() {
  const [markup, setMarkup] = useState('<title>Email Marketing Guide | Toolbox Hub</title>\n<meta name="description" content="Learn practical email marketing tips with a browser-first workflow." />\n<meta name="robots" content="index,follow" />\n<link rel="canonical" href="https://example.com/email-marketing-guide" />');
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleAnalyze() {
    try {
      const result = analyzeMetaTags(markup);
      setReport(`${result.findings.join("\n")}\n\nSuggestions:\n${result.suggestions.length ? result.suggestions.map((item) => `- ${item}`).join("\n") : "- No major gaps detected in the basic tag set."}`);
      setError("");
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Unable to analyze those meta tags.");
      setReport("");
    }
  }

  return (
    <ToolShell title="Meta Tag Analyzer" description="Review pasted head markup locally, detect common SEO tags, and highlight basic gaps like missing titles, descriptions, canonicals, or Open Graph tags.">
      <Field label="Head markup or meta tags" hint="Paste a few tags or a full <head> snippet.">
        <textarea className={`${inputClass} min-h-40`} value={markup} onChange={(event) => setMarkup(event.target.value)} />
      </Field>
      <Notice>Helpful example: title, description, robots, canonical, and Open Graph tags for a landing page or blog post.</Notice>
      <button type="button" className={buttonClass} onClick={handleAnalyze}>Analyze meta tags</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!report && !error ? <EmptyState title="No analysis yet" description="Paste markup and run the analyzer to get a quick formatted SEO review." /> : null}
      {report ? (
        <>
          <OutputBlock title="Meta tag analysis" value={report} />
          <button type="button" className={buttonClass} onClick={() => copy("meta tag analysis", report)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function PageTitleGeneratorTool() {
  const [keyword, setKeyword] = useState("email marketing");
  const [brand, setBrand] = useState("Toolbox Hub");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    try {
      setOutput(buildPageTitles(keyword, brand).join("\n"));
      setError("");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate page titles.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="Page Title Generator" description="Generate SEO-friendly page title ideas from a topic, keyword, and optional brand name using local templates instead of live data or AI.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Primary keyword" hint="Example: email marketing">
          <input className={inputClass} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="email marketing" />
        </Field>
        <Field label="Brand name" hint="Optional brand suffix">
          <input className={inputClass} value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Toolbox Hub" />
        </Field>
      </div>
      <Notice>Helpful example: combine a core keyword with a brand suffix for title-tag brainstorming.</Notice>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate page titles</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? <EmptyState title="No title ideas yet" description="Enter a keyword and optional brand name to generate formatted page-title ideas." /> : null}
      {output ? (
        <>
          <OutputBlock title="Page title ideas" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("page title ideas", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function DescriptionGeneratorTool() {
  const [keyword, setKeyword] = useState("email marketing");
  const [audience, setAudience] = useState("small teams");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    try {
      setOutput(buildDescriptions(keyword, audience).join("\n\n"));
      setError("");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate description ideas.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="Description Generator" description="Generate meta-description style lines locally from a topic and optional audience cue using reusable drafting templates.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Topic or keyword" hint="Example: email marketing">
          <input className={inputClass} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="email marketing" />
        </Field>
        <Field label="Audience or use case" hint="Optional angle like beginners or small teams">
          <input className={inputClass} value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="small teams" />
        </Field>
      </div>
      <Notice>Helpful example: draft several description options, then refine one down to your preferred snippet length.</Notice>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate descriptions</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? <EmptyState title="No description ideas yet" description="Enter a keyword and optional audience to generate formatted draft descriptions you can refine." /> : null}
      {output ? (
        <>
          <OutputBlock title="Description ideas" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("description ideas", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}
