"use client";

import { buildLazyTool } from "@/components/tools/lazy-tool";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

const WordCounterTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.WordCounterTool));
const CharacterCounterTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.CharacterCounterTool));
const CaseConverterTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.CaseConverterTool));
const RemoveDuplicateLinesTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.RemoveDuplicateLinesTool));
const TextSorterTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.TextSorterTool));
const TextReverserTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.TextReverserTool));
const TextToSlugConverterTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.TextToSlugConverterTool));
const TextLineCounterTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.TextLineCounterTool));
const RandomSentenceGeneratorTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.RandomSentenceGeneratorTool));
const LoremIpsumGeneratorTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.LoremIpsumGeneratorTool));
const TextReplaceTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.TextReplaceTool));
const TextDuplicateRemoverTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.TextDuplicateRemoverTool));
const TextCompareTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.TextCompareTool));
const WordFrequencyCounterTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.WordFrequencyCounterTool));
const PalindromeCheckerTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.PalindromeCheckerTool));
const SentenceCounterTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.SentenceCounterTool));
const ReadingTimeCalculatorTool = buildLazyTool(() => import("@/components/tools/text-tools").then((module) => module.ReadingTimeCalculatorTool));

export function TextToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "word-counter": return <WordCounterTool />;
    case "character-counter": return <CharacterCounterTool />;
    case "case-converter": return <CaseConverterTool />;
    case "remove-duplicate-lines": return <RemoveDuplicateLinesTool />;
    case "text-sorter": return <TextSorterTool />;
    case "text-reverser": return <TextReverserTool />;
    case "text-to-slug-converter": return <TextToSlugConverterTool />;
    case "text-line-counter": return <TextLineCounterTool />;
    case "random-sentence-generator": return <RandomSentenceGeneratorTool />;
    case "lorem-ipsum-generator": return <LoremIpsumGeneratorTool />;
    case "text-replace-tool": return <TextReplaceTool />;
    case "text-duplicate-remover": return <TextDuplicateRemoverTool />;
    case "text-compare-tool": return <TextCompareTool />;
    case "word-frequency-counter": return <WordFrequencyCounterTool />;
    case "palindrome-checker": return <PalindromeCheckerTool />;
    case "sentence-counter": return <SentenceCounterTool />;
    case "reading-time-calculator": return <ReadingTimeCalculatorTool />;
    default: return <ToolPlaceholder tool={tool} />;
  }
}
