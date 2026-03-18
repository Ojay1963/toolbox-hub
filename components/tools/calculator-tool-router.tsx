"use client";

import {
  AgeCalculatorTool,
  AgeDifferenceCalculatorTool,
  BmiCalculatorTool,
  BusinessDaysCalculatorTool,
  CompoundInterestCalculatorTool,
  DateDifferenceCalculatorTool,
  DiscountCalculatorTool,
  LoanCalculatorTool,
  MeetingTimeFinderTool,
  PercentageCalculatorTool,
  ProfitMarginCalculatorTool,
  SalesTaxCalculatorTool,
  SimpleInterestCalculatorTool,
  TimeDurationCalculatorTool,
  TipCalculatorTool,
  UnitPriceCalculatorTool,
  VatCalculatorTool,
  WorkHoursCalculatorTool,
} from "@/components/tools/calculator-tools";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

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
