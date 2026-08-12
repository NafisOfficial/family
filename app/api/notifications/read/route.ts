import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const result = await Notification.updateMany(
      { recipient: authResult.userId, isRead: false },
      { $set: { isRead: true } },
    );

    return NextResponse.json(
      { data: { updatedCount: result.modifiedCount ?? result.matchedCount } },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to mark notifications as read" },
      { status: 500 },
    );
  }
}
