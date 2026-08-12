"use client";

import { useQuery } from "@tanstack/react-query";

interface NotificationsResponse {
  data: { isRead: boolean }[];
  total: number;
  page: number;
  hasMore: boolean;
}

async function fetchUnreadCount(): Promise<number> {
  const res = await fetch("/api/notifications?limit=20", {
    cache: "no-store",
  });
  if (!res.ok) return 0;
  const json: NotificationsResponse = await res.json();
  return json.data.filter((n) => !n.isRead).length;
}

export function useUnreadNotifications() {
  return useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000, // poll every 30 s
    staleTime: 20_000,
  });
}
