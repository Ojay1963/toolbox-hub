"use client";

import { useMemo, useState } from "react";
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

function encodeUtf8ToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64ToUtf8(value: string) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function minifyCss(value: string) {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;\}/g, "}")
    .replace(/\s+/g, " ")
    .trim();
}

function minifyHtml(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseCsvRow(row: string) {
  const cells: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];

    if (character === '"') {
      if (insideQuotes && row[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  if (insideQuotes) {
    throw new Error("The CSV input has an unclosed quoted field.");
  }

  cells.push(current);
  return cells;
}

function parseCsv(value: string) {
  const lines = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (!lines.length) {
    throw new Error("Paste CSV content before converting it.");
  }

  const headers = parseCsvRow(lines[0]).map((header) => header.trim());
  if (!headers.every(Boolean)) {
    throw new Error("The header row must contain a name for every column.");
  }

  return lines.slice(1).map((line, rowIndex) => {
    const values = parseCsvRow(line);
    if (values.length !== headers.length) {
      throw new Error(`Row ${rowIndex + 2} has ${values.length} columns, but the header has ${headers.length}.`);
    }

    return headers.reduce<Record<string, string>>((record, header, headerIndex) => {
      record[header] = values[headerIndex] ?? "";
      return record;
    }, {});
  });
}

function escapeCsvValue(value: unknown) {
  const stringValue = value == null ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function jsonToCsv(value: string) {
  const parsed = JSON.parse(value);
  const rows = Array.isArray(parsed) ? parsed : [parsed];

  if (!rows.length) {
    throw new Error("Add at least one object to convert JSON into CSV.");
  }

  if (!rows.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
    throw new Error("JSON to CSV expects an object or an array of objects.");
  }

  const headers = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row as Record<string, unknown>))),
  );

  const csvRows = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      headers
        .map((header) => escapeCsvValue((row as Record<string, unknown>)[header]))
        .join(","),
    ),
  ];

  return csvRows.join("\n");
}

function htmlEncode(value: string) {
  const textarea = document.createElement("textarea");
  textarea.textContent = value;
  return textarea.innerHTML;
}

function htmlDecode(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function encodeBase64Url(value: string) {
  return encodeUtf8ToBase64(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return decodeBase64ToUtf8(normalized + padding);
}

function convertInlineMarkdownToHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(value: string) {
  const blocks = value.trim().split(/\n\s*\n/);
  if (!blocks.length || !value.trim()) {
    throw new Error("Paste Markdown content before converting it.");
  }

  return blocks
    .map((block) => {
      const lines = block.split("\n");

      if (lines.every((line) => /^- /.test(line))) {
        const items = lines
          .map((line) => line.replace(/^- /, "").trim())
          .map((line) => `<li>${convertInlineMarkdownToHtml(line)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      if (lines.every((line) => /^\d+\. /.test(line))) {
        const items = lines
          .map((line) => line.replace(/^\d+\. /, "").trim())
          .map((line) => `<li>${convertInlineMarkdownToHtml(line)}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      }

      if (lines.length === 1 && /^#{1,6}\s+/.test(lines[0])) {
        const headingMatch = lines[0].match(/^(#{1,6})\s+(.+)$/);
        if (!headingMatch) {
          return `<p>${convertInlineMarkdownToHtml(lines[0])}</p>`;
        }
        const level = headingMatch[1].length;
        return `<h${level}>${convertInlineMarkdownToHtml(headingMatch[2])}</h${level}>`;
      }

      if (lines.length === 1 && /^> /.test(lines[0])) {
        return `<blockquote>${convertInlineMarkdownToHtml(lines[0].replace(/^> /, ""))}</blockquote>`;
      }

      return `<p>${lines.map((line) => convertInlineMarkdownToHtml(line.trim())).join("<br />")}</p>`;
    })
    .join("\n");
}

function escapeMarkdownText(value: string) {
  return value.replace(/([*_`[\]])/g, "\\$1");
}

function nodeToMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  const text = Array.from(node.childNodes).map((child) => nodeToMarkdown(child)).join("");
  const inner = text.trim();

  switch (node.tagName.toLowerCase()) {
    case "h1":
      return `# ${inner}`;
    case "h2":
      return `## ${inner}`;
    case "h3":
      return `### ${inner}`;
    case "h4":
      return `#### ${inner}`;
    case "h5":
      return `##### ${inner}`;
    case "h6":
      return `###### ${inner}`;
    case "strong":
    case "b":
      return `**${inner}**`;
    case "em":
    case "i":
      return `*${inner}*`;
    case "code":
      return `\`${inner}\``;
    case "a":
      return `[${inner || node.getAttribute("href") || "link"}](${node.getAttribute("href") || "#"})`;
    case "br":
      return "\n";
    case "p":
      return inner;
    case "blockquote":
      return `> ${inner}`;
    case "ul":
      return Array.from(node.children)
        .map((child) => `- ${nodeToMarkdown(child).trim()}`)
        .join("\n");
    case "ol":
      return Array.from(node.children)
        .map((child, index) => `${index + 1}. ${nodeToMarkdown(child).trim()}`)
        .join("\n");
    case "li":
      return inner;
    default:
      return inner || escapeMarkdownText(node.textContent ?? "");
  }
}

function htmlToMarkdown(value: string) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(value, "text/html");
  const parserError = documentNode.querySelector("parsererror");
  if (parserError) {
    throw new Error("Enter valid HTML markup before converting it.");
  }

  const content = Array.from(documentNode.body.childNodes)
    .map((node) => nodeToMarkdown(node).trim())
    .filter(Boolean)
    .join("\n\n");

  if (!content) {
    throw new Error("Enter HTML content with readable text before converting it.");
  }

  return content;
}

function leftRotate(value: number, shift: number) {
  return (value << shift) | (value >>> (32 - shift));
}

function md5(value: string) {
  const message = new TextEncoder().encode(value);
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

async function digestValue(value: string, algorithm: AlgorithmIdentifier) {
  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleFormat(minify = false) {
    if (!input.trim()) {
      setError("Paste JSON before formatting.");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="JSON Formatter" description="Validate, pretty-print, and minify JSON locally with clear error feedback.">
      <Field label="JSON input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder='{"name":"Toolbox Hub"}' />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={() => handleFormat(false)}>Format JSON</button>
        <button type="button" className={secondaryButtonClass} onClick={() => handleFormat(true)}>Minify JSON</button>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title="Add JSON to format" description="Paste valid JSON and choose whether you want a prettified or minified result." />
      ) : output ? (
        <>
          <OutputBlock title="Formatted output" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("formatted JSON", output)}>Copy output</button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      ) : null}
    </ToolShell>
  );
}

function Base64Tool({
  mode,
}: {
  mode: "encode" | "decode";
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleRun() {
    if (!input) {
      setError(`Enter text to ${mode}.`);
      setOutput("");
      return;
    }

    try {
      const result = mode === "encode" ? encodeUtf8ToBase64(input) : decodeBase64ToUtf8(input.trim());
      setOutput(result);
      setError("");
    } catch {
      setError(mode === "decode" ? "That Base64 input is not valid." : "Unable to encode that input.");
      setOutput("");
    }
  }

  return (
    <ToolShell
      title={mode === "encode" ? "Base64 Encoder" : "Base64 Decoder"}
      description={mode === "encode" ? "Convert plain text into Base64 locally in the browser." : "Decode Base64 text into readable UTF-8 output with validation."}
    >
      <Field label={mode === "encode" ? "Plain text" : "Base64 input"}>
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={mode === "encode" ? "Enter text to encode." : "Paste a Base64 string."} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleRun}>
        {mode === "encode" ? "Encode Base64" : "Decode Base64"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title={`Nothing to ${mode} yet`} description={mode === "encode" ? "Enter plain text to create Base64 output." : "Paste a valid Base64 string to decode it."} />
      ) : output ? (
        <>
          <OutputBlock title="Output" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("Base64 output", output)}>Copy output</button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      ) : null}
    </ToolShell>
  );
}

export function Base64EncoderTool() {
  return <Base64Tool mode="encode" />;
}

export function Base64DecoderTool() {
  return <Base64Tool mode="decode" />;
}

function MinifierTool({
  title,
  description,
  minify,
  placeholder,
}: {
  title: string;
  description: string;
  minify: (value: string) => string;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleMinify() {
    if (!input.trim()) {
      setError("Add code before minifying.");
      setOutput("");
      return;
    }
    setOutput(minify(input));
    setError("");
  }

  return (
    <ToolShell title={title} description={description}>
      <Field label="Input code">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleMinify}>
        Minify code
      </button>
      <Notice>Reduced-scope local minification only. This is useful for cleanup, but it is not a full production optimizer.</Notice>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title="Add code to minify" description="Paste CSS or HTML and the tool will remove comments and unnecessary spacing where appropriate." />
      ) : output ? (
        <>
          <OutputBlock title="Minified output" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("minified output", output)}>Copy output</button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      ) : null}
    </ToolShell>
  );
}

export function CssMinifierTool() {
  return (
    <MinifierTool
      title="CSS Minifier"
      description="Shrink CSS by removing comments and extra whitespace with a lightweight browser-side cleanup flow."
      minify={minifyCss}
      placeholder={"body {\n  color: red;\n}\n/* comment */"}
    />
  );
}

export function HtmlMinifierTool() {
  return (
    <MinifierTool
      title="HTML Minifier"
      description="Minify HTML markup locally with a lightweight cleanup pass and clear scope labeling."
      minify={minifyHtml}
      placeholder={"<div>\n  <span>Hello</span>\n</div>"}
    />
  );
}

function UrlCodecTool({
  mode,
}: {
  mode: "encode" | "decode";
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleRun() {
    if (!input) {
      setError(`Enter text to ${mode}.`);
      setOutput("");
      return;
    }

    try {
      setOutput(mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input));
      setError("");
    } catch {
      setError(mode === "decode" ? "That URL-encoded value is not valid." : "Unable to encode this value.");
      setOutput("");
    }
  }

  return (
    <ToolShell
      title={mode === "encode" ? "URL Encoder" : "URL Decoder"}
      description={mode === "encode" ? "Encode URL components safely with browser-native encoding." : "Decode URL-encoded text back into readable values with validation."}
    >
      <Field label="Input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={mode === "encode" ? "Enter text to encode." : "Paste URL-encoded text."} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleRun}>
        {mode === "encode" ? "Encode URL" : "Decode URL"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title={`Nothing to ${mode} yet`} description={mode === "encode" ? "Add text or a URL component to encode it safely." : "Paste URL-encoded text to decode it."} />
      ) : output ? (
        <>
          <OutputBlock title="Output" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("URL output", output)}>Copy output</button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      ) : null}
    </ToolShell>
  );
}

export function UrlEncoderTool() {
  return <UrlCodecTool mode="encode" />;
}

export function UrlDecoderTool() {
  return <UrlCodecTool mode="decode" />;
}

export function RegexTesterTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [sample, setSample] = useState("");

  const { matches, error } = useMemo(() => {
    if (!pattern || !sample) {
      return { matches: [], error: "" };
    }

    try {
      const regex = new RegExp(pattern, flags);
      return {
        matches: [...sample.matchAll(regex)].map((match, index) => `${index + 1}. ${match[0]}`),
        error: "",
      };
    } catch (err) {
      return {
        matches: [],
        error: err instanceof Error ? err.message : "Invalid regular expression.",
      };
    }
  }, [flags, pattern, sample]);

  return (
    <ToolShell title="Regex Tester" description="Test JavaScript regular expressions against sample text with live validation.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Pattern">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder="\\btool\\b" />
        </Field>
        <Field label="Flags" hint="Examples: g, gi, gm">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={flags} onChange={(event) => setFlags(event.target.value)} placeholder="g" />
        </Field>
      </div>
      <Field label="Sample text">
        <textarea className={textareaClass} value={sample} onChange={(event) => setSample(event.target.value)} placeholder="Paste text to test against your pattern." />
      </Field>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!pattern || !sample ? (
        <EmptyState title="Add a pattern and sample text" description="The tester will show every match found by the browser's JavaScript regex engine." />
      ) : matches.length ? (
        <OutputBlock title="Matches" value={matches.join("\n")} />
      ) : (
        !error ? <Notice>No matches found for the current pattern and flags.</Notice> : null
      )}
    </ToolShell>
  );
}

function TransformTool({
  title,
  description,
  inputLabel,
  placeholder,
  actionLabel,
  transform,
}: {
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  actionLabel: string;
  transform: (value: string) => string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleTransform() {
    if (!input.trim()) {
      setError("Add input before running this tool.");
      setOutput("");
      return;
    }

    try {
      setOutput(transform(input));
      setError("");
    } catch (transformError) {
      setError(transformError instanceof Error ? transformError.message : "Unable to process this input.");
      setOutput("");
    }
  }

  return (
    <ToolShell title={title} description={description}>
      <Field label={inputLabel}>
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleTransform}>
        {actionLabel}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title="Add input to begin" description="Paste or type content, then run the conversion to generate copy-ready output." />
      ) : output ? (
        <>
          <OutputBlock title="Output" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("tool output", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function JsonToCsvConverterTool() {
  return (
    <TransformTool
      title="JSON to CSV Converter"
      description="Convert JSON objects into CSV locally in the browser with validation for common structure issues."
      inputLabel="JSON input"
      placeholder={`[\n  {"name":"Toolbox Hub","category":"Developer"},\n  {"name":"Word Counter","category":"Text"}\n]`}
      actionLabel="Convert to CSV"
      transform={jsonToCsv}
    />
  );
}

export function CsvToJsonConverterTool() {
  return (
    <TransformTool
      title="CSV to JSON Converter"
      description="Convert CSV data into a JSON array locally with basic quoted-field support and clear validation."
      inputLabel="CSV input"
      placeholder={`name,category\nToolbox Hub,Developer\nWord Counter,Text`}
      actionLabel="Convert to JSON"
      transform={(value) => JSON.stringify(parseCsv(value), null, 2)}
    />
  );
}

export function HtmlEncoderTool() {
  return (
    <TransformTool
      title="HTML Encoder"
      description="Encode raw HTML into safe entity text locally in the browser."
      inputLabel="HTML input"
      placeholder={`<div class="card">Hello & welcome</div>`}
      actionLabel="Encode HTML"
      transform={htmlEncode}
    />
  );
}

export function HtmlDecoderTool() {
  return (
    <TransformTool
      title="HTML Decoder"
      description="Decode HTML entities back into readable text locally in the browser."
      inputLabel="Encoded HTML"
      placeholder={`&lt;div class=&quot;card&quot;&gt;Hello &amp; welcome&lt;/div&gt;`}
      actionLabel="Decode HTML"
      transform={htmlDecode}
    />
  );
}

export function HtmlToMarkdownConverterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleConvert() {
    if (!input.trim()) {
      setError("Paste HTML before converting it.");
      setOutput("");
      return;
    }

    try {
      setOutput(htmlToMarkdown(input));
      setError("");
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Unable to convert that HTML.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="HTML to Markdown Converter" description="Convert common HTML elements into readable Markdown locally in the browser.">
      <Field label="HTML input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={`<h2>Example</h2>\n<p>Hello <strong>world</strong></p>`} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleConvert}>
        Convert to Markdown
      </button>
      <Notice>Supports common tags such as headings, paragraphs, lists, links, emphasis, blockquotes, and inline code.</Notice>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title="Add HTML to convert" description="Paste markup and generate Markdown output that is easier to reuse or edit." />
      ) : output ? (
        <>
          <OutputBlock title="Markdown output" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("Markdown output", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function MarkdownToHtmlConverterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleConvert() {
    if (!input.trim()) {
      setError("Paste Markdown before converting it.");
      setOutput("");
      return;
    }

    try {
      setOutput(markdownToHtml(input));
      setError("");
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Unable to convert that Markdown.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="Markdown to HTML Converter" description="Convert common Markdown syntax into HTML locally with readable, copy-ready output.">
      <Field label="Markdown input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={`## Example\n\n- one\n- two\n\nVisit [Toolbox Hub](https://example.com)`} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleConvert}>
        Convert to HTML
      </button>
      <Notice>Supports headings, paragraphs, lists, links, emphasis, blockquotes, and inline code.</Notice>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title="Add Markdown to convert" description="Paste Markdown text and generate HTML output locally in the browser." />
      ) : output ? (
        <>
          <OutputBlock title="HTML output" value={output} />
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Rendered preview</p>
            <div className="prose prose-sm mt-3 max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: output }} />
          </div>
          <button type="button" className={buttonClass} onClick={() => copy("HTML output", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function UrlParserTool() {
  const [input, setInput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const { parsed, error } = useMemo(() => {
    const value = input.trim();
    if (!value) {
      return { parsed: null, error: "" };
    }

    try {
      const url = new URL(value);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      return {
        parsed: {
          href: url.href,
          protocol: url.protocol,
          origin: url.origin,
          host: url.host,
          hostname: url.hostname,
          port: url.port || "(default)",
          pathname: url.pathname,
          search: url.search || "(none)",
          hash: url.hash || "(none)",
          username: url.username || "(none)",
          password: url.password ? "Present" : "(none)",
          queryParams,
        },
        error: "",
      };
    } catch {
      return {
        parsed: null,
        error: "Enter a valid absolute URL including the protocol, such as https://example.com/path?a=1.",
      };
    }
  }, [input]);

  const queryOutput = parsed ? JSON.stringify(parsed.queryParams, null, 2) : "";

  return (
    <ToolShell title="URL Parser" description="Break a URL into readable parts such as origin, host, path, fragment, and query parameters.">
      <Field label="URL input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://example.com:8080/docs/page?ref=toolbox#section-2" />
      </Field>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title="Paste a URL to inspect it" description="Use a full absolute URL to see its parsed parts and query parameters." />
      ) : parsed ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <OutputBlock title="Full URL" value={parsed.href} multiline={false} />
            <OutputBlock title="Protocol" value={parsed.protocol} multiline={false} />
            <OutputBlock title="Origin" value={parsed.origin} multiline={false} />
            <OutputBlock title="Host" value={parsed.host} multiline={false} />
            <OutputBlock title="Hostname" value={parsed.hostname} multiline={false} />
            <OutputBlock title="Port" value={parsed.port} multiline={false} />
            <OutputBlock title="Pathname" value={parsed.pathname} multiline={false} />
            <OutputBlock title="Search" value={parsed.search} multiline={false} />
            <OutputBlock title="Hash" value={parsed.hash} multiline={false} />
          </div>
          <OutputBlock title="Query parameters" value={queryOutput || "{}"} />
          <button type="button" className={buttonClass} onClick={() => copy("parsed URL JSON", JSON.stringify(parsed, null, 2))}>
            Copy parsed result
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function JwtDecoderTool() {
  const [input, setInput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const { decoded, error } = useMemo(() => {
    const value = input.trim();
    if (!value) {
      return { decoded: null, error: "" };
    }

    const parts = value.split(".");
    if (parts.length < 2 || parts.length > 3) {
      return {
        decoded: null,
        error: "Enter a valid JWT with readable Base64URL-encoded header and payload sections.",
      };
    }

    try {
      const header = JSON.parse(decodeBase64Url(parts[0]));
      const payload = JSON.parse(decodeBase64Url(parts[1]));
      return {
        decoded: {
          header,
          payload,
          signature: parts[2] || "(none)",
        },
        error: "",
      };
    } catch {
      return {
        decoded: null,
        error: "Enter a valid JWT with readable Base64URL-encoded header and payload sections.",
      };
    }
  }, [input]);

  return (
    <ToolShell title="JWT Decoder" description="Decode JWT header and payload data locally in the browser without claiming signature verification.">
      <Field label="JWT token">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
      </Field>
      <Notice>Decoding a JWT does not verify its signature or prove that the token is trustworthy.</Notice>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title="Paste a JWT to inspect it" description="The tool decodes the header and payload locally so you can read the JSON content." />
      ) : decoded ? (
        <>
          <OutputBlock title="Header" value={JSON.stringify(decoded.header, null, 2)} />
          <OutputBlock title="Payload" value={JSON.stringify(decoded.payload, null, 2)} />
          <OutputBlock title="Signature section" value={decoded.signature} multiline={false} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("JWT header", JSON.stringify(decoded.header, null, 2))}>
              Copy header
            </button>
            <button type="button" className={secondaryButtonClass} onClick={() => copy("JWT payload", JSON.stringify(decoded.payload, null, 2))}>
              Copy payload
            </button>
          </div>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function JwtEncoderTool() {
  const [algorithm, setAlgorithm] = useState<"none" | "HS256">("none");
  const [headerInput, setHeaderInput] = useState('{\n  "typ": "JWT"\n}');
  const [payloadInput, setPayloadInput] = useState('{\n  "sub": "1234567890",\n  "name": "Toolbox Hub"\n}');
  const [secret, setSecret] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  async function signHs256(value: string, secretValue: string) {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secretValue),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(value));
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  async function handleEncode() {
    setIsWorking(true);
    try {
      const parsedHeader = JSON.parse(headerInput);
      const parsedPayload = JSON.parse(payloadInput);
      if (!parsedHeader || typeof parsedHeader !== "object" || Array.isArray(parsedHeader)) {
        throw new Error("JWT header must be a JSON object.");
      }
      if (!parsedPayload || typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) {
        throw new Error("JWT payload must be a JSON object.");
      }

      const finalHeader = {
        ...parsedHeader,
        alg: algorithm === "none" ? "none" : "HS256",
      };

      const encodedHeader = encodeBase64Url(JSON.stringify(finalHeader));
      const encodedPayload = encodeBase64Url(JSON.stringify(parsedPayload));
      const signingInput = `${encodedHeader}.${encodedPayload}`;

      if (algorithm === "none") {
        setOutput(`${signingInput}.`);
        setError("");
        return;
      }

      if (!secret) {
        throw new Error("Enter a secret key to generate an HS256 JWT.");
      }

      const signature = await signHs256(signingInput, secret);
      setOutput(`${signingInput}.${signature}`);
      setError("");
    } catch (encodeError) {
      setError(encodeError instanceof Error ? encodeError.message : "Unable to encode that JWT.");
      setOutput("");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <ToolShell title="JWT Encoder" description="Create unsigned or HS256-signed JWT tokens locally in the browser from JSON header and payload data.">
      <Field label="Algorithm">
        <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={algorithm} onChange={(event) => setAlgorithm(event.target.value as "none" | "HS256")}>
          <option value="none">none (unsigned)</option>
          <option value="HS256">HS256</option>
        </select>
      </Field>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="JWT header JSON">
          <textarea className={textareaClass} value={headerInput} onChange={(event) => setHeaderInput(event.target.value)} />
        </Field>
        <Field label="JWT payload JSON">
          <textarea className={textareaClass} value={payloadInput} onChange={(event) => setPayloadInput(event.target.value)} />
        </Field>
      </div>
      {algorithm === "HS256" ? (
        <Field label="Secret key">
          <input className={inputClass} value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Enter signing secret" />
        </Field>
      ) : (
        <Notice>This mode creates an unsigned token with `alg: none`. Use it only for debugging or examples.</Notice>
      )}
      <button type="button" className={buttonClass} onClick={handleEncode} disabled={isWorking}>
        {isWorking ? "Generating JWT..." : "Generate JWT"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {output ? (
        <>
          <OutputBlock title="JWT output" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("JWT output", output)}>
            Copy token
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : (
        !error ? <EmptyState title="Generate a local JWT" description="Provide JSON header and payload data, then choose unsigned or HS256 output." /> : null
      )}
    </ToolShell>
  );
}

function HashTool({
  title,
  description,
  fixedAlgorithm,
}: {
  title: string;
  description: string;
  fixedAlgorithm?: "MD5" | "SHA-256";
}) {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<"MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512">(fixedAlgorithm ?? "SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  async function handleGenerate() {
    if (!input) {
      setError("Enter text before generating a hash.");
      setOutput("");
      return;
    }

    setIsWorking(true);
    try {
      const nextOutput =
        algorithm === "MD5" ? md5(input) : await digestValue(input, algorithm);
      setOutput(nextOutput);
      setError("");
    } catch (hashError) {
      setError(hashError instanceof Error ? hashError.message : "Unable to generate the hash.");
      setOutput("");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <ToolShell title={title} description={description}>
      {!fixedAlgorithm ? (
        <Field label="Algorithm">
          <select
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value as "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512")}
          >
            <option value="MD5">MD5</option>
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-384">SHA-384</option>
            <option value="SHA-512">SHA-512</option>
          </select>
        </Field>
      ) : null}
      <Field label="Input text">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter text to hash." />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate} disabled={isWorking}>
        {isWorking ? "Generating hash..." : "Generate hash"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title="Add text to hash" description="Enter the exact text you want to hash. Output is generated locally in the browser." />
      ) : output ? (
        <>
          <OutputBlock title={`${algorithm} output`} value={output} multiline={false} />
          <button type="button" className={buttonClass} onClick={() => copy("hash output", output)}>
            Copy hash
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function Sha256GeneratorTool() {
  return (
    <HashTool
      title="SHA256 Generator"
      description="Generate SHA-256 hashes locally in the browser using the Web Crypto API."
      fixedAlgorithm="SHA-256"
    />
  );
}

export function Md5GeneratorTool() {
  return (
    <HashTool
      title="MD5 Generator"
      description="Generate MD5 hashes locally in the browser with a lightweight bundled implementation."
      fixedAlgorithm="MD5"
    />
  );
}

export function HashGeneratorTool() {
  return (
    <HashTool
      title="Hash Generator"
      description="Generate MD5, SHA-1, SHA-256, SHA-384, or SHA-512 hashes locally without external services."
    />
  );
}
