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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const sentenceBank = [
  "Small tools save surprising amounts of time during everyday work.",
  "A clean workflow usually beats a complicated one.",
  "Browser-first utilities can be fast, simple, and practical.",
  "Good defaults make even small tools easier to trust.",
  "Clear output matters as much as correct output.",
  "Tiny improvements often create the biggest sense of momentum.",
];

const loremWords = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" ");

function getRandomInt(max: number) {
  return crypto.getRandomValues(new Uint32Array(1))[0] % max;
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

export function TextReverserTool() {
  const [text, setText] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const output = useMemo(() => [...text].reverse().join(""), [text]);

  return (
    <ToolShell title="Text Reverser" description="Reverse the order of characters in text locally in the browser.">
      <Field label="Input text">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder="Enter text to reverse." />
      </Field>
      {!text ? (
        <EmptyState title="Enter text to reverse" description="The tool will reverse the character order and keep the result ready to copy." />
      ) : (
        <>
          <OutputBlock title="Reversed output" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("reversed text", output)} disabled={!output}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function TextToSlugConverterTool() {
  const [text, setText] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const output = useMemo(() => slugify(text), [text]);

  return (
    <ToolShell title="Text to Slug Converter" description="Convert titles and phrases into clean, lowercase URL slugs.">
      <Field label="Input text">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder="My New Tool Title" />
      </Field>
      {!text ? (
        <EmptyState title="Add text to generate a slug" description="The converter will remove punctuation, normalize spacing, and create a URL-friendly slug." />
      ) : (
        <>
          <OutputBlock title="Slug output" value={output || "No slug could be created from the current input."} multiline={false} />
          <button type="button" className={buttonClass} onClick={() => copy("slug", output)} disabled={!output}>
            Copy slug
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function TextLineCounterTool() {
  const [text, setText] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const metrics = useMemo(() => {
    const lines = text ? text.split("\n") : [];
    return {
      totalLines: lines.length,
      nonEmptyLines: lines.filter((line) => line.trim() !== "").length,
      emptyLines: lines.filter((line) => line.trim() === "").length,
    };
  }, [text]);
  const output = useMemo(
    () =>
      `Total lines: ${metrics.totalLines}\nNon-empty lines: ${metrics.nonEmptyLines}\nEmpty lines: ${metrics.emptyLines}`,
    [metrics],
  );

  return (
    <ToolShell title="Text Line Counter" description="Count total, non-empty, and empty lines in a text block.">
      <Field label="Text input">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder={"First line\nSecond line\n\nFourth line"} />
      </Field>
      {!text ? (
        <EmptyState title="Paste or type text to count lines" description="The tool shows total lines as well as empty and non-empty line counts." />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(metrics).map(([key, value]) => (
              <OutputBlock key={key} title={key} value={String(value)} multiline={false} />
            ))}
          </div>
          <button type="button" className={buttonClass} onClick={() => copy("line counts", output)}>
            Copy counts
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function RandomSentenceGeneratorTool() {
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function handleGenerate() {
    if (!Number.isFinite(count) || count < 1 || count > 10) {
      setError("Choose a sentence count between 1 and 10.");
      setOutput("");
      return;
    }
    const total = Math.max(1, Math.min(10, count));
    const sentences = Array.from({ length: total }, () => sentenceBank[getRandomInt(sentenceBank.length)]);
    setOutput(sentences.join(" "));
    setError("");
  }

  return (
    <ToolShell title="Random Sentence Generator" description="Generate sample sentences from a bundled local sentence set.">
      <Field label="Number of sentences">
        <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="1" max="10" value={count} onChange={(event) => setCount(Number(event.target.value))} />
      </Field>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate sentences
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output ? (
        <EmptyState title="No sentences generated yet" description="Choose how many sentences you want, then generate a local sample text block." />
      ) : (
        <>
          <OutputBlock title="Generated sentences" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("sentences", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function LoremIpsumGeneratorTool() {
  const [mode, setMode] = useState<"paragraphs" | "sentences">("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function makeSentence(wordCount: number) {
    const words = Array.from({ length: wordCount }, (_, index) => loremWords[index % loremWords.length]);
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  }

  function handleGenerate() {
    const total = Math.max(1, Math.min(10, count));
    if (mode === "sentences") {
      setOutput(Array.from({ length: total }, () => makeSentence(12)).join(" "));
      return;
    }
    setOutput(
      Array.from({ length: total }, () =>
        [makeSentence(12), makeSentence(10), makeSentence(14)].join(" "),
      ).join("\n\n"),
    );
  }

  return (
    <ToolShell title="Lorem Ipsum Generator" description="Generate lorem ipsum placeholder text locally in the browser.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Mode">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={mode} onChange={(event) => setMode(event.target.value as "paragraphs" | "sentences")}>
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
          </select>
        </Field>
        <Field label={`Number of ${mode}`}>
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" min="1" max="10" value={count} onChange={(event) => setCount(Number(event.target.value))} />
        </Field>
      </div>
      <button type="button" className={buttonClass} onClick={handleGenerate}>
        Generate lorem ipsum
      </button>
      {!output ? (
        <EmptyState title="No placeholder text generated yet" description="Choose paragraphs or sentences, then generate local lorem ipsum content." />
      ) : (
        <>
          <OutputBlock title="Generated placeholder text" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("lorem ipsum", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function TextReplaceTool() {
  const [text, setText] = useState("");
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function handleReplace() {
    if (!text) {
      setError("Add text before running replace.");
      setOutput("");
      return;
    }
    if (!findValue) {
      setError("Enter the text you want to find.");
      setOutput("");
      return;
    }
    const regex = new RegExp(escapeRegex(findValue), caseSensitive ? "g" : "gi");
    setOutput(text.replace(regex, replaceValue));
    setError("");
  }

  return (
    <ToolShell title="Text Replace Tool" description="Find and replace text locally with clear validation and copy-ready output.">
      <Field label="Source text">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste the source text here." />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Find">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={findValue} onChange={(event) => setFindValue(event.target.value)} placeholder="word to replace" />
        </Field>
        <Field label="Replace with">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={replaceValue} onChange={(event) => setReplaceValue(event.target.value)} placeholder="new value" />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-[color:var(--foreground)]">
        <input type="checkbox" checked={caseSensitive} onChange={(event) => setCaseSensitive(event.target.checked)} />
        Match case
      </label>
      <button type="button" className={buttonClass} onClick={handleReplace}>
        Replace text
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!output && !error ? (
        <EmptyState title="Run a replacement" description="Add source text plus the find and replace values to generate updated output." />
      ) : null}
      {output ? (
        <>
          <OutputBlock title="Updated output" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("replaced text", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function TextDuplicateRemoverTool() {
  const [text, setText] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(true);
  const { copied, copy } = useCopyToClipboard();

  const output = useMemo(() => {
    const seen = new Set<string>();
    return text
      .split("\n")
      .filter((line) => {
        const key = ignoreCase ? line.trim().toLowerCase() : line.trim();
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join("\n");
  }, [ignoreCase, text]);

  return (
    <ToolShell title="Text Duplicate Remover" description="Remove repeated text entries from a line-based list with optional case-insensitive matching.">
      <Field label="Line-based text">
        <textarea className={textareaClass} value={text} onChange={(event) => setText(event.target.value)} placeholder={"Apple\napple\nOrange\nOrange"} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-[color:var(--foreground)]">
        <input type="checkbox" checked={ignoreCase} onChange={(event) => setIgnoreCase(event.target.checked)} />
        Ignore case while removing duplicates
      </label>
      {!text ? (
        <EmptyState title="Paste line-based text to remove duplicates" description="Each non-empty line is compared and only the first unique entry is kept." />
      ) : (
        <>
          <OutputBlock title="Deduplicated output" value={output} />
          <button type="button" className={buttonClass} onClick={() => copy("deduplicated text", output)} disabled={!output}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}
