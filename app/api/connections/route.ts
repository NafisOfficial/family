import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ConnectionRequest from "@/models/ConnectionRequest";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const requests = await ConnectionRequest.find({
      $or: [{ sender: authResult.userId }, { receiver: authResult.userId }],
    })
      .populate("sender", "username displayName")
      .populate("receiver", "username displayName")
      .lean();

    const pending = requests.filter((request) => request.status === "pending");
    const accepted = requests.filter(
      (request) => request.status === "accepted",
    );

    return NextResponse.json({ data: { pending, accepted } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to load connections" },
      { status: 500 },
    );
  }
}
