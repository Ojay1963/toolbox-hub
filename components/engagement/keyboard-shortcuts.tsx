"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEngagement } from "./engagement-provider";

const SHORTCUTS = [
  { keys: ["/"], description: "Focus search bar" },
  { keys: ["Escape"], description: "Close any open modal or dropdown" },
  { keys: ["Ctrl", "D"], description: "Toggle dark mode" },
  { keys: ["Ctrl", "B"], description: "Go to My Favourites" },
  { keys: ["Ctrl", "H"], description: "Go to homepage" },
  { keys: ["?"], description: "Show this shortcuts guide" },
];

export function KeyboardShortcuts() {
  const { toggleDarkMode } = useEngagement();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (isInput) return;

      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const search = document.querySelector<HTMLInputElement>('input[type="search"]');
        if (search) search.focus();
        return;
      }

      if (e.key === "?" && !e.ctrlKey) {
        setOpen((v) => !v);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        router.push("/profile#favourites");
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        router.push("/");
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleDarkMode, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-[color:var(--foreground)]/30 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-[2rem] border border-[color:var(--border)] bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-[color:var(--foreground)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
              <rect x="2" y="6" width="20" height="13" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" strokeLinecap="round" />
            </svg>
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[color:var(--border)]">
            {SHORTCUTS.map((s) => (
              <tr key={s.description}>
                <td className="py-2.5 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-2 py-0.5 font-mono text-xs text-[color:var(--foreground)]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </td>
                <td className="py-2.5 text-[color:var(--muted)]">{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-[color:var(--muted)]">Press <kbd className="rounded border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-1.5 py-0.5 font-mono">Esc</kbd> or click outside to close.</p>
      </div>
    </div>
  );
}
