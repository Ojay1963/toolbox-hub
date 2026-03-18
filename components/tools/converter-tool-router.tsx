"use client";

import {
  BinaryToDecimalConverterTool,
  BinaryToTextConverterTool,
  CurrencyConverterTool,
  DecimalToBinaryConverterTool,
  HexToRgbConverterTool,
  LengthConverterTool,
  RgbToHexConverterTool,
  TemperatureConverterTool,
  TextToBinaryConverterTool,
  TimeConverterTool,
  TimezoneConverterTool,
  UnixTimestampConverterTool,
  WeightConverterTool,
} from "@/components/tools/converter-tools";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

export function ConverterToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "length-converter": return <LengthConverterTool />;
    case "weight-converter": return <WeightConverterTool />;
    case "temperature-converter": return <TemperatureConverterTool />;
    case "time-converter": return <TimeConverterTool />;
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
