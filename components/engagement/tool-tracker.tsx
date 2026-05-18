"use client";

import { useEffect } from "react";
import { useEngagement } from "./engagement-provider";

export function ToolTracker({ slug, name }: { slug: string; name: string }) {
  const { trackToolUse } = useEngagement();

  useEffect(() => {
    trackToolUse(slug, name);
  }, [slug, name, trackToolUse]);

  return null;
}
