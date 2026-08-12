"use client";

import { StoryFeed } from "@/components/story/StoryFeed";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function FeedPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto w-full max-w-7xl font-body">
      <div className="sticky top-0 z-20 -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 bg-[hsl(var(--background))]/95 backdrop-blur border-b border-[hsl(var(--border))]">
        <h1 className="font-display text-lg font-semibold text-[hsl(var(--primary))]">
          Home
        </h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Welcome back, {user?.displayName}
        </p>
      </div>

      <div className="space-y-6 py-6 px-0 lg:px-2">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                New post
              </span>
              <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Share your family memory with a single post.
              </h1>
              <p className="max-w-2xl text-slate-600">
                Write a story, attach photos, and invite relatives to react. Use
                the button below to open the post composer.
              </p>
            </div>
            <Link
              href="/create-post"
              className="inline-flex items-center justify-center rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Create post
            </Link>
          </div>
        </section>

        <div className="space-y-6">
          <StoryFeed />
        </div>
      </div>
    </div>
  );
}
