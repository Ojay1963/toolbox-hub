"use client";

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

const lengthUnits = {
  meter: 1,
  kilometer: 1000,
  centimeter: 0.01,
  millimeter: 0.001,
  inch: 0.0254,
  foot: 0.3048,
  yard: 0.9144,
  mile: 1609.344,
};

const weightUnits = {
  kilogram: 1,
  gram: 0.001,
  pound: 0.45359237,
  ounce: 0.028349523125,
  tonne: 1000,
};

const timeUnits = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
};

const currencyRatesDate = "2026-03-18";
const currencyBase = "USD";
const currencyRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  NGN: 1585,
  CAD: 1.36,
  AUD: 1.52,
  INR: 83.1,
  JPY: 149.6,
};

function normalizeHexColor(value: string) {
  const trimmed = value.trim().replace(/^#/, "");

  if (!/^[\da-fA-F]{3}([\da-fA-F]{3})?$/.test(trimmed)) {
    throw new Error("Enter a valid 3-digit or 6-digit HEX color value.");
  }

  if (trimmed.length === 3) {
    return trimmed
      .split("")
      .map((character) => character + character)
      .join("")
      .toUpperCase();
  }

  return trimmed.toUpperCase();
}

function parseRgbChannel(value: string, label: string) {
  if (value.trim() === "") {
    throw new Error(`Enter a value for ${label}.`);
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 255) {
    throw new Error(`${label} must be an integer between 0 and 255.`);
  }

  return parsed;
}

function BaseConverterShell({
  title,
  description,
  label,
  value,
  onChange,
  placeholder,
  outputLabel,
  output,
  error,
  copyLabel,
}: {
  title: string;
  description: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  outputLabel: string;
  output: string;
  error: string;
  copyLabel: string;
}) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <ToolShell title={title} description={description}>
      <Field label={label}>
        <input
          className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </Field>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!value.trim() ? (
        <EmptyState title="Enter a value to convert" description="The output updates in real time as you type." />
      ) : output ? (
        <>
          <OutputBlock title={outputLabel} value={output} multiline={false} />
          <button type="button" className={buttonClass} onClick={() => copy(copyLabel, output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

function unitLabel(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function UnitConverter({
  title,
  description,
  units,
}: {
  title: string;
  description: string;
  units: Record<string, number>;
}) {
  const unitNames = Object.keys(units);
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState(unitNames[0]);
  const [to, setTo] = useState(unitNames[1] ?? unitNames[0]);

  const output = useMemo(() => {
    if (Number.isNaN(amount)) return "";
    const base = amount * units[from];
    return (base / units[to]).toString();
  }, [amount, from, to, units]);

  return (
    <ToolShell title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Value">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        </Field>
        <Field label="From">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={from} onChange={(event) => setFrom(event.target.value)}>
            {unitNames.map((unit) => <option key={unit} value={unit}>{unitLabel(unit)}</option>)}
          </select>
        </Field>
        <Field label="To">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={to} onChange={(event) => setTo(event.target.value)}>
            {unitNames.map((unit) => <option key={unit} value={unit}>{unitLabel(unit)}</option>)}
          </select>
        </Field>
      </div>
      {output ? <OutputBlock title="Converted value" value={output} multiline={false} /> : <EmptyState title="Enter a value to convert" description="Choose the original and target units to see the converted result." />}
    </ToolShell>
  );
}

export function LengthConverterTool() {
  return <UnitConverter title="Length Converter" description="Convert between common metric and imperial length units locally in the browser." units={lengthUnits} />;
}

export function WeightConverterTool() {
  return <UnitConverter title="Weight Converter" description="Convert between common weight and mass units using local calculation logic." units={weightUnits} />;
}

export function TemperatureConverterTool() {
  const [amount, setAmount] = useState(0);
  const [from, setFrom] = useState("celsius");
  const [to, setTo] = useState("fahrenheit");

  const output = useMemo(() => {
    let celsius = amount;
    if (from === "fahrenheit") celsius = (amount - 32) * (5 / 9);
    if (from === "kelvin") celsius = amount - 273.15;
    if (to === "fahrenheit") return ((celsius * 9) / 5 + 32).toString();
    if (to === "kelvin") return (celsius + 273.15).toString();
    return celsius.toString();
  }, [amount, from, to]);

  return (
    <ToolShell title="Temperature Converter" description="Convert temperatures between Celsius, Fahrenheit, and Kelvin with local formulas.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Value">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        </Field>
        <Field label="From">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={from} onChange={(event) => setFrom(event.target.value)}>
            <option value="celsius">Celsius</option>
            <option value="fahrenheit">Fahrenheit</option>
            <option value="kelvin">Kelvin</option>
          </select>
        </Field>
        <Field label="To">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={to} onChange={(event) => setTo(event.target.value)}>
            <option value="celsius">Celsius</option>
            <option value="fahrenheit">Fahrenheit</option>
            <option value="kelvin">Kelvin</option>
          </select>
        </Field>
      </div>
      <OutputBlock title="Converted temperature" value={output} multiline={false} />
    </ToolShell>
  );
}

export function TimeConverterTool() {
  return <UnitConverter title="Time Converter" description="Convert time units such as seconds, minutes, hours, days, and weeks." units={timeUnits} />;
}

export function CurrencyConverterTool() {
  const currencyCodes = Object.keys(currencyRates);
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const { copied, copy } = useCopyToClipboard();

  const result = useMemo(() => {
    if (!Number.isFinite(amount)) {
      return "";
    }

    const inBaseCurrency = amount / currencyRates[from];
    const convertedAmount = inBaseCurrency * currencyRates[to];
    return convertedAmount.toFixed(4).replace(/\.?0+$/, "");
  }, [amount, from, to]);

  const rateLabel = useMemo(() => {
    const rate = currencyRates[to] / currencyRates[from];
    return `1 ${from} = ${rate.toFixed(4).replace(/\.?0+$/, "")} ${to}`;
  }, [from, to]);

  return (
    <ToolShell
      title="Currency Converter"
      description="Convert currencies using manually defined reference rates bundled with the site. These rates are static, clearly labeled, and not live market data."
    >
      <Notice>
        Static reference rates only. Base currency: {currencyBase}. Rate set date:{" "}
        {currencyRatesDate}.
      </Notice>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Amount">
          <input
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            type="number"
            value={Number.isNaN(amount) ? "" : amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </Field>
        <Field label="From currency">
          <select
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          >
            {currencyCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="To currency">
          <select
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          >
            {currencyCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {!result ? (
        <EmptyState
          title="Enter an amount to convert"
          description="This tool uses bundled static rates for rough estimation only."
        />
      ) : (
        <>
          <OutputBlock title="Converted amount" value={`${result} ${to}`} multiline={false} />
          <OutputBlock title="Reference rate" value={rateLabel} multiline={false} />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={buttonClass}
              onClick={() => copy("converted amount", `${result} ${to}`)}
            >
              Copy result
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
            >
              Swap currencies
            </button>
          </div>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
    </ToolShell>
  );
}

export function BinaryToDecimalConverterTool() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    const value = input.trim();
    if (!value) {
      return { output: "", error: "" };
    }
    if (!/^[01]+$/.test(value)) {
      return { output: "", error: "Binary input can contain only 0 and 1." };
    }
    return { output: parseInt(value, 2).toString(10), error: "" };
  }, [input]);

  return (
    <BaseConverterShell
      title="Binary to Decimal Converter"
      description="Convert binary numbers into decimal values instantly in the browser."
      label="Binary input"
      value={input}
      onChange={setInput}
      placeholder="101010"
      outputLabel="Decimal output"
      output={output}
      error={error}
      copyLabel="decimal output"
    />
  );
}

export function DecimalToBinaryConverterTool() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    const value = input.trim();
    if (!value) {
      return { output: "", error: "" };
    }
    if (!/^-?\d+$/.test(value)) {
      return { output: "", error: "Enter a whole decimal number." };
    }

    const decimal = Number(value);
    if (!Number.isSafeInteger(decimal)) {
      return { output: "", error: "Enter a safe whole number for accurate conversion." };
    }

    return { output: decimal.toString(2), error: "" };
  }, [input]);

  return (
    <BaseConverterShell
      title="Decimal to Binary Converter"
      description="Convert whole decimal numbers into binary output with real-time validation."
      label="Decimal input"
      value={input}
      onChange={setInput}
      placeholder="42"
      outputLabel="Binary output"
      output={output}
      error={error}
      copyLabel="binary output"
    />
  );
}

export function HexToRgbConverterTool() {
  const [input, setInput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const { output, error, preview } = useMemo(() => {
    const value = input.trim();
    if (!value) {
      return { output: "", error: "", preview: "" };
    }

    try {
      const normalized = normalizeHexColor(value);
      const red = parseInt(normalized.slice(0, 2), 16);
      const green = parseInt(normalized.slice(2, 4), 16);
      const blue = parseInt(normalized.slice(4, 6), 16);

      return {
        output: `rgb(${red}, ${green}, ${blue})`,
        error: "",
        preview: `#${normalized}`,
      };
    } catch (conversionError) {
      return {
        output: "",
        error: conversionError instanceof Error ? conversionError.message : "Invalid HEX color.",
        preview: "",
      };
    }
  }, [input]);

  return (
    <ToolShell title="Hex to RGB Converter" description="Convert HEX color values into RGB output instantly in the browser.">
      <Field label="HEX input">
        <input
          className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="#2A7FFF"
        />
      </Field>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!input.trim() ? (
        <EmptyState title="Enter a HEX color to convert" description="The result updates as you type and supports both short and full HEX values." />
      ) : output ? (
        <>
          <div className="rounded-2xl border border-[color:var(--border)] bg-stone-50 p-4">
            <div className="h-16 rounded-xl border border-[color:var(--border)]" style={{ backgroundColor: preview }} aria-hidden="true" />
          </div>
          <OutputBlock title="RGB output" value={output} multiline={false} />
          <button type="button" className={buttonClass} onClick={() => copy("RGB output", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function RgbToHexConverterTool() {
  const [redInput, setRedInput] = useState("");
  const [greenInput, setGreenInput] = useState("");
  const [blueInput, setBlueInput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const { output, error } = useMemo(() => {
    if (!redInput.trim() && !greenInput.trim() && !blueInput.trim()) {
      return { output: "", error: "" };
    }

    try {
      const red = parseRgbChannel(redInput, "Red");
      const green = parseRgbChannel(greenInput, "Green");
      const blue = parseRgbChannel(blueInput, "Blue");

      return {
        output: `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0").toUpperCase()).join("")}`,
        error: "",
      };
    } catch (conversionError) {
      return {
        output: "",
        error: conversionError instanceof Error ? conversionError.message : "Invalid RGB input.",
      };
    }
  }, [blueInput, greenInput, redInput]);

  return (
    <ToolShell title="RGB to Hex Converter" description="Convert RGB channel values into a HEX color in real time.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Red (0-255)">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" inputMode="numeric" value={redInput} onChange={(event) => setRedInput(event.target.value)} placeholder="42" />
        </Field>
        <Field label="Green (0-255)">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" inputMode="numeric" value={greenInput} onChange={(event) => setGreenInput(event.target.value)} placeholder="127" />
        </Field>
        <Field label="Blue (0-255)">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" inputMode="numeric" value={blueInput} onChange={(event) => setBlueInput(event.target.value)} placeholder="255" />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!redInput.trim() && !greenInput.trim() && !blueInput.trim() ? (
        <EmptyState title="Enter RGB values to convert" description="Provide red, green, and blue values between 0 and 255." />
      ) : output ? (
        <>
          <div className="rounded-2xl border border-[color:var(--border)] bg-stone-50 p-4">
            <div className="h-16 rounded-xl border border-[color:var(--border)]" style={{ backgroundColor: output }} aria-hidden="true" />
          </div>
          <OutputBlock title="HEX output" value={output} multiline={false} />
          <button type="button" className={buttonClass} onClick={() => copy("HEX output", output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function TextToBinaryConverterTool() {
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input) {
      return "";
    }

    return Array.from(new TextEncoder().encode(input), (byte) => byte.toString(2).padStart(8, "0")).join(" ");
  }, [input]);

  return (
    <BaseConverterShell
      title="Text to Binary Converter"
      description="Convert plain text into UTF-8 binary bytes in real time."
      label="Text input"
      value={input}
      onChange={setInput}
      placeholder="Toolbox Hub"
      outputLabel="Binary output"
      output={output}
      error=""
      copyLabel="binary output"
    />
  );
}

export function BinaryToTextConverterTool() {
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    const value = input.trim();
    if (!value) {
      return { output: "", error: "" };
    }

    const groups = value.split(/\s+/);
    if (!groups.every((group) => /^[01]{8}$/.test(group))) {
      return { output: "", error: "Enter binary as 8-bit groups separated by spaces." };
    }

    try {
      const bytes = Uint8Array.from(groups.map((group) => parseInt(group, 2)));
      return {
        output: new TextDecoder().decode(bytes),
        error: "",
      };
    } catch {
      return { output: "", error: "Unable to decode that binary input into text." };
    }
  }, [input]);

  return (
    <BaseConverterShell
      title="Binary to Text Converter"
      description="Convert 8-bit binary groups back into readable UTF-8 text."
      label="Binary input"
      value={input}
      onChange={setInput}
      placeholder="01010100 01101111 01101111 01101100"
      outputLabel="Text output"
      output={output}
      error={error}
      copyLabel="text output"
    />
  );
}
