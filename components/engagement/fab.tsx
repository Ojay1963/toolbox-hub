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
      icon: "★",
      label: "My Favourites",
      count: favourites.length,
      href: "/profile#favourites",
    },
    {
      icon: "🕐",
      label: "Recent Tools",
      count: recentTools.length,
      href: "/#recent-tools",
    },
    {
      icon: "🔥",
      label: "My Streak",
      count: streak,
      href: "/profile",
    },
    {
      icon: "🔍",
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
                    className="flex items-center gap-3 rounded-[1.3rem] border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)] shadow-md transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
                  >
                    <span className="text-base leading-none">{item.icon}</span>
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
              ? "bg-[color:var(--foreground)] text-white"
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
