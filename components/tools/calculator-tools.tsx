"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  buttonClass,
  EmptyState,
  Field,
  formatNumber,
  NumberInput,
  parseNumberInput,
  Notice,
  OutputBlock,
  ToolShell,
  useCopyToClipboard,
} from "@/components/tools/common";

function numberInputClass() {
  return "w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]";
}

function CalculatorExplanation({ children }: { children: ReactNode }) {
  return <Notice>{children}</Notice>;
}

const meetingTimeZones = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Lagos",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

type MeetingParticipant = {
  label: string;
  timeZone: string;
  startHour: number;
  endHour: number;
  enabled: boolean;
};

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const mapped = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  const year = Number(mapped.year);
  const month = Number(mapped.month);
  const day = Number(mapped.day);
  const hour = Number(mapped.hour);
  const minute = Number(mapped.minute);

  return {
    year,
    month,
    day,
    hour,
    minute,
    weekday: mapped.weekday,
    dateKey: `${mapped.year}-${mapped.month}-${mapped.day}`,
    dateLabel: `${mapped.year}-${mapped.month}-${mapped.day}`,
  };
}

function formatHourMinute(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function parseDateInput(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function differenceInCalendarDays(start: Date, end: Date) {
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);
  return Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
}

function differenceInYearsMonthsDays(start: Date, end: Date) {
  let earlier = start;
  let later = end;
  let reversed = false;
  if (start.getTime() > end.getTime()) {
    earlier = end;
    later = start;
    reversed = true;
  }

  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(later.getFullYear(), later.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days, reversed };
}

function formatHoursAndMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hour(s), ${minutes} minute(s)`;
}

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
        <Field label={metric ? "Height (cm)" : "Height (in)"}><NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={height} onChange={(event) => setHeight(parseNumberInput(event.target.value))} /></Field>
        <Field label={metric ? "Weight (kg)" : "Weight (lb)"}><NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={weight} onChange={(event) => setWeight(parseNumberInput(event.target.value))} /></Field>
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
        <Field label="Loan amount"><NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={principal} onChange={(event) => setPrincipal(parseNumberInput(event.target.value))} /></Field>
        <Field label="Annual rate (%)"><NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={annualRate} onChange={(event) => setAnnualRate(parseNumberInput(event.target.value))} /></Field>
        <Field label="Term (years)"><NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={years} onChange={(event) => setYears(parseNumberInput(event.target.value))} /></Field>
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
        <Field label="Percent / first value"><NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={percent} onChange={(event) => setPercent(parseNumberInput(event.target.value))} /></Field>
        <Field label="Base / second value"><NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={baseValue} onChange={(event) => setBaseValue(parseNumberInput(event.target.value))} /></Field>
        <Field label="Old value"><NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={oldValue} onChange={(event) => setOldValue(parseNumberInput(event.target.value))} /></Field>
        <Field label="New value"><NumberInput className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]" type="number" value={newValue} onChange={(event) => setNewValue(parseNumberInput(event.target.value))} /></Field>
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

export function DiscountCalculatorTool() {
  const [originalPrice, setOriginalPrice] = useState(100);
  const [discountRate, setDiscountRate] = useState(20);

  const { error, summary } = useMemo(() => {
    if (originalPrice <= 0) {
      return { error: "Original price must be greater than zero.", summary: "" };
    }
    if (discountRate < 0 || discountRate > 100) {
      return { error: "Discount rate must be between 0 and 100.", summary: "" };
    }

    const savings = originalPrice * (discountRate / 100);
    const finalPrice = originalPrice - savings;
    return {
      error: "",
      summary: `Savings: ${formatNumber(savings)}\nFinal price: ${formatNumber(finalPrice)}\nYou pay ${formatNumber(100 - discountRate)}% of the original price.`,
    };
  }, [discountRate, originalPrice]);

  return (
    <ToolShell title="Discount Calculator" description="Calculate savings and final price instantly from an original amount and discount percentage.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Original price">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" value={originalPrice} onChange={(event) => setOriginalPrice(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Discount (%)">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" max="100" value={discountRate} onChange={(event) => setDiscountRate(parseNumberInput(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Discount result" value={summary} />}
      <CalculatorExplanation>The calculator uses: savings = original price Ã— discount rate, then final price = original price âˆ’ savings.</CalculatorExplanation>
    </ToolShell>
  );
}

export function TipCalculatorTool() {
  const [billAmount, setBillAmount] = useState(80);
  const [tipRate, setTipRate] = useState(15);
  const [peopleCount, setPeopleCount] = useState(1);

  const { error, summary } = useMemo(() => {
    if (billAmount <= 0) {
      return { error: "Bill amount must be greater than zero.", summary: "" };
    }
    if (tipRate < 0) {
      return { error: "Tip percentage cannot be negative.", summary: "" };
    }
    if (!Number.isInteger(peopleCount) || peopleCount <= 0) {
      return { error: "Number of people must be a whole number greater than zero.", summary: "" };
    }

    const tipAmount = billAmount * (tipRate / 100);
    const totalAmount = billAmount + tipAmount;
    const perPerson = totalAmount / peopleCount;

    return {
      error: "",
      summary: `Tip amount: ${formatNumber(tipAmount)}\nTotal bill: ${formatNumber(totalAmount)}\nPer person (${peopleCount}): ${formatNumber(perPerson)}`,
    };
  }, [billAmount, peopleCount, tipRate]);

  return (
    <ToolShell title="Tip Calculator" description="Calculate tip amount, total bill, and optional split per person in real time.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Bill amount">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" value={billAmount} onChange={(event) => setBillAmount(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Tip (%)">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={tipRate} onChange={(event) => setTipRate(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="People">
          <NumberInput className={numberInputClass()} type="number" inputMode="numeric" min="1" value={peopleCount} onChange={(event) => setPeopleCount(parseNumberInput(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Tip result" value={summary} />}
      <CalculatorExplanation>Tip amount = bill Ã— tip rate. Total bill = bill + tip. Split per person = total bill Ã· number of people.</CalculatorExplanation>
    </ToolShell>
  );
}

export function ProfitMarginCalculatorTool() {
  const [cost, setCost] = useState(50);
  const [sellingPrice, setSellingPrice] = useState(80);

  const { error, summary } = useMemo(() => {
    if (cost < 0) {
      return { error: "Cost cannot be negative.", summary: "" };
    }
    if (sellingPrice <= 0) {
      return { error: "Selling price must be greater than zero.", summary: "" };
    }
    if (sellingPrice < cost) {
      return { error: "Selling price should be greater than or equal to cost for a positive margin.", summary: "" };
    }

    const profit = sellingPrice - cost;
    const margin = (profit / sellingPrice) * 100;
    const markup = cost === 0 ? 0 : (profit / cost) * 100;

    return {
      error: "",
      summary: `Profit: ${formatNumber(profit)}\nProfit margin: ${formatNumber(margin)}%\nMarkup: ${formatNumber(markup)}%`,
    };
  }, [cost, sellingPrice]);

  return (
    <ToolShell title="Profit Margin Calculator" description="Calculate profit, margin, and markup from cost and selling price with instant results.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Cost">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={cost} onChange={(event) => setCost(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Selling price">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={sellingPrice} onChange={(event) => setSellingPrice(parseNumberInput(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Profit result" value={summary} />}
      <CalculatorExplanation>Profit = selling price âˆ’ cost. Margin uses selling price as the base, while markup uses cost as the base.</CalculatorExplanation>
    </ToolShell>
  );
}

export function VatCalculatorTool() {
  const [amount, setAmount] = useState(100);
  const [vatRate, setVatRate] = useState(7.5);
  const [mode, setMode] = useState<"add" | "remove">("add");

  const { error, summary } = useMemo(() => {
    if (amount <= 0) {
      return { error: "Amount must be greater than zero.", summary: "" };
    }
    if (vatRate < 0) {
      return { error: "VAT rate cannot be negative.", summary: "" };
    }

    if (mode === "add") {
      const vatAmount = amount * (vatRate / 100);
      const total = amount + vatAmount;
      return {
        error: "",
        summary: `VAT amount: ${formatNumber(vatAmount)}\nAmount before VAT: ${formatNumber(amount)}\nAmount including VAT: ${formatNumber(total)}`,
      };
    }

    const netAmount = amount / (1 + vatRate / 100);
    const vatAmount = amount - netAmount;
    return {
      error: "",
      summary: `VAT amount: ${formatNumber(vatAmount)}\nNet amount before VAT: ${formatNumber(netAmount)}\nAmount including VAT: ${formatNumber(amount)}`,
    };
  }, [amount, mode, vatRate]);

  return (
    <ToolShell title="VAT Calculator" description="Add VAT to a base amount or remove VAT from a tax-inclusive total instantly.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Amount">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="VAT rate (%)">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={vatRate} onChange={(event) => setVatRate(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Mode">
          <select className={numberInputClass()} value={mode} onChange={(event) => setMode(event.target.value as "add" | "remove")}>
            <option value="add">Add VAT</option>
            <option value="remove">Remove VAT</option>
          </select>
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="VAT result" value={summary} />}
      <CalculatorExplanation>Adding VAT uses amount Ã— rate. Removing VAT works backwards from a tax-inclusive total to find the net amount and VAT portion.</CalculatorExplanation>
    </ToolShell>
  );
}

export function SalesTaxCalculatorTool() {
  const [priceBeforeTax, setPriceBeforeTax] = useState(100);
  const [taxRate, setTaxRate] = useState(8.5);

  const { error, summary } = useMemo(() => {
    if (priceBeforeTax <= 0) {
      return { error: "Price before tax must be greater than zero.", summary: "" };
    }
    if (taxRate < 0) {
      return { error: "Sales tax rate cannot be negative.", summary: "" };
    }

    const taxAmount = priceBeforeTax * (taxRate / 100);
    const total = priceBeforeTax + taxAmount;

    return {
      error: "",
      summary: `Sales tax: ${formatNumber(taxAmount)}\nPrice before tax: ${formatNumber(priceBeforeTax)}\nFinal total: ${formatNumber(total)}`,
    };
  }, [priceBeforeTax, taxRate]);

  return (
    <ToolShell title="Sales Tax Calculator" description="Calculate sales tax and final total from a base amount and tax rate in real time.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Price before tax">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" value={priceBeforeTax} onChange={(event) => setPriceBeforeTax(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Sales tax (%)">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={taxRate} onChange={(event) => setTaxRate(parseNumberInput(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Sales tax result" value={summary} />}
      <CalculatorExplanation>Sales tax amount = price before tax Ã— tax rate. Final total = price before tax + sales tax.</CalculatorExplanation>
    </ToolShell>
  );
}

export function SimpleInterestCalculatorTool() {
  const [principal, setPrincipal] = useState(1000);
  const [annualRate, setAnnualRate] = useState(5);
  const [years, setYears] = useState(3);

  const { error, summary } = useMemo(() => {
    if (principal <= 0) {
      return { error: "Principal must be greater than zero.", summary: "" };
    }
    if (annualRate < 0) {
      return { error: "Interest rate cannot be negative.", summary: "" };
    }
    if (years <= 0) {
      return { error: "Time must be greater than zero.", summary: "" };
    }

    const interest = principal * (annualRate / 100) * years;
    const totalAmount = principal + interest;

    return {
      error: "",
      summary: `Interest earned: ${formatNumber(interest)}\nTotal amount: ${formatNumber(totalAmount)}\nTime period: ${formatNumber(years)} year(s)`,
    };
  }, [annualRate, principal, years]);

  return (
    <ToolShell title="Simple Interest Calculator" description="Calculate interest and final amount using the standard simple interest formula.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Principal">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" value={principal} onChange={(event) => setPrincipal(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Annual rate (%)">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={annualRate} onChange={(event) => setAnnualRate(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Time (years)">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={years} onChange={(event) => setYears(parseNumberInput(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Simple interest result" value={summary} />}
      <CalculatorExplanation>Simple interest uses I = P Ã— R Ã— T, where P is principal, R is annual rate, and T is time in years.</CalculatorExplanation>
    </ToolShell>
  );
}

export function CompoundInterestCalculatorTool() {
  const [principal, setPrincipal] = useState(1000);
  const [annualRate, setAnnualRate] = useState(5);
  const [years, setYears] = useState(5);
  const [compoundingsPerYear, setCompoundingsPerYear] = useState(12);

  const { error, summary } = useMemo(() => {
    if (principal <= 0) {
      return { error: "Principal must be greater than zero.", summary: "" };
    }
    if (annualRate < 0) {
      return { error: "Interest rate cannot be negative.", summary: "" };
    }
    if (years <= 0) {
      return { error: "Time must be greater than zero.", summary: "" };
    }
    if (!Number.isInteger(compoundingsPerYear) || compoundingsPerYear <= 0) {
      return { error: "Compounding frequency must be a whole number greater than zero.", summary: "" };
    }

    const ratePerPeriod = annualRate / 100 / compoundingsPerYear;
    const totalPeriods = compoundingsPerYear * years;
    const totalAmount = principal * (1 + ratePerPeriod) ** totalPeriods;
    const interestEarned = totalAmount - principal;

    return {
      error: "",
      summary: `Interest earned: ${formatNumber(interestEarned)}\nTotal amount: ${formatNumber(totalAmount)}\nCompounded ${compoundingsPerYear} time(s) per year`,
    };
  }, [annualRate, compoundingsPerYear, principal, years]);

  return (
    <ToolShell title="Compound Interest Calculator" description="Estimate growth with compound interest using principal, rate, time, and compounding frequency.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Principal">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" value={principal} onChange={(event) => setPrincipal(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Annual rate (%)">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={annualRate} onChange={(event) => setAnnualRate(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Time (years)">
          <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={years} onChange={(event) => setYears(parseNumberInput(event.target.value))} />
        </Field>
        <Field label="Compounds per year">
          <NumberInput className={numberInputClass()} type="number" inputMode="numeric" min="1" value={compoundingsPerYear} onChange={(event) => setCompoundingsPerYear(parseNumberInput(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Compound interest result" value={summary} />}
      <CalculatorExplanation>Compound growth uses A = P(1 + r/n)^(nt), where n is the number of compounding periods each year.</CalculatorExplanation>
    </ToolShell>
  );
}

export function UnitPriceCalculatorTool() {
  const [price, setPrice] = useState(12.99);
  const [quantity, setQuantity] = useState(750);
  const [unitLabel, setUnitLabel] = useState("ml");
  const [comparisonPrice, setComparisonPrice] = useState(8.49);
  const [comparisonQuantity, setComparisonQuantity] = useState(500);

  const { error, summary } = useMemo(() => {
    if (price <= 0 || comparisonPrice <= 0) {
      return { error: "Both prices must be greater than zero.", summary: "" };
    }
    if (quantity <= 0 || comparisonQuantity <= 0) {
      return { error: "Both quantities must be greater than zero.", summary: "" };
    }

    const primaryUnitPrice = price / quantity;
    const comparisonUnitPrice = comparisonPrice / comparisonQuantity;
    const cheaperLabel =
      primaryUnitPrice < comparisonUnitPrice
        ? "First item has the lower unit price."
        : primaryUnitPrice > comparisonUnitPrice
          ? "Second item has the lower unit price."
          : "Both items have the same unit price.";

    return {
      error: "",
      summary: `First item: ${formatNumber(primaryUnitPrice, 4)} per ${unitLabel}\nSecond item: ${formatNumber(comparisonUnitPrice, 4)} per ${unitLabel}\n${cheaperLabel}`,
    };
  }, [comparisonPrice, comparisonQuantity, price, quantity, unitLabel]);

  return (
    <ToolShell title="Unit Price Calculator" description="Compare price per unit for two items and see which one offers better value.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Field label="First item price">
            <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={price} onChange={(event) => setPrice(parseNumberInput(event.target.value))} />
          </Field>
          <Field label="First item quantity">
            <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={quantity} onChange={(event) => setQuantity(parseNumberInput(event.target.value))} />
          </Field>
        </div>
        <div className="space-y-4">
          <Field label="Second item price">
            <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={comparisonPrice} onChange={(event) => setComparisonPrice(parseNumberInput(event.target.value))} />
          </Field>
          <Field label="Second item quantity">
            <NumberInput className={numberInputClass()} type="number" inputMode="decimal" min="0" value={comparisonQuantity} onChange={(event) => setComparisonQuantity(parseNumberInput(event.target.value))} />
          </Field>
        </div>
      </div>
      <Field label="Quantity unit" hint="Use a short unit like g, kg, ml, L, or pcs.">
        <input className={numberInputClass()} value={unitLabel} onChange={(event) => setUnitLabel(event.target.value || "unit")} />
      </Field>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Unit price result" value={summary} />}
      <CalculatorExplanation>Unit price = total price divided by quantity. Comparing both values helps show which item offers better value per unit.</CalculatorExplanation>
    </ToolShell>
  );
}

export function TimeDurationCalculatorTool() {
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  const { error, summary } = useMemo(() => {
    if (!startDateTime || !endDateTime) {
      return { error: "", summary: "" };
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { error: "Enter valid start and end date/time values.", summary: "" };
    }

    const differenceMs = end.getTime() - start.getTime();
    if (differenceMs < 0) {
      return { error: "End date/time must be later than the start date/time.", summary: "" };
    }

    const totalMinutes = Math.floor(differenceMs / (1000 * 60));
    const totalHours = differenceMs / (1000 * 60 * 60);
    const totalDays = differenceMs / (1000 * 60 * 60 * 24);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    return {
      error: "",
      summary: `Duration: ${days} day(s), ${hours} hour(s), ${minutes} minute(s)\nTotal hours: ${formatNumber(totalHours, 2)}\nTotal days: ${formatNumber(totalDays, 2)}`,
    };
  }, [endDateTime, startDateTime]);

  return (
    <ToolShell title="Time Duration Calculator" description="Calculate the duration between two date/time values with clear totals in days and hours.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start date and time">
          <input className={numberInputClass()} type="datetime-local" value={startDateTime} onChange={(event) => setStartDateTime(event.target.value)} />
        </Field>
        <Field label="End date and time">
          <input className={numberInputClass()} type="datetime-local" value={endDateTime} onChange={(event) => setEndDateTime(event.target.value)} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : summary ? <OutputBlock title="Duration result" value={summary} /> : <EmptyState title="Choose a start and end time" description="Enter both date/time values to calculate the duration between them." />}
      <CalculatorExplanation>The duration is based on the exact millisecond difference between the selected start and end values in your local timezone.</CalculatorExplanation>
    </ToolShell>
  );
}

export function WorkHoursCalculatorTool() {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:30");
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [crossesMidnight, setCrossesMidnight] = useState(false);

  const { error, summary } = useMemo(() => {
    if (!startTime || !endTime) {
      return { error: "", summary: "" };
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    if ([startHour, startMinute, endHour, endMinute].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid start and end times.", summary: "" };
    }
    if (breakMinutes < 0) {
      return { error: "Break minutes cannot be negative.", summary: "" };
    }

    const startTotal = startHour * 60 + startMinute;
    let endTotal = endHour * 60 + endMinute;
    if (crossesMidnight || endTotal < startTotal) {
      endTotal += 24 * 60;
    }

    const shiftMinutes = endTotal - startTotal;
    if (shiftMinutes <= 0) {
      return { error: "End time must be later than start time unless the shift crosses midnight.", summary: "" };
    }
    if (breakMinutes >= shiftMinutes) {
      return { error: "Break time must be shorter than the full shift length.", summary: "" };
    }

    const workedMinutes = shiftMinutes - breakMinutes;
    const decimalHours = workedMinutes / 60;
    return {
      error: "",
      summary: `Shift length: ${formatHoursAndMinutes(shiftMinutes)}\nBreak time: ${formatHoursAndMinutes(breakMinutes)}\nWorked time: ${formatHoursAndMinutes(workedMinutes)}\nDecimal hours: ${formatNumber(decimalHours, 2)}`,
    };
  }, [breakMinutes, crossesMidnight, endTime, startTime]);

  return (
    <ToolShell title="Work Hours Calculator" description="Calculate total worked time from a shift start, end, and unpaid break with clear browser-side time math.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Start time">
          <input className={numberInputClass()} type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
        </Field>
        <Field label="End time">
          <input className={numberInputClass()} type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
        </Field>
        <Field label="Break (minutes)">
          <NumberInput className={numberInputClass()} type="number" min="0" value={breakMinutes} onChange={(event) => setBreakMinutes(parseNumberInput(event.target.value))} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-[color:var(--foreground)]">
        <input type="checkbox" checked={crossesMidnight} onChange={(event) => setCrossesMidnight(event.target.checked)} />
        Shift ends the next day
      </label>
      {error ? <Notice tone="error">{error}</Notice> : summary ? <OutputBlock title="Work hours result" value={summary} /> : <EmptyState title="Enter shift times to calculate work hours" description="Choose a start time, end time, and optional break to calculate total worked time." />}
      <CalculatorExplanation>This calculator subtracts the break from the full shift and supports overnight shifts when you enable the next-day option.</CalculatorExplanation>
    </ToolShell>
  );
}

export function BusinessDaysCalculatorTool() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeEndDate, setIncludeEndDate] = useState(true);

  const { error, summary } = useMemo(() => {
    if (!startDate || !endDate) {
      return { error: "", summary: "" };
    }

    const start = parseDateInput(startDate);
    const end = parseDateInput(endDate);
    if (!start || !end) {
      return { error: "Enter valid start and end dates.", summary: "" };
    }
    if (end.getTime() < start.getTime()) {
      return { error: "End date must be the same as or later than the start date.", summary: "" };
    }

    let businessDays = 0;
    let weekendDays = 0;
    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
      const dayOfWeek = cursor.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays += 1;
      } else {
        businessDays += 1;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (!includeEndDate) {
      const endDayOfWeek = end.getDay();
      if (endDayOfWeek === 0 || endDayOfWeek === 6) {
        weekendDays = Math.max(0, weekendDays - 1);
      } else {
        businessDays = Math.max(0, businessDays - 1);
      }
    }

    const totalDays = differenceInCalendarDays(start, end) + (includeEndDate ? 1 : 0);
    const fullWeeks = Math.floor(totalDays / 7);

    return {
      error: "",
      summary: `Business days: ${businessDays}\nWeekend days: ${weekendDays}\nTotal calendar days counted: ${totalDays}\nEquivalent full weeks: ${formatNumber(fullWeeks, 0)}`,
    };
  }, [endDate, includeEndDate, startDate]);

  return (
    <ToolShell title="Business Days Calculator" description="Count business days between two dates locally, with a clear weekday-only calculation that excludes weekends.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start date">
          <input className={numberInputClass()} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </Field>
        <Field label="End date">
          <input className={numberInputClass()} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-[color:var(--foreground)]">
        <input type="checkbox" checked={includeEndDate} onChange={(event) => setIncludeEndDate(event.target.checked)} />
        Include the end date in the count
      </label>
      {error ? <Notice tone="error">{error}</Notice> : summary ? <OutputBlock title="Business days result" value={summary} /> : <EmptyState title="Choose a date range to count business days" description="Select a start and end date to count weekdays and compare them with total calendar days." />}
      <CalculatorExplanation>This version counts Monday through Friday as business days and does not subtract public holidays unless you add that logic later.</CalculatorExplanation>
    </ToolShell>
  );
}

export function AgeDifferenceCalculatorTool() {
  const [firstBirthDate, setFirstBirthDate] = useState("");
  const [secondBirthDate, setSecondBirthDate] = useState("");

  const { error, summary } = useMemo(() => {
    if (!firstBirthDate || !secondBirthDate) {
      return { error: "", summary: "" };
    }

    const first = parseDateInput(firstBirthDate);
    const second = parseDateInput(secondBirthDate);
    if (!first || !second) {
      return { error: "Enter two valid birth dates.", summary: "" };
    }

    const { years, months, days, reversed } = differenceInYearsMonthsDays(first, second);
    const totalDays = Math.abs(differenceInCalendarDays(first, second));

    return {
      error: "",
      summary: `${reversed ? "Person 2" : "Person 1"} is older by ${years} year(s), ${months} month(s), ${days} day(s)\nTotal difference in days: ${totalDays}\nApproximate weeks: ${formatNumber(totalDays / 7, 2)}`,
    };
  }, [firstBirthDate, secondBirthDate]);

  return (
    <ToolShell title="Age Difference Calculator" description="Compare two birth dates and calculate the age gap in years, months, days, and total calendar days locally in the browser.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First birth date">
          <input className={numberInputClass()} type="date" value={firstBirthDate} onChange={(event) => setFirstBirthDate(event.target.value)} />
        </Field>
        <Field label="Second birth date">
          <input className={numberInputClass()} type="date" value={secondBirthDate} onChange={(event) => setSecondBirthDate(event.target.value)} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : summary ? <OutputBlock title="Age difference result" value={summary} /> : <EmptyState title="Select two birth dates to compare ages" description="Choose both dates to see the exact age gap in multiple readable formats." />}
      <CalculatorExplanation>The age gap is calculated with calendar-aware year, month, and day differences rather than a simple day-count estimate alone.</CalculatorExplanation>
    </ToolShell>
  );
}

export function MeetingTimeFinderTool() {
  const [searchDate, setSearchDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([
    { label: "Team member 1", timeZone: "America/New_York", startHour: 9, endHour: 17, enabled: true },
    { label: "Team member 2", timeZone: "Europe/London", startHour: 9, endHour: 17, enabled: true },
    { label: "Team member 3", timeZone: "Asia/Tokyo", startHour: 10, endHour: 18, enabled: false },
  ]);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    setSearchDate(new Date().toISOString().slice(0, 10));
  }, []);

  function updateParticipant(index: number, next: Partial<MeetingParticipant>) {
    setParticipants((current) => current.map((participant, participantIndex) => (
      participantIndex === index ? { ...participant, ...next } : participant
    )));
  }

  const result = useMemo(() => {
    const activeParticipants = participants.filter((participant) => participant.enabled);
    if (!searchDate) {
      return { error: "", output: "" };
    }
    if (activeParticipants.length < 2) {
      return { error: "Enable at least two participants to compare time zones.", output: "" };
    }
    if (durationMinutes <= 0 || durationMinutes > 480) {
      return { error: "Meeting duration must be between 1 and 480 minutes.", output: "" };
    }
    if (activeParticipants.some((participant) => participant.startHour >= participant.endHour)) {
      return { error: "Each enabled participant must have an end hour later than the start hour.", output: "" };
    }

    const baseUtc = Date.parse(`${searchDate}T00:00:00Z`);
    const startUtc = baseUtc - 18 * 60 * 60 * 1000;
    const endUtc = baseUtc + 42 * 60 * 60 * 1000;
    const organizerZone = activeParticipants[0].timeZone;
    const options: string[] = [];

    for (let currentUtc = startUtc; currentUtc <= endUtc; currentUtc += 30 * 60 * 1000) {
      const startDate = new Date(currentUtc);
      const endDate = new Date(currentUtc + durationMinutes * 60 * 1000);
      const organizerStart = getZonedParts(startDate, organizerZone);
      if (organizerStart.dateKey !== searchDate) {
        continue;
      }

      const lines = activeParticipants.map((participant) => {
        const localStart = getZonedParts(startDate, participant.timeZone);
        const localEnd = getZonedParts(endDate, participant.timeZone);
        const startMinutes = localStart.hour * 60 + localStart.minute;
        const endMinutes = localEnd.hour * 60 + localEnd.minute;
        const fitsWorkingHours =
          localStart.dateKey === localEnd.dateKey &&
          startMinutes >= participant.startHour * 60 &&
          endMinutes <= participant.endHour * 60;

        return {
          fitsWorkingHours,
          line: `${participant.label} (${participant.timeZone}): ${localStart.weekday} ${localStart.dateLabel}, ${formatHourMinute(startMinutes)}-${formatHourMinute(endMinutes)}`,
        };
      });

      if (lines.every((item) => item.fitsWorkingHours)) {
        options.push(`Option ${options.length + 1}\n${lines.map((item) => item.line).join("\n")}`);
      }

      if (options.length >= 8) {
        break;
      }
    }

    if (!options.length) {
      return {
        error: "",
        output: "No overlapping slots found for the selected date, duration, and working-hour windows. Try widening the working hours or enabling fewer regions.",
      };
    }

    return { error: "", output: options.join("\n\n") };
  }, [durationMinutes, participants, searchDate]);

  return (
    <ToolShell title="Meeting Time Finder" description="Find overlapping meeting windows across two or three time zones locally in the browser using built-in timezone rules.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Search date" hint="The search anchors to this date in participant 1's timezone.">
          <input className={numberInputClass()} type="date" value={searchDate} onChange={(event) => setSearchDate(event.target.value)} />
        </Field>
        <Field label="Meeting duration (minutes)" hint="Example: 30, 45, or 60 minutes.">
          <NumberInput className={numberInputClass()} type="number" min="1" max="480" value={durationMinutes} onChange={(event) => setDurationMinutes(parseNumberInput(event.target.value))} />
        </Field>
      </div>
      <div className="space-y-4">
        {participants.map((participant, index) => (
          <div key={`${participant.label}-${index}`} className="rounded-2xl border border-[color:var(--border)] p-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <Field label={`Participant ${index + 1} label`}>
                <input className={numberInputClass()} value={participant.label} onChange={(event) => updateParticipant(index, { label: event.target.value })} />
              </Field>
              <Field label="Time zone">
                <select className={numberInputClass()} value={participant.timeZone} onChange={(event) => updateParticipant(index, { timeZone: event.target.value })}>
                  {meetingTimeZones.map((timeZone) => (
                    <option key={timeZone} value={timeZone}>{timeZone}</option>
                  ))}
                </select>
              </Field>
              <Field label="Workday starts">
                <NumberInput className={numberInputClass()} type="number" min="0" max="23" value={participant.startHour} onChange={(event) => updateParticipant(index, { startHour: parseNumberInput(event.target.value) })} />
              </Field>
              <Field label="Workday ends">
                <NumberInput className={numberInputClass()} type="number" min="1" max="24" value={participant.endHour} onChange={(event) => updateParticipant(index, { endHour: parseNumberInput(event.target.value) })} />
              </Field>
            </div>
            {index === 2 ? (
              <label className="mt-4 flex items-center gap-2 text-sm text-[color:var(--foreground)]">
                <input type="checkbox" checked={participant.enabled} onChange={(event) => updateParticipant(index, { enabled: event.target.checked })} />
                Include this third participant
              </label>
            ) : null}
          </div>
        ))}
      </div>
      <Notice>Helpful example: try New York 9-17, London 9-17, and Tokyo 10-18 with a 45-minute meeting to see how quickly overlap narrows.</Notice>
      {result.error ? <Notice tone="error">{result.error}</Notice> : null}
      {!searchDate ? (
        <EmptyState title="Choose a date to search for overlap" description="Set a date, duration, and participant time zones to generate local meeting options." />
      ) : (
        <>
          <OutputBlock title="Meeting options" value={result.output} />
          <button type="button" className={buttonClass} onClick={() => void copy("meeting options", result.output)} disabled={!result.output}>Copy options</button>
          {copied ? <Notice tone="success">Copied {copied} to your clipboard.</Notice> : null}
        </>
      )}
      <CalculatorExplanation>The overlap search checks 30-minute increments and uses the browser's built-in timezone data, including daylight-saving adjustments where supported.</CalculatorExplanation>
    </ToolShell>
  );
}



