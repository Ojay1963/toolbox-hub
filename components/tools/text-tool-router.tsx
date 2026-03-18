"use client";

import {
  CaseConverterTool,
  CharacterCounterTool,
  LoremIpsumGeneratorTool,
  PalindromeCheckerTool,
  RandomSentenceGeneratorTool,
  ReadingTimeCalculatorTool,
  RemoveDuplicateLinesTool,
  SentenceCounterTool,
  TextCompareTool,
  TextDuplicateRemoverTool,
  TextLineCounterTool,
  TextReplaceTool,
  TextReverserTool,
  TextSorterTool,
  TextToSlugConverterTool,
  WordFrequencyCounterTool,
  WordCounterTool,
} from "@/components/tools/text-tools";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

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
