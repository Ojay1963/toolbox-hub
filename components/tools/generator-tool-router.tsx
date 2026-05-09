"use client";

import { buildLazyTool } from "@/components/tools/lazy-tool";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

const BarcodeGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.BarcodeGeneratorTool));
const PasswordGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.PasswordGeneratorTool));
const QrCodeGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.QrCodeGeneratorTool));
const UuidGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.UuidGeneratorTool));
const RandomNameGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.RandomNameGeneratorTool));
const RandomNumberGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.RandomNumberGeneratorTool));
const RandomUsernameGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.RandomUsernameGeneratorTool));
const UsernameGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.UsernameGeneratorTool));
const NicknameGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.NicknameGeneratorTool));
const RandomColorGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.RandomColorGeneratorTool));
const RandomColorPaletteGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.RandomColorPaletteGeneratorTool));
const RandomPasswordPhraseGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.RandomPasswordPhraseGeneratorTool));
const RandomQuoteGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.RandomQuoteGeneratorTool));
const CountdownTimerGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.CountdownTimerGeneratorTool));
const BlogTitleGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.BlogTitleGeneratorTool));
const YouTubeTagGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.YouTubeTagGeneratorTool));
const InstagramHashtagGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.InstagramHashtagGeneratorTool));
const ProductNameGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.ProductNameGeneratorTool));
const DomainNameGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.DomainNameGeneratorTool));
const FakeAddressGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.FakeAddressGeneratorTool));
const RandomTeamGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.RandomTeamGeneratorTool));
const DiceRollerTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.DiceRollerTool));
const CoinFlipGeneratorTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.CoinFlipGeneratorTool));
const WheelSpinnerRandomPickerTool = buildLazyTool(() => import("@/components/tools/generator-tools").then((module) => module.WheelSpinnerRandomPickerTool));

export function GeneratorToolRouter({ tool }: { tool: ToolDefinition }) {
  switch (tool.slug) {
    case "barcode-generator": return <BarcodeGeneratorTool />;
    case "password-generator": return <PasswordGeneratorTool />;
    case "qr-code-generator": return <QrCodeGeneratorTool />;
    case "uuid-generator": return <UuidGeneratorTool />;
    case "random-name-generator": return <RandomNameGeneratorTool />;
    case "random-number-generator": return <RandomNumberGeneratorTool />;
    case "random-username-generator": return <RandomUsernameGeneratorTool />;
    case "username-generator": return <UsernameGeneratorTool />;
    case "nickname-generator": return <NicknameGeneratorTool />;
    case "random-color-generator": return <RandomColorGeneratorTool />;
    case "random-color-palette-generator": return <RandomColorPaletteGeneratorTool />;
    case "random-password-phrase-generator": return <RandomPasswordPhraseGeneratorTool />;
    case "random-quote-generator": return <RandomQuoteGeneratorTool />;
    case "countdown-timer-generator": return <CountdownTimerGeneratorTool />;
    case "blog-title-generator": return <BlogTitleGeneratorTool />;
    case "youtube-tag-generator": return <YouTubeTagGeneratorTool />;
    case "instagram-hashtag-generator": return <InstagramHashtagGeneratorTool />;
    case "product-name-generator": return <ProductNameGeneratorTool />;
    case "domain-name-generator": return <DomainNameGeneratorTool />;
    case "fake-address-generator": return <FakeAddressGeneratorTool />;
    case "random-team-generator": return <RandomTeamGeneratorTool />;
    case "dice-roller": return <DiceRollerTool />;
    case "coin-flip-generator": return <CoinFlipGeneratorTool />;
    case "wheel-spinner-random-picker": return <WheelSpinnerRandomPickerTool />;
    default: return <ToolPlaceholder tool={tool} />;
  }
}
