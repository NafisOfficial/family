"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  ThumbsDown,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";

interface NotificationItemProps {
  notification: {
    _id: string;
    type:
      | "connection_request"
      | "connection_accepted"
      | "story_upvote"
      | "story_comment"
      | "story_downvote";
    actor: {
      username: string;
      displayName: string;
      avatarUrl?: string;
    };
    story: string | null;
    connectionRequest: string | null;
    isRead: boolean;
    createdAt: string;
  };
}

const TYPE_META: Record<
  NotificationItemProps["notification"]["type"],
  {
    message: string;
    getHref: (n: NotificationItemProps["notification"]) => string | null;
    Icon: React.ElementType;
    iconClass: string;
  }
> = {
  connection_request: {
    message: "sent you a connection request.",
    getHref: () => "/connections",
    Icon: UserPlus,
    iconClass: "bg-blue-100 text-blue-600",
  },
  connection_accepted: {
    message: "accepted your connection request.",
    getHref: () => "/connections",
    Icon: UserCheck,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  story_upvote: {
    message: "upvoted your story.",
    getHref: (n) => (n.story ? `/story/${n.story}` : null),
    Icon: Heart,
    iconClass: "bg-pink-100 text-pink-600",
  },
  story_comment: {
    message: "commented on your story.",
    getHref: (n) => (n.story ? `/story/${n.story}` : null),
    Icon: MessageCircle,
    iconClass: "bg-violet-100 text-violet-600",
  },
  story_downvote: {
    message: "downvoted your story.",
    getHref: (n) => (n.story ? `/story/${n.story}` : null),
    Icon: ThumbsDown,
    iconClass: "bg-orange-100 text-orange-600",
  },
};

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const meta = TYPE_META[notification.type];
  const href = meta.getHref(notification);
  const Icon = meta.Icon;

  const initial = notification.actor.displayName?.charAt(0).toUpperCase() ?? "?";

  async function markRead() {
    if (notification.isRead) return;
    await fetch(`/api/notifications/${notification._id}/read`, {
      method: "POST",
    });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  const handleClick = () => {
    startTransition(() => {
      markRead();
    });
  };

  const content = (
    <div
      className={`group flex items-start gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200 ${
        notification.isRead
          ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow"
          : "border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:shadow-emerald-100"
      } ${isPending ? "opacity-60" : ""}`}
    >
      {/* Actor avatar */}
      <div className="relative shrink-0">
        {notification.actor.avatarUrl ? (
          <Image
            src={notification.actor.avatarUrl}
            alt={notification.actor.displayName}
            width={44}
            height={44}
            className="rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-base font-bold text-white">
            {initial}
          </div>
        )}
        {/* Type icon badge */}
        <span
          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ${meta.iconClass} ring-2 ring-white`}
        >
          <Icon className="h-3 w-3" />
        </span>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-700 leading-snug">
          <span className="font-semibold text-slate-900">
            {notification.actor.displayName}
          </span>{" "}
          {meta.message}
        </p>
        <p className="mt-1 text-xs text-slate-400">{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="block w-full text-left"
    >
      {content}
    </button>
  );
}
