"use client";

import { useEffect } from "react";

export function AnalyticsHook() {
  useEffect(() => {
    const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER?.trim().toLowerCase();

    // Hook point for future lightweight analytics providers such as Plausible or PostHog.
    // Keeping this as a no-op avoids shipping tracking code before a real provider is chosen.
    if (!provider || provider === "none") {
      return;
    }
  }, []);

  return null;
}
