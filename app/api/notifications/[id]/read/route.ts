import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const params = await context.params;

    const notification = await Notification.findOne({
      _id: params.id,
      recipient: authResult.userId,
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    notification.isRead = true;
    await notification.save();

    return NextResponse.json({ data: { _id: params.id } }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to mark notification as read" },
      { status: 500 },
    );
  }
}
