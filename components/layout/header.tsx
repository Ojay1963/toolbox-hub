import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface-strong)]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Go to Toolbox Hub homepage">
            <div className="rounded-2xl bg-[color:var(--primary)] px-3 py-2 text-sm font-bold text-white">
              TH
            </div>
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
            <Link href="/#search-tools" className="transition hover:text-[color:var(--primary)]">
              Search
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
              href="/category/text-tools"
              className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
            >
              Browse categories
            </Link>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:hidden">
          <Link
            href="/"
            className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Home
          </Link>
          <Link
            href="/tools"
            className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Tools
          </Link>
          <Link
            href="/#search-tools"
            className="rounded-full bg-[color:var(--primary)] px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            Search
          </Link>
          <Link
            href="/category/text-tools"
            className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Browse categories
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Contact
          </Link>
        </div>
        <div className="mt-4 lg:hidden">
          <details className="rounded-2xl border border-[color:var(--border)] bg-white/80 p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-[color:var(--foreground)]">
              Menu
            </summary>
            <nav aria-label="Mobile" className="mt-4 grid gap-2 text-sm text-[color:var(--muted)] sm:grid-cols-2">
              <Link
                href="/"
                className="rounded-2xl border border-[color:var(--border)] px-4 py-3 transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                Home
              </Link>
              <Link
                href="/tools"
                className="rounded-2xl border border-[color:var(--border)] px-4 py-3 transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                Tools
              </Link>
              <Link
                href="/#search-tools"
                className="rounded-2xl border border-[color:var(--border)] px-4 py-3 transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                Search tools
              </Link>
              <Link
                href="/category/text-tools"
                className="rounded-2xl border border-[color:var(--border)] px-4 py-3 transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                Browse categories
              </Link>
              <Link
                href="/about"
                className="rounded-2xl border border-[color:var(--border)] px-4 py-3 transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                About
              </Link>
              <Link
                href="/blog"
                className="rounded-2xl border border-[color:var(--border)] px-4 py-3 transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                Guides
              </Link>
              <Link
                href="/contact"
                className="rounded-2xl border border-[color:var(--border)] px-4 py-3 transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                Contact
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
