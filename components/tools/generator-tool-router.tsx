"use client";

import {
  BarcodeGeneratorTool,
  BlogTitleGeneratorTool,
  CoinFlipGeneratorTool,
  CountdownTimerGeneratorTool,
  DiceRollerTool,
  DomainNameGeneratorTool,
  FakeAddressGeneratorTool,
  InstagramHashtagGeneratorTool,
  NicknameGeneratorTool,
  PasswordGeneratorTool,
  ProductNameGeneratorTool,
  QrCodeGeneratorTool,
  RandomColorGeneratorTool,
  RandomColorPaletteGeneratorTool,
  RandomNameGeneratorTool,
  RandomNumberGeneratorTool,
  RandomPasswordPhraseGeneratorTool,
  RandomQuoteGeneratorTool,
  RandomUsernameGeneratorTool,
  RandomTeamGeneratorTool,
  UuidGeneratorTool,
  UsernameGeneratorTool,
  WheelSpinnerRandomPickerTool,
  YouTubeTagGeneratorTool,
} from "@/components/tools/generator-tools";
import { ToolPlaceholder } from "@/components/tools/tool-placeholder";
import type { ToolDefinition } from "@/lib/tools";

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
