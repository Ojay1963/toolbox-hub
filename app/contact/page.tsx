import Link from "next/link";
import { buildMetadata, siteMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Toolbox Hub for bug reports, accessibility feedback, business inquiries, privacy requests, and legal notices.",
  pathname: "/contact",
  keywords: ["contact toolbox hub", "tools website contact", "support contact"],
});

const contactTopics = [
  "Broken tool reports or output issues",
  "Accessibility concerns and usability feedback",
  "Incorrect page copy, metadata, or instructions",
  "Partnership, licensing, or business inquiries",
  "Abuse, security, or legal notices",
];

export default function ContactPage() {
  const contactEmail = siteMetadata.contactEmail;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
          Contact
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Contact Toolbox Hub</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
          Use this page to contact Toolbox Hub about broken tools, accessibility issues, privacy questions,
          business inquiries, or legal notices. Including the tool name, page URL, browser, and a short
          description of the issue will help us investigate more quickly.
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-7 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black tracking-tight">What to contact the site about</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {contactTopics.map((topic) => (
              <li key={topic} className="rounded-2xl bg-stone-50 px-4 py-3">
                {topic}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            If you report a problem, include the tool name, the page URL, the browser/device used,
            and a short explanation of what happened. That makes it much easier to reproduce and fix
            the issue.
          </p>
        </section>

        <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-7 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black tracking-tight">Contact details</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {contactEmail ? (
              <p>
                Email:{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-semibold text-[color:var(--primary)] underline-offset-4 hover:underline"
                >
                  {contactEmail}
                </a>
              </p>
            ) : (
              <p>
                Support, business, privacy, and legal requests are handled by email.
              </p>
            )}
            <p>
              Response times can vary depending on request volume and the type of issue, but accessibility,
              security, abuse, and legal reports should include enough context for prompt triage.
            </p>
          </div>
          <div className="mt-6 rounded-3xl bg-stone-50 p-5">
            <h3 className="text-lg font-bold tracking-tight">Useful links</h3>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
              <Link href="/about" className="block transition hover:text-[color:var(--primary)]">
                About Toolbox Hub
              </Link>
              <Link href="/privacy-policy" className="block transition hover:text-[color:var(--primary)]">
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" className="block transition hover:text-[color:var(--primary)]">
                Terms of Use
              </Link>
              <Link href="/disclaimer" className="block transition hover:text-[color:var(--primary)]">
                Disclaimer
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
