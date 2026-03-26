import Image from "next/image";
import Link from "next/link";
import siteMark from "@/components/images/Tools-hub-favicorn.png";
import { getPublicContactEmail } from "@/lib/seo";
import { categories, getPopularTools } from "@/lib/tools";

export function Footer() {
  const contactEmail = getPublicContactEmail();
  const quickLinks = getPopularTools(6);
  const currentYear = new Date().getFullYear();
  const siteLinks = [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Guides" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-use", label: "Terms of Use" },
    { href: "/disclaimer", label: "Disclaimer" },
  ];

  return (
    <footer className="border-t border-[color:var(--border)] bg-white/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src={siteMark}
              alt="Toolbox Hub logo"
              className="h-16 w-16 shrink-0 object-contain"
            />
            <h2 className="text-xl font-bold tracking-tight">Toolbox Hub</h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
            Toolbox Hub is a public website for free online tools, practical guides, and clear help pages for everyday digital tasks.
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            The site is designed to stay fast, mobile-friendly, and easy to understand, with public pages for contact, privacy, terms, and general site information.
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            Contact:{" "}
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="font-semibold text-[color:var(--primary)] underline-offset-4 hover:underline">
                {contactEmail}
              </a>
            ) : (
              <span className="font-semibold text-[color:var(--foreground)]">Contact email unavailable</span>
            )}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--primary-dark)]">
            Categories
          </h3>
          <nav aria-label="Footer categories" className="mt-4 grid grid-cols-2 gap-3 text-sm text-[color:var(--muted)]">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="transition hover:text-[color:var(--primary)]"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--primary-dark)]">
            Site
          </h3>
          <nav aria-label="Footer site links" className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            {siteLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block transition hover:text-[color:var(--primary)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--primary-dark)]">
            Popular tools
          </h3>
          <nav aria-label="Footer popular tools" className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            {quickLinks.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="block transition hover:text-[color:var(--primary)]"
              >
                {tool.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="border-t border-[color:var(--border)]/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-[color:var(--muted)] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>{currentYear} Toolbox Hub. Free online tools with clear help and public site pages.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="transition hover:text-[color:var(--primary)]">
              Contact
            </Link>
            <Link href="/privacy-policy" className="transition hover:text-[color:var(--primary)]">
              Privacy
            </Link>
            <Link href="/" className="transition hover:text-[color:var(--primary)]">
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
