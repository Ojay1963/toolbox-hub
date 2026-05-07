"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import siteMark from "@/components/images/Tools-hub-favicorn.png";

export function Header() {
  const pathname = usePathname();
  const mobilePrimaryNav = [
    { href: "/", label: "Home" },
    { href: "/tools", label: "Tools" },
    { href: "/tools#browse-categories", label: "Explore" },
  ];
  const mobileBottomNav = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/tools", label: "Tools", icon: "grid" },
    { href: "/#search-tools", label: "Search", icon: "search" },
    { href: "/blog", label: "Guides", icon: "spark" },
    { href: "/contact", label: "Contact", icon: "user" },
  ] as const;

  const pageTitle = pathname.startsWith("/tools/")
    ? "Tool workspace"
    : pathname.startsWith("/tools")
      ? "Tool directory"
      : pathname.startsWith("/category/")
        ? "Category view"
        : pathname.startsWith("/blog")
          ? "Guides"
          : pathname.startsWith("/contact")
            ? "Contact"
            : pathname.startsWith("/about")
              ? "About"
              : "Home";

  const isNavActive = (href: string) => {
    const baseHref = href.split("#")[0];

    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/tools#browse-categories") {
      return pathname === "/tools" || pathname.startsWith("/category/") || pathname.startsWith("/tools/education");
    }

    return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface-strong)]/88 backdrop-blur">
        <div className="site-header-shell mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <Link href="/" className="site-header-brand flex min-w-0 items-center gap-3" aria-label="Go to Toolbox Hub homepage">
              <Image
                src={siteMark}
                alt="Toolbox Hub logo"
                sizes="(max-width: 640px) 46px, 96px"
                className="site-header-logo h-24 w-24 shrink-0 rounded-[1.35rem] border border-white/70 bg-white/90 object-contain p-2 shadow-[0_14px_30px_rgba(42,56,84,0.1)]"
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
              {[
                { href: "/", label: "Home" },
                { href: "/tools", label: "Tools" },
                { href: "/about", label: "About" },
                { href: "/blog", label: "Guides" },
                { href: "/contact", label: "Contact" },
              ].map((item) => {
                const isActive = isNavActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={item.href === "/" || item.href === "/tools" ? undefined : false}
                    aria-current={isActive ? "page" : undefined}
                    className={`transition ${
                      isActive
                        ? "font-semibold text-emerald-700"
                        : "hover:text-[color:var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="hidden justify-end lg:flex">
              <Link
                href="/tools#browse-categories"
                prefetch={false}
                aria-current={isNavActive("/tools#browse-categories") ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isNavActive("/tools#browse-categories")
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-[color:var(--border)] bg-white text-[color:var(--foreground)] hover:border-[color:var(--primary)]"
                }`}
              >
                Browse categories
              </Link>
            </div>
          </div>

          <div className="mobile-app-header mt-1 lg:hidden">
            <div className="mobile-app-status-bar">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
                  {pageTitle}
                </p>
                <p className="truncate text-sm text-[color:var(--muted)]">Touch-first browsing and quick actions</p>
              </div>
              <Link
                href="/#search-tools"
                prefetch={false}
                className="mobile-app-search-button"
                aria-label="Open tool search from the homepage"
              >
                Search
              </Link>
            </div>

            <nav aria-label="Mobile quick actions" className="mobile-app-shortcuts">
              {mobilePrimaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={item.href === "/" || item.href === "/tools" ? undefined : false}
                  aria-current={isNavActive(item.href) ? "page" : undefined}
                  className={`mobile-app-shortcut ${
                    isNavActive(item.href)
                      ? "mobile-app-shortcut-active"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <nav aria-label="Mobile app navigation" className="mobile-bottom-nav lg:hidden">
        {mobileBottomNav.map((item) => {
          const baseHref = item.href.split("#")[0];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : baseHref === "/"
                ? false
                : pathname === baseHref || pathname.startsWith(`${baseHref}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.href === "/" || item.href === "/tools" ? undefined : false}
              className={`mobile-bottom-nav-item ${isActive ? "mobile-bottom-nav-item-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="mobile-bottom-nav-icon" aria-hidden="true">
                {item.icon === "home" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3.75 10.5 12 4l8.25 6.5v8.25a1.5 1.5 0 0 1-1.5 1.5h-3.75V14.25h-6v6H5.25a1.5 1.5 0 0 1-1.5-1.5z" />
                  </svg>
                ) : item.icon === "grid" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="4" width="6" height="6" rx="1.25" />
                    <rect x="14" y="4" width="6" height="6" rx="1.25" />
                    <rect x="4" y="14" width="6" height="6" rx="1.25" />
                    <rect x="14" y="14" width="6" height="6" rx="1.25" />
                  </svg>
                ) : item.icon === "search" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="5.5" />
                    <path d="m16 16 4.25 4.25" />
                  </svg>
                ) : item.icon === "spark" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="m12 3 1.7 4.97L18.5 9.7l-4.8 1.73L12 16.4l-1.7-4.97L5.5 9.7l4.8-1.73z" />
                    <path d="m18 15 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
                    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                  </svg>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
