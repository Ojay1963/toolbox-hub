import { StaticPage } from "@/components/content/static-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Toolbox Hub",
  description:
    "Learn what Toolbox Hub is, how the free online tools directory is built, and why the site focuses on browser-first workflows, honest scope notes, and strong internal navigation.",
  pathname: "/about",
  keywords: ["about toolbox hub", "about online tools website", "toolbox hub about"],
});

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="About"
      title="About Toolbox Hub"
      intro="Toolbox Hub is a free online tools website built around a simple idea: useful tools should be easy to open, honest about their scope, and organized so people can move from one task to the next without friction."
      sections={[
        {
          title: "What the Site Tries to Do Well",
          paragraphs: [
            "The site focuses on practical utility across PDFs, images, text, developer workflows, generators, calculators, converters, and internet tools. The goal is not to overwhelm people with gimmicks, but to make common tasks easier to complete quickly.",
            "Where possible, tools are designed to run locally in the browser. Where that is not realistic, the site uses clearly labeled server-assisted workflows instead of pretending everything is purely local.",
          ],
          bullets: [
            "Fast pages with a shared structure",
            "Clear how-to steps, FAQ sections, and related tools",
            "Honest labels for reduced-scope and service-backed workflows",
            "Mobile-friendly navigation and category browsing",
          ],
        },
        {
          title: "How the Site Is Structured",
          paragraphs: [
            "The directory uses a central tool registry, reusable page templates, and category-based routing so the site can scale without turning into a maze of one-off pages.",
            "That structure helps with consistency, internal linking, metadata, and maintainability as more tools are added over time.",
          ],
        },
        {
          title: "What the Site Does Not Promise",
          paragraphs: [
            "Toolbox Hub is not a replacement for expert review, enterprise document systems, or specialized compliance software. Some conversions and analyses are intentionally simplified, and some capabilities depend on browser support or third-party services.",
            "Instead of hiding those limitations, the site is built to surface them clearly on the relevant pages.",
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
