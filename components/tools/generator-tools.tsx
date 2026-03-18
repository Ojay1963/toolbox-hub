"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
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

const givenNames = ["Alex", "Jordan", "Taylor", "Morgan", "Avery", "Riley", "Cameron", "Jamie", "Logan", "Casey"];
const familyNames = ["Parker", "Johnson", "Reed", "Mitchell", "Bennett", "Hayes", "Coleman", "Murphy", "Bailey", "Foster"];
const usernameWords = ["pixel", "swift", "luna", "forge", "delta", "echo", "mint", "nova", "orbit", "atlas"];
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

function buildDownloadLink(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

function getRandomInt(max: number) {
  return crypto.getRandomValues(new Uint32Array(1))[0] % max;
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
