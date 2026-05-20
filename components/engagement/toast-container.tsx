"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEngagement } from "./engagement-provider";

export function ToastContainer() {
  const { toasts, dismissToast } = useEngagement();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-24 right-4 z-[200] flex flex-col gap-3 lg:bottom-8 lg:right-6"
      style={{ maxWidth: "min(22rem, calc(100vw - 2rem))" }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={`relative flex flex-col gap-2 rounded-[1.4rem] px-4 py-3.5 shadow-lg ${
              toast.type === "badge"
                ? "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-200"
                : toast.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-200"
                  : "border border-[color:var(--border)] bg-white text-[color:var(--foreground)] dark:bg-slate-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <p className="flex-1 text-sm font-semibold leading-6">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="mt-0.5 shrink-0 text-[color:var(--muted)] opacity-60 hover:opacity-100"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                  <path d="M4.5 4.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
            </div>
            {toast.actions && toast.actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {toast.actions.map((action) =>
                  action.href ? (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="rounded-full border border-current/20 bg-white/60 px-3 py-1 text-xs font-semibold transition hover:bg-white/90 dark:bg-slate-800/60 dark:hover:bg-slate-700/80"
                    >
                      {action.label}
                    </Link>
                  ) : (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      className="rounded-full border border-current/20 bg-white/60 px-3 py-1 text-xs font-semibold transition hover:bg-white/90 dark:bg-slate-800/60 dark:hover:bg-slate-700/80"
                    >
                      {action.label}
                    </button>
                  ),
                )}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
