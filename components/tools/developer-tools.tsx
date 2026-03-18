"use client";

import { useMemo, useState } from "react";
import {
  buttonClass,
  EmptyState,
  Field,
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
