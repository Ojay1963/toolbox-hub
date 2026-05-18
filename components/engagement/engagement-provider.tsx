"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ALL_BADGES,
  STORAGE_KEYS,
  checkNewBadges,
  computeStreak,
  getDateString,
  getInitialRatingCounts,
  getInitialUsageCount,
  safeLsGet,
  safeLsSet,
} from "@/lib/engagement-store";

export interface ToastMessage {
  id: string;
  message: string;
  type?: "success" | "info" | "badge";
  actions?: { label: string; href?: string; onClick?: () => void }[];
}

interface EngagementCtx {
  recentTools: string[];
  clearRecentTools: () => void;

  favourites: string[];
  toggleFavourite: (slug: string) => void;
  isFavourite: (slug: string) => boolean;

  streak: number;
  badges: string[];

  ratings: Record<string, "up" | "down">;
  vote: (slug: string, type: "up" | "down") => void;
  getVoteCounts: (slug: string) => { up: number; down: number };

  usageCounts: Record<string, number>;
  getUsageCount: (slug: string) => number;

  welcomeDismissed: boolean;
  dismissWelcomeBanner: () => void;

  darkMode: boolean;
  toggleDarkMode: () => void;

  trackToolUse: (slug: string, name: string) => void;

  toasts: ToastMessage[];
  showToast: (
    msg: string,
    opts?: { type?: ToastMessage["type"]; actions?: ToastMessage["actions"] },
  ) => void;
  dismissToast: (id: string) => void;

  celebrate: (toolName: string) => void;

  mounted: boolean;
}

const Ctx = createContext<EngagementCtx | null>(null);

export function useEngagement(): EngagementCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEngagement must be used inside EngagementProvider");
  return ctx;
}

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, "up" | "down">>({});
  const [ratingVoteCounts, setRatingVoteCounts] = useState<
    Record<string, { up: number; down: number }>
  >({});
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [welcomeDismissed, setWelcomeDismissed] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const streakRef = useRef(0);
  const sessionToolsRef = useRef<string[]>([]);
  const uniqueToolsUsedRef = useRef<string[]>([]);

  const showToast = useCallback(
    (
      msg: string,
      opts?: { type?: ToastMessage["type"]; actions?: ToastMessage["actions"] },
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: ToastMessage = { id, message: msg, type: opts?.type, actions: opts?.actions };
      setToasts((prev) => [...prev.slice(-4), toast]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const recentRaw = safeLsGet<string[]>(STORAGE_KEYS.recentTools, []);
    const favsRaw = safeLsGet<string[]>(STORAGE_KEYS.favourites, []);
    const streakRaw = safeLsGet<number>(STORAGE_KEYS.streak, 0);
    const lastVisitRaw = safeLsGet<string>(STORAGE_KEYS.lastVisitDate, "");
    const badgesRaw = safeLsGet<string[]>(STORAGE_KEYS.badges, []);
    const ratingsRaw = safeLsGet<Record<string, "up" | "down">>(STORAGE_KEYS.ratings, {});
    const ratingCountsRaw = safeLsGet<Record<string, { up: number; down: number }>>(
      STORAGE_KEYS.ratingVoteCounts,
      {},
    );
    const usageRaw = safeLsGet<Record<string, number>>(STORAGE_KEYS.usageCounts, {});
    const welcomeRaw = safeLsGet<boolean>(STORAGE_KEYS.welcomeDismissed, false);
    const darkRaw = safeLsGet<boolean>(STORAGE_KEYS.darkMode, false);

    const today = getDateString(new Date());
    const sessionDateRaw = safeLsGet<string>(STORAGE_KEYS.sessionDate, "");
    const sessionToolsRaw =
      sessionDateRaw === today ? safeLsGet<string[]>(STORAGE_KEYS.sessionTools, []) : [];
    const uniqueRaw = safeLsGet<string[]>(STORAGE_KEYS.uniqueToolsUsed, []);

    const { streak: newStreak, lastVisitDate: newDate } = computeStreak(lastVisitRaw, streakRaw);

    setRecentTools(recentRaw);
    setFavourites(favsRaw);
    setStreak(newStreak);
    setBadges(badgesRaw);
    setRatings(ratingsRaw);
    setRatingVoteCounts(ratingCountsRaw);
    setUsageCounts(usageRaw);
    setWelcomeDismissed(welcomeRaw);
    setDarkMode(darkRaw);
    streakRef.current = newStreak;
    sessionToolsRef.current = sessionToolsRaw;
    uniqueToolsUsedRef.current = uniqueRaw;

    safeLsSet(STORAGE_KEYS.streak, newStreak);
    safeLsSet(STORAGE_KEYS.lastVisitDate, newDate);
    if (sessionDateRaw !== today) {
      safeLsSet(STORAGE_KEYS.sessionDate, today);
      safeLsSet(STORAGE_KEYS.sessionTools, []);
    }

    if (darkRaw) document.documentElement.classList.add("dark");

    // Award any badges earned by the streak update
    const earnedOnLoad = checkNewBadges(uniqueRaw, sessionToolsRaw, newStreak, badgesRaw);
    if (earnedOnLoad.length > 0) {
      const merged = [...badgesRaw, ...earnedOnLoad];
      setBadges(merged);
      safeLsSet(STORAGE_KEYS.badges, merged);
      earnedOnLoad.forEach((id, i) => {
        const badge = ALL_BADGES.find((b) => b.id === id);
        if (badge) {
          setTimeout(() => {
            showToast(`${badge.emoji} Badge Unlocked: ${badge.name}!`, { type: "badge" });
          }, 1500 + i * 800);
        }
      });
    }

    setMounted(true);
  }, [showToast]);

  const trackToolUse = useCallback(
    (slug: string, _name: string) => {
      setRecentTools((prev) => {
        const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 6);
        safeLsSet(STORAGE_KEYS.recentTools, next);
        return next;
      });

      setUsageCounts((prev) => {
        const base = prev[slug] ?? getInitialUsageCount(slug);
        const inc = 1 + Math.floor(Math.random() * 4);
        const next = { ...prev, [slug]: base + inc };
        safeLsSet(STORAGE_KEYS.usageCounts, next);
        return next;
      });

      if (!sessionToolsRef.current.includes(slug)) {
        sessionToolsRef.current = [...sessionToolsRef.current, slug];
        safeLsSet(STORAGE_KEYS.sessionTools, sessionToolsRef.current);
      }
      if (!uniqueToolsUsedRef.current.includes(slug)) {
        uniqueToolsUsedRef.current = [...uniqueToolsUsedRef.current, slug];
        safeLsSet(STORAGE_KEYS.uniqueToolsUsed, uniqueToolsUsedRef.current);
      }

      setBadges((prev) => {
        const newOnes = checkNewBadges(
          uniqueToolsUsedRef.current,
          sessionToolsRef.current,
          streakRef.current,
          prev,
        );
        if (newOnes.length === 0) return prev;
        const merged = [...prev, ...newOnes];
        safeLsSet(STORAGE_KEYS.badges, merged);
        newOnes.forEach((id, i) => {
          const badge = ALL_BADGES.find((b) => b.id === id);
          if (badge) {
            setTimeout(
              () => showToast(`${badge.emoji} Badge Unlocked: ${badge.name}!`, { type: "badge" }),
              500 + i * 600,
            );
          }
        });
        return merged;
      });
    },
    [showToast],
  );

  const toggleFavourite = useCallback((slug: string) => {
    setFavourites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      safeLsSet(STORAGE_KEYS.favourites, next);
      return next;
    });
  }, []);

  const isFavourite = useCallback(
    (slug: string) => favourites.includes(slug),
    [favourites],
  );

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
    safeLsSet(STORAGE_KEYS.recentTools, []);
  }, []);

  const dismissWelcomeBanner = useCallback(() => {
    setWelcomeDismissed(true);
    safeLsSet(STORAGE_KEYS.welcomeDismissed, true);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      safeLsSet(STORAGE_KEYS.darkMode, next);
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  const vote = useCallback((slug: string, type: "up" | "down") => {
    setRatings((prev) => {
      if (prev[slug]) return prev;
      const next = { ...prev, [slug]: type };
      safeLsSet(STORAGE_KEYS.ratings, next);
      return next;
    });
    setRatingVoteCounts((prev) => {
      const current = prev[slug] ?? getInitialRatingCounts(slug);
      const next = {
        ...prev,
        [slug]: {
          up: current.up + (type === "up" ? 1 : 0),
          down: current.down + (type === "down" ? 1 : 0),
        },
      };
      safeLsSet(STORAGE_KEYS.ratingVoteCounts, next);
      return next;
    });
  }, []);

  const getVoteCounts = useCallback(
    (slug: string) => ratingVoteCounts[slug] ?? getInitialRatingCounts(slug),
    [ratingVoteCounts],
  );

  const getUsageCount = useCallback(
    (slug: string) => usageCounts[slug] ?? getInitialUsageCount(slug),
    [usageCounts],
  );

  const celebrate = useCallback(
    async (toolName: string) => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch {
        // canvas-confetti unavailable
      }
      showToast(`Done! Your ${toolName} result is ready`, { type: "success" });
    },
    [showToast],
  );

  const ctx: EngagementCtx = {
    recentTools: mounted ? recentTools : [],
    clearRecentTools,
    favourites: mounted ? favourites : [],
    toggleFavourite,
    isFavourite,
    streak: mounted ? streak : 0,
    badges: mounted ? badges : [],
    ratings: mounted ? ratings : {},
    vote,
    getVoteCounts,
    usageCounts: mounted ? usageCounts : {},
    getUsageCount,
    welcomeDismissed: mounted ? welcomeDismissed : true,
    dismissWelcomeBanner,
    darkMode: mounted ? darkMode : false,
    toggleDarkMode,
    trackToolUse,
    toasts,
    showToast,
    dismissToast,
    celebrate,
    mounted,
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}
