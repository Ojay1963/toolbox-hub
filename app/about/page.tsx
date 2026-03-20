import { StaticPage } from "@/components/content/static-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Toolbox Hub",
  description:
    "Learn what Toolbox Hub is and how the site helps people find simple online tools for everyday tasks.",
  pathname: "/about",
  keywords: ["about toolbox hub", "about online tools website", "toolbox hub about"],
});

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="About"
      title="About Toolbox Hub"
      intro="Toolbox Hub is a free online tools website built to make common tasks simple. Open a tool, use it quickly, and move on."
      sections={[
        {
          title: "What the Site Tries to Do Well",
          paragraphs: [
            "The site focuses on practical utility across PDFs, images, text, developer workflows, generators, calculators, converters, and internet tools. The goal is not to overwhelm people with gimmicks, but to make common tasks easier to complete quickly.",
            "The goal is to keep tools easy to use, fast to open, and clear about what you can expect.",
          ],
          bullets: [
            "Fast pages with a shared structure",
            "Clear how-to steps, FAQ sections, and related tools",
            "Simple tool pages with clear instructions",
            "Mobile-friendly navigation and category browsing",
          ],
        },
        {
          title: "How the Site Is Organized",
          paragraphs: [
            "Tools are grouped into clear categories so it is easy to find similar options.",
            "Each tool page includes the tool itself, simple steps, common questions, and related links.",
          ],
        },
        {
          title: "What the Site Does Not Promise",
          paragraphs: [
            "Toolbox Hub is made for quick everyday tasks, not specialist professional work.",
            "For important documents or high-stakes decisions, it is still a good idea to review the results carefully.",
          ],
        },
        {
          title: "Who the Site Is For",
          paragraphs: [
            "The site is useful for students, creators, developers, small teams, marketers, and everyday users who need a quick browser-accessible tool for formatting, converting, generating, checking, or inspecting common content.",
            "It is especially useful when you want a straightforward utility without creating an account or installing a large desktop app first.",
          ],
        },
      ]}
    />
  );
}
