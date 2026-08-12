import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
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

    const filter = { recipient: authResult.userId };

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("actor", "username displayName avatarUrl")
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        data: notifications,
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to fetch notifications" },
      { status: 500 },
    );
  }
}
