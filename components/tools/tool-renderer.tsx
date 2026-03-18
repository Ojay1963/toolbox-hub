import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ToolDefinition } from "@/lib/tools";

function LoadingToolPanel() {
  return (
    <section className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="h-5 w-32 rounded-full bg-stone-100" />
      <div className="mt-4 h-9 w-56 rounded-xl bg-stone-100" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded bg-stone-100" />
        <div className="h-4 w-11/12 rounded bg-stone-100" />
        <div className="h-4 w-3/4 rounded bg-stone-100" />
      </div>
    </section>
  );
}

function buildDynamicTool(loader: () => Promise<ComponentType>) {
  return dynamic(async () => ({ default: await loader() }), {
    loading: () => <LoadingToolPanel />,
  });
}

const toolComponentMap: Record<string, ComponentType> = {
  "image-compressor": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageCompressorTool)),
  "image-format-converter": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageFormatConverterTool)),
  "image-color-picker": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageColorPickerTool)),
  "blur-image-tool": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.BlurImageTool)),
  "image-brightness-adjuster": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageBrightnessAdjusterTool)),
  "image-contrast-adjuster": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageContrastAdjusterTool)),
  "image-grayscale-converter": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageGrayscaleConverterTool)),
  "image-resizer": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageResizerTool)),
  "crop-image": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.CropImageTool)),
  "jpg-to-png-converter": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.JpgToPngConverterTool)),
  "png-to-jpg-converter": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.PngToJpgConverterTool)),
  "image-to-webp-converter": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageToWebpConverterTool)),
  "background-remover": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.BackgroundRemoverTool)),
  "image-rotator": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageRotatorTool)),
  "image-watermark-tool": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageWatermarkTool)),
  "image-to-base64-converter": buildDynamicTool(() => import("@/components/tools/image-tools").then((m) => m.ImageToBase64ConverterTool)),
  "pdf-merge": buildDynamicTool(() => import("@/components/tools/pdf-tools").then((m) => m.PdfMergeTool)),
  "pdf-split": buildDynamicTool(() => import("@/components/tools/pdf-tools").then((m) => m.PdfSplitTool)),
  "pdf-compressor": buildDynamicTool(() => import("@/components/tools/pdf-tools").then((m) => m.PdfCompressorTool)),
  "pdf-to-jpg": buildDynamicTool(() => import("@/components/tools/pdf-tools").then((m) => m.PdfToJpgTool)),
  "jpg-to-pdf": buildDynamicTool(() => import("@/components/tools/pdf-tools").then((m) => m.JpgToPdfTool)),
  "pdf-page-rotator": buildDynamicTool(() => import("@/components/tools/pdf-tools").then((m) => m.PdfPageRotatorTool)),
  "pdf-page-number-adder": buildDynamicTool(() => import("@/components/tools/pdf-tools").then((m) => m.PdfPageNumberAdderTool)),
  "protect-pdf": buildDynamicTool(() => import("@/components/tools/pdf-tools").then((m) => m.ProtectPdfTool)),
  "word-counter": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.WordCounterTool)),
  "character-counter": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.CharacterCounterTool)),
  "case-converter": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.CaseConverterTool)),
  "remove-duplicate-lines": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.RemoveDuplicateLinesTool)),
  "text-sorter": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.TextSorterTool)),
  "text-reverser": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.TextReverserTool)),
  "text-to-slug-converter": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.TextToSlugConverterTool)),
  "text-line-counter": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.TextLineCounterTool)),
  "random-sentence-generator": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.RandomSentenceGeneratorTool)),
  "lorem-ipsum-generator": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.LoremIpsumGeneratorTool)),
  "text-replace-tool": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.TextReplaceTool)),
  "text-duplicate-remover": buildDynamicTool(() => import("@/components/tools/text-tools").then((m) => m.TextDuplicateRemoverTool)),
  "json-formatter": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.JsonFormatterTool)),
  "json-to-csv-converter": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.JsonToCsvConverterTool)),
  "csv-to-json-converter": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.CsvToJsonConverterTool)),
  "base64-encoder": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.Base64EncoderTool)),
  "base64-decoder": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.Base64DecoderTool)),
  "css-minifier": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.CssMinifierTool)),
  "html-minifier": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.HtmlMinifierTool)),
  "html-encoder": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.HtmlEncoderTool)),
  "html-decoder": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.HtmlDecoderTool)),
  "html-to-markdown-converter": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.HtmlToMarkdownConverterTool)),
  "markdown-to-html-converter": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.MarkdownToHtmlConverterTool)),
  "url-encoder": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.UrlEncoderTool)),
  "url-decoder": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.UrlDecoderTool)),
  "url-parser": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.UrlParserTool)),
  "regex-tester": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.RegexTesterTool)),
  "jwt-decoder": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.JwtDecoderTool)),
  "jwt-encoder": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.JwtEncoderTool)),
  "sha256-generator": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.Sha256GeneratorTool)),
  "md5-generator": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.Md5GeneratorTool)),
  "hash-generator": buildDynamicTool(() => import("@/components/tools/developer-tools").then((m) => m.HashGeneratorTool)),
  "password-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.PasswordGeneratorTool)),
  "qr-code-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.QrCodeGeneratorTool)),
  "uuid-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.UuidGeneratorTool)),
  "random-name-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.RandomNameGeneratorTool)),
  "random-number-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.RandomNumberGeneratorTool)),
  "username-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.UsernameGeneratorTool)),
  "nickname-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.NicknameGeneratorTool)),
  "random-color-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.RandomColorGeneratorTool)),
  "random-password-phrase-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.RandomPasswordPhraseGeneratorTool)),
  "random-quote-generator": buildDynamicTool(() => import("@/components/tools/generator-tools").then((m) => m.RandomQuoteGeneratorTool)),
  "age-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.AgeCalculatorTool)),
  "bmi-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.BmiCalculatorTool)),
  "loan-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.LoanCalculatorTool)),
  "percentage-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.PercentageCalculatorTool)),
  "date-difference-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.DateDifferenceCalculatorTool)),
  "discount-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.DiscountCalculatorTool)),
  "tip-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.TipCalculatorTool)),
  "profit-margin-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.ProfitMarginCalculatorTool)),
  "vat-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.VatCalculatorTool)),
  "sales-tax-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.SalesTaxCalculatorTool)),
  "simple-interest-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.SimpleInterestCalculatorTool)),
  "compound-interest-calculator": buildDynamicTool(() => import("@/components/tools/calculator-tools").then((m) => m.CompoundInterestCalculatorTool)),
  "length-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.LengthConverterTool)),
  "weight-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.WeightConverterTool)),
  "temperature-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.TemperatureConverterTool)),
  "time-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.TimeConverterTool)),
  "currency-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.CurrencyConverterTool)),
  "binary-to-decimal-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.BinaryToDecimalConverterTool)),
  "decimal-to-binary-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.DecimalToBinaryConverterTool)),
  "hex-to-rgb-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.HexToRgbConverterTool)),
  "rgb-to-hex-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.RgbToHexConverterTool)),
  "text-to-binary-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.TextToBinaryConverterTool)),
  "binary-to-text-converter": buildDynamicTool(() => import("@/components/tools/converter-tools").then((m) => m.BinaryToTextConverterTool)),
  "ip-address-lookup": buildDynamicTool(() => import("@/components/tools/internet-tools").then((m) => m.IpAddressLookupTool)),
  "http-status-code-checker": buildDynamicTool(() => import("@/components/tools/internet-tools").then((m) => m.HttpStatusCodeCheckerTool)),
  "url-redirect-checker": buildDynamicTool(() => import("@/components/tools/internet-tools").then((m) => m.UrlRedirectCheckerTool)),
  "website-screenshot-tool": buildDynamicTool(() => import("@/components/tools/internet-tools").then((m) => m.WebsiteScreenshotTool)),
  "user-agent-parser": buildDynamicTool(() => import("@/components/tools/internet-tools").then((m) => m.UserAgentParserTool)),
  "dns-lookup": buildDynamicTool(() => import("@/components/tools/internet-tools").then((m) => m.DnsLookupTool)),
  "mime-type-lookup": buildDynamicTool(() => import("@/components/tools/internet-tools").then((m) => m.MimeTypeLookupTool)),
};

export function ToolRenderer({ tool }: { tool: ToolDefinition }) {
  const ToolComponent = toolComponentMap[tool.slug];

  if (ToolComponent) {
    return <ToolComponent />;
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
