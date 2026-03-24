"use client";

import { useMemo, useState } from "react";
import {
  buttonClass,
  EmptyState,
  Field,
  NumberInput,
  parseNumberInput,
  Notice,
  OutputBlock,
  secondaryButtonClass,
  ToolShell,
  useCopyToClipboard,
} from "@/components/tools/common";

async function getApiError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || "This service is temporarily unavailable. Please try again in a moment.";
  } catch {
    return "This service is temporarily unavailable. Please try again in a moment.";
  }
}

const timezoneOptions = [
  "UTC",
  "Africa/Lagos",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

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

const fileSizeSystems = {
  decimal: {
    base: 1000,
    labels: ["Bytes", "KB", "MB", "GB", "TB"],
  },
  binary: {
    base: 1024,
    labels: ["Bytes", "KiB", "MiB", "GiB", "TiB"],
  },
} as const;

const supportedCurrencyCodes = [
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "EUR",
  "GBP",
  "GHS",
  "HKD",
  "INR",
  "JPY",
  "KES",
  "MXN",
  "NGN",
  "NOK",
  "NZD",
  "SEK",
  "SGD",
  "USD",
  "XAF",
  "XOF",
  "ZAR",
];

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

function formatDatePartsForTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
}

function getTimezoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = formatDatePartsForTimeZone(date, timeZone);
  const utcTimestamp = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return (utcTimestamp - date.getTime()) / 60000;
}

function zonedDateTimeToUtc(dateTime: string, timeZone: string) {
  const match = dateTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error("Enter a valid date and time.");
  }

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offsetMinutes = getTimezoneOffsetMinutes(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMinutes * 60000);
}

function formatDateTimeForZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
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
          <NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={amount} onChange={(event) => setAmount(parseNumberInput(event.target.value))} />
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
          <NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={amount} onChange={(event) => setAmount(parseNumberInput(event.target.value))} />
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

export function FileSizeConverterTool() {
  const [value, setValue] = useState("1024");
  const [unitIndex, setUnitIndex] = useState(1);
  const [system, setSystem] = useState<keyof typeof fileSizeSystems>("decimal");
  const { copied, copy } = useCopyToClipboard();

  const conversion = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      return { error: "", output: "" };
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return {
        error: "Enter a valid non-negative file size value.",
        output: "",
      };
    }

    const activeSystem = fileSizeSystems[system];
    const normalizedIndex = Math.max(0, Math.min(unitIndex, activeSystem.labels.length - 1));
    const bytes = parsed * activeSystem.base ** normalizedIndex;
    const rows = activeSystem.labels.map((label, index) => {
      const converted = bytes / activeSystem.base ** index;
      const safeValue = converted >= 100 ? converted.toFixed(2) : converted.toFixed(4);
      return `${label}: ${safeValue.replace(/\.?0+$/, "")}`;
    });

    return {
      error: "",
      output: rows.join("\n"),
    };
  }, [system, unitIndex, value]);

  return (
    <ToolShell title="File Size Converter" description="Convert between bytes, KB, MB, GB, and TB instantly with support for decimal and binary file-size units.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Value">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} placeholder="1024" />
        </Field>
        <Field label="Input unit">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={String(unitIndex)} onChange={(event) => setUnitIndex(parseNumberInput(event.target.value))}>
            {fileSizeSystems[system].labels.map((label, index) => (
              <option key={label} value={index}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Unit system">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={system} onChange={(event) => setSystem(event.target.value as keyof typeof fileSizeSystems)}>
            <option value="decimal">Decimal (KB = 1000 bytes)</option>
            <option value="binary">Binary (KiB = 1024 bytes)</option>
          </select>
        </Field>
      </div>
      <Notice>Storage vendors often use decimal units, while many operating systems display binary units such as KiB and MiB.</Notice>
      {conversion.error ? <Notice tone="error">{conversion.error}</Notice> : null}
      {!value.trim() ? (
        <EmptyState title="Enter a file size to convert it" description="The converter updates instantly and shows all related units in the selected measurement system." />
      ) : conversion.output ? (
        <>
          <OutputBlock title="Converted values" value={conversion.output} />
          <button type="button" className={buttonClass} onClick={() => copy("file size conversions", conversion.output)}>
            Copy output
          </button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      ) : null}
    </ToolShell>
  );
}

export function TimezoneConverterTool() {
  const [dateTime, setDateTime] = useState("");
  const [fromZone, setFromZone] = useState("UTC");
  const [toZone, setToZone] = useState("Africa/Lagos");

  const { output, error } = useMemo(() => {
    if (!dateTime) {
      return { output: "", error: "" };
    }

    try {
      const utcDate = zonedDateTimeToUtc(dateTime, fromZone);
      return {
        output: `Source time: ${formatDateTimeForZone(utcDate, fromZone)}\nConverted time: ${formatDateTimeForZone(utcDate, toZone)}`,
        error: "",
      };
    } catch (conversionError) {
      return {
        output: "",
        error: conversionError instanceof Error ? conversionError.message : "Unable to convert that time.",
      };
    }
  }, [dateTime, fromZone, toZone]);

  return (
    <ToolShell title="Timezone Converter" description="Convert a date and time from one timezone into another using browser-supported timezone data.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Date and time">
          <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} />
        </Field>
        <Field label="From timezone">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={fromZone} onChange={(event) => setFromZone(event.target.value)}>
            {timezoneOptions.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </Field>
        <Field label="To timezone">
          <select className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" value={toZone} onChange={(event) => setToZone(event.target.value)}>
            {timezoneOptions.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : output ? <OutputBlock title="Converted time" value={output} /> : <EmptyState title="Pick a date, time, and two timezones" description="The converter uses built-in browser timezone data and updates when all inputs are present." />}
    </ToolShell>
  );
}

export function UnixTimestampConverterTool() {
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const timestampResult = useMemo(() => {
    const value = timestampInput.trim();
    if (!value) {
      return { output: "", error: "" };
    }
    if (!/^-?\d+$/.test(value)) {
      return { output: "", error: "Enter a whole Unix timestamp in seconds or milliseconds." };
    }

    const numericValue = Number(value);
    const milliseconds = value.length > 10 ? numericValue : numericValue * 1000;
    const date = new Date(milliseconds);
    if (Number.isNaN(date.getTime())) {
      return { output: "", error: "That timestamp could not be converted into a valid date." };
    }

    return {
      output: `${date.toUTCString()}\nLocal time: ${date.toLocaleString()}`,
      error: "",
    };
  }, [timestampInput]);

  const dateResult = useMemo(() => {
    if (!dateInput) {
      return { output: "", error: "" };
    }

    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      return { output: "", error: "Enter a valid date and time to convert." };
    }

    return {
      output: `Unix seconds: ${Math.floor(date.getTime() / 1000)}\nUnix milliseconds: ${date.getTime()}`,
      error: "",
    };
  }, [dateInput]);

  return (
    <ToolShell title="Unix Timestamp Converter" description="Convert Unix timestamps into readable dates and convert date/time values back into Unix time.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Field label="Unix timestamp" hint="10 digits are treated as seconds. Longer values are treated as milliseconds.">
            <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" inputMode="numeric" value={timestampInput} onChange={(event) => setTimestampInput(event.target.value)} placeholder="1710758400" />
          </Field>
          {timestampResult.error ? <Notice tone="error">{timestampResult.error}</Notice> : timestampResult.output ? <OutputBlock title="Readable date output" value={timestampResult.output} /> : <EmptyState title="Enter a timestamp to decode it" description="Paste a Unix timestamp in seconds or milliseconds to see both UTC and local time." />}
        </div>
        <div className="space-y-4">
          <Field label="Date and time">
            <input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="datetime-local" value={dateInput} onChange={(event) => setDateInput(event.target.value)} />
          </Field>
          {dateResult.error ? <Notice tone="error">{dateResult.error}</Notice> : dateResult.output ? <OutputBlock title="Unix timestamp output" value={dateResult.output} /> : <EmptyState title="Choose a date and time to encode it" description="Select a local date/time to get Unix seconds and Unix milliseconds." />}
        </div>
      </div>
    </ToolShell>
  );
}

export function CurrencyConverterTool() {
  const [quote, setQuote] = useState<{
    provider: string;
    base: string;
    target: string;
    amount: number;
    convertedAmount: number;
    rate: number;
    effectiveDate: string;
    isLive: boolean;
    sourceNote: string;
    requestedDate?: string;
    rateStatus: "live" | "daily-updated" | "historical";
  } | null>(null);
  const [amountInput, setAmountInput] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("NGN");
  const [historicalDate, setHistoricalDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const amount = useMemo(() => Number(amountInput), [amountInput]);
  const hasAmountInput = amountInput.trim().length > 0;
  const hasInvalidAmount = hasAmountInput && (!Number.isFinite(amount) || amount < 0);
  const canSubmit = !loading && !hasInvalidAmount && Boolean(from) && Boolean(to);
  const conciseProviderNote = useMemo(() => {
    if (!quote) {
      return "";
    }

    if (quote.rateStatus === "historical" && quote.requestedDate) {
      return `Historical provider rate for ${quote.requestedDate}.`;
    }

    if (quote.provider === "Frankfurter") {
      return "Daily-updated reference rate from the latest working day.";
    }

    return quote.isLive ? "Latest provider rate from the backend provider." : "Latest provider-supported reference rate.";
  }, [quote]);
  const dateLabel = useMemo(() => {
    if (!quote) return "";
    if (quote.rateStatus === "historical" && quote.requestedDate) {
      return `Historical rate for ${quote.requestedDate}`;
    }
    return `Rate as of ${quote.effectiveDate}`;
  }, [quote]);

  async function handleConvert() {
    if (!Number.isFinite(amount) || amount < 0) {
      setQuote(null);
      setError("Enter an amount greater than or equal to 0.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setQuote(null);
      const searchParams = new URLSearchParams({
        base: from,
        target: to,
        amount: String(amount),
      });
      if (historicalDate) {
        searchParams.set("date", historicalDate);
      }

      const response = await fetch(`/api/tools/currency-converter?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const payload = (await response.json()) as {
        ok: true;
        data: {
          provider: string;
          base: string;
          target: string;
          amount: number;
          convertedAmount: number;
          rate: number;
          effectiveDate: string;
          isLive: boolean;
          sourceNote: string;
          requestedDate?: string;
          rateStatus: "live" | "daily-updated" | "historical";
        };
      };

      setQuote(payload.data);
    } catch (loadError) {
      setQuote(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Currency conversion is temporarily unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }

  const resultSummary = quote
    ? [
        `Provider: ${quote.provider}`,
        `${dateLabel}`,
        `1 ${quote.base} = ${quote.rate} ${quote.target}`,
        `${quote.amount} ${quote.base} = ${quote.convertedAmount} ${quote.target}`,
      ].join("\n")
    : "";

  return (
    <ToolShell
      title="Currency Converter"
      description="Convert currencies through a backend provider, optionally look up a historical date, and review the exact provider date or timestamp returned for the rate."
    >
      <Notice>
        The converter prefers configured live-rate providers first and falls back to Frankfurter when needed.
        Frankfurter rates are daily-updated reference rates, not real-time market quotes.
      </Notice>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Amount">
          <NumberInput
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            placeholder="100"
            disabled={loading}
          />
        </Field>
        <Field label="Base currency">
          <select
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            value={from}
            onChange={(event) => {
              const next = event.target.value;
              setFrom(next);
              if (next === to) {
                const fallback = supportedCurrencyCodes.find((code) => code !== next) ?? next;
                setTo(fallback);
              }
              setQuote(null);
              setError("");
            }}
            disabled={loading}
          >
            {supportedCurrencyCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Target currency">
          <select
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            value={to}
            onChange={(event) => {
              const next = event.target.value;
              setTo(next);
              if (next === from) {
                const fallback = supportedCurrencyCodes.find((code) => code !== next) ?? next;
                setFrom(fallback);
              }
              setQuote(null);
              setError("");
            }}
            disabled={loading}
          >
            {supportedCurrencyCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Historical date" hint="Optional. Leave empty for the latest provider-supported rate.">
          <input
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={historicalDate}
            onChange={(event) => {
              setHistoricalDate(event.target.value);
              setQuote(null);
              setError("");
            }}
            disabled={loading}
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={handleConvert} disabled={!canSubmit}>
          {loading ? "Fetching rate..." : historicalDate ? "Convert with historical rate" : "Convert with latest rate"}
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={loading}
          onClick={() => {
            setFrom(to);
            setTo(from);
            setQuote(null);
            setError("");
          }}
        >
          Swap currencies
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={loading || !historicalDate}
          onClick={() => {
            setHistoricalDate("");
            setQuote(null);
            setError("");
          }}
        >
          Reset to latest
        </button>
      </div>
      {hasInvalidAmount ? <Notice tone="error">Enter an amount greater than or equal to 0.</Notice> : null}
      {loading ? <Notice>Fetching exchange-rate data for {from} to {to}. This can take a moment if the provider is slow.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!quote ? (
          <EmptyState
            title={
              loading
                ? "Getting the latest available rate"
                : error
                  ? "Unable to load a conversion right now"
                  : "Enter an amount and choose your currencies"
            }
            description={
              loading
                ? "The converter is requesting the rate, provider, and effective date from the backend."
                : error
                  ? "Check the amount, currencies, or date and try again. If the provider is unavailable, the tool will recover when the service is back."
                  : "Run a conversion to see the provider, rate, converted amount, and the effective date or timestamp used for the quote."
            }
          />
        ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <OutputBlock title="Converted amount" value={`${quote.convertedAmount} ${quote.target}`} multiline={false} />
            <OutputBlock title="Reference rate" value={`1 ${quote.base} = ${quote.rate} ${quote.target}`} multiline={false} />
            <OutputBlock title="Provider" value={quote.provider} multiline={false} />
            <OutputBlock
              title="Rate status"
              value={
                quote.rateStatus === "historical"
                  ? "Historical"
                  : quote.rateStatus === "daily-updated"
                    ? "Daily-updated"
                    : "Latest provider rate"
              }
              multiline={false}
            />
          </div>
          <OutputBlock title="Effective rate date" value={dateLabel} multiline={false} />
          <OutputBlock title="Provider note" value={conciseProviderNote} />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={buttonClass}
              onClick={() => copy("currency conversion", resultSummary)}
              disabled={loading}
            >
              Copy result
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



