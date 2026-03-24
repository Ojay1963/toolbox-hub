import Link from "next/link";
import { categories, getCategory, type ToolCategorySlug } from "@/lib/tools";

export function CategorySidebar({
  activeCategory,
  title = "Browse Categories",
  description = "Move between sections quickly to find the tool that fits your task.",
}: {
  activeCategory: ToolCategorySlug;
  title?: string;
  description?: string;
}) {
  const currentCategory = getCategory(activeCategory);

  return (
    <>
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-5 shadow-sm lg:hidden">
        <details>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[color:var(--foreground)]">
            <span className="min-w-0 truncate">{currentCategory?.name ?? "Browse Categories"}</span>
            <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--muted)]">
              Open menu
            </span>
          </summary>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{description}</p>
          <nav aria-label="Category sidebar mobile" className="mt-4 grid gap-2">
            {categories.map((category) => {
              const isActive = category.slug === activeCategory;
              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[color:var(--primary)] text-white"
                      : "border border-[color:var(--border)] bg-stone-50 text-[color:var(--foreground)] hover:border-[color:var(--primary)]"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </details>
      </section>

      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            {title}
          </p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{description}</p>
          <nav aria-label="Category sidebar" className="mt-5 space-y-2">
            {categories.map((category) => {
              const isActive = category.slug === activeCategory;
              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[color:var(--primary)] text-white shadow-sm"
                      : "border border-[color:var(--border)] bg-stone-50 text-[color:var(--foreground)] hover:border-[color:var(--primary)]"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
