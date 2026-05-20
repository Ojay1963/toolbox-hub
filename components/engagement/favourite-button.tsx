"use client";

import { useEngagement } from "./engagement-provider";

export function FavouriteButton({
  slug,
  name,
  className = "",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const { isFavourite, toggleFavourite, mounted } = useEngagement();
  if (!mounted) return null;

  const faved = isFavourite(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavourite(slug);
      }}
      aria-label={faved ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      title={faved ? "Remove from favourites" : "Save to favourites"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
        faved
          ? "border-rose-300 bg-rose-50 text-rose-500"
          : "border-[color:var(--border)] bg-white/80 text-[color:var(--muted)] hover:border-rose-300 hover:text-rose-400"
      } ${className}`}
      style={{
        transform: faved ? "scale(1.1)" : "scale(1)",
        transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s, background-color 0.15s",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill={faved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

export function FavouritesCount({ className = "" }: { className?: string }) {
  const { favourites, mounted } = useEngagement();
  if (!mounted || favourites.length === 0) return null;

  return (
    <span
      className={`flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:border-rose-800/60 dark:bg-rose-900/20 dark:text-rose-300 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden="true">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
      {favourites.length}
    </span>
  );
}
