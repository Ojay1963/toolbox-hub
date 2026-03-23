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
      intro="Toolbox Hub is a public website that brings together practical online tools for everyday tasks. The goal is simple: make common jobs easier to finish with clear pages, straightforward instructions, and useful related links."
      sections={[
        {
          title: "What Toolbox Hub Offers",
          paragraphs: [
            "Toolbox Hub covers practical tasks across PDFs, images, text, web and data workflows, generators, calculators, converters, and related utility pages.",
            "The site is built for people who want a straightforward tool page, clear steps, and a quick result without hunting through menus or creating an account first.",
          ],
          bullets: [
            "Clear tool pages with simple how-to steps",
            "Helpful FAQs and related tool links",
            "Mobile-friendly navigation and category browsing",
            "Guides and support pages that are easy to find",
          ],
        },
        {
          title: "How the Site Is Organized",
          paragraphs: [
            "Tools are grouped into categories so it is easier to find similar options without searching the whole site every time.",
            "Each tool page is designed to explain what the tool does, how to use it, and where to go next if a related task would be more useful.",
          ],
        },
        {
          title: "What You Can Expect",
          paragraphs: [
            "Toolbox Hub is built to be useful, clear, and easy to navigate, but it is still wise to review important files and results before relying on them for formal or high-stakes use.",
            "The site keeps its language and page structure simple so visitors can quickly understand the purpose of each tool and decide whether it fits the task.",
          ],
        },
        {
          title: "Who the Site Is For",
          paragraphs: [
            "The site is useful for students, creators, developers, small teams, marketers, and everyday users who need a quick browser-accessible tool for formatting, converting, generating, checking, or inspecting common content.",
            "It is especially useful when you want a straightforward utility without creating an account or installing a large desktop app first.",
          ],
        },
        {
          title: "Questions or Feedback",
          paragraphs: [
            "If you need to report a problem, ask a site-related question, or reach out about accessibility, privacy, or business matters, use the public contact details on the contact page.",
            "You can also review the privacy policy, terms of use, and disclaimer pages for more information about how the site is run and what to expect from its tools.",
          ],
        },
      ]}
    />
  );
}
