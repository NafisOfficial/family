"use client";

import { CommentSection } from "@/components/story/CommentSection";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, MessageSquare, Calendar } from "lucide-react";

interface StoryDetailProps {
  initialStory: {
    _id: string;
    title: string;
    content: string;
    visibility: string;
    createdAt: string;
    updatedAt?: string;
    upvotesCount: number;
    downvotesCount: number;
    commentsCount: number;
    author: {
      username: string;
      displayName: string;
      avatarUrl?: string;
    };
  };
  initialUserVote?: "up" | "down" | null;
}

export function StoryDetail({
  initialStory,
  initialUserVote = null,
}: StoryDetailProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [userVote, setUserVote] = useState<"up" | "down" | null>(
    initialUserVote,
  );
  const [counts, setCounts] = useState({
    upvotesCount: initialStory.upvotesCount,
    downvotesCount: initialStory.downvotesCount,
  });
  const [isVoting, setIsVoting] = useState(false);

  const storyQuery = useQuery({
    queryKey: ["story", initialStory._id],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${initialStory._id}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to load story");
      }
      const payload = await response.json();
      return payload.data as StoryDetailProps["initialStory"];
    },
    initialData: initialStory,
  });

  const voteMutation = useMutation<any, Error, "up" | "down">({
    mutationKey: ["vote", initialStory._id],
    mutationFn: async (type: "up" | "down") => {
      const response = await fetch(`/api/stories/${initialStory._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit vote");
      }

      return response.json();
    },
    onSuccess: (result: any) => {
      setCounts({
        upvotesCount: result.data.upvotesCount,
        downvotesCount: result.data.downvotesCount,
      });
      setUserVote(result.data.userVote);
      queryClient.invalidateQueries({ queryKey: ["story", initialStory._id] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  const story = storyQuery.data || initialStory;

  const onVote = (type: "up" | "down") => {
    if (!user || isVoting) {
      return;
    }

    setIsVoting(true);
    voteMutation.mutate(type, {
      onSettled: () => {
        setIsVoting(false);
      },
    });
  };

  const initial = story.author.displayName?.charAt(0).toUpperCase() ?? "U";

  return (
    <section className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.25)] sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-100 pb-6">
        <div className="space-y-4">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            story.visibility === "relatives" 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
              : "bg-blue-50 text-blue-700 border border-blue-100"
          }`}>
            {story.visibility === "relatives" ? "Relatives Only" : "Public"}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{story.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(story.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Author Avatar & Username */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3 shadow-2xs">
          {story.author.avatarUrl ? (
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
              <Image
                src={story.author.avatarUrl}
                alt={story.author.displayName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-none">
              {story.author.displayName}
            </p>
            <p className="text-xs text-slate-400 mt-1">@{story.author.username}</p>
          </div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base">
        <p className="whitespace-pre-line">{story.content}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4 text-emerald-600" />
            <span>{counts.upvotesCount} upvotes</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ThumbsDown className="h-4 w-4 text-rose-500" />
            <span>{counts.downvotesCount} downvotes</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <span>{story.commentsCount} comments</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onVote("up")}
            disabled={!user || isVoting}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              userVote === "up"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-600"
                : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            {userVote === "up" ? "Upvoted" : "Upvote"}
          </button>
          <button
            type="button"
            onClick={() => onVote("down")}
            disabled={!user || isVoting}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              userVote === "down"
                ? "bg-rose-50 text-rose-700 border border-rose-600"
                : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            {userVote === "down" ? "Downvoted" : "Downvote"}
          </button>
        </div>
      </div>

      <CommentSection storyId={story._id} />
    </section>
  );
}
