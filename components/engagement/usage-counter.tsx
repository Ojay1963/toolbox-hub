"use client";

import { useEffect, useState } from "react";
import { formatUsageCount } from "@/lib/engagement-store";
import { useEngagement } from "./engagement-provider";

export function UsageCounter({ slug }: { slug: string }) {
  const { getUsageCount, mounted } = useEngagement();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!mounted) return;
    setCount(getUsageCount(slug));
  }, [mounted, slug, getUsageCount]);

  if (count === null) return null;

  return (
    <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">
      <span className="text-[color:var(--primary)]">{formatUsageCount(count)}</span> uses
    </p>
  );
}
