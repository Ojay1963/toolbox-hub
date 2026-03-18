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
