import Link from "next/link";

export type BreadcrumbItem = {
  name: string;
  href: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]"
    >
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;

        return (
          <span key={`${item.href}-${item.name}`} className="inline-flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {isCurrent ? (
              <span aria-current="page" className="text-[color:var(--foreground)]">
                {item.name}
              </span>
            ) : (
              <Link href={item.href} prefetch={false} className="transition hover:text-[color:var(--primary)]">
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
