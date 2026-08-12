"use client";

import { StoryCard } from "@/components/story/StoryCard";
import { type StoryFeedItem, useStoryFeed } from "@/hooks/useStoryFeed";
import { useState } from "react";

const sortLabels = {
  latest: "Latest",
  top: "Top",
  trending: "Trending",
};

export function StoryFeed() {
  const [sort, setSort] = useState<"latest" | "top" | "trending">("latest");
  const { data, isLoading, isError, error } = useStoryFeed(sort);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Memory stories feed
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Discover recent posts
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(sortLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key as "latest" | "top" | "trending")}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                sort === key
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-slate-500">Loading stories...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p>Unable to load stories. {(error as Error)?.message}</p>
        </div>
      )}

      {data?.stories.length ? (
        <div className="space-y-4">
          {data.stories.map((story: StoryFeedItem) => (
            <StoryCard key={story._id} story={story} />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
            <p>No stories available yet. Share a story to get started.</p>
          </div>
        )
      )}
    </section>
  );
}
