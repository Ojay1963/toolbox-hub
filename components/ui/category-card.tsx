import Link from "next/link";
import type { CategoryDefinition } from "@/lib/tools";

type CategoryCardInput = Pick<CategoryDefinition, "name" | "description"> & {
  slug: string;
};

export function CategoryCard({
  category,
  href,
  badgeLabel = "Browse tools",
  ctaLabel = "Explore category",
}: {
  category: CategoryCardInput;
  href?: string;
  badgeLabel?: string;
  ctaLabel?: string;
}) {
  return (
    <Link
      href={href ?? `/category/${category.slug}#tools-list`}
      className="app-panel group rounded-3xl p-6 transition hover:-translate-y-1 hover:border-[color:var(--primary)]/35 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold tracking-tight">{category.name}</h3>
        <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-xs font-semibold text-[color:var(--primary-dark)]">
          {badgeLabel}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{category.description}</p>
      <p className="mt-4 text-sm font-semibold text-[color:var(--accent)] transition group-hover:translate-x-0.5">
        {ctaLabel}
      </p>
    </Link>
  );
}
