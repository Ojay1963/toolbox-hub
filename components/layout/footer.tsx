import Link from "next/link";
import { categories, getPopularTools } from "@/lib/tools";

export function Footer() {
  const quickLinks = getPopularTools(6);

  return (
    <footer className="border-t border-[color:var(--border)] bg-white/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr] lg:px-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Toolbox Hub</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
            A clean collection of practical browser-side tools for PDFs, images, text,
            developer workflows, calculations, generators, and converters.
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            No accounts, no clutter, and no deceptive claims. Each page is built to stay fast,
            mobile-friendly, and easy to extend as new tools are added.
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
          <p>Built for fast online utility, honest scope notes, and strong internal linking.</p>
          <Link href="/" className="transition hover:text-[color:var(--primary)]">
            Back to homepage
          </Link>
        </div>
      </div>
    </footer>
  );
}
