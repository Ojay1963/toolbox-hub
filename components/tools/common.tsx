"use client";

import { useState } from "react";

export const panelClass = "rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-sm";
export const inputClass =
  "w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3.5 text-base outline-none transition focus:border-[color:var(--primary)] sm:text-sm";
export const textareaClass = `${inputClass} min-h-44`;
export const buttonClass =
  "rounded-2xl bg-[color:var(--primary)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButtonClass =
  "rounded-2xl border border-[color:var(--border)] bg-white px-5 py-3.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[color:var(--foreground)]">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-[color:var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-stone-50 p-4 text-sm text-[color:var(--muted)]">
      <p className="font-semibold text-[color:var(--foreground)]">{title}</p>
      <p className="mt-2 leading-7">{description}</p>
    </div>
  );
}

export function Notice({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "error" | "success";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-stone-200 bg-stone-50 text-stone-700";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClass}`}>{children}</div>;
}

export function OutputBlock({
  title,
  value,
  multiline = true,
}: {
  title: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
        {title}
      </p>
      {multiline ? (
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-sm text-slate-700">
          {value}
        </pre>
      ) : (
        <p className="mt-2 break-words text-sm text-slate-700">{value}</p>
      )}
    </div>
  );
}

export function ToolShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className={panelClass}>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">{description}</p>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function useCopyToClipboard() {
  const [copied, setCopied] = useState<string>("");

  async function copy(label: string, value: string) {
    if (!value) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
      return true;
    } catch {
      return false;
    }
  }

  return { copied, copy };
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024)} KB`;
  return `${formatNumber(bytes / (1024 * 1024))} MB`;
}
