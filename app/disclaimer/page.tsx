import { StaticPage } from "@/components/content/static-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Disclaimer",
  description:
    "Read the Toolbox Hub disclaimer about informational use, tool limitations, third-party services, and when results should be independently verified.",
  pathname: "/disclaimer",
  keywords: ["disclaimer", "toolbox hub disclaimer", "online tools disclaimer"],
});

export default function DisclaimerPage() {
  return (
    <StaticPage
      eyebrow="Trust"
      title="Disclaimer"
      intro="Toolbox Hub provides practical free online tools, but important results should always be reviewed carefully before they are used in formal, professional, or high-stakes situations."
      sections={[
        {
          title: "General Information Only",
          paragraphs: [
            "The content and tools on this site are provided for general informational and utility purposes. They are not legal advice, tax advice, financial advice, medical advice, cybersecurity advice, or professional certification of any kind.",
            "Even where a tool is fully functional, you should verify important results independently before relying on them in contracts, audits, filings, production deployments, or regulated workflows.",
          ],
        },
        {
          title: "No Guarantee of Completeness",
          paragraphs: [
            "Some tools depend on browser support, simplified processing, or outside services. That means results may vary by device, file structure, service availability, or the quality of the input data.",
            "Some tools may simplify layout, formatting, metadata, or website checks, so you should review important outputs carefully.",
          ],
        },
        {
          title: "Outside Services",
          paragraphs: [
            "Certain tools may rely on outside providers for exchange rates, OCR, website analysis, screenshots, document workflows, or image processing. Those providers can fail, rate limit requests, return delayed data, or change behavior independently of the site.",
            "When a provider is unavailable, Toolbox Hub may pause that feature or show that the page is temporarily unavailable.",
          ],
        },
        {
          title: "Use at Your Own Risk",
          paragraphs: [
            "You are responsible for deciding whether a tool is appropriate for your situation. That includes checking source material, confirming conversions, reviewing extracted text, and testing generated files before relying on them.",
            "If you need guaranteed professional outputs, specialist review, or service-level commitments, a free online tools website may not be sufficient on its own.",
          ],
        },
      ]}
    />
  );
}
