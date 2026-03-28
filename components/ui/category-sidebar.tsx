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
      <section className="mobile-category-sidebar min-w-0 w-full max-w-full overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-5 shadow-sm lg:hidden">
        <div className="mobile-category-sidebar-header flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              {currentCategory?.name ?? "Browse Categories"}
            </p>
            <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
          </div>
          <Link
            href="#tools-list"
            className="mobile-sidebar-cta rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
          >
            View tools
          </Link>
        </div>
        <nav aria-label="Category sidebar mobile" className="mobile-wrap-chip-row mt-4 flex w-full max-w-full gap-2 pb-1">
          {categories.map((category) => {
            const isActive = category.slug === activeCategory;
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}#tools-list`}
                aria-current={isActive ? "page" : undefined}
                className={`mobile-category-chip flex min-w-0 flex-1 basis-[calc(50%-0.25rem)] items-center justify-center rounded-full px-4 py-2.5 text-center text-sm font-medium transition sm:basis-[calc(33.333%-0.35rem)] ${
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
                  href={`/category/${category.slug}#tools-list`}
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
