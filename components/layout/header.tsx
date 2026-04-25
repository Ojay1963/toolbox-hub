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

  return (
    <>
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
                  className={`mobile-app-shortcut ${
                    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("#")[0]))
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
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
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
