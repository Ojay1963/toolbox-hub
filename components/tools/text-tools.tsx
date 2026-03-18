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

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function toSentenceCase(value: string) {
  return value
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
}

export function WordCounterTool() {
  const [text, setText] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
    };
  }, [text]);

  return (
    <ToolShell title="Word Counter" description="Count words, sentences, paragraphs, and characters locally as you type.">
      <Field label="Text input">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste or type your text here." />
      </Field>
      {!text ? (
        <EmptyState title="Start typing to count text" description="The tool will update counts instantly for words, characters, sentences, and paragraphs." />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(stats).map(([key, value]) => (
              <OutputBlock key={key} title={key} value={String(value)} multiline={false} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={secondaryButtonClass} onClick={() => copy("text", text)}>
              Copy text
            </button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      )}
    </ToolShell>
  );
}

export function CharacterCounterTool() {
  const [text, setText] = useState("");

  const metrics = useMemo(() => {
    const noSpaces = text.replace(/\s/g, "");
    return {
      totalCharacters: text.length,
      withoutSpaces: noSpaces.length,
      lines: text ? text.split("\n").length : 0,
      bytesUtf8: new TextEncoder().encode(text).length,
    };
  }, [text]);

  return (
    <ToolShell title="Character Counter" description="Measure characters, characters without spaces, line count, and UTF-8 byte size.">
      <Field label="Text input">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder="Enter text to count characters." />
      </Field>
      {!text ? (
        <EmptyState title="No text to count yet" description="Paste or type text to see character totals and related metrics." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(metrics).map(([key, value]) => (
            <OutputBlock key={key} title={key} value={String(value)} multiline={false} />
          ))}
        </div>
      )}
    </ToolShell>
  );
}

export function CaseConverterTool() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  return (
    <ToolShell title="Case Converter" description="Transform text into uppercase, lowercase, title case, or sentence case locally in the browser.">
      <Field label="Input text">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder="Enter text to convert." />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClass} onClick={() => setOutput(text.toUpperCase())} disabled={!text}>UPPERCASE</button>
        <button type="button" className={secondaryButtonClass} onClick={() => setOutput(text.toLowerCase())} disabled={!text}>lowercase</button>
        <button type="button" className={secondaryButtonClass} onClick={() => setOutput(toTitleCase(text))} disabled={!text}>Title Case</button>
        <button type="button" className={secondaryButtonClass} onClick={() => setOutput(toSentenceCase(text))} disabled={!text}>Sentence case</button>
      </div>
      {!text ? (
        <EmptyState title="Add text to convert" description="Choose any case option after entering text." />
      ) : (
        <>
          <OutputBlock title="Converted output" value={output || "Choose a case style above."} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("converted text", output)} disabled={!output}>
              Copy output
            </button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      )}
    </ToolShell>
  );
}

export function RemoveDuplicateLinesTool() {
  const [text, setText] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const output = useMemo(() => {
    const seen = new Set<string>();
    return text
      .split("\n")
      .filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      })
      .join("\n");
  }, [text]);

  return (
    <ToolShell title="Remove Duplicate Lines" description="Clean a list of lines by removing repeats while preserving the first occurrence.">
      <Field label="Line-based text">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder={"apple\norange\napple\nbanana"} />
      </Field>
      {!text ? (
        <EmptyState title="Paste line-based text to clean it" description="Each line is treated as one value, and the first occurrence is kept." />
      ) : (
        <>
          <OutputBlock title="Unique lines" value={output} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("unique lines", output)} disabled={!output}>
              Copy result
            </button>
            <button type="button" className={secondaryButtonClass} onClick={() => setText(output)}>
              Replace input with result
            </button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      )}
    </ToolShell>
  );
}

export function TextSorterTool() {
  const [text, setText] = useState("");
  const [descending, setDescending] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const { copied, copy } = useCopyToClipboard();

  const sorted = useMemo(() => {
    const lines = text.split("\n");
    const filtered = removeEmpty ? lines.filter((line) => line.trim() !== "") : lines;
    const next = [...filtered].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return (descending ? next.reverse() : next).join("\n");
  }, [descending, removeEmpty, text]);

  return (
    <ToolShell title="Text Sorter" description="Sort lines alphabetically in ascending or descending order with simple browser-side processing.">
      <Field label="Line-based text">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder={"pear\napple\nbanana"} />
      </Field>
      <div className="flex flex-wrap gap-6 text-sm text-[color:var(--foreground)]">
        <label className="flex items-center gap-2"><input type="checkbox" checked={descending} onChange={(event) => setDescending(event.target.checked)} /> Sort descending</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={removeEmpty} onChange={(event) => setRemoveEmpty(event.target.checked)} /> Remove empty lines</label>
      </div>
      {!text ? (
        <EmptyState title="Paste some lines to sort" description="The tool sorts one line at a time and works best with line-based lists." />
      ) : (
        <>
          <OutputBlock title="Sorted text" value={sorted} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => copy("sorted text", sorted)} disabled={!sorted}>
              Copy result
            </button>
            {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
          </div>
        </>
      )}
    </ToolShell>
  );
}
