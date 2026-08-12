import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createStorySchema } from "@/lib/validations/story";
import ConnectionRequest from "@/models/ConnectionRequest";
import Story from "@/models/Story";
import { NextResponse } from "next/server";

function parseInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const url = new URL(request.url);
    const page = parseInteger(url.searchParams.get("page"), 1);
    const limit = Math.min(parseInteger(url.searchParams.get("limit"), 10), 20);
    const sortKey = url.searchParams.get("sort") || "latest";

    const connectionRequests = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ sender: authResult.userId }, { receiver: authResult.userId }],
    }).lean();

    const relatedIds = new Set<string>([authResult.userId]);
    connectionRequests.forEach((request) => {
      if (request.sender.toString() === authResult.userId) {
        relatedIds.add(request.receiver.toString());
      } else {
        relatedIds.add(request.sender.toString());
      }
    });

    const filter = {
      $or: [
        { visibility: "public" },
        { visibility: "relatives", author: { $in: Array.from(relatedIds) } },
      ],
    };

    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      latest: { createdAt: -1 },
      top: { upvotesCount: -1, downvotesCount: 1, createdAt: -1 },
    };

    let stories;
    if (sortKey === "trending") {
      stories = await Story.aggregate([
        { $match: filter },
        {
          $addFields: {
            trendingScore: {
              $subtract: ["$upvotesCount", "$downvotesCount"],
            },
          },
        },
        { $sort: { trendingScore: -1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            title: 1,
            content: 1,
            visibility: 1,
            createdAt: 1,
            updatedAt: 1,
            upvotesCount: 1,
            downvotesCount: 1,
            commentsCount: 1,
            author: {
              username: "$author.username",
              displayName: "$author.displayName",
              avatarUrl: "$author.avatarUrl",
            },
          },
        },
      ]);
    } else {
      stories = await Story.find(filter)
        .populate("author", "username displayName avatarUrl")
        .sort(sortOptions[sortKey] ?? sortOptions.latest)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    const total = await Story.countDocuments(filter);

    return NextResponse.json(
      {
        data: {
          stories,
          page,
          limit,
          total,
          hasMore: page * limit < total,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch stories error:", error);
    return NextResponse.json(
      { error: "Unable to fetch stories" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = createStorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid story data", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const rawStory = await Story.create({
      author: authResult.userId,
      title: validation.data.title,
      content: validation.data.content,
      mediaUrls: validation.data.mediaUrls,
      visibility: validation.data.visibility,
    });

    const story = rawStory.toObject();
    delete story.__v;

    return NextResponse.json({ data: story }, { status: 201 });
  } catch (error) {
    console.error("Create story error:", error);
    return NextResponse.json(
      { error: "Unable to create story" },
      { status: 500 },
    );
  }
}
