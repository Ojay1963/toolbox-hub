// localStorage-based engagement utilities. All keys prefixed with tbh_ to avoid conflicts.

export const STORAGE_KEYS = {
  recentTools: "tbh_recent_tools",
  favourites: "tbh_favourites",
  streak: "tbh_streak",
  lastVisitDate: "tbh_last_visit_date",
  badges: "tbh_badges",
  usageCounts: "tbh_usage_counts",
  ratings: "tbh_ratings",
  ratingVoteCounts: "tbh_rating_vote_counts",
  welcomeDismissed: "tbh_welcome_dismissed",
  darkMode: "tbh_dark_mode",
  sessionTools: "tbh_session_tools",
  sessionDate: "tbh_session_date",
  uniqueToolsUsed: "tbh_unique_tools_used",
} as const;

export function safeLsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeLsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota exceeded, etc.)
  }
}

// Deterministic usage seed per slug so all devices show the same base count.
const USAGE_SEEDS: Record<string, number> = {
  "image-compressor": 1_200_000,
  "pdf-merge": 890_000,
  "json-formatter": 650_000,
  "qr-code-generator": 420_000,
  "word-counter": 380_000,
};

export function getInitialUsageCount(slug: string): number {
  const seed = USAGE_SEEDS[slug];
  if (seed !== undefined) return seed;
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) + hash) ^ slug.charCodeAt(i);
    hash >>>= 0;
  }
  return 50_000 + (hash % 250_001);
}

const RATING_SEEDS: Record<string, { up: number; down: number }> = {
  "image-compressor": { up: 1180, down: 48 },
  "pdf-merge": { up: 876, down: 35 },
  "json-formatter": { up: 643, down: 22 },
  "qr-code-generator": { up: 412, down: 18 },
  "word-counter": { up: 371, down: 15 },
};

export function getInitialRatingCounts(slug: string): { up: number; down: number } {
  if (RATING_SEEDS[slug]) return RATING_SEEDS[slug];
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) + hash) ^ slug.charCodeAt(i);
    hash >>>= 0;
  }
  const up = 50 + (hash % 501);
  const down = Math.max(1, Math.floor(up * 0.04));
  return { up, down };
}

export function formatUsageCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  return count.toLocaleString();
}

export function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function computeStreak(
  lastVisitDate: string,
  currentStreak: number,
): { streak: number; lastVisitDate: string } {
  const today = getDateString(new Date());
  if (!lastVisitDate) return { streak: 1, lastVisitDate: today };
  if (lastVisitDate === today) return { streak: Math.max(1, currentStreak), lastVisitDate };
  const diffMs = new Date(today).getTime() - new Date(lastVisitDate).getTime();
  const diffDays = Math.round(diffMs / 86_400_000);
  if (diffDays === 1) return { streak: currentStreak + 1, lastVisitDate: today };
  return { streak: 1, lastVisitDate: today };
}

// Returns ms until local midnight for countdown timers.
export function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

// Deterministic day index — same value for all users on the same day.
export function getTodayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return dayOfYear + now.getFullYear() * 366;
}

export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const ALL_BADGES: BadgeDef[] = [
  { id: "first-tool", emoji: "🥉", name: "First Tool Used", description: "Used any tool for the first time" },
  { id: "power-user", emoji: "🥈", name: "Power User", description: "Used 5 different tools" },
  { id: "toolbox-pro", emoji: "🥇", name: "Toolbox Pro", description: "Used 10 different tools" },
  { id: "on-fire", emoji: "🔥", name: "On Fire", description: "7-day visit streak" },
  { id: "speed-run", emoji: "⚡", name: "Speed Run", description: "Used 3 tools in one session" },
];

export function checkNewBadges(
  uniqueToolsUsed: string[],
  sessionTools: string[],
  streak: number,
  existingBadges: string[],
): string[] {
  const existing = new Set(existingBadges);
  const newOnes: string[] = [];
  if (!existing.has("first-tool") && uniqueToolsUsed.length >= 1) newOnes.push("first-tool");
  if (!existing.has("power-user") && uniqueToolsUsed.length >= 5) newOnes.push("power-user");
  if (!existing.has("toolbox-pro") && uniqueToolsUsed.length >= 10) newOnes.push("toolbox-pro");
  if (!existing.has("on-fire") && streak >= 7) newOnes.push("on-fire");
  if (!existing.has("speed-run") && sessionTools.length >= 3) newOnes.push("speed-run");
  return newOnes;
}
