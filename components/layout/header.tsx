import Image from "next/image";
import Link from "next/link";
import siteMark from "@/components/images/Tools-hub-favicorn.png";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface-strong)]/95 backdrop-blur">
      <div className="site-header-shell mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="site-header-brand flex min-w-0 items-center gap-3" aria-label="Go to Toolbox Hub homepage">
            <Image
              src={siteMark}
              alt="Toolbox Hub logo"
              className="site-header-logo h-24 w-24 shrink-0 object-contain"
              priority
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-tight">Toolbox Hub</p>
              <p className="truncate text-sm text-[color:var(--muted)]">Free online tools</p>
            </div>
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center justify-center gap-6 text-sm text-[color:var(--muted)] lg:flex"
          >
            <Link href="/" className="transition hover:text-[color:var(--primary)]">
              Home
            </Link>
            <Link href="/tools" className="transition hover:text-[color:var(--primary)]">
              Tools
            </Link>
            <Link href="/about" className="transition hover:text-[color:var(--primary)]">
              About
            </Link>
            <Link href="/blog" className="transition hover:text-[color:var(--primary)]">
              Guides
            </Link>
            <Link href="/contact" className="transition hover:text-[color:var(--primary)]">
              Contact
            </Link>
          </nav>
          <div className="hidden justify-end lg:flex">
            <Link
              href="/tools#browse-categories"
              className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
            >
              Browse categories
            </Link>
          </div>
        </div>
        <nav aria-label="Mobile primary" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
          <Link
            href="/"
            className="site-action-link rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Home
          </Link>
          <Link
            href="/tools"
            className="site-action-link rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Tools
          </Link>
          <Link
            href="/tools#browse-categories"
            className="site-action-link rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Browse categories
          </Link>
          <Link
            href="/contact"
            className="site-action-link rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Contact
          </Link>
          <Link
            href="/about"
            className="site-action-link rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            About
          </Link>
          <Link
            href="/blog"
            className="site-action-link rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Guides
          </Link>
        </nav>
      </div>
    </header>
  );
}
