type AdSlotFormat = "banner" | "leaderboard" | "rectangle" | "sidebar";

const formatClasses: Record<AdSlotFormat, string> = {
  banner: "min-h-[110px] sm:min-h-[120px]",
  leaderboard: "min-h-[130px] sm:min-h-[150px]",
  rectangle: "min-h-[220px] sm:min-h-[250px]",
  sidebar: "min-h-[260px] sm:min-h-[300px]",
};

const formatLabels: Record<AdSlotFormat, string> = {
  banner: "Advertisement",
  leaderboard: "Advertisement",
  rectangle: "Advertisement",
  sidebar: "Advertisement",
};

export function AdPlaceholder({
  slot,
  label,
  format = "banner",
  className = "",
}: {
  slot: string;
  label?: string;
  format?: AdSlotFormat;
  className?: string;
}) {
  return (
    <aside
      aria-label={label ?? formatLabels[format]}
      data-ad-slot={slot}
      className={`rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/80 p-5 text-center shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)] ${formatClasses[format]} ${className}`.trim()}
    >
      <div className="flex h-full min-h-full flex-col items-center justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
          {label ?? formatLabels[format]}
        </p>
      </div>
    </aside>
  );
}
