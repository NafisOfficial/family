"use client";

import { StoryCreateForm } from "@/components/story/StoryCreateForm";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function CreatePostPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto w-full max-w-4xl font-body">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Create post
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Share a memory with your family.
            </h1>
            <p className="mt-2 text-slate-600">
              Add a title, story, and images to make your post feel complete.
            </p>
          </div>
          <Link
            href="/feed"
            className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Back to feed
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <StoryCreateForm />
      </div>
    </div>
  );
}
