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
      intro="This Privacy Policy explains how Toolbox Hub handles information when you browse the site or use its tools. The aim is to collect only what is reasonably needed to operate the website, protect the service, and complete the task you request."
      sections={[
        {
          title: "Information We Process",
          paragraphs: [
            "Most tools on the site do not require an account. When you use those tools, the content you enter or upload is used only to produce the result you requested.",
            "Some tools use online processing or trusted service providers for tasks such as document conversion, website analysis, or image handling. In those cases, the uploaded file or requested URL is used only to complete the action you chose.",
          ],
          bullets: [
            "We do not provide user accounts, public profiles, or persistent dashboards.",
            "We do not intentionally ask for sensitive personal information to use the core tool directory.",
            "When a tool uses outside processing, the page explains that in plain language.",
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
            "The site may also apply caching, request limits, and file-size controls to keep the service reliable and available for visitors.",
          ],
        },
        {
          title: "Service Providers",
          paragraphs: [
            "Some tools may rely on external providers for features such as OCR, website performance analysis, background removal, screenshots, exchange rates, or document processing.",
            "When an outside provider is involved, the provider may process the request data needed to perform the task. Their own privacy and retention practices may also apply.",
          ],
        },
        {
          title: "Cookies, Analytics, and Advertising",
          paragraphs: [
            "The site does not depend on user accounts to use the tools. Basic cookies or similar technical storage may still be used where needed for hosting, caching, security, analytics, or advertising.",
            "If advertising or analytics services are used, they may collect standard website data such as page views, device information, or ad interaction data according to their own policies and applicable law.",
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
