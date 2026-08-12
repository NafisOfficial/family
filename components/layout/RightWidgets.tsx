import { Sparkles, TrendingUp, UserPlus } from "lucide-react";
import Link from "next/link";

/**
 * Static placeholder content — wire these up to real data (suggested
 * connections, trending keywords, subscription status) whenever the
 * corresponding API endpoints are ready. Left as plain markup on
 * purpose so no functionality is implied that doesn't exist yet.
 */
const SUGGESTED = [
  { name: "Amelia Rhodes", handle: "amelia.r", mutual: "3 mutual relatives" },
  { name: "David Chen", handle: "d.chen", mutual: "2nd cousin" },
  { name: "Priya Nair", handle: "priya.nair", mutual: "1 mutual relative" },
];

const TRENDING = [
  "#FamilyReunion2026",
  "#OldPhotos",
  "#GrandparentsStory",
  "#RootsWeek",
];

export default function RightWidgets() {
  return (
    <aside className="hidden xl:flex xl:fixed xl:inset-y-0 xl:right-0 xl:z-30 xl:w-80 xl:flex-col xl:gap-5 xl:overflow-y-auto xl:border-l xl:border-[hsl(var(--border))] xl:bg-[hsl(var(--background))] xl:px-5 xl:py-8 font-body">
      {/* Subscription upsell */}
      {/* <div className="rounded-3xl bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[hsl(var(--accent))]">
            Memory+
          </span>
        </div>
        <p className="font-display text-lg leading-snug mb-3">
          Unlimited photos and a deeper family archive.
        </p>
        <button
          type="button"
          className="w-full rounded-full bg-[hsl(var(--accent))] py-2 text-sm font-semibold text-[hsl(var(--primary))] hover:opacity-90 transition"
        >
          Upgrade
        </button>
      </div> */}

      {/* Suggested connections */}
      <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-4 w-4 text-[hsl(var(--primary))]" />
          <h3 className="font-display text-base font-semibold text-[hsl(var(--primary))]">
            Suggested for you
          </h3>
        </div>
        <ul className="space-y-4">
          {SUGGESTED.map((person) => (
            <li
              key={person.handle}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-sm font-semibold text-[hsl(var(--primary))]">
                  {person.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
                    {person.name}
                  </p>
                  <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                    {person.mutual}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-[hsl(var(--primary))]/25 px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/8 transition"
              >
                Connect
              </button>
            </li>
          ))}
        </ul>
        <Link
          href="/connections"
          className="mt-4 inline-block text-sm font-semibold text-[hsl(var(--accent))] hover:underline"
        >
          See all
        </Link>
      </div>

      {/* Trending */}
      <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
          <h3 className="font-display text-base font-semibold text-[hsl(var(--primary))]">
            Trending in Memory
          </h3>
        </div>
        <ul className="space-y-3">
          {TRENDING.map((tag) => (
            <li key={tag}>
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                {tag}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
