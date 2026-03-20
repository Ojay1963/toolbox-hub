"use client";

import dynamic from "next/dynamic";
import {
  Base64DecoderTool,
  Base64EncoderTool,
  BCryptGeneratorTool,
  CronExpressionGeneratorTool,
  CronExpressionParserTool,
  CsvFormatterTool,
  CsvDiffCheckerTool,
  CsvToJsonConverterTool,
  CsvViewerTool,
  CssMinifierTool,
  EmailValidatorTool,
  HashIdentifierTool,
  HmacGeneratorTool,
  HashGeneratorTool,
  HtmlDecoderTool,
  HtmlEncoderTool,
  HtmlMinifierTool,
  HtmlPreviewTool,
  HtmlToMarkdownConverterTool,
  JsonDiffCheckerTool,
  JsonFormatterTool,
  JsonKeyExtractorTool,
  JsonSchemaValidatorTool,
  JsonToCsvConverterTool,
  JsonToXmlConverterTool,
  JwtDecoderTool,
  JwtEncoderTool,
  KeywordDensityCheckerTool,
  MarkdownToHtmlConverterTool,
  MarkdownEditorTool,
  Md5GeneratorTool,
  MetaTagGeneratorTool,
  OpenGraphGeneratorTool,
  PasswordEntropyCalculatorTool,
  PhoneNumberFormatterTool,
  RandomApiKeyGeneratorTool,
  RandomTokenGeneratorTool,
  RegexTesterTool,
  RobotsTxtGeneratorTool,
  SecurePasswordStrengthCheckerTool,
  SecureTokenGeneratorTool,
  SecretKeyGeneratorTool,
  Sha256GeneratorTool,
  SqlBeautifierTool,
  SqlMinifierTool,
  SqlQueryFormatterTool,
  SitemapGeneratorTool,
  UUIDValidatorTool,
  UrlDecoderTool,
  UrlEncoderTool,
  UrlParserTool,
  UrlSlugGeneratorTool,
  XmlToJsonConverterTool,
  XmlFormatterTool,
  YamlFormatterTool,
} from "@/components/tools/developer-tools";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

function LoadingToolPanel() {
  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <div className="h-5 w-32 rounded-full bg-stone-100" />
      <div className="mt-4 h-9 w-56 rounded-xl bg-stone-100" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded bg-stone-100" />
        <div className="h-4 w-11/12 rounded bg-stone-100" />
      </div>
    </div>
  );
}

const FileHashCheckerTool = dynamic(() => import("@/components/tools/developer-lazy-tools").then((module) => module.FileHashCheckerTool), { loading: () => <LoadingToolPanel /> });
const FileChecksumGeneratorTool = dynamic(() => import("@/components/tools/developer-lazy-tools").then((module) => module.FileChecksumGeneratorTool), { loading: () => <LoadingToolPanel /> });
const KeywordDifficultyCheckerPlaceholderTool = dynamic(() => import("@/components/tools/developer-lazy-tools").then((module) => module.KeywordDifficultyCheckerPlaceholderTool), { loading: () => <LoadingToolPanel /> });
const KeywordSuggestionGeneratorTool = dynamic(() => import("@/components/tools/developer-lazy-tools").then((module) => module.KeywordSuggestionGeneratorTool), { loading: () => <LoadingToolPanel /> });
const MetaTagAnalyzerTool = dynamic(() => import("@/components/tools/developer-lazy-tools").then((module) => module.MetaTagAnalyzerTool), { loading: () => <LoadingToolPanel /> });
const PageTitleGeneratorTool = dynamic(() => import("@/components/tools/developer-lazy-tools").then((module) => module.PageTitleGeneratorTool), { loading: () => <LoadingToolPanel /> });
const DescriptionGeneratorTool = dynamic(() => import("@/components/tools/developer-lazy-tools").then((module) => module.DescriptionGeneratorTool), { loading: () => <LoadingToolPanel /> });

export function DeveloperToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "json-formatter": return <JsonFormatterTool />;
    case "json-to-csv-converter": return <JsonToCsvConverterTool />;
    case "csv-to-json-converter": return <CsvToJsonConverterTool />;
    case "base64-encoder": return <Base64EncoderTool />;
    case "base64-decoder": return <Base64DecoderTool />;
    case "css-minifier": return <CssMinifierTool />;
    case "html-minifier": return <HtmlMinifierTool />;
    case "html-encoder": return <HtmlEncoderTool />;
    case "html-decoder": return <HtmlDecoderTool />;
    case "html-to-markdown-converter": return <HtmlToMarkdownConverterTool />;
    case "markdown-to-html-converter": return <MarkdownToHtmlConverterTool />;
    case "markdown-editor": return <MarkdownEditorTool />;
    case "yaml-formatter": return <YamlFormatterTool />;
    case "xml-formatter": return <XmlFormatterTool />;
    case "json-diff-checker": return <JsonDiffCheckerTool />;
    case "csv-formatter": return <CsvFormatterTool />;
    case "csv-viewer": return <CsvViewerTool />;
    case "csv-diff-checker": return <CsvDiffCheckerTool />;
    case "html-preview-tool": return <HtmlPreviewTool />;
    case "meta-tag-generator": return <MetaTagGeneratorTool />;
    case "meta-tag-analyzer": return <MetaTagAnalyzerTool />;
    case "keyword-density-checker": return <KeywordDensityCheckerTool />;
    case "keyword-difficulty-checker": return <KeywordDifficultyCheckerPlaceholderTool />;
    case "keyword-suggestion-generator": return <KeywordSuggestionGeneratorTool />;
    case "page-title-generator": return <PageTitleGeneratorTool />;
    case "description-generator": return <DescriptionGeneratorTool />;
    case "robots-txt-generator": return <RobotsTxtGeneratorTool />;
    case "sitemap-generator": return <SitemapGeneratorTool />;
    case "url-slug-generator": return <UrlSlugGeneratorTool />;
    case "open-graph-generator": return <OpenGraphGeneratorTool />;
    case "url-encoder": return <UrlEncoderTool />;
    case "url-decoder": return <UrlDecoderTool />;
    case "url-parser": return <UrlParserTool />;
    case "regex-tester": return <RegexTesterTool />;
    case "jwt-decoder": return <JwtDecoderTool />;
    case "jwt-encoder": return <JwtEncoderTool />;
    case "sha256-generator": return <Sha256GeneratorTool />;
    case "md5-generator": return <Md5GeneratorTool />;
    case "hash-generator": return <HashGeneratorTool />;
    case "bcrypt-generator": return <BCryptGeneratorTool />;
    case "hmac-generator": return <HmacGeneratorTool />;
    case "sql-minifier": return <SqlMinifierTool />;
    case "sql-beautifier": return <SqlBeautifierTool />;
    case "sql-query-formatter": return <SqlQueryFormatterTool />;
    case "cron-expression-generator": return <CronExpressionGeneratorTool />;
    case "cron-expression-parser": return <CronExpressionParserTool />;
    case "json-schema-validator": return <JsonSchemaValidatorTool />;
    case "json-key-extractor": return <JsonKeyExtractorTool />;
    case "xml-to-json-converter": return <XmlToJsonConverterTool />;
    case "json-to-xml-converter": return <JsonToXmlConverterTool />;
    case "random-token-generator": return <RandomTokenGeneratorTool />;
    case "secure-password-strength-checker": return <SecurePasswordStrengthCheckerTool />;
    case "secret-key-generator": return <SecretKeyGeneratorTool />;
    case "email-validator": return <EmailValidatorTool />;
    case "file-hash-checker": return <FileHashCheckerTool />;
    case "file-checksum-generator": return <FileChecksumGeneratorTool />;
    case "phone-number-formatter": return <PhoneNumberFormatterTool />;
    case "uuid-validator": return <UUIDValidatorTool />;
    case "random-api-key-generator": return <RandomApiKeyGeneratorTool />;
    case "secure-token-generator": return <SecureTokenGeneratorTool />;
    case "password-entropy-calculator": return <PasswordEntropyCalculatorTool />;
    case "hash-identifier": return <HashIdentifierTool />;
    default: return <ToolPlaceholder tool={tool} />;
  }
}
