import { StaticPage } from "@/components/content/static-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Read the privacy policy for Toolbox Hub, including how browser-side tools, uploaded files, analytics-free usage, and server-assisted routes are handled.",
  pathname: "/privacy-policy",
  keywords: ["privacy policy", "toolbox hub privacy", "online tools privacy"],
});

export default function PrivacyPolicyPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This Privacy Policy explains how Toolbox Hub handles information when you browse the site or use its tools. The site is designed to favor local browser-side processing whenever practical and to avoid collecting more data than is needed to operate the service."
      sections={[
        {
          title: "Information We Process",
          paragraphs: [
            "Most tools on the site run in the browser and do not require an account. When you use those tools, the content you enter or upload is processed locally on your device and is not intentionally stored by the site operator.",
            "Some higher-value tools use server routes or third-party services to complete tasks such as document conversion, OCR, website analysis, or image processing. In those cases, the uploaded file or requested URL is processed only to complete the tool action you requested.",
          ],
          bullets: [
            "We do not provide user accounts, public profiles, or persistent dashboards.",
            "We do not intentionally ask for sensitive personal information to use the core tool directory.",
            "If a tool depends on a third-party service, the page should explain that scope honestly.",
          ],
        },
        {
          title: "Files, Text, and Tool Inputs",
          paragraphs: [
            "Uploaded files, pasted text, URLs, and other inputs are used only to generate the output requested by the tool. Files may be transmitted to a server route or an external service only when that specific tool requires it.",
            "Because the site includes utilities for PDFs, images, text, developer workflows, and internet checks, you should avoid uploading confidential, regulated, or highly sensitive material unless you fully understand the scope note shown on that tool page.",
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
            "Some tools may rely on external providers for capabilities that are not practical or reliable to perform entirely in the browser. Examples can include OCR, website performance analysis, background removal, screenshots, exchange rates, or document processing.",
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
            "You can choose not to upload files or submit URLs to tools that rely on server-side processing. For browser-first tools, you can usually complete the workflow without sending your data away from the device.",
            "If you need privacy-related contact or deletion information, use the public contact details listed on the contact page.",
          ],
        },
      ]}
    />
  );
}
