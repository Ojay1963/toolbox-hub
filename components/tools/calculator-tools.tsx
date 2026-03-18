"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  EmptyState,
  Field,
  formatNumber,
  Notice,
  OutputBlock,
  ToolShell,
} from "@/components/tools/common";

function numberInputClass() {
  return "w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]";
}

function CalculatorExplanation({ children }: { children: ReactNode }) {
  return <Notice>{children}</Notice>;
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
          <input className={numberInputClass()} type="number" inputMode="decimal" value={originalPrice} onChange={(event) => setOriginalPrice(Number(event.target.value))} />
        </Field>
        <Field label="Discount (%)">
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" max="100" value={discountRate} onChange={(event) => setDiscountRate(Number(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Discount result" value={summary} />}
      <CalculatorExplanation>The calculator uses: savings = original price × discount rate, then final price = original price − savings.</CalculatorExplanation>
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
          <input className={numberInputClass()} type="number" inputMode="decimal" value={billAmount} onChange={(event) => setBillAmount(Number(event.target.value))} />
        </Field>
        <Field label="Tip (%)">
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" value={tipRate} onChange={(event) => setTipRate(Number(event.target.value))} />
        </Field>
        <Field label="People">
          <input className={numberInputClass()} type="number" inputMode="numeric" min="1" value={peopleCount} onChange={(event) => setPeopleCount(Number(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Tip result" value={summary} />}
      <CalculatorExplanation>Tip amount = bill × tip rate. Total bill = bill + tip. Split per person = total bill ÷ number of people.</CalculatorExplanation>
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
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" value={cost} onChange={(event) => setCost(Number(event.target.value))} />
        </Field>
        <Field label="Selling price">
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" value={sellingPrice} onChange={(event) => setSellingPrice(Number(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Profit result" value={summary} />}
      <CalculatorExplanation>Profit = selling price − cost. Margin uses selling price as the base, while markup uses cost as the base.</CalculatorExplanation>
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
          <input className={numberInputClass()} type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        </Field>
        <Field label="VAT rate (%)">
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" value={vatRate} onChange={(event) => setVatRate(Number(event.target.value))} />
        </Field>
        <Field label="Mode">
          <select className={numberInputClass()} value={mode} onChange={(event) => setMode(event.target.value as "add" | "remove")}>
            <option value="add">Add VAT</option>
            <option value="remove">Remove VAT</option>
          </select>
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="VAT result" value={summary} />}
      <CalculatorExplanation>Adding VAT uses amount × rate. Removing VAT works backwards from a tax-inclusive total to find the net amount and VAT portion.</CalculatorExplanation>
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
          <input className={numberInputClass()} type="number" inputMode="decimal" value={priceBeforeTax} onChange={(event) => setPriceBeforeTax(Number(event.target.value))} />
        </Field>
        <Field label="Sales tax (%)">
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" value={taxRate} onChange={(event) => setTaxRate(Number(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Sales tax result" value={summary} />}
      <CalculatorExplanation>Sales tax amount = price before tax × tax rate. Final total = price before tax + sales tax.</CalculatorExplanation>
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
          <input className={numberInputClass()} type="number" inputMode="decimal" value={principal} onChange={(event) => setPrincipal(Number(event.target.value))} />
        </Field>
        <Field label="Annual rate (%)">
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" value={annualRate} onChange={(event) => setAnnualRate(Number(event.target.value))} />
        </Field>
        <Field label="Time (years)">
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" value={years} onChange={(event) => setYears(Number(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Simple interest result" value={summary} />}
      <CalculatorExplanation>Simple interest uses I = P × R × T, where P is principal, R is annual rate, and T is time in years.</CalculatorExplanation>
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
          <input className={numberInputClass()} type="number" inputMode="decimal" value={principal} onChange={(event) => setPrincipal(Number(event.target.value))} />
        </Field>
        <Field label="Annual rate (%)">
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" value={annualRate} onChange={(event) => setAnnualRate(Number(event.target.value))} />
        </Field>
        <Field label="Time (years)">
          <input className={numberInputClass()} type="number" inputMode="decimal" min="0" value={years} onChange={(event) => setYears(Number(event.target.value))} />
        </Field>
        <Field label="Compounds per year">
          <input className={numberInputClass()} type="number" inputMode="numeric" min="1" value={compoundingsPerYear} onChange={(event) => setCompoundingsPerYear(Number(event.target.value))} />
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : <OutputBlock title="Compound interest result" value={summary} />}
      <CalculatorExplanation>Compound growth uses A = P(1 + r/n)^(nt), where n is the number of compounding periods each year.</CalculatorExplanation>
    </ToolShell>
  );
}
