"use client";

import { buildLazyTool } from "@/components/tools/lazy-tool";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

const AgeCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.AgeCalculatorTool));
const AgeDifferenceCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.AgeDifferenceCalculatorTool));
const BmiCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.BmiCalculatorTool));
const BusinessDaysCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.BusinessDaysCalculatorTool));
const LoanCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.LoanCalculatorTool));
const MeetingTimeFinderTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.MeetingTimeFinderTool));
const PercentageCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.PercentageCalculatorTool));
const DateDifferenceCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.DateDifferenceCalculatorTool));
const DiscountCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.DiscountCalculatorTool));
const TipCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.TipCalculatorTool));
const ProfitMarginCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.ProfitMarginCalculatorTool));
const VatCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.VatCalculatorTool));
const SalesTaxCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.SalesTaxCalculatorTool));
const SimpleInterestCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.SimpleInterestCalculatorTool));
const CompoundInterestCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.CompoundInterestCalculatorTool));
const UnitPriceCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.UnitPriceCalculatorTool));
const WorkHoursCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.WorkHoursCalculatorTool));
const TimeDurationCalculatorTool = buildLazyTool(() => import("@/components/tools/calculator-tools").then((module) => module.TimeDurationCalculatorTool));

export function CalculatorToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "age-calculator": return <AgeCalculatorTool />;
    case "age-difference-calculator": return <AgeDifferenceCalculatorTool />;
    case "bmi-calculator": return <BmiCalculatorTool />;
    case "business-days-calculator": return <BusinessDaysCalculatorTool />;
    case "loan-calculator": return <LoanCalculatorTool />;
    case "meeting-time-finder": return <MeetingTimeFinderTool />;
    case "percentage-calculator": return <PercentageCalculatorTool />;
    case "date-difference-calculator": return <DateDifferenceCalculatorTool />;
    case "discount-calculator": return <DiscountCalculatorTool />;
    case "tip-calculator": return <TipCalculatorTool />;
    case "profit-margin-calculator": return <ProfitMarginCalculatorTool />;
    case "vat-calculator": return <VatCalculatorTool />;
    case "sales-tax-calculator": return <SalesTaxCalculatorTool />;
    case "simple-interest-calculator": return <SimpleInterestCalculatorTool />;
    case "compound-interest-calculator": return <CompoundInterestCalculatorTool />;
    case "unit-price-calculator": return <UnitPriceCalculatorTool />;
    case "work-hours-calculator": return <WorkHoursCalculatorTool />;
    case "time-duration-calculator": return <TimeDurationCalculatorTool />;
    default: return <ToolPlaceholder tool={tool} />;
  }
}
