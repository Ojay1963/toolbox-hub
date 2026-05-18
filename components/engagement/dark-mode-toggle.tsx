"use client";

import { useEngagement } from "./engagement-provider";

export function DarkModeToggle({ className = "" }: { className?: string }) {
  const { darkMode, toggleDarkMode, mounted } = useEngagement();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Light mode" : "Dark mode"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] ${className}`}
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {darkMode ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 transition-transform duration-300" style={{ transform: "rotate(0deg)" }}>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 transition-transform duration-300" style={{ transform: "rotate(20deg)" }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
