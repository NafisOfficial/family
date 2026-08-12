"use client";

import { CommentSection } from "@/components/story/CommentSection";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface StoryCardProps {
  story: {
    _id: string;
    title: string;
    content: string;
    visibility: string;
    createdAt: string;
    upvotesCount: number;
    downvotesCount: number;
    commentsCount: number;
    author: {
      username: string;
      displayName: string;
      avatarUrl?: string;
    };
  };
}

export function StoryCard({ story }: StoryCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [counts, setCounts] = useState({
    upvotesCount: story.upvotesCount,
    downvotesCount: story.downvotesCount,
  });

  const voteMutation = useMutation<any, Error, "up" | "down">({
    mutationFn: async (type: "up" | "down") => {
      const response = await fetch(`/api/stories/${story._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) {
        throw new Error("Unable to submit vote");
      }
      return response.json();
    },
    onSuccess: (result) => {
      setCounts({
        upvotesCount: result.data.upvotesCount,
        downvotesCount: result.data.downvotesCount,
      });
      setUserVote(result.data.userVote);
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  const onVote = (type: "up" | "down") => {
    if (!user || voteMutation.status === "pending") {
      return;
    }
    voteMutation.mutate(type);
  };

  const excerpt =
    story.content.length > 220
      ? `${story.content.slice(0, 220)}...`
      : story.content;

  const initial = story.author.displayName?.charAt(0).toUpperCase() ?? "U";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {story.author.avatarUrl ? (
              <div className="relative h-11 w-11 overflow-hidden rounded-full border border-slate-150 bg-slate-100 shadow-2xs">
                <Image
                  src={story.author.avatarUrl}
                  alt={story.author.displayName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-2xs">
                {initial}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {story.author.displayName}
              </p>
              <p className="text-xs text-slate-500">@{story.author.username}</p>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                story.visibility === "relatives"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-blue-50 text-blue-700 border border-blue-100"
              }`}
            >
              {story.visibility === "relatives" ? "Relatives Only" : "Public"}
            </span>
            <time className="block text-xs text-slate-400 font-medium">
              {new Date(story.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[72px_1fr]">
          <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
            <button
              type="button"
              onClick={() => onVote("up")}
              disabled={!user || voteMutation.status === "pending"}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                userVote === "up"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <span className="my-2 text-sm font-semibold text-slate-900">
              {counts.upvotesCount - counts.downvotesCount}
            </span>
            <button
              type="button"
              onClick={() => onVote("down")}
              disabled={!user || voteMutation.status === "pending"}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                userVote === "down"
                  ? "bg-rose-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 hover:text-emerald-600 transition">
                <Link href={`/story/${story._id}`}>{story.title}</Link>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {excerpt}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
              <div className="inline-flex items-center gap-2 text-slate-600">
                <MessageSquare className="h-4 w-4" />
                {story.commentsCount} comments
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                  {counts.upvotesCount} upvotes
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                  {counts.downvotesCount} downvotes
                </span>
              </div>
            </div>

            <div className="mt-4">
              <CommentSection storyId={story._id} compact />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
