"use client";

import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CommentData {
  _id: string;
  content: string;
  createdAt: string;
  hidden?: boolean;
  harmfulLabel?: string;
  harmfulConfidence?: number;
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

interface CommentSectionProps {
  storyId: string;
  compact?: boolean;
}

export function CommentSection({
  storyId,
  compact = false,
}: CommentSectionProps) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [revealedComments, setRevealedComments] = useState<
    Record<string, boolean>
  >({});
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const saved = window.localStorage.getItem(`revealedComments-${storyId}`);
    if (saved) {
      try {
        setRevealedComments(JSON.parse(saved));
      } catch {
        setRevealedComments({});
      }
    }
  }, [storyId]);

  const commentsQuery = useQuery<CommentData[]>({
    queryKey: ["storyComments", storyId],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) {
        let msg = "Unable to load comments";
        try {
          const payload = await response.json();
          msg = payload?.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const payload = await response.json();
      return payload.data as CommentData[];
    },
  });

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !content.trim()) {
      return;
    }

    const response = await fetch(`/api/stories/${storyId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ content: content.trim() }),
    });

    if (!response.ok) {
      try {
        const payload = await response.json();
        setErrorMsg(payload?.error || "Unable to post comment");
      } catch {
        setErrorMsg("Unable to post comment");
      }
      return;
    }

    setContent("");
    setErrorMsg(null);
    await queryClient.invalidateQueries({
      queryKey: ["storyComments", storyId],
    });
    await queryClient.invalidateQueries({ queryKey: ["story", storyId] });
  };

  const deleteComment = async (commentId: string) => {
    const response = await fetch(
      `/api/stories/${storyId}/comments/${commentId}`,
      { method: "DELETE", credentials: "same-origin" },
    );

    if (!response.ok) {
      try {
        const payload = await response.json();
        setErrorMsg(payload?.error || "Unable to delete comment");
      } catch {
        setErrorMsg("Unable to delete comment");
      }
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["storyComments", storyId],
    });
    await queryClient.invalidateQueries({ queryKey: ["story", storyId] });
  };

  return (
    <div
      id="comments"
      className={`space-y-6 rounded-3xl border border-slate-200 bg-white ${compact ? "p-4" : "p-6"}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Comments</h2>
          {!compact && (
            <p className="text-xs text-slate-500">
              Share feedback, memories, or thoughtful replies.
            </p>
          )}
        </div>
      </div>

      {user ? (
        <form onSubmit={submitComment} className="space-y-3">
          {compact ? (
            <div className="flex items-center gap-3">
              <input
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                disabled={!content.trim() || commentsQuery.isFetching}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-700"
              >
                Post
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Write a comment..."
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!content.trim() || commentsQuery.isFetching}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-700"
                >
                  Post comment
                </button>
              </div>
            </>
          )}
        </form>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          {loading
            ? "Checking authentication..."
            : "Sign in to post comments and join the conversation."}
        </div>
      )}

      {commentsQuery.isLoading ? (
        <p className="text-sm text-slate-400">Loading comments…</p>
      ) : commentsQuery.error ? (
        <p className="text-sm text-rose-600">
          {(commentsQuery.error as Error)?.message ||
            "Unable to load comments."}
        </p>
      ) : commentsQuery.data?.length ? (
        <div
          className={`space-y-4 ${compact ? "max-h-72 overflow-y-auto pr-2" : ""}`}
        >
          {(compact && !showAllComments
            ? commentsQuery.data.slice(-2)
            : commentsQuery.data
          ).map((comment) => {
            const initial =
              comment.author.displayName?.charAt(0).toUpperCase() ?? "?";
            const isHidden = Boolean(
              comment.hidden ||
              (comment.harmfulLabel &&
                comment.harmfulLabel !== "NOT_HARASSMENT"),
            );
            const isRevealed = Boolean(revealedComments[comment._id]);
            return (
              <div
                key={comment._id}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-50 transition duration-150"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {comment.author.avatarUrl ? (
                      <div className="relative w-8 h-8 rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                        <Image
                          src={comment.author.avatarUrl}
                          alt={comment.author.displayName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-[10px] font-bold text-white">
                        {initial}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-none">
                        {comment.author.displayName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        @{comment.author.username}
                      </p>
                    </div>
                  </div>
                  <time className="text-[10px] text-slate-400 font-medium">
                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 pl-1">
                  {isHidden && !isRevealed
                    ? "This comment is marked as potentially harmful. Click the eye icon to reveal it."
                    : comment.content}
                </p>
                {isHidden && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                    <button
                      type="button"
                      onClick={() => {
                        setRevealedComments((prev) => {
                          const next = {
                            ...prev,
                            [comment._id]: !prev[comment._id],
                          };
                          if (typeof window !== "undefined") {
                            window.localStorage.setItem(
                              `revealedComments-${storyId}`,
                              JSON.stringify(next),
                            );
                          }
                          return next;
                        });
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Hide comment
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Show comment
                        </>
                      )}
                    </button>
                    {comment.harmfulLabel && (
                      <span className="text-[10px] text-slate-500">
                        {comment.harmfulLabel.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                )}
                {user?.username === comment.author.username && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => deleteComment(comment._id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {compact && commentsQuery.data.length > 2 && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllComments((current) => !current)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {showAllComments ? "Show fewer comments" : "See all comments"}
              </button>
            </div>
          )}
        </div>
      ) : !compact ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Be the first to leave a comment on this memory.
        </div>
      ) : null}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
