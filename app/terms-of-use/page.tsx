import { StaticPage } from "@/components/content/static-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description:
    "Read the general terms of use for Toolbox Hub, including acceptable use, availability, intellectual property, and limits of liability for a free online tools website.",
  pathname: "/terms-of-use",
  keywords: ["terms of use", "toolbox hub terms", "free online tools terms"],
});

export default function TermsOfUsePage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Terms of Use"
      intro="These Terms of Use explain the basic rules for using Toolbox Hub. By using the site, you agree to use it lawfully, respectfully, and in line with the purpose of each page."
      sections={[
        {
          title: "Using the Site",
          paragraphs: [
            "Toolbox Hub is provided as a free online tools website. You may use the site for personal, educational, editorial, or general business tasks so long as your use is lawful and does not interfere with the service for others.",
            "You agree not to misuse the site through scraping that causes harm, abusive automation, denial-of-service attempts, malicious file uploads, exploit attempts, or requests designed to bypass technical restrictions.",
          ],
        },
        {
          title: "Tool Scope and Accuracy",
          paragraphs: [
            "The site includes a range of tools for different tasks. Some pages handle simple formatting or conversion, while others depend on browser support, outside services, or the quality of the file or text you provide.",
            "You are responsible for reviewing outputs before relying on them for legal, financial, medical, security, or compliance-sensitive decisions. Toolbox Hub aims to describe tools clearly, but it cannot guarantee that every result will be complete or suitable for every purpose.",
          ],
        },
        {
          title: "Files, Content, and Responsibility",
          paragraphs: [
            "You are responsible for the files, text, URLs, and other data you submit. Do not upload or process content that you do not have the right to use.",
            "You should not use the site to handle illegal material, malware, confidential data you are not authorized to process, or content that would create unreasonable operational or legal risk for the operator.",
          ],
        },
        {
          title: "Intellectual Property",
          paragraphs: [
            "The site design, written content, branding, tool arrangement, and code remain the property of the site operator or their licensors unless a specific asset is stated otherwise.",
            "Using the public tools does not transfer ownership of the site itself or grant permission to copy the entire service, republish the content as your own, or remove attribution where it is legally required.",
          ],
        },
        {
          title: "Availability and Changes",
          paragraphs: [
            "Because the site depends on software, hosting, and in some cases outside services, any tool may change, become temporarily unavailable, or be removed.",
            "Toolbox Hub may update tool behavior, page copy, limits, or these terms as the site changes over time.",
          ],
        },
        {
          title: "Disclaimer of Warranties and Liability",
          paragraphs: [
            'The site is provided on an "as is" and "as available" basis without guarantees of uninterrupted service, perfect output fidelity, or suitability for every purpose.',
            "To the extent allowed by law, Toolbox Hub is not liable for losses arising from site downtime, incorrect outputs, unavailable outside services, file corruption, or decisions made based on tool results.",
          ],
        },
      ]}
    />
  );
}
