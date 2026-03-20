import { StaticPage } from "@/components/content/static-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Read the privacy policy for Toolbox Hub, including how uploaded files, tool inputs, and third-party services may be handled.",
  pathname: "/privacy-policy",
  keywords: ["privacy policy", "toolbox hub privacy", "online tools privacy"],
});

export default function PrivacyPolicyPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This Privacy Policy explains how Toolbox Hub handles information when you browse the site or use its tools. The site is designed to collect only the information needed to operate the service."
      sections={[
        {
          title: "Information We Process",
          paragraphs: [
            "Most tools on the site do not require an account. When you use those tools, the content you enter or upload is used only to produce the result you requested.",
            "Some tools may rely on online processing or third-party services for tasks such as document conversion, OCR, website analysis, or image editing. In those cases, the uploaded file or requested URL is used only to complete the action you requested.",
          ],
          bullets: [
            "We do not provide user accounts, public profiles, or persistent dashboards.",
            "We do not intentionally ask for sensitive personal information to use the core tool directory.",
            "If a tool relies on a third-party service, the page should explain that clearly.",
          ],
        },
        {
          title: "Files, Text, and Tool Inputs",
          paragraphs: [
            "Uploaded files, pasted text, URLs, and other inputs are used only to generate the output requested by the tool. Some requests may be handled online or by a third-party service when needed to complete the tool action.",
            "Because the site includes tools for PDFs, images, text, developer tasks, and website checks, you should avoid uploading confidential, regulated, or highly sensitive material unless you are comfortable with how that tool works.",
          ],
        },
        {
          title: "Logs and Technical Data",
          paragraphs: [
            "Like most websites, the hosting platform or server infrastructure may collect basic operational logs such as IP address, request path, browser data, timestamps, and error details. That information is used for security, abuse prevention, uptime monitoring, and troubleshooting.",
            "The site may also apply caching, rate limiting, and file-size controls to keep the service reliable and protect expensive endpoints from abuse.",
          ],
        },
        {
          title: "Third-Party Services",
          paragraphs: [
            "Some tools may rely on external providers for features such as OCR, website performance analysis, background removal, screenshots, exchange rates, or document processing.",
            "When a third-party provider is involved, the provider may process the request data needed to perform the task. Their own privacy and retention practices will apply in addition to this site policy.",
          ],
        },
        {
          title: "Cookies and Tracking",
          paragraphs: [
            "The site does not depend on user accounts or behavioral tracking to use the tools. If analytics, advertising, or performance monitoring are enabled, this policy will be updated to identify the provider and explain the data scope clearly.",
            "Basic platform-level cookies or temporary technical storage may still be used where necessary for hosting, caching, or security purposes.",
          ],
        },
        {
          title: "Your Choices",
          paragraphs: [
            "You can choose not to upload files or submit URLs to tools that rely on online processing.",
            "If you need privacy-related contact or deletion information, use the public contact details listed on the contact page.",
          ],
        },
      ]}
    />
  );
}
