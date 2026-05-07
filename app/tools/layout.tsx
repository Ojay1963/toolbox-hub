import { NumberInputEnhancer } from "@/components/ui/number-input-enhancer";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NumberInputEnhancer />
      {children}
    </>
  );
}
