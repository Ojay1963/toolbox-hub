"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEngagement } from "./engagement-provider";

export function FAB() {
  const { favourites, recentTools, streak, mounted } = useEngagement();
  const [open, setOpen] = useState(false);

  if (!mounted) return null;

  const items = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
        </svg>
      ),
      label: "My Favourites",
      count: favourites.length,
      href: "/profile#favourites",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
        </svg>
      ),
      label: "Recent Tools",
      count: recentTools.length,
      href: "/#recent-tools",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.545 3.75 3.75 0 0 1 3.255 3.717Z" clipRule="evenodd" />
        </svg>
      ),
      label: "My Streak",
      count: streak,
      href: "/profile",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
        </svg>
      ),
      label: "Search Tools",
      count: null,
      href: "/#search-tools",
    },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[89]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="fixed bottom-24 right-4 z-[90] flex flex-col items-end gap-2 lg:bottom-8 lg:right-6">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", stiffness: 480, damping: 34 }}
              className="flex flex-col gap-2 pb-2"
            >
              {[...items].reverse().map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 480, damping: 36 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-[1.3rem] border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)] shadow-md transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] dark:bg-slate-800 dark:shadow-slate-900/50"
                  >
                    <span className="flex items-center leading-none">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.count !== null && item.count > 0 && (
                      <span className="ml-auto rounded-full bg-[color:var(--soft)] px-2 py-0.5 text-xs font-bold text-[color:var(--primary-dark)]">
                        {item.count}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close quick actions" : "Open quick actions"}
          aria-expanded={open}
          whileTap={{ scale: 0.92 }}
          className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition ${
            open
              ? "bg-slate-700 text-white dark:bg-slate-600"
              : "bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-dark)]"
          }`}
        >
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            <path d="M12 5v14M5 12h14" />
          </motion.svg>
        </motion.button>
      </div>
    </>
  );
}
