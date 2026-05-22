"use client";

/**
 * Defers framer-motion, canvas-confetti, and other heavy engagement overlay
 * code out of the critical path. ssr:false is only valid inside Client Components
 * (App Router rule), so this thin wrapper exists purely to host the dynamic imports.
 *
 * Result: framer-motion is excluded from the initial HTML bundle and only loaded
 * after the page is interactive, cutting ~50 KiB of unused JS and the 500ms+
 * main-thread long task reported by PageSpeed Insights.
 */
import dynamic from "next/dynamic";

const FAB = dynamic(() => import("./fab").then((m) => m.FAB), { ssr: false });
const KeyboardShortcuts = dynamic(() => import("./keyboard-shortcuts").then((m) => m.KeyboardShortcuts), { ssr: false });
const ToastContainer = dynamic(() => import("./toast-container").then((m) => m.ToastContainer), { ssr: false });

export function LazyEngagementOverlays() {
  return (
    <>
      <ToastContainer />
      <FAB />
      <KeyboardShortcuts />
    </>
  );
}
