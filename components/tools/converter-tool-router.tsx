"use client";

import { buildLazyTool } from "@/components/tools/lazy-tool";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

const LengthConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.LengthConverterTool));
const WeightConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.WeightConverterTool));
const TemperatureConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.TemperatureConverterTool));
const TimeConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.TimeConverterTool));
const FileSizeConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.FileSizeConverterTool));
const CurrencyConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.CurrencyConverterTool));
const TimezoneConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.TimezoneConverterTool));
const UnixTimestampConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.UnixTimestampConverterTool));
const BinaryToDecimalConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.BinaryToDecimalConverterTool));
const DecimalToBinaryConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.DecimalToBinaryConverterTool));
const HexToRgbConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.HexToRgbConverterTool));
const RgbToHexConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.RgbToHexConverterTool));
const TextToBinaryConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.TextToBinaryConverterTool));
const BinaryToTextConverterTool = buildLazyTool(() => import("@/components/tools/converter-tools").then((module) => module.BinaryToTextConverterTool));

export function ConverterToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "length-converter": return <LengthConverterTool />;
    case "weight-converter": return <WeightConverterTool />;
    case "temperature-converter": return <TemperatureConverterTool />;
    case "time-converter": return <TimeConverterTool />;
    case "file-size-converter": return <FileSizeConverterTool />;
    case "currency-converter": return <CurrencyConverterTool />;
    case "timezone-converter": return <TimezoneConverterTool />;
    case "unix-timestamp-converter": return <UnixTimestampConverterTool />;
    case "binary-to-decimal-converter": return <BinaryToDecimalConverterTool />;
    case "decimal-to-binary-converter": return <DecimalToBinaryConverterTool />;
    case "hex-to-rgb-converter": return <HexToRgbConverterTool />;
    case "rgb-to-hex-converter": return <RgbToHexConverterTool />;
    case "text-to-binary-converter": return <TextToBinaryConverterTool />;
    case "binary-to-text-converter": return <BinaryToTextConverterTool />;
    default: return <ToolPlaceholder tool={tool} />;
  }
}
