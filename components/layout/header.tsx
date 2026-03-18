import Link from "next/link";
import { categories } from "@/lib/tools";

export function Header() {
  return (
    <header className="border-b border-[color:var(--border)] bg-[color:var(--surface-strong)]/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-[color:var(--primary)] px-3 py-2 text-sm font-bold text-white">
              TH
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Toolbox Hub</p>
              <p className="text-sm text-[color:var(--muted)]">100 free browser-first tools</p>
            </div>
          </Link>
          <nav className="hidden flex-wrap items-center gap-4 text-sm text-[color:var(--muted)] lg:flex">
            <Link href="/#search-tools" className="transition hover:text-[color:var(--primary)]">
              Search
            </Link>
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
        <div className="mt-4 lg:hidden">
          <details className="rounded-2xl border border-[color:var(--border)] bg-white/80 p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-[color:var(--foreground)]">
              Browse tools and categories
            </summary>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-[color:var(--muted)]">
              <Link
                href="/#search-tools"
                className="rounded-full border border-[color:var(--border)] px-3 py-2 transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                Search tools
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="rounded-full border border-[color:var(--border)] px-3 py-2 transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
