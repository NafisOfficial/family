import { useQuery } from "@tanstack/react-query";

export interface StoryFeedItem {
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
}

export interface StoryFeedResult {
  stories: StoryFeedItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export function useStoryFeed(sort: "latest" | "top" | "trending" = "latest") {
  return useQuery<StoryFeedResult, Error, StoryFeedResult>({
    queryKey: ["stories", sort],
    queryFn: async () => {
      const response = await fetch(`/api/stories?sort=${sort}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to fetch stories");
      }

      const payload = await response.json();
      return payload.data as StoryFeedResult;
    },
  });
}
