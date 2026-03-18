import type { ToolDefinition } from "@/lib/tools";
import {
  AgeCalculatorTool,
  BmiCalculatorTool,
  DateDifferenceCalculatorTool,
  LoanCalculatorTool,
  PercentageCalculatorTool,
} from "@/components/tools/calculator-tools";
import {
  CurrencyConverterTool,
  LengthConverterTool,
  TemperatureConverterTool,
  TimeConverterTool,
  WeightConverterTool,
} from "@/components/tools/converter-tools";
import {
  Base64DecoderTool,
  Base64EncoderTool,
  CssMinifierTool,
  HtmlMinifierTool,
  JsonFormatterTool,
  RegexTesterTool,
  UrlDecoderTool,
  UrlEncoderTool,
} from "@/components/tools/developer-tools";
import {
  BackgroundRemoverTool,
  CropImageTool,
  ImageCompressorTool,
  ImageResizerTool,
  ImageRotatorTool,
  ImageToBase64ConverterTool,
  ImageToWebpConverterTool,
  ImageWatermarkTool,
  JpgToPngConverterTool,
  PngToJpgConverterTool,
} from "@/components/tools/image-tools";
import { DnsLookupTool, IpAddressLookupTool } from "@/components/tools/internet-tools";
import {
  JpgToPdfTool,
  PdfCompressorTool,
  PdfMergeTool,
  PdfPageNumberAdderTool,
  PdfPageRotatorTool,
  PdfSplitTool,
  PdfToJpgTool,
  ProtectPdfTool,
} from "@/components/tools/pdf-tools";
import {
  PasswordGeneratorTool,
  QrCodeGeneratorTool,
  RandomNameGeneratorTool,
  RandomNumberGeneratorTool,
  UuidGeneratorTool,
} from "@/components/tools/generator-tools";
import {
  CaseConverterTool,
  CharacterCounterTool,
  RemoveDuplicateLinesTool,
  TextSorterTool,
  WordCounterTool,
} from "@/components/tools/text-tools";

export function ToolRenderer({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "image-compressor":
      return <ImageCompressorTool />;
    case "image-resizer":
      return <ImageResizerTool />;
    case "crop-image":
      return <CropImageTool />;
    case "jpg-to-png-converter":
      return <JpgToPngConverterTool />;
    case "png-to-jpg-converter":
      return <PngToJpgConverterTool />;
    case "image-to-webp-converter":
      return <ImageToWebpConverterTool />;
    case "background-remover":
      return <BackgroundRemoverTool />;
    case "image-rotator":
      return <ImageRotatorTool />;
    case "image-watermark-tool":
      return <ImageWatermarkTool />;
    case "image-to-base64-converter":
      return <ImageToBase64ConverterTool />;
    case "pdf-merge":
      return <PdfMergeTool />;
    case "pdf-split":
      return <PdfSplitTool />;
    case "pdf-compressor":
      return <PdfCompressorTool />;
    case "pdf-to-jpg":
      return <PdfToJpgTool />;
    case "jpg-to-pdf":
      return <JpgToPdfTool />;
    case "pdf-page-rotator":
      return <PdfPageRotatorTool />;
    case "pdf-page-number-adder":
      return <PdfPageNumberAdderTool />;
    case "protect-pdf":
      return <ProtectPdfTool />;
    case "word-counter":
      return <WordCounterTool />;
    case "character-counter":
      return <CharacterCounterTool />;
    case "case-converter":
      return <CaseConverterTool />;
    case "remove-duplicate-lines":
      return <RemoveDuplicateLinesTool />;
    case "text-sorter":
      return <TextSorterTool />;
    case "json-formatter":
      return <JsonFormatterTool />;
    case "base64-encoder":
      return <Base64EncoderTool />;
    case "base64-decoder":
      return <Base64DecoderTool />;
    case "css-minifier":
      return <CssMinifierTool />;
    case "html-minifier":
      return <HtmlMinifierTool />;
    case "url-encoder":
      return <UrlEncoderTool />;
    case "url-decoder":
      return <UrlDecoderTool />;
    case "regex-tester":
      return <RegexTesterTool />;
    case "password-generator":
      return <PasswordGeneratorTool />;
    case "qr-code-generator":
      return <QrCodeGeneratorTool />;
    case "uuid-generator":
      return <UuidGeneratorTool />;
    case "random-name-generator":
      return <RandomNameGeneratorTool />;
    case "random-number-generator":
      return <RandomNumberGeneratorTool />;
    case "age-calculator":
      return <AgeCalculatorTool />;
    case "bmi-calculator":
      return <BmiCalculatorTool />;
    case "loan-calculator":
      return <LoanCalculatorTool />;
    case "percentage-calculator":
      return <PercentageCalculatorTool />;
    case "date-difference-calculator":
      return <DateDifferenceCalculatorTool />;
    case "length-converter":
      return <LengthConverterTool />;
    case "weight-converter":
      return <WeightConverterTool />;
    case "temperature-converter":
      return <TemperatureConverterTool />;
    case "time-converter":
      return <TimeConverterTool />;
    case "currency-converter":
      return <CurrencyConverterTool />;
    case "ip-address-lookup":
      return <IpAddressLookupTool />;
    case "dns-lookup":
      return <DnsLookupTool />;
    default:
      break;
  }

  return (
    <section className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
          Tool UI Slot
        </span>
        <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          {tool.implementationStatus}
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">Implementation placeholder</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
        This page is wired and production-ready for SEO, routing, metadata, internal linking, and
        content structure. The live browser-side tool logic for <strong>{tool.name}</strong> can be
        plugged in next by mapping this registry entry to a dedicated client component.
      </p>
      {tool.statusNote ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Current note: {tool.statusNote}
        </p>
      ) : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Registry source
          </p>
          <p className="mt-2 text-sm text-slate-700">lib/tools.ts entry for {tool.slug}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Next step
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Add a client component and connect it here without changing page routes or content.
          </p>
        </div>
      </div>
    </section>
  );
}
