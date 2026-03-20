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

function formatCsv(value: string) {
  const rows = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (!rows.length) {
    throw new Error("Paste CSV content before formatting it.");
  }

  return rows.map((row) => parseCsvRow(row).map((cell) => escapeCsvValue(cell.trim())).join(",")).join("\n");
}

function formatYaml(value: string) {
  const normalized = value.replace(/\r\n/g, "\n");
  if (!normalized.trim()) {
    throw new Error("Paste YAML content before formatting it.");
  }

  const lines = normalized.split("\n");
  let previousIndent = 0;
  let blankCount = 0;

  const formatted = lines.map((line, index) => {
    if (/\t/.test(line)) {
      throw new Error(`Line ${index + 1} uses tabs. Use spaces for YAML indentation.`);
    }

    const trimmed = line.trimEnd();
    if (!trimmed.trim()) {
      blankCount += 1;
      return blankCount > 1 ? null : "";
    }

    blankCount = 0;
    const leadingSpaces = trimmed.match(/^ */)?.[0].length ?? 0;
    if (leadingSpaces % 2 !== 0) {
      throw new Error(`Line ${index + 1} has odd indentation. Use multiples of 2 spaces.`);
    }

    if (leadingSpaces > previousIndent + 2 && !trimmed.trimStart().startsWith("- ")) {
      throw new Error(`Line ${index + 1} jumps indentation too far for this formatter.`);
    }

    previousIndent = leadingSpaces;
    return `${" ".repeat(leadingSpaces)}${trimmed.trimStart()}`;
  }).filter((line): line is string => line !== null);

  return formatted.join("\n").trim();
}

function formatXml(value: string) {
  if (!value.trim()) {
    throw new Error("Paste XML content before formatting it.");
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(value, "application/xml");
  const parserError = documentNode.querySelector("parsererror");
  if (parserError) {
    throw new Error("Enter valid XML before formatting it.");
  }

  const serializer = new XMLSerializer();
  const xml = serializer.serializeToString(documentNode);
  const segments = xml.replace(/>\s*</g, "><").replace(/(>)(<)(\/*)/g, "$1\n$2$3").split("\n");
  let indent = 0;

  return segments
    .map((segment) => {
      const trimmed = segment.trim();
      if (!trimmed) {
        return null;
      }

      if (/^<\//.test(trimmed)) {
        indent = Math.max(0, indent - 1);
      }

      const line = `${"  ".repeat(indent)}${trimmed}`;

      if (/^<[^!?][^>]*[^/]>\s*$/.test(trimmed) && !/^<.*<\/.*>$/.test(trimmed) && !/^<\//.test(trimmed)) {
        indent += 1;
      }

      return line;
    })
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

type JsonDiffEntry = {
  path: string;
  left: string;
  right: string;
  kind: "added" | "removed" | "changed";
};

function stringifyDiffValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function diffJsonValues(left: unknown, right: unknown, path = "$"): JsonDiffEntry[] {
  if (Object.is(left, right)) {
    return [];
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const max = Math.max(left.length, right.length);
    const diffs: JsonDiffEntry[] = [];
    for (let index = 0; index < max; index += 1) {
      if (index >= left.length) {
        diffs.push({ path: `${path}[${index}]`, left: "(missing)", right: stringifyDiffValue(right[index]), kind: "added" });
      } else if (index >= right.length) {
        diffs.push({ path: `${path}[${index}]`, left: stringifyDiffValue(left[index]), right: "(missing)", kind: "removed" });
      } else {
        diffs.push(...diffJsonValues(left[index], right[index], `${path}[${index}]`));
      }
    }
    return diffs;
  }

  if (left && right && typeof left === "object" && typeof right === "object" && !Array.isArray(left) && !Array.isArray(right)) {
    const keys = new Set([...Object.keys(left as Record<string, unknown>), ...Object.keys(right as Record<string, unknown>)]);
    const diffs: JsonDiffEntry[] = [];
    for (const key of keys) {
      const leftRecord = left as Record<string, unknown>;
      const rightRecord = right as Record<string, unknown>;
      if (!(key in leftRecord)) {
        diffs.push({ path: `${path}.${key}`, left: "(missing)", right: stringifyDiffValue(rightRecord[key]), kind: "added" });
      } else if (!(key in rightRecord)) {
        diffs.push({ path: `${path}.${key}`, left: stringifyDiffValue(leftRecord[key]), right: "(missing)", kind: "removed" });
      } else {
        diffs.push(...diffJsonValues(leftRecord[key], rightRecord[key], `${path}.${key}`));
      }
    }
    return diffs;
  }

  return [{ path, left: stringifyDiffValue(left), right: stringifyDiffValue(right), kind: "changed" }];
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

function sanitizePreviewUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, "https://example.com");
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : trimmed;
    }
  } catch {
    return "";
  }

  return "";
}

function buildSafeMarkdownLink(label: string, rawUrl: string) {
  const safeUrl = sanitizePreviewUrl(rawUrl);
  const safeLabel = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (!safeUrl) {
    return safeLabel;
  }

  return `<a href="${escapeHtml(safeUrl)}" rel="nofollow noopener noreferrer" target="_blank">${safeLabel}</a>`;
}

function convertInlineMarkdownToHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, rawUrl) => buildSafeMarkdownLink(label, rawUrl));
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

function downloadTextFile(contents: string, filename: string, mimeType = "text/plain;charset=utf-8") {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(new Blob([contents], { type: mimeType }));
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

function sanitizePreviewHtml(value: string) {
  if (typeof DOMParser === "undefined") {
    return `<pre>${escapeHtml(value)}</pre>`;
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(value, "text/html");

  documentNode.querySelectorAll("script, iframe, object, embed, link[rel='import'], meta[http-equiv='refresh'], base").forEach((node) => {
    node.remove();
  });

  documentNode.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const rawValue = attribute.value.trim();

      if (name.startsWith("on") || name === "srcdoc") {
        element.removeAttribute(attribute.name);
        return;
      }

      if (["href", "src", "action", "formaction"].includes(name)) {
        const safeUrl = sanitizePreviewUrl(rawValue);
        if (!safeUrl) {
          element.removeAttribute(attribute.name);
          return;
        }

        element.setAttribute(attribute.name, safeUrl);
      }
    });

    if (element instanceof HTMLAnchorElement && element.hasAttribute("href")) {
      element.setAttribute("rel", "nofollow noopener noreferrer");
      element.setAttribute("target", "_blank");
    }
  });

  return documentNode.body.innerHTML;
}

function SandboxPreview({
  title,
  html,
}: {
  title: string;
  html: string;
}) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">{title}</p>
      <iframe
        title={title}
        className="mt-3 h-72 w-full rounded-2xl border border-[color:var(--border)] bg-white"
        sandbox=""
        referrerPolicy="no-referrer"
        srcDoc={html}
      />
    </div>
  );
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value: string) {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function createSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function analyzeKeywordDensity(content: string, focusKeyword: string) {
  const words = content
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];

  if (!words.length) {
    throw new Error("Paste content with readable words before checking keyword density.");
  }

  const counts = new Map<string, number>();
  words.forEach((word) => {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });

  const topTerms = [...counts.entries()]
    .filter(([word]) => word.length > 2)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      density: (count / words.length) * 100,
    }));

  const normalizedFocus = createSlug(focusKeyword).replace(/-/g, " ").trim();
  const focusMatches = normalizedFocus
    ? (content.toLowerCase().match(new RegExp(normalizedFocus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length
    : 0;

  return {
    totalWords: words.length,
    uniqueWords: counts.size,
    focusKeyword: normalizedFocus,
    focusMatches,
    focusDensity: normalizedFocus ? (focusMatches / words.length) * 100 : 0,
    topTerms,
  };
}

function getCryptoRandomString(length: number, alphabet: string) {
  const safeLength = Math.max(1, length);
  const values = crypto.getRandomValues(new Uint32Array(safeLength));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

function validateEmailFormat(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error("Enter an email address before validating it.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailPattern.test(normalized)) {
    return {
      valid: false,
      normalized,
      note: "The address does not match a common email format.",
    };
  }

  const [localPart, domain] = normalized.split("@");
  return {
    valid: true,
    normalized: `${localPart}@${domain.toLowerCase()}`,
    note: "This passes client-side format checks only. It does not verify mailbox existence.",
  };
}

function formatPhoneNumberValue(value: string, style: "us" | "international") {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    throw new Error("Enter a phone number before formatting it.");
  }

  if (style === "us") {
    const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
    if (normalized.length !== 10) {
      throw new Error("US format expects 10 digits, or 11 digits starting with country code 1.");
    }
    return {
      digits,
      formatted: `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`,
      note: "Formatted with a US-style local pattern.",
    };
  }

  if (digits.length < 8 || digits.length > 15) {
    throw new Error("International format expects a value between 8 and 15 digits.");
  }

  return {
    digits,
    formatted: `+${digits}`,
    note: "Formatted as a clean E.164-style international number.",
  };
}

function inspectUuid(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    throw new Error("Paste a UUID before validating it.");
  }

  const match = normalized.match(/^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-([89ab])[0-9a-f]{3}-[0-9a-f]{12}$/i);
  return {
    normalized,
    valid: Boolean(match),
    version: match?.[1] ?? "Unknown",
    variant: match ? "RFC 4122 / modern UUID variant" : "Unknown",
  };
}

function calculatePasswordEntropy(password: string) {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigits = /\d/.test(password);
  const hasSymbols = /[^A-Za-z0-9\s]/.test(password);
  const hasSpaces = /\s/.test(password);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigits) poolSize += 10;
  if (hasSymbols) poolSize += 33;
  if (hasSpaces) poolSize += 1;

  const entropy = poolSize > 0 ? password.length * Math.log2(poolSize) : 0;
  const strength =
    entropy >= 80 ? "Very strong" :
    entropy >= 60 ? "Strong" :
    entropy >= 40 ? "Moderate" :
    entropy >= 28 ? "Weak" :
    "Very weak";

  return {
    entropy,
    poolSize,
    length: password.length,
    strength,
    characterSets: [
      hasLower ? "lowercase" : "",
      hasUpper ? "uppercase" : "",
      hasDigits ? "digits" : "",
      hasSymbols ? "symbols" : "",
      hasSpaces ? "spaces" : "",
    ].filter(Boolean),
  };
}

function identifyHashCandidates(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error("Paste a hash-like value before identifying it.");
  }

  const candidates: string[] = [];
  const hexOnly = /^[a-f0-9]+$/i.test(normalized);
  const base64Like = /^[A-Za-z0-9+/=]+$/.test(normalized);
  const bcryptLike = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(normalized);

  if (bcryptLike) {
    candidates.push("bcrypt");
  }
  if (hexOnly && normalized.length === 32) {
    candidates.push("MD5");
  }
  if (hexOnly && normalized.length === 40) {
    candidates.push("SHA-1");
  }
  if (hexOnly && normalized.length === 56) {
    candidates.push("SHA-224 / SHA3-224");
  }
  if (hexOnly && normalized.length === 64) {
    candidates.push("SHA-256 / SHA3-256 / BLAKE2s");
  }
  if (hexOnly && normalized.length === 96) {
    candidates.push("SHA-384 / SHA3-384");
  }
  if (hexOnly && normalized.length === 128) {
    candidates.push("SHA-512 / SHA3-512 / BLAKE2b");
  }
  if (base64Like && normalized.length >= 20) {
    candidates.push("Base64-encoded digest or token");
  }
  if (/^[A-F0-9]+$/.test(normalized) && normalized.length % 2 === 0) {
    candidates.push("Uppercase hexadecimal digest");
  }

  return [...new Set(candidates)];
}

const keywordSuggestionModifiers = [
  "best",
  "for beginners",
  "tips",
  "guide",
  "examples",
  "tools",
  "checklist",
  "ideas",
  "template",
  "strategy",
];

const pageTitleTemplates = [
  "{keyword} | Free Online Tool",
  "{keyword}: Simple Guide for Beginners",
  "Best {keyword} Tips for 2026",
  "{keyword} Checklist and Examples",
  "Free {keyword} Tool | Fast Online Workflow",
];

const descriptionTemplates = [
  "Use {keyword} to simplify your workflow with a fast online tool and clear copy-ready output.",
  "Generate better {keyword} ideas with a practical workflow and easy next steps.",
  "Plan your {keyword} content faster with a lightweight local tool built for drafting and SEO brainstorming.",
  "Create a polished {keyword} draft with clear examples, structured output, and easy copy actions.",
];

function toKeywordParts(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
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

function pickKeywordModifier(seed: string) {
  const index = seed.length % keywordSuggestionModifiers.length;
  return keywordSuggestionModifiers[index];
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

  return {
    findings,
    suggestions,
  };
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

function highlightJson(value: string) {
  return escapeHtml(value).replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi,
    (match, stringValue, keySuffix, literal) => {
      if (stringValue && keySuffix) {
        return `<span class="text-sky-700">${stringValue}</span><span class="text-slate-500">${keySuffix}</span>`;
      }
      if (stringValue) {
        return `<span class="text-emerald-700">${stringValue}</span>`;
      }
      if (literal) {
        return `<span class="text-fuchsia-700">${literal}</span>`;
      }
      return `<span class="text-amber-700">${match}</span>`;
    },
  );
}

function highlightXml(value: string) {
  return escapeHtml(value)
    .replace(/(&lt;\/?)([\w:-]+)(.*?)(\/?&gt;)/g, (_, open, tag, attrs, close) => {
      const highlightedAttrs = attrs.replace(
        /([\w:-]+)=(&quot;.*?&quot;)/g,
        '<span class="text-amber-700">$1</span>=<span class="text-emerald-700">$2</span>',
      );
      return `<span class="text-sky-700">${open}${tag}</span>${highlightedAttrs}<span class="text-sky-700">${close}</span>`;
    });
}

function highlightSql(value: string) {
  const keywords = /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|ON|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE|TABLE|ALTER|DROP|AND|OR|NOT|IN|AS|CASE|WHEN|THEN|ELSE|END|DISTINCT|UNION|ALL)\b/gi;
  return escapeHtml(value)
    .replace(/(--.*$)/gm, '<span class="text-slate-400">$1</span>')
    .replace(/("(?:[^"]|"")*"|'(?:[^']|'')*')/g, '<span class="text-emerald-700">$1</span>')
    .replace(/\b\d+(?:\.\d+)?\b/g, '<span class="text-amber-700">$&</span>')
    .replace(keywords, '<span class="text-sky-700 font-semibold">$1</span>');
}

function getHighlightedMarkup(value: string, language: "json" | "xml" | "sql" | "text") {
  if (language === "json") return highlightJson(value);
  if (language === "xml") return highlightXml(value);
  if (language === "sql") return highlightSql(value);
  return escapeHtml(value);
}

function CodeOutputBlock({
  title,
  value,
  language,
}: {
  title: string;
  value: string;
  language: "json" | "xml" | "sql" | "text";
}) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
        {title}
      </p>
      <pre
        className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm leading-7 text-slate-700"
        dangerouslySetInnerHTML={{ __html: getHighlightedMarkup(value, language) }}
      />
    </div>
  );
}

function removeSqlComments(value: string) {
  return value
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function minifySql(value: string) {
  const cleaned = removeSqlComments(value)
    .replace(/\s+/g, " ")
    .replace(/\s*([(),=<>+-])\s*/g, "$1")
    .trim();

  if (!cleaned) {
    throw new Error("Paste an SQL query before formatting it.");
  }

  return cleaned.replace(/\s*,/g, ",");
}

function beautifySql(value: string) {
  const minified = minifySql(value);
  const keywordBreaks = [
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP BY",
    "ORDER BY",
    "HAVING",
    "LIMIT",
    "OFFSET",
    "INSERT INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE FROM",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "OUTER JOIN",
    "JOIN",
    "ON",
    "UNION ALL",
    "UNION",
  ];

  let formatted = minified;
  for (const keyword of keywordBreaks.sort((left, right) => right.length - left.length)) {
    const pattern = new RegExp(`\\b${keyword.replace(/\s+/g, "\\s+")}\\b`, "gi");
    formatted = formatted.replace(pattern, `\n${keyword.toUpperCase()}`);
  }

  formatted = formatted
    .replace(/\b(AND|OR)\b/gi, "\n  $1")
    .replace(/,/g, ",\n  ")
    .replace(/\n{2,}/g, "\n")
    .trim();

  return formatted;
}

function formatCronField(value: string, min: number, max: number, label: string) {
  if (!/^(\*|\*\/\d+|\d+|\d+(?:,\d+)+)$/.test(value)) {
    throw new Error(`Unsupported ${label} field syntax: ${value}`);
  }

  if (value === "*") return `every ${label}`;
  if (value.startsWith("*/")) return `every ${value.slice(2)} ${label}${value.slice(2) === "1" ? "" : "s"}`;

  const numbers = value.split(",").map(Number);
  if (numbers.some((number) => Number.isNaN(number) || number < min || number > max)) {
    throw new Error(`${label} field must stay between ${min} and ${max}.`);
  }

  return numbers.length === 1
    ? `${label} ${numbers[0]}`
    : `${label}s ${numbers.join(", ")}`;
}

function parseCronExpression(value: string) {
  const fields = value.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error("Use the standard 5-field cron format: minute hour day month weekday.");
  }

  const [minute, hour, day, month, weekday] = fields;
  const summary = [
    `Minutes: ${formatCronField(minute, 0, 59, "minute")}`,
    `Hours: ${formatCronField(hour, 0, 23, "hour")}`,
    `Days of month: ${formatCronField(day, 1, 31, "day")}`,
    `Months: ${formatCronField(month, 1, 12, "month")}`,
    `Weekdays: ${formatCronField(weekday, 0, 6, "weekday")}`,
  ];

  return {
    expression: fields.join(" "),
    description:
      minute === "*" && hour === "*" && day === "*" && month === "*" && weekday === "*"
        ? "Runs every minute."
        : `Runs with minute field "${minute}", hour field "${hour}", day field "${day}", month field "${month}", and weekday field "${weekday}".`,
    output: summary.join("\n"),
  };
}

type ReducedJsonSchema = {
  type?: string | string[];
  required?: string[];
  properties?: Record<string, ReducedJsonSchema>;
  items?: ReducedJsonSchema;
  enum?: unknown[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
};

function getJsonType(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function validateJsonAgainstSchema(data: unknown, schema: ReducedJsonSchema, path = "$") {
  const errors: string[] = [];
  const expectedTypes = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  const actualType = getJsonType(data);

  if (expectedTypes.length && !expectedTypes.includes(actualType)) {
    errors.push(`${path}: expected type ${expectedTypes.join(" or ")}, received ${actualType}.`);
    return errors;
  }

  if (schema.enum && !schema.enum.some((item) => JSON.stringify(item) === JSON.stringify(data))) {
    errors.push(`${path}: value is not one of the allowed enum options.`);
  }

  if (typeof data === "string") {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push(`${path}: string is shorter than minLength ${schema.minLength}.`);
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push(`${path}: string is longer than maxLength ${schema.maxLength}.`);
    }
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(data)) {
        errors.push(`${path}: string does not match pattern ${schema.pattern}.`);
      }
    }
  }

  if (typeof data === "number") {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push(`${path}: number is less than minimum ${schema.minimum}.`);
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push(`${path}: number is greater than maximum ${schema.maximum}.`);
    }
  }

  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push(`${path}: array has fewer than ${schema.minItems} items.`);
    }
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      errors.push(`${path}: array has more than ${schema.maxItems} items.`);
    }
    if (schema.items) {
      data.forEach((item, index) => {
        errors.push(...validateJsonAgainstSchema(item, schema.items as ReducedJsonSchema, `${path}[${index}]`));
      });
    }
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    for (const requiredKey of schema.required ?? []) {
      if (!(requiredKey in record)) {
        errors.push(`${path}: missing required property "${requiredKey}".`);
      }
    }
    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (key in record) {
        errors.push(...validateJsonAgainstSchema(record[key], propertySchema, `${path}.${key}`));
      }
    }
  }

  return errors;
}

function extractJsonPaths(value: unknown, path = "$", paths = new Set<string>()) {
  paths.add(path);
  if (Array.isArray(value)) {
    value.forEach((item, index) => extractJsonPaths(item, `${path}[${index}]`, paths));
  } else if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
      extractJsonPaths(child, `${path}.${key}`, paths);
    });
  }
  return paths;
}

function xmlNodeToJson(node: Element): unknown {
  const attributes = Array.from(node.attributes);
  const children = Array.from(node.children);
  const textContent = node.textContent?.trim() ?? "";

  if (!attributes.length && !children.length) {
    return textContent;
  }

  const result: Record<string, unknown> = {};
  if (attributes.length) {
    result["@attributes"] = attributes.reduce<Record<string, string>>((record, attribute) => {
      record[attribute.name] = attribute.value;
      return record;
    }, {});
  }

  if (textContent && !children.length) {
    result["#text"] = textContent;
  }

  for (const child of children) {
    const childValue = xmlNodeToJson(child);
    if (child.tagName in result) {
      const existing = result[child.tagName];
      result[child.tagName] = Array.isArray(existing) ? [...existing, childValue] : [existing, childValue];
    } else {
      result[child.tagName] = childValue;
    }
  }

  return result;
}

function jsonValueToXml(value: unknown, nodeName: string, depth = 0): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    return value.map((item) => jsonValueToXml(item, nodeName, depth)).join("\n");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const attributes = record["@attributes"] && typeof record["@attributes"] === "object"
      ? Object.entries(record["@attributes"] as Record<string, unknown>)
          .map(([key, attributeValue]) => `${key}="${escapeXml(String(attributeValue))}"`)
          .join(" ")
      : "";
    const attributeText = attributes ? ` ${attributes}` : "";

    const childEntries = Object.entries(record).filter(([key]) => key !== "@attributes");
    if (!childEntries.length) {
      return `${indent}<${nodeName}${attributeText} />`;
    }

    const childContent = childEntries
      .map(([key, child]) => {
        if (key === "#text") {
          return `${nextIndent}${escapeXml(String(child))}`;
        }
        return jsonValueToXml(child, key, depth + 1);
      })
      .join("\n");

    return `${indent}<${nodeName}${attributeText}>\n${childContent}\n${indent}</${nodeName}>`;
  }

  return `${indent}<${nodeName}>${escapeXml(String(value ?? ""))}</${nodeName}>`;
}

function buildMetaTags(input: {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  keywords: string;
  author: string;
}) {
  const lines = [
    "<title>",
    `${escapeHtml(input.title)}</title>`,
    `<meta name="description" content="${escapeHtml(input.description)}" />`,
  ];

  if (input.keywords.trim()) {
    lines.push(`<meta name="keywords" content="${escapeHtml(input.keywords.trim())}" />`);
  }
  if (input.author.trim()) {
    lines.push(`<meta name="author" content="${escapeHtml(input.author.trim())}" />`);
  }
  if (input.robots.trim()) {
    lines.push(`<meta name="robots" content="${escapeHtml(input.robots.trim())}" />`);
  }
  if (input.canonicalUrl.trim()) {
    lines.push(`<link rel="canonical" href="${escapeHtml(input.canonicalUrl.trim())}" />`);
  }

  return lines.join("\n");
}

function buildOpenGraphTags(input: {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  siteName: string;
  type: string;
}) {
  const lines = [
    `<meta property="og:title" content="${escapeHtml(input.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(input.description)}" />`,
    `<meta property="og:type" content="${escapeHtml(input.type)}" />`,
  ];

  if (input.url.trim()) {
    lines.push(`<meta property="og:url" content="${escapeHtml(input.url.trim())}" />`);
  }
  if (input.imageUrl.trim()) {
    lines.push(`<meta property="og:image" content="${escapeHtml(input.imageUrl.trim())}" />`);
  }
  if (input.siteName.trim()) {
    lines.push(`<meta property="og:site_name" content="${escapeHtml(input.siteName.trim())}" />`);
  }

  return lines.join("\n");
}

function buildRobotsTxt(input: {
  userAgent: string;
  allow: string;
  disallow: string;
  sitemapUrl: string;
}) {
  const lines = [`User-agent: ${input.userAgent.trim() || "*"}`];

  const allowRules = input.allow
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const disallowRules = input.disallow
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!allowRules.length && !disallowRules.length) {
    lines.push("Allow: /");
  } else {
    allowRules.forEach((rule) => lines.push(`Allow: ${rule}`));
    disallowRules.forEach((rule) => lines.push(`Disallow: ${rule}`));
  }

  if (input.sitemapUrl.trim()) {
    lines.push("", `Sitemap: ${input.sitemapUrl.trim()}`);
  }

  return lines.join("\n");
}

function buildSitemapXml(urlLines: string[], changefreq: string, priority: string) {
  const urls = urlLines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return new URL(line).toString();
      } catch {
        throw new Error(`Enter valid absolute URLs. "${line}" is not valid.`);
      }
    });

  if (!urls.length) {
    throw new Error("Add at least one valid URL before generating a sitemap.");
  }

  const safePriority = Number(priority);
  const priorityTag =
    Number.isFinite(safePriority) && safePriority >= 0 && safePriority <= 1
      ? `    <priority>${safePriority.toFixed(1)}</priority>\n`
      : "";
  const changefreqTag = changefreq ? `    <changefreq>${escapeXml(changefreq)}</changefreq>\n` : "";

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => [
      "  <url>",
      `    <loc>${escapeXml(url)}</loc>`,
      changefreqTag.trimEnd(),
      priorityTag.trimEnd(),
      "  </url>",
    ].filter(Boolean).join("\n")),
    "</urlset>",
  ].join("\n");
}

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

function md5(value: string) {
  return md5Bytes(new TextEncoder().encode(value));
}

async function digestValue(value: string, algorithm: AlgorithmIdentifier) {
  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function digestFile(file: File, algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512") {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (algorithm === "MD5") {
    return md5Bytes(bytes);
  }

  const digest = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signHmac(value: string, secretValue: string, hash: "SHA-256" | "SHA-384" | "SHA-512") {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretValue),
    { name: "HMAC", hash },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function generateRandomString(length: number, alphabet: string) {
  const safeLength = Math.max(1, length);
  const randomValues = crypto.getRandomValues(new Uint32Array(safeLength));
  return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join("");
}

function scorePasswordStrength(value: string) {
  const checks = [
    { label: "At least 12 characters", passed: value.length >= 12 },
    { label: "Contains lowercase letters", passed: /[a-z]/.test(value) },
    { label: "Contains uppercase letters", passed: /[A-Z]/.test(value) },
    { label: "Contains numbers", passed: /\d/.test(value) },
    { label: "Contains symbols", passed: /[^A-Za-z0-9]/.test(value) },
    { label: "No repeated character runs", passed: !/(.)\1{2,}/.test(value) },
  ];

  const score = checks.filter((check) => check.passed).length;
  const label =
    score <= 2 ? "Weak" :
    score <= 4 ? "Moderate" :
    score === 5 ? "Strong" :
    "Very strong";

  return { checks, score, label };
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
      <Notice>This tool is best for quick cleanup. Results may vary with more complex code.</Notice>
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
      description="Shrink CSS by removing comments and extra whitespace."
      minify={minifyCss}
      placeholder={"body {\n  color: red;\n}\n/* comment */"}
    />
  );
}

export function HtmlMinifierTool() {
  return (
    <MinifierTool
      title="HTML Minifier"
      description="Minify HTML markup with a quick cleanup pass."
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

export function YamlFormatterTool() {
  return (
    <TransformTool
      title="YAML Formatter"
      description="Format YAML with whitespace cleanup and clear validation for common structures."
      inputLabel="YAML input"
      placeholder={`site:\n  name: Toolbox Hub\n  tools:\n    - formatter\n    - parser`}
      actionLabel="Format YAML"
      transform={formatYaml}
    />
  );
}

export function XmlFormatterTool() {
  return (
    <TransformTool
      title="XML Formatter"
      description="Pretty-print XML locally with validation and readable indentation."
      inputLabel="XML input"
      placeholder={`<tools><tool name="Word Counter" /><tool name="JSON Formatter" /></tools>`}
      actionLabel="Format XML"
      transform={formatXml}
    />
  );
}

export function CsvFormatterTool() {
  return (
    <TransformTool
      title="CSV Formatter"
      description="Format CSV rows locally with consistent quoting and cleaned spacing for common spreadsheet-style data."
      inputLabel="CSV input"
      placeholder={`name, category\nToolbox Hub, Developer\nWord Counter, Text`}
      actionLabel="Format CSV"
      transform={formatCsv}
    />
  );
}

export function CsvViewerTool() {
  const [input, setInput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const { rows, headers, error } = useMemo(() => {
    const value = input.trim();
    if (!value) {
      return { rows: [] as Array<Record<string, string>>, headers: [] as string[], error: "" };
    }

    try {
      const parsed = parseCsv(value);
      return {
        rows: parsed,
        headers: parsed.length ? Object.keys(parsed[0]) : parseCsvRow(value.replace(/\r\n/g, "\n").split("\n")[0]).map((header) => header.trim()),
        error: "",
      };
    } catch (parseError) {
      return {
        rows: [] as Array<Record<string, string>>,
        headers: [] as string[],
        error: parseError instanceof Error ? parseError.message : "Unable to parse that CSV input.",
      };
    }
  }, [input]);

  return (
    <ToolShell title="CSV Viewer" description="View CSV data locally as a readable table with validation for common row and header issues.">
      <Field label="CSV input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={`name,category\nToolbox Hub,Developer\nWord Counter,Text`} />
      </Field>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input.trim() ? (
        <EmptyState title="Paste CSV to view it as a table" description="The viewer parses CSV locally and renders the rows without uploading any data." />
      ) : rows.length ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-white">
            <table className="min-w-full divide-y divide-[color:var(--border)] text-sm">
              <thead className="bg-stone-50">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-4 py-3 text-left font-semibold text-[color:var(--foreground)]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex + 1}`}>
                    {headers.map((header) => (
                      <td key={`${rowIndex + 1}-${header}`} className="px-4 py-3 text-slate-700">{row[header]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className={buttonClass} onClick={() => copy("CSV JSON preview", JSON.stringify(rows, null, 2))}>Copy parsed rows as JSON</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
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

export function HtmlPreviewTool() {
  const [input, setInput] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const previewHtml = useMemo(() => sanitizePreviewHtml(input), [input]);

  return (
    <ToolShell title="HTML Preview Tool" description="Preview HTML snippets locally in a sanitized sandbox so untrusted markup cannot execute scripts or unsafe handlers.">
      <Field label="HTML input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={`<section>\n  <h2>Hello</h2>\n  <p>This is a preview.</p>\n</section>`} />
      </Field>
      <Notice>Preview output is sanitized and rendered in a sandbox. Scripts, inline event handlers, and unsafe URLs are removed before preview.</Notice>
      {!input.trim() ? (
        <EmptyState title="Paste HTML to preview it" description="Enter HTML markup and the tool will render a local preview directly in the browser." />
      ) : (
        <>
          <OutputBlock title="HTML source" value={input} />
          <SandboxPreview title="Rendered preview" html={previewHtml} />
          <button type="button" className={buttonClass} onClick={() => copy("HTML source", input)}>Copy HTML</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
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
          <SandboxPreview title="Rendered preview" html={output} />
          <button type="button" className={buttonClass} onClick={() => copy("HTML output", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function MarkdownEditorTool() {
  const [input, setInput] = useState("## Project Notes\n\n- Write clearly\n- Ship small improvements\n- Review the preview before exporting\n\nVisit [Toolbox Hub](https://example.com) for more tools.");
  const { copied, copy } = useCopyToClipboard();

  const { html, error } = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { html: "", error: "" };
    }

    try {
      return { html: markdownToHtml(trimmed), error: "" };
    } catch (conversionError) {
      return {
        html: "",
        error: conversionError instanceof Error ? conversionError.message : "Unable to render that Markdown.",
      };
    }
  }, [input]);

  return (
    <ToolShell title="Markdown Editor" description="Write Markdown with a live rendered preview, then copy or export the source or generated HTML locally in the browser.">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <Field label="Markdown input" hint="Supports headings, lists, links, emphasis, blockquotes, and inline code.">
            <textarea className={`${textareaClass} min-h-[26rem] font-mono`} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Write Markdown here..." />
          </Field>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("Markdown source", input)} disabled={!input.trim()}>
              Copy Markdown
            </button>
            <button type="button" className={secondaryButtonClass} onClick={() => downloadTextFile(input, "markdown-editor.md")} disabled={!input.trim()}>
              Export .md
            </button>
            <button type="button" className={secondaryButtonClass} onClick={() => setInput("")}>
              Clear editor
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {error ? <Notice tone="error">{error}</Notice> : null}
          {!input.trim() ? (
            <EmptyState title="Start writing Markdown" description="The preview updates as you type, and you can export either the Markdown source or the generated HTML." />
          ) : (
            <>
              <SandboxPreview title="Live preview" html={html} />
              <OutputBlock title="HTML output" value={html || "<p></p>"} />
              <div className="flex flex-wrap gap-3">
                <button type="button" className={buttonClass} onClick={() => copy("HTML output", html)} disabled={!html}>
                  Copy HTML
                </button>
                <button type="button" className={secondaryButtonClass} onClick={() => downloadTextFile(html, "markdown-editor.html", "text/html;charset=utf-8")} disabled={!html}>
                  Export .html
                </button>
              </div>
            </>
          )}
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </div>
      </div>
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

export function JsonDiffCheckerTool() {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const { diffs, error } = useMemo(() => {
    if (!leftInput.trim() && !rightInput.trim()) {
      return { diffs: [] as JsonDiffEntry[], error: "" };
    }

    if (!leftInput.trim() || !rightInput.trim()) {
      return { diffs: [] as JsonDiffEntry[], error: "Paste JSON into both inputs before comparing them." };
    }

    try {
      const left = JSON.parse(leftInput);
      const right = JSON.parse(rightInput);
      return { diffs: diffJsonValues(left, right), error: "" };
    } catch (parseError) {
      return {
        diffs: [] as JsonDiffEntry[],
        error: parseError instanceof Error ? parseError.message : "Enter valid JSON in both inputs before comparing them.",
      };
    }
  }, [leftInput, rightInput]);

  const output = useMemo(
    () =>
      diffs.length
        ? diffs
            .map((diff) => `${diff.kind.toUpperCase()} ${diff.path}\nLeft: ${diff.left}\nRight: ${diff.right}`)
            .join("\n\n")
        : "No differences found.",
    [diffs],
  );

  return (
    <ToolShell title="JSON Diff Checker" description="Compare two JSON values locally and highlight added, removed, and changed paths in a readable format.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Left JSON">
          <textarea className={textareaClass} value={leftInput} onChange={(event) => setLeftInput(event.target.value)} placeholder={`{"name":"Toolbox Hub","tools":100}`} />
        </Field>
        <Field label="Right JSON">
          <textarea className={textareaClass} value={rightInput} onChange={(event) => setRightInput(event.target.value)} placeholder={`{"name":"Toolbox Hub","tools":150}`} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!leftInput.trim() && !rightInput.trim() ? (
        <EmptyState title="Paste two JSON values to compare them" description="The diff checker runs locally and focuses on actual value differences, not just formatting." />
      ) : !error ? (
        <>
          <OutputBlock title={diffs.length ? `Differences found: ${diffs.length}` : "Comparison result"} value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("JSON diff result", output)}>Copy diff result</button>
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
        const matches = normalizedExpected === hash.toLowerCase();
        lines.push(`Match: ${matches ? "Yes" : "No"}`);
        setOutput(lines.join("\n"));
      } else {
        setOutput(lines.join("\n"));
      }
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
        <select
          className={inputClass}
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
      {mode === "checker" ? (
        <Field label="Expected hash" hint="Paste the digest you want to compare against. Uppercase and lowercase are treated the same.">
          <input className={inputClass} value={expectedHash} onChange={(event) => setExpectedHash(event.target.value)} placeholder="Paste expected checksum" />
        </Field>
      ) : null}
      <button type="button" className={buttonClass} onClick={handleGenerate} disabled={isWorking}>
        {isWorking ? "Computing hash..." : mode === "checker" ? "Check file hash" : "Generate checksum"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!file ? (
        <EmptyState title="Upload a file to begin" description="Choose a file, select a hash algorithm, and compute the digest locally in the browser." />
      ) : output ? (
        <>
          <OutputBlock title={mode === "checker" ? "File hash check" : "File checksum"} value={output} />
          <button type="button" className={buttonClass} onClick={() => copy(mode === "checker" ? "file hash check" : "file checksum", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function FileHashCheckerTool() {
  return (
    <FileHashTool
      title="File Hash Checker"
      description="Upload a file, compute its digest locally, and compare it with an expected checksum without sending the file to a server."
      mode="checker"
    />
  );
}

export function FileChecksumGeneratorTool() {
  return (
    <FileHashTool
      title="File Checksum Generator"
      description="Generate MD5 or SHA-family file checksums locally in the browser from uploaded file contents."
      mode="generator"
    />
  );
}

export function BCryptGeneratorTool() {
  const [input, setInput] = useState("");
  const [rounds, setRounds] = useState(10);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  async function handleGenerate() {
    if (!input) {
      setError("Enter text before generating a bcrypt hash.");
      setOutput("");
      return;
    }

    const safeRounds = Math.max(4, Math.min(14, rounds));
    setIsWorking(true);
    try {
      const bcrypt = await import("bcryptjs");
      const salt = await bcrypt.genSalt(safeRounds);
      const hash = await bcrypt.hash(input, salt);
      setOutput(hash);
      setError("");
    } catch (bcryptError) {
      setError(bcryptError instanceof Error ? bcryptError.message : "Unable to generate a bcrypt hash.");
      setOutput("");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <ToolShell title="BCrypt Generator" description="Generate real bcrypt hashes locally with a lightweight bcrypt library and adjustable cost factor.">
      <Field label="Input text">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter the value to hash." />
      </Field>
      <Field label="Cost factor" hint="Higher cost is slower but harder to brute force.">
        <input className={inputClass} type="number" min="4" max="14" value={rounds} onChange={(event) => setRounds(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate} disabled={isWorking}>
        {isWorking ? "Generating bcrypt..." : "Generate bcrypt hash"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input ? (
        <EmptyState title="Add text to hash" description="Enter text and choose a cost factor to generate a bcrypt hash locally in the browser." />
      ) : output ? (
        <>
          <OutputBlock title="BCrypt output" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("bcrypt hash", output)}>Copy hash</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function HmacGeneratorTool() {
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState<"SHA-256" | "SHA-384" | "SHA-512">("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  async function handleGenerate() {
    if (!message.trim()) {
      setError("Enter a message before generating an HMAC.");
      setOutput("");
      return;
    }

    if (!secret) {
      setError("Enter a secret key before generating an HMAC.");
      setOutput("");
      return;
    }

    setIsWorking(true);
    try {
      const signature = await signHmac(message, secret, algorithm);
      setOutput(signature);
      setError("");
    } catch (hmacError) {
      setError(hmacError instanceof Error ? hmacError.message : "Unable to generate that HMAC.");
      setOutput("");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <ToolShell title="HMAC Generator" description="Generate HMAC digests locally using the Web Crypto API with your chosen SHA family algorithm.">
      <Field label="Algorithm">
        <select className={inputClass} value={algorithm} onChange={(event) => setAlgorithm(event.target.value as "SHA-256" | "SHA-384" | "SHA-512")}>
          <option value="SHA-256">HMAC-SHA-256</option>
          <option value="SHA-384">HMAC-SHA-384</option>
          <option value="SHA-512">HMAC-SHA-512</option>
        </select>
      </Field>
      <Field label="Secret key">
        <input className={inputClass} value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Enter a secret key" />
      </Field>
      <Field label="Message">
        <textarea className={textareaClass} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Enter the message to sign." />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate} disabled={isWorking}>
        {isWorking ? "Generating HMAC..." : "Generate HMAC"}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!message && !secret ? (
        <EmptyState title="Add a secret and message" description="Provide a secret key and message to generate an HMAC locally in the browser." />
      ) : output ? (
        <>
          <OutputBlock title={`${algorithm} HMAC`} value={output} multiline={false} />
          <button type="button" className={buttonClass} onClick={() => copy("HMAC output", output)}>Copy HMAC</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function RandomTokenGeneratorTool() {
  const [length, setLength] = useState(32);
  const [format, setFormat] = useState<"hex" | "base64url" | "alphanumeric">("hex");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const safeLength = Math.max(8, Math.min(128, length));
    if (format === "hex") {
      const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(safeLength / 2)));
      setOutput(Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, safeLength));
      return;
    }

    if (format === "base64url") {
      const bytes = crypto.getRandomValues(new Uint8Array(safeLength));
      setOutput(bytesToBase64Url(bytes).slice(0, safeLength));
      return;
    }

    setOutput(generateRandomString(safeLength, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));
  }

  return (
    <ToolShell title="Random Token Generator" description="Generate secure random tokens locally in multiple formats using browser-provided cryptographic randomness.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Output format">
          <select className={inputClass} value={format} onChange={(event) => setFormat(event.target.value as "hex" | "base64url" | "alphanumeric")}>
            <option value="hex">Hex</option>
            <option value="base64url">Base64URL</option>
            <option value="alphanumeric">Alphanumeric</option>
          </select>
        </Field>
        <Field label="Length">
          <input className={inputClass} type="number" min="8" max="128" value={length} onChange={(event) => setLength(Number(event.target.value))} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate token</button>
      {!output ? (
        <EmptyState title="No token generated yet" description="Choose a format and length, then generate a secure random token locally." />
      ) : (
        <>
          <OutputBlock title="Generated token" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("generated token", output)}>Copy token</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function SecurePasswordStrengthCheckerTool() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const result = useMemo(() => (password ? scorePasswordStrength(password) : null), [password]);
  const summary = result
    ? `${result.label} (${result.score}/6 checks passed)`
    : "";

  return (
    <ToolShell title="Secure Password Strength Checker" description="Check password strength locally with clear rule-based feedback and no server upload.">
      <Field label="Password to evaluate" hint="This analysis runs locally in your browser only.">
        <input className={inputClass} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter a password to check" />
      </Field>
      <label className="flex items-center gap-2 text-sm text-[color:var(--foreground)]">
        <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
        Show password
      </label>
      {!password ? (
        <EmptyState title="No password to evaluate yet" description="Enter a password to see a local strength summary and rule-by-rule feedback." />
      ) : result ? (
        <>
          <OutputBlock title="Strength summary" value={summary} multiline={false} />
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Checks</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {result.checks.map((check) => (
                <li key={check.label}>{check.passed ? "Pass" : "Needs work"}: {check.label}</li>
              ))}
            </ul>
          </div>
          <button type="button" className={buttonClass} onClick={() => copy("password strength summary", summary)}>Copy summary</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function SecretKeyGeneratorTool() {
  const [length, setLength] = useState(48);
  const [format, setFormat] = useState<"base64url" | "hex">("base64url");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    const safeLength = Math.max(16, Math.min(128, length));
    if (format === "hex") {
      const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(safeLength / 2)));
      setOutput(Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, safeLength));
      return;
    }

    const bytes = crypto.getRandomValues(new Uint8Array(safeLength));
    setOutput(bytesToBase64Url(bytes).slice(0, safeLength));
  }

  return (
    <ToolShell title="Secret Key Generator" description="Generate high-entropy secret keys locally for app configuration, signing secrets, and development workflows.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Output format">
          <select className={inputClass} value={format} onChange={(event) => setFormat(event.target.value as "base64url" | "hex")}>
            <option value="base64url">Base64URL</option>
            <option value="hex">Hex</option>
          </select>
        </Field>
        <Field label="Length">
          <input className={inputClass} type="number" min="16" max="128" value={length} onChange={(event) => setLength(Number(event.target.value))} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate secret key</button>
      {!output ? (
        <EmptyState title="No secret key generated yet" description="Choose a length and format, then generate a random secret locally in the browser." />
      ) : (
        <>
          <OutputBlock title="Generated secret key" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("secret key", output)}>Copy key</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function MetaTagGeneratorTool() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [robots, setRobots] = useState("index,follow");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function loadExample() {
    setTitle("Free PDF Watermark Tool | Toolbox Hub");
    setDescription("Add text watermarks to PDF files online with a fast browser-side workflow.");
    setCanonicalUrl("https://example.com/tools/pdf-watermark-tool");
    setRobots("index,follow");
    setKeywords("pdf watermark tool, add watermark to pdf, watermark pdf online");
    setAuthor("Toolbox Hub");
  }

  function handleGenerate() {
    if (!title.trim() || !description.trim()) {
      setError("Enter a page title and meta description first.");
      setOutput("");
      return;
    }

    setOutput(buildMetaTags({ title, description, canonicalUrl, robots, keywords, author }));
    setError("");
  }

  return (
    <ToolShell title="Meta Tag Generator" description="Generate common SEO meta tags from a simple form and copy the output into your page head.">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={loadExample}>Load example</button>
      </div>
      <Field label="Page title">
        <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter the page title" />
      </Field>
      <Field label="Meta description">
        <textarea className={textareaClass} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Summarize the page in about 150-160 characters." />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Canonical URL">
          <input className={inputClass} value={canonicalUrl} onChange={(event) => setCanonicalUrl(event.target.value)} placeholder="https://example.com/page" />
        </Field>
        <Field label="Robots directive">
          <input className={inputClass} value={robots} onChange={(event) => setRobots(event.target.value)} placeholder="index,follow" />
        </Field>
        <Field label="Keywords">
          <input className={inputClass} value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="keyword one, keyword two" />
        </Field>
        <Field label="Author">
          <input className={inputClass} value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Author or brand name" />
        </Field>
      </div>
      <Notice>Example use case: generate title, description, canonical, robots, author, and keywords tags for a landing page or tool page.</Notice>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleGenerate}>Generate meta tags</button>
        {output ? <button type="button" className={secondaryButtonClass} onClick={() => copy("meta tags", output)}>Copy output</button> : null}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!title && !description ? (
        <EmptyState title="No meta tags generated yet" description="Fill in the core fields or load the example to generate copy-ready SEO meta tags." />
      ) : output ? (
        <>
          <OutputBlock title="Generated meta tags" value={output} />
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function KeywordDensityCheckerTool() {
  const [content, setContent] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [report, setReport] = useState("");
  const [topTerms, setTopTerms] = useState<Array<{ word: string; count: number; density: number }>>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function loadExample() {
    setContent("A PDF watermark tool helps users add a watermark to PDF files online. A clear PDF watermark workflow can improve document labeling for teams that need fast browser-based PDF editing.");
    setFocusKeyword("pdf watermark");
  }

  function handleAnalyze() {
    try {
      const result = analyzeKeywordDensity(content, focusKeyword);
      const lines = [
        `Total words: ${result.totalWords}`,
        `Unique words: ${result.uniqueWords}`,
      ];
      if (result.focusKeyword) {
        lines.push(`Focus keyword: ${result.focusKeyword}`);
        lines.push(`Focus matches: ${result.focusMatches}`);
        lines.push(`Focus density: ${result.focusDensity.toFixed(2)}%`);
      }
      lines.push("", "Top terms:");
      result.topTerms.forEach((term) => {
        lines.push(`- ${term.word}: ${term.count} (${term.density.toFixed(2)}%)`);
      });

      setReport(lines.join("\n"));
      setTopTerms(result.topTerms);
      setError("");
    } catch (densityError) {
      setError(densityError instanceof Error ? densityError.message : "Unable to analyze keyword density.");
      setReport("");
      setTopTerms([]);
    }
  }

  return (
    <ToolShell title="Keyword Density Checker" description="Analyze term frequency in pasted content locally and review the top repeated words or a chosen focus keyword.">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={loadExample}>Load example</button>
      </div>
      <Field label="Content">
        <textarea className={textareaClass} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Paste the content you want to analyze." />
      </Field>
      <Field label="Focus keyword or phrase" hint="Optional. Example: pdf watermark">
        <input className={inputClass} value={focusKeyword} onChange={(event) => setFocusKeyword(event.target.value)} placeholder="Enter an optional keyword or phrase" />
      </Field>
      <Notice>Example use case: check how often a target phrase appears and review the most repeated terms in a draft page.</Notice>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleAnalyze}>Analyze content</button>
        {report ? <button type="button" className={secondaryButtonClass} onClick={() => copy("keyword density report", report)}>Copy report</button> : null}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!content.trim() ? (
        <EmptyState title="No content analyzed yet" description="Paste some content or load the example to generate a quick keyword density report." />
      ) : report ? (
        <>
          <OutputBlock title="Keyword density report" value={report} />
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Top terms</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {topTerms.map((term) => (
                <li key={term.word}>{term.word}: {term.count} uses ({term.density.toFixed(2)}%)</li>
              ))}
            </ul>
          </div>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function RobotsTxtGeneratorTool() {
  const [userAgent, setUserAgent] = useState("*");
  const [allow, setAllow] = useState("/");
  const [disallow, setDisallow] = useState("/private/");
  const [sitemapUrl, setSitemapUrl] = useState("https://example.com/sitemap.xml");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function loadExample() {
    setUserAgent("*");
    setAllow("/");
    setDisallow("/admin/\n/tmp/");
    setSitemapUrl("https://example.com/sitemap.xml");
  }

  function handleGenerate() {
    setOutput(buildRobotsTxt({ userAgent, allow, disallow, sitemapUrl }));
  }

  return (
    <ToolShell title="Robots.txt Generator" description="Generate a simple robots.txt file locally from common crawl rules, then copy the result into your site root.">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={loadExample}>Load example</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="User-agent">
          <input className={inputClass} value={userAgent} onChange={(event) => setUserAgent(event.target.value)} placeholder="*" />
        </Field>
        <Field label="Sitemap URL">
          <input className={inputClass} value={sitemapUrl} onChange={(event) => setSitemapUrl(event.target.value)} placeholder="https://example.com/sitemap.xml" />
        </Field>
      </div>
      <Field label="Allow rules" hint="One path per line">
        <textarea className={textareaClass} value={allow} onChange={(event) => setAllow(event.target.value)} placeholder="/&#10;/blog/" />
      </Field>
      <Field label="Disallow rules" hint="One path per line">
        <textarea className={textareaClass} value={disallow} onChange={(event) => setDisallow(event.target.value)} placeholder="/admin/&#10;/private/" />
      </Field>
      <Notice>Example use case: create a starter robots.txt that allows public pages, blocks private paths, and points crawlers to your sitemap.</Notice>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleGenerate}>Generate robots.txt</button>
        {output ? <button type="button" className={secondaryButtonClass} onClick={() => copy("robots.txt output", output)}>Copy output</button> : null}
      </div>
      {!output ? (
        <EmptyState title="No robots.txt generated yet" description="Add your crawl rules or load the example to generate a copy-ready robots.txt file." />
      ) : (
        <>
          <OutputBlock title="Generated robots.txt" value={output} />
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function SitemapGeneratorTool() {
  const [urls, setUrls] = useState("https://example.com/\nhttps://example.com/tools/pdf-watermark-tool");
  const [changefreq, setChangefreq] = useState("weekly");
  const [priority, setPriority] = useState("0.8");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    try {
      setOutput(buildSitemapXml(urls.split("\n"), changefreq, priority));
      setError("");
    } catch (sitemapError) {
      setError(sitemapError instanceof Error ? sitemapError.message : "Unable to generate that sitemap.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="Sitemap Generator" description="Generate a simple XML sitemap from a list of absolute URLs and common sitemap options.">
      <Field label="URLs" hint="Enter one absolute URL per line">
        <textarea className={textareaClass} value={urls} onChange={(event) => setUrls(event.target.value)} placeholder="https://example.com/" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Change frequency">
          <select className={inputClass} value={changefreq} onChange={(event) => setChangefreq(event.target.value)}>
            <option value="always">always</option>
            <option value="hourly">hourly</option>
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
            <option value="yearly">yearly</option>
          </select>
        </Field>
        <Field label="Priority" hint="Use a value from 0.0 to 1.0">
          <input className={inputClass} value={priority} onChange={(event) => setPriority(event.target.value)} placeholder="0.8" />
        </Field>
      </div>
      <Notice>Example use case: create a starter XML sitemap for a small site or a batch of landing pages.</Notice>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleGenerate}>Generate sitemap XML</button>
        {output ? <button type="button" className={secondaryButtonClass} onClick={() => copy("sitemap XML", output)}>Copy output</button> : null}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!urls.trim() ? (
        <EmptyState title="No sitemap generated yet" description="Add one or more absolute URLs to build a copy-ready XML sitemap." />
      ) : output ? (
        <>
          <OutputBlock title="Generated sitemap XML" value={output} />
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function UrlSlugGeneratorTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function loadExample() {
    setInput("Free PDF Watermark Tool for Small Business Documents");
  }

  function handleGenerate() {
    setOutput(createSlug(input));
  }

  return (
    <ToolShell title="URL Slug Generator" description="Generate readable URL slugs from titles, headings, and phrases with a clean SEO-focused workflow.">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={loadExample}>Load example</button>
      </div>
      <Field label="Title or phrase">
        <input className={inputClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter a page title or phrase" />
      </Field>
      <Notice>Example use case: turn a blog title or landing-page heading into a lowercase, hyphenated URL segment.</Notice>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleGenerate}>Generate slug</button>
        {output ? <button type="button" className={secondaryButtonClass} onClick={() => copy("URL slug", output)}>Copy slug</button> : null}
      </div>
      {!input.trim() ? (
        <EmptyState title="No slug generated yet" description="Enter a title or load the example to generate an SEO-friendly slug." />
      ) : output ? (
        <>
          <OutputBlock title="Generated URL slug" value={output} multiline={false} />
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function OpenGraphGeneratorTool() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [type, setType] = useState("website");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function loadExample() {
    setTitle("PDF Watermark Tool | Toolbox Hub");
    setDescription("Add text watermarks to PDF files online with a fast browser-side workflow.");
    setUrl("https://example.com/tools/pdf-watermark-tool");
    setImageUrl("https://example.com/og/pdf-watermark-tool.jpg");
    setSiteName("Toolbox Hub");
    setType("website");
  }

  function handleGenerate() {
    if (!title.trim() || !description.trim()) {
      setError("Enter a title and description before generating Open Graph tags.");
      setOutput("");
      return;
    }

    setOutput(buildOpenGraphTags({ title, description, url, imageUrl, siteName, type }));
    setError("");
  }

  return (
    <ToolShell title="Open Graph Generator" description="Generate Open Graph meta tags for richer social sharing previews and copy the final markup easily.">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={loadExample}>Load example</button>
      </div>
      <Field label="Open Graph title">
        <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter the sharing title" />
      </Field>
      <Field label="Open Graph description">
        <textarea className={textareaClass} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Enter the sharing description" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Page URL">
          <input className={inputClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/page" />
        </Field>
        <Field label="Image URL">
          <input className={inputClass} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://example.com/image.jpg" />
        </Field>
        <Field label="Site name">
          <input className={inputClass} value={siteName} onChange={(event) => setSiteName(event.target.value)} placeholder="Your site name" />
        </Field>
        <Field label="Open Graph type">
          <select className={inputClass} value={type} onChange={(event) => setType(event.target.value)}>
            <option value="website">website</option>
            <option value="article">article</option>
            <option value="product">product</option>
          </select>
        </Field>
      </div>
      <Notice>Example use case: generate `og:` tags for a blog post, landing page, tool page, or product page.</Notice>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleGenerate}>Generate Open Graph tags</button>
        {output ? <button type="button" className={secondaryButtonClass} onClick={() => copy("Open Graph tags", output)}>Copy output</button> : null}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!title.trim() && !description.trim() ? (
        <EmptyState title="No Open Graph tags generated yet" description="Fill in the sharing fields or load the example to generate copy-ready Open Graph markup." />
      ) : output ? (
        <>
          <OutputBlock title="Generated Open Graph tags" value={output} />
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function EmailValidatorTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleValidate() {
    try {
      const next = validateEmailFormat(input);
      setResult([
        `Status: ${next.valid ? "Valid format" : "Invalid format"}`,
        `Normalized: ${next.normalized}`,
        `Note: ${next.note}`,
      ].join("\n"));
      setError("");
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Unable to validate that email address.");
      setResult("");
    }
  }

  return (
    <ToolShell title="Email Validator" description="Validate common email-address format rules locally in the browser without pretending to verify mailbox existence.">
      <Field label="Email address">
        <input className={inputClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="name@example.com" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleValidate}>Validate email</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!result && !error ? (
        <EmptyState title="No email checked yet" description="Enter an email address to run a local format validation and generate a copy-ready result." />
      ) : result ? (
        <>
          <OutputBlock title="Validation result" value={result} />
          <button type="button" className={buttonClass} onClick={() => copy("email validation result", result)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function PhoneNumberFormatterTool() {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState<"us" | "international">("us");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleFormat() {
    try {
      const next = formatPhoneNumberValue(input, style);
      setResult([
        `Formatted: ${next.formatted}`,
        `Digits only: ${next.digits}`,
        `Note: ${next.note}`,
      ].join("\n"));
      setError("");
    } catch (formattingError) {
      setError(formattingError instanceof Error ? formattingError.message : "Unable to format that phone number.");
      setResult("");
    }
  }

  return (
    <ToolShell title="Phone Number Formatter" description="Clean up phone numbers locally and format them with a simple US or international output style.">
      <Field label="Phone number">
        <input className={inputClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="+1 (415) 555-0123" />
      </Field>
      <Field label="Formatting style">
        <select className={inputClass} value={style} onChange={(event) => setStyle(event.target.value as "us" | "international")}>
          <option value="us">US format</option>
          <option value="international">International format</option>
        </select>
      </Field>
      <button type="button" className={buttonClass} onClick={handleFormat}>Format number</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!result && !error ? (
        <EmptyState title="No formatted number yet" description="Enter a number and choose an output style to generate a cleaned phone-number format." />
      ) : result ? (
        <>
          <OutputBlock title="Formatted phone number" value={result} />
          <button type="button" className={buttonClass} onClick={() => copy("formatted phone number", result)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function UUIDValidatorTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleValidate() {
    try {
      const next = inspectUuid(input);
      setResult([
        `Status: ${next.valid ? "Valid UUID" : "Invalid UUID"}`,
        `Normalized: ${next.normalized}`,
        `Version: ${next.version}`,
        `Variant: ${next.variant}`,
      ].join("\n"));
      setError("");
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Unable to validate that UUID.");
      setResult("");
    }
  }

  return (
    <ToolShell title="UUID Validator" description="Validate common UUID formats locally and show the detected version when the pattern matches.">
      <Field label="UUID value">
        <input className={inputClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="123e4567-e89b-12d3-a456-426614174000" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleValidate}>Validate UUID</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!result && !error ? (
        <EmptyState title="No UUID checked yet" description="Paste a UUID string to validate its pattern and inspect the version information locally." />
      ) : result ? (
        <>
          <OutputBlock title="UUID validation" value={result} />
          <button type="button" className={buttonClass} onClick={() => copy("UUID validation result", result)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function RandomApiKeyGeneratorTool() {
  const [prefix, setPrefix] = useState("sk_live");
  const [length, setLength] = useState(32);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    if (!Number.isFinite(length) || length < 16 || length > 96) {
      setError("Choose a key length between 16 and 96 characters.");
      setOutput("");
      return;
    }

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const body = getCryptoRandomString(length, alphabet);
    setOutput(prefix.trim() ? `${prefix.trim()}_${body}` : body);
    setError("");
  }

  return (
    <ToolShell title="Random API Key Generator" description="Generate API-style random keys locally with browser cryptographic randomness and copy-ready output.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Prefix">
          <input className={inputClass} value={prefix} onChange={(event) => setPrefix(event.target.value)} placeholder="sk_live" />
        </Field>
        <Field label="Random body length">
          <input className={inputClass} type="number" min="16" max="96" value={length} onChange={(event) => setLength(Number(event.target.value))} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate API key</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No API key generated yet" description="Choose an optional prefix and length, then generate a random key entirely in the browser." />
      ) : output ? (
        <>
          <OutputBlock title="Generated API key" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("API key", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function SecureTokenGeneratorTool() {
  const [format, setFormat] = useState<"hex" | "base64url">("base64url");
  const [length, setLength] = useState(32);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    if (!Number.isFinite(length) || length < 16 || length > 128) {
      setError("Choose a token length between 16 and 128 characters.");
      setOutput("");
      return;
    }

    const alphabet =
      format === "hex"
        ? "abcdef0123456789"
        : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

    setOutput(getCryptoRandomString(length, alphabet));
    setError("");
  }

  return (
    <ToolShell title="Secure Token Generator" description="Generate secure random tokens locally in hex or URL-safe format using browser cryptographic randomness.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Token format">
          <select className={inputClass} value={format} onChange={(event) => setFormat(event.target.value as "hex" | "base64url")}>
            <option value="base64url">Base64URL-safe</option>
            <option value="hex">Hex</option>
          </select>
        </Field>
        <Field label="Token length">
          <input className={inputClass} type="number" min="16" max="128" value={length} onChange={(event) => setLength(Number(event.target.value))} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate token</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No token generated yet" description="Choose the token format and length, then generate a secure browser-side random token." />
      ) : output ? (
        <>
          <OutputBlock title="Generated token" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("secure token", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function PasswordEntropyCalculatorTool() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleCalculate() {
    if (!password) {
      setError("Enter a password before calculating entropy.");
      setResult("");
      return;
    }

    const entropy = calculatePasswordEntropy(password);
    setResult([
      `Estimated entropy: ${entropy.entropy.toFixed(2)} bits`,
      `Strength: ${entropy.strength}`,
      `Length: ${entropy.length} characters`,
      `Estimated character pool: ${entropy.poolSize}`,
      `Detected sets: ${entropy.characterSets.join(", ") || "none"}`,
    ].join("\n"));
    setError("");
  }

  return (
    <ToolShell title="Password Entropy Calculator" description="Estimate password entropy locally from length and character variety to get a rough strength signal.">
      <Field label="Password to analyze">
        <input className={inputClass} type="text" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter a password sample" />
      </Field>
      <Notice>This is an estimate based on character variety and length. It does not account for password reuse or predictable patterns.</Notice>
      <button type="button" className={buttonClass} onClick={handleCalculate}>Calculate entropy</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!result && !error ? (
        <EmptyState title="No entropy report yet" description="Enter a password sample to estimate entropy and review a simple browser-side strength summary." />
      ) : result ? (
        <>
          <OutputBlock title="Entropy report" value={result} />
          <button type="button" className={buttonClass} onClick={() => copy("entropy report", result)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function HashIdentifierTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleIdentify() {
    try {
      const candidates = identifyHashCandidates(input);
      setResult(
        candidates.length
          ? [
              `Likely matches: ${candidates.join(", ")}`,
              `Input length: ${input.trim().length}`,
              "Note: pattern matching suggests possibilities only and cannot guarantee the exact hash type.",
            ].join("\n")
          : [
              "No strong hash match detected from this pattern.",
              `Input length: ${input.trim().length}`,
              "Note: the value may be plain text, a custom token, or a digest format outside the bundled pattern list.",
            ].join("\n"),
      );
      setError("");
    } catch (identifyError) {
      setError(identifyError instanceof Error ? identifyError.message : "Unable to identify that hash-like value.");
      setResult("");
    }
  }

  return (
    <ToolShell title="Hash Identifier" description="Guess likely hash families locally from digest length and character patterns with an honest uncertainty note.">
      <Field label="Hash-like value">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="5d41402abc4b2a76b9719d911017c592" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleIdentify}>Identify hash</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!result && !error ? (
        <EmptyState title="No hash identified yet" description="Paste a digest or token to compare it against common hash-pattern signatures in the browser." />
      ) : result ? (
        <>
          <OutputBlock title="Identification result" value={result} />
          <button type="button" className={buttonClass} onClick={() => copy("hash identification result", result)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function SqlMinifierTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleMinify() {
    try {
      setOutput(minifySql(input));
      setError("");
    } catch (sqlError) {
      setError(sqlError instanceof Error ? sqlError.message : "Unable to minify that SQL query.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="SQL Minifier" description="Minify common SQL queries locally by stripping comments and collapsing whitespace into compact single-line output.">
      <Field label="SQL query">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={"SELECT id, name\nFROM users\nWHERE active = 1\nORDER BY created_at DESC;"} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleMinify}>Minify SQL</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No minified SQL yet" description="Paste a query and run the minifier to get a compact SQL string you can copy." />
      ) : output ? (
        <>
          <CodeOutputBlock title="Minified SQL" value={output} language="sql" />
          <button type="button" className={buttonClass} onClick={() => copy("minified SQL", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

function SqlFormatterTool({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleFormat() {
    try {
      setOutput(beautifySql(input));
      setError("");
    } catch (sqlError) {
      setError(sqlError instanceof Error ? sqlError.message : "Unable to format that SQL query.");
      setOutput("");
    }
  }

  return (
    <ToolShell title={title} description={description}>
      <Field label="SQL query">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder={"select id, name, email from users where status = 'active' and deleted_at is null order by created_at desc;"} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleFormat}>Format SQL</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No formatted SQL yet" description="Paste a query to generate a readable multi-line layout with lightweight syntax highlighting." />
      ) : output ? (
        <>
          <CodeOutputBlock title="Formatted SQL" value={output} language="sql" />
          <button type="button" className={buttonClass} onClick={() => copy("formatted SQL", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function SqlBeautifierTool() {
  return (
    <SqlFormatterTool
      title="SQL Beautifier"
      description="Beautify common SQL queries locally with readable line breaks and indentation for fast review and sharing."
    />
  );
}

export function SqlQueryFormatterTool() {
  return (
    <SqlFormatterTool
      title="SQL Query Formatter"
      description="Format SQL queries locally into a cleaner, easier-to-scan structure while keeping the workflow fully in the browser."
    />
  );
}

export function CronExpressionGeneratorTool() {
  const [mode, setMode] = useState<"every-minute" | "hourly" | "daily" | "weekly" | "monthly">("daily");
  const [minute, setMinute] = useState(0);
  const [hour, setHour] = useState(9);
  const [weekday, setWeekday] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [interval, setInterval] = useState(5);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    if (minute < 0 || minute > 59 || hour < 0 || hour > 23) {
      setError("Minute must be 0-59 and hour must be 0-23.");
      setOutput("");
      return;
    }

    let expression: string;
    let description: string;

    if (mode === "every-minute") {
      if (interval < 1 || interval > 59) {
        setError("Minute interval must be between 1 and 59.");
        setOutput("");
        return;
      }
      expression = `*/${interval} * * * *`;
      description = `Runs every ${interval} minute(s).`;
    } else if (mode === "hourly") {
      expression = `${minute} * * * *`;
      description = `Runs at minute ${minute} of every hour.`;
    } else if (mode === "daily") {
      expression = `${minute} ${hour} * * *`;
      description = `Runs every day at ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}.`;
    } else if (mode === "weekly") {
      expression = `${minute} ${hour} * * ${weekday}`;
      description = `Runs weekly on weekday ${weekday} at ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}.`;
    } else {
      if (dayOfMonth < 1 || dayOfMonth > 31) {
        setError("Day of month must be between 1 and 31.");
        setOutput("");
        return;
      }
      expression = `${minute} ${hour} ${dayOfMonth} * *`;
      description = `Runs monthly on day ${dayOfMonth} at ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}.`;
    }

    setOutput(`${expression}\n\n${description}`);
    setError("");
  }

  return (
    <ToolShell title="Cron Expression Generator" description="Generate common 5-field cron expressions from a simpler schedule form and copy the final expression easily.">
      <Field label="Schedule type">
        <select className={inputClass} value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
          <option value="every-minute">Every N minutes</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </Field>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mode === "every-minute" ? (
          <Field label="Minute interval">
            <input className={inputClass} type="number" min="1" max="59" value={interval} onChange={(event) => setInterval(Number(event.target.value))} />
          </Field>
        ) : null}
        {mode !== "every-minute" ? (
          <>
            <Field label="Hour">
              <input className={inputClass} type="number" min="0" max="23" value={hour} onChange={(event) => setHour(Number(event.target.value))} />
            </Field>
            <Field label="Minute">
              <input className={inputClass} type="number" min="0" max="59" value={minute} onChange={(event) => setMinute(Number(event.target.value))} />
            </Field>
          </>
        ) : null}
        {mode === "weekly" ? (
          <Field label="Weekday" hint="0 = Sunday, 6 = Saturday">
            <input className={inputClass} type="number" min="0" max="6" value={weekday} onChange={(event) => setWeekday(Number(event.target.value))} />
          </Field>
        ) : null}
        {mode === "monthly" ? (
          <Field label="Day of month">
            <input className={inputClass} type="number" min="1" max="31" value={dayOfMonth} onChange={(event) => setDayOfMonth(Number(event.target.value))} />
          </Field>
        ) : null}
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate cron expression</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No cron expression yet" description="Choose a schedule pattern and generate a 5-field cron expression with a human-readable summary." />
      ) : output ? (
        <>
          <CodeOutputBlock title="Cron expression" value={output} language="text" />
          <button type="button" className={buttonClass} onClick={() => copy("cron expression", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function CronExpressionParserTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleParse() {
    try {
      const parsed = parseCronExpression(input);
      setOutput(`${parsed.expression}\n\n${parsed.description}\n\n${parsed.output}`);
      setError("");
    } catch (cronError) {
      setError(cronError instanceof Error ? cronError.message : "Unable to parse that cron expression.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="Cron Expression Parser" description="Parse a standard 5-field cron expression into a clearer human-readable summary directly in the browser.">
      <Field label="Cron expression" hint="Use the format: minute hour day month weekday">
        <input className={inputClass} value={input} onChange={(event) => setInput(event.target.value)} placeholder="*/15 9 * * 1,3,5" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleParse}>Parse cron</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No cron schedule parsed yet" description="Enter a standard 5-field cron expression to see a lightweight field-by-field explanation." />
      ) : output ? (
        <>
          <CodeOutputBlock title="Parsed cron schedule" value={output} language="text" />
          <button type="button" className={buttonClass} onClick={() => copy("parsed cron schedule", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function JsonSchemaValidatorTool() {
  const [dataInput, setDataInput] = useState('{"name":"Toolbox Hub","tools":50}');
  const [schemaInput, setSchemaInput] = useState('{"type":"object","required":["name","tools"],"properties":{"name":{"type":"string","minLength":3},"tools":{"type":"number","minimum":1}}}');
  const [report, setReport] = useState("");
  const [formattedData, setFormattedData] = useState("");
  const [formattedSchema, setFormattedSchema] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleValidate() {
    try {
      const data = JSON.parse(dataInput);
      const schema = JSON.parse(schemaInput) as ReducedJsonSchema;
      const errors = validateJsonAgainstSchema(data, schema);
      setFormattedData(JSON.stringify(data, null, 2));
      setFormattedSchema(JSON.stringify(schema, null, 2));
      setReport(errors.length ? errors.join("\n") : "Validation passed. The JSON matches the supported schema rules.");
      setError("");
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Unable to validate the JSON against that schema.");
      setReport("");
      setFormattedData("");
      setFormattedSchema("");
    }
  }

  return (
    <ToolShell title="JSON Schema Validator" description="Validate JSON with support for common schema rules such as types, required keys, enums, patterns, and length checks.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="JSON data">
          <textarea className={textareaClass} value={dataInput} onChange={(event) => setDataInput(event.target.value)} />
        </Field>
        <Field label="JSON schema">
          <textarea className={textareaClass} value={schemaInput} onChange={(event) => setSchemaInput(event.target.value)} />
        </Field>
      </div>
      <Notice>Supported rules include `type`, `required`, `properties`, `items`, `enum`, `minLength`, `maxLength`, `minimum`, `maximum`, `pattern`, `minItems`, and `maxItems`.</Notice>
      <button type="button" className={buttonClass} onClick={handleValidate}>Validate JSON</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!report && !error ? (
        <EmptyState title="No validation report yet" description="Paste JSON plus a compatible schema to validate the structure locally in the browser." />
      ) : report ? (
        <>
          <OutputBlock title="Validation report" value={report} />
          <div className="grid gap-4 md:grid-cols-2">
            <CodeOutputBlock title="Formatted JSON data" value={formattedData} language="json" />
            <CodeOutputBlock title="Formatted JSON schema" value={formattedSchema} language="json" />
          </div>
          <button type="button" className={buttonClass} onClick={() => copy("JSON schema validation report", report)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function JsonKeyExtractorTool() {
  const [input, setInput] = useState('{"site":{"name":"Toolbox Hub","categories":["text","developer"]}}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleExtract() {
    try {
      const parsed = JSON.parse(input);
      const paths = [...extractJsonPaths(parsed)].sort();
      setOutput(paths.join("\n"));
      setError("");
    } catch (extractError) {
      setError(extractError instanceof Error ? extractError.message : "Unable to extract keys from that JSON.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="JSON Key Extractor" description="Extract JSON keys and deep paths locally so you can inspect nested payload structure without leaving the browser.">
      <Field label="JSON input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleExtract}>Extract keys</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No JSON paths extracted yet" description="Paste valid JSON and run the extractor to list root keys and nested paths." />
      ) : output ? (
        <>
          <OutputBlock title="Extracted JSON paths" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("JSON paths", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function XmlToJsonConverterTool() {
  const [input, setInput] = useState("<site><name>Toolbox Hub</name><tools>50</tools></site>");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleConvert() {
    try {
      const parser = new DOMParser();
      const documentNode = parser.parseFromString(input, "application/xml");
      const parserError = documentNode.querySelector("parsererror");
      if (parserError || !documentNode.documentElement) {
        throw new Error("Enter valid XML before converting it.");
      }
      const converted = {
        [documentNode.documentElement.tagName]: xmlNodeToJson(documentNode.documentElement),
      };
      setOutput(JSON.stringify(converted, null, 2));
      setError("");
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : "Unable to convert that XML into JSON.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="XML to JSON Converter" description="Convert valid XML into a readable JSON structure with highlighted output.">
      <Field label="XML input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleConvert}>Convert XML to JSON</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No JSON output yet" description="Paste valid XML and convert it into a JSON structure you can inspect and copy." />
      ) : output ? (
        <>
          <CodeOutputBlock title="JSON output" value={output} language="json" />
          <button type="button" className={buttonClass} onClick={() => copy("JSON output", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function JsonToXmlConverterTool() {
  const [input, setInput] = useState('{"site":{"name":"Toolbox Hub","tools":50}}');
  const [rootName, setRootName] = useState("root");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleConvert() {
    try {
      const parsed = JSON.parse(input);
      const xml = typeof parsed === "object" && parsed && !Array.isArray(parsed) && Object.keys(parsed).length === 1
        ? Object.entries(parsed as Record<string, unknown>).map(([key, value]) => jsonValueToXml(value, key)).join("\n")
        : jsonValueToXml(parsed, rootName.trim() || "root");
      setOutput(formatXml(xml));
      setError("");
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : "Unable to convert that JSON into XML.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="JSON to XML Converter" description="Convert valid JSON into readable XML locally in the browser, with support for nested objects, arrays, and simple attributes via `@attributes`.">
      <Field label="JSON input">
        <textarea className={textareaClass} value={input} onChange={(event) => setInput(event.target.value)} />
      </Field>
      <Field label="Fallback root name" hint="Used when the JSON root is not a single named object.">
        <input className={inputClass} value={rootName} onChange={(event) => setRootName(event.target.value)} placeholder="root" />
      </Field>
      <button type="button" className={buttonClass} onClick={handleConvert}>Convert JSON to XML</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No XML output yet" description="Paste valid JSON and convert it into readable XML with browser-side formatting." />
      ) : output ? (
        <>
          <CodeOutputBlock title="XML output" value={output} language="xml" />
          <button type="button" className={buttonClass} onClick={() => copy("XML output", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function CsvDiffCheckerTool() {
  const [leftInput, setLeftInput] = useState("id,name,status\n1,Alpha,active\n2,Beta,inactive");
  const [rightInput, setRightInput] = useState("id,name,status\n1,Alpha,active\n2,Beta,active\n3,Gamma,active");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleCompare() {
    try {
      const leftRows = parseCsv(leftInput);
      const rightRows = parseCsv(rightInput);
      const leftHeaders = Object.keys(leftRows[0] ?? {});
      const rightHeaders = Object.keys(rightRows[0] ?? {});

      if (leftHeaders.join("|") !== rightHeaders.join("|")) {
        throw new Error("Both CSV inputs need the same header row for this diff checker.");
      }

      const maxRows = Math.max(leftRows.length, rightRows.length);
      const diffs: string[] = [];

      for (let index = 0; index < maxRows; index += 1) {
        const leftRow = leftRows[index];
        const rightRow = rightRows[index];

        if (!leftRow) {
          diffs.push(`Row ${index + 2}: added in right CSV -> ${JSON.stringify(rightRow)}`);
          continue;
        }
        if (!rightRow) {
          diffs.push(`Row ${index + 2}: removed from right CSV -> ${JSON.stringify(leftRow)}`);
          continue;
        }

        for (const header of leftHeaders) {
          if ((leftRow[header] ?? "") !== (rightRow[header] ?? "")) {
            diffs.push(`Row ${index + 2}, column "${header}": "${leftRow[header] ?? ""}" -> "${rightRow[header] ?? ""}"`);
          }
        }
      }

      setOutput(diffs.length ? diffs.join("\n") : "No row or cell differences found.");
      setError("");
    } catch (diffError) {
      setError(diffError instanceof Error ? diffError.message : "Unable to compare those CSV inputs.");
      setOutput("");
    }
  }

  return (
    <ToolShell title="CSV Diff Checker" description="Compare two CSV inputs locally by row number and shared headers, then review a clear cell-by-cell diff report.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Left CSV">
          <textarea className={textareaClass} value={leftInput} onChange={(event) => setLeftInput(event.target.value)} />
        </Field>
        <Field label="Right CSV">
          <textarea className={textareaClass} value={rightInput} onChange={(event) => setRightInput(event.target.value)} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleCompare}>Compare CSV</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No CSV diff yet" description="Paste two CSV inputs with matching headers to generate a row-by-row diff report in the browser." />
      ) : output ? (
        <>
          <OutputBlock title="CSV diff report" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("CSV diff report", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function KeywordDifficultyCheckerPlaceholderTool() {
  return (
    <ToolShell title="Keyword Difficulty Checker" description="Keyword difficulty works best with live search data, so this tool is not available yet.">
      <Notice>
        This tool is currently unavailable. Please check back later.
      </Notice>
      <EmptyState
        title="Not available right now"
        description="Reliable keyword difficulty scores need live search data. This page stays hidden until that experience is ready."
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
      <Notice>Example ideas include modifiers like “tips,” “guide,” “online,” and question-style variations.</Notice>
      <button type="button" className={buttonClass} onClick={handleGenerate}>Generate keyword ideas</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="No keyword ideas yet" description="Enter a seed phrase and generate a local list of brainstorming suggestions you can refine later." />
      ) : output ? (
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
  const [markup, setMarkup] = useState('<title>Email Marketing Guide | Toolbox Hub</title>\n<meta name="description" content="Learn practical email marketing tips with clear examples and simple advice." />\n<meta name="robots" content="index,follow" />\n<link rel="canonical" href="https://example.com/email-marketing-guide" />');
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleAnalyze() {
    try {
      const result = analyzeMetaTags(markup);
      setReport(
        `${result.findings.join("\n")}\n\nSuggestions:\n${result.suggestions.length ? result.suggestions.map((item) => `- ${item}`).join("\n") : "- No major gaps detected in the basic tag set."}`,
      );
      setError("");
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Unable to analyze those meta tags.");
      setReport("");
    }
  }

  return (
    <ToolShell title="Meta Tag Analyzer" description="Review pasted head markup locally, detect common SEO tags, and highlight basic gaps like missing titles, descriptions, canonicals, or Open Graph tags.">
      <Field label="Head markup or meta tags" hint="Paste a few tags or a full <head> snippet.">
        <textarea className={textareaClass} value={markup} onChange={(event) => setMarkup(event.target.value)} />
      </Field>
      <Notice>Helpful example: title, description, robots, canonical, and Open Graph tags for a landing page or blog post.</Notice>
      <button type="button" className={buttonClass} onClick={handleAnalyze}>Analyze meta tags</button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!report && !error ? (
        <EmptyState title="No analysis yet" description="Paste markup and run the analyzer to get a quick formatted SEO review." />
      ) : report ? (
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
      {!output && !error ? (
        <EmptyState title="No title ideas yet" description="Enter a keyword and optional brand name to generate formatted page-title ideas." />
      ) : output ? (
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
      {!output && !error ? (
        <EmptyState title="No description ideas yet" description="Enter a keyword and optional audience to generate formatted draft descriptions you can refine." />
      ) : output ? (
        <>
          <OutputBlock title="Description ideas" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("description ideas", output)}>Copy output</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}
