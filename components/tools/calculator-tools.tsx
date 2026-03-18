"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EmptyState,
  Field,
  formatNumber,
  Notice,
  OutputBlock,
  ToolShell,
} from "@/components/tools/common";

export function AgeCalculatorTool() {
  const [birthDate, setBirthDate] = useState("");
  const [compareDate, setCompareDate] = useState("");

  useEffect(() => {
    setCompareDate(new Date().toISOString().slice(0, 10));
  }, []);

  const result = useMemo(() => {
    if (!birthDate || !compareDate) return "";
    const birth = new Date(birthDate);
    const compare = new Date(compareDate);
    if (birth > compare) return "Birth date must be earlier than or equal to the compare date.";

    let years = compare.getFullYear() - birth.getFullYear();
    let months = compare.getMonth() - birth.getMonth();
    let days = compare.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(compare.getFullYear(), compare.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years} years, ${months} months, ${days} days`;
  }, [birthDate, compareDate]);

  return (
    <ToolShell title="Age Calculator" description="Calculate age in years, months, and days using browser-side date math.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Birth date"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} /></Field>
        <Field label="Compare with"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="date" value={compareDate} onChange={(event) => setCompareDate(event.target.value)} /></Field>
      </div>
      {!birthDate ? (
        <EmptyState title="Choose a birth date to begin" description="The tool will calculate the exact age difference against the selected compare date." />
      ) : (
        <OutputBlock title="Age result" value={result} multiline={false} />
      )}
    </ToolShell>
  );
}

export function BmiCalculatorTool() {
  const [metric, setMetric] = useState(true);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);

  const result = useMemo(() => {
    if (height <= 0 || weight <= 0) return "";
    const bmi = metric ? weight / ((height / 100) ** 2) : (703 * weight) / height ** 2;
    let category: string;
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obesity";
    return `${formatNumber(bmi)} (${category})`;
  }, [height, metric, weight]);

  return (
    <ToolShell title="BMI Calculator" description="Calculate body mass index from height and weight with metric or imperial units.">
      <label className="flex items-center gap-2 text-sm text-[color:var(--foreground)]">
        <input type="checkbox" checked={metric} onChange={(event) => setMetric(event.target.checked)} />
        Use metric units
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={metric ? "Height (cm)" : "Height (in)"}><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={height} onChange={(event) => setHeight(Number(event.target.value))} /></Field>
        <Field label={metric ? "Weight (kg)" : "Weight (lb)"}><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={weight} onChange={(event) => setWeight(Number(event.target.value))} /></Field>
      </div>
      {result ? <OutputBlock title="BMI result" value={result} multiline={false} /> : <EmptyState title="Enter valid height and weight" description="Both values must be greater than zero to calculate BMI." />}
      <Notice>BMI is a screening metric only and not medical advice.</Notice>
    </ToolShell>
  );
}

export function LoanCalculatorTool() {
  const [principal, setPrincipal] = useState(25000);
  const [annualRate, setAnnualRate] = useState(7.5);
  const [years, setYears] = useState(5);

  const summary = useMemo(() => {
    if (principal <= 0 || years <= 0) return "";
    const months = years * 12;
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - principal;
    return `Monthly payment: ${formatNumber(monthlyPayment)}\nTotal repayment: ${formatNumber(totalPaid)}\nTotal interest: ${formatNumber(totalInterest)}`;
  }, [annualRate, principal, years]);

  return (
    <ToolShell title="Loan Calculator" description="Estimate monthly repayment, total paid, and total interest using standard amortization math.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Loan amount"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={principal} onChange={(event) => setPrincipal(Number(event.target.value))} /></Field>
        <Field label="Annual rate (%)"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={annualRate} onChange={(event) => setAnnualRate(Number(event.target.value))} /></Field>
        <Field label="Term (years)"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={years} onChange={(event) => setYears(Number(event.target.value))} /></Field>
      </div>
      {summary ? <OutputBlock title="Loan summary" value={summary} /> : <EmptyState title="Enter valid loan inputs" description="Loan amount and term must be greater than zero." />}
    </ToolShell>
  );
}

export function PercentageCalculatorTool() {
  const [percent, setPercent] = useState(15);
  const [baseValue, setBaseValue] = useState(200);
  const [oldValue, setOldValue] = useState(120);
  const [newValue, setNewValue] = useState(150);

  const result = useMemo(() => {
    const percentOf = (percent / 100) * baseValue;
    const percentageChange = oldValue === 0 ? 0 : ((newValue - oldValue) / oldValue) * 100;
    const whatPercent = baseValue === 0 ? 0 : (percent / baseValue) * 100;
    return `Percent of value: ${percent}% of ${baseValue} = ${formatNumber(percentOf)}\nWhat percent: ${percent} is ${formatNumber(whatPercent)}% of ${baseValue}\nPercentage change: ${formatNumber(percentageChange)}%`;
  }, [baseValue, newValue, oldValue, percent]);

  return (
    <ToolShell title="Percentage Calculator" description="Handle common percentage formulas like percent of a value, percentage share, and percentage change.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Percent / first value"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={percent} onChange={(event) => setPercent(Number(event.target.value))} /></Field>
        <Field label="Base / second value"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={baseValue} onChange={(event) => setBaseValue(Number(event.target.value))} /></Field>
        <Field label="Old value"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={oldValue} onChange={(event) => setOldValue(Number(event.target.value))} /></Field>
        <Field label="New value"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={newValue} onChange={(event) => setNewValue(Number(event.target.value))} /></Field>
      </div>
      <OutputBlock title="Percentage results" value={result} />
    </ToolShell>
  );
}

export function DateDifferenceCalculatorTool() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const result = useMemo(() => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const absDays = Math.abs(Math.round(diffMs / (1000 * 60 * 60 * 24)));
    return `${absDays} day(s)\n${formatNumber(absDays / 7, 2)} week(s)`;
  }, [endDate, startDate]);

  return (
    <ToolShell title="Date Difference Calculator" description="Find the difference between two calendar dates using local browser-side date math.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start date"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></Field>
        <Field label="End date"><input className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></Field>
      </div>
      {result ? <OutputBlock title="Date difference" value={result} /> : <EmptyState title="Select two dates" description="Choose a start and end date to calculate the total difference." />}
    </ToolShell>
  );
}
