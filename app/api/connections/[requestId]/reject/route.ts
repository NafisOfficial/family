import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ConnectionRequest from "@/models/ConnectionRequest";
import { NextResponse } from "next/server";

export async function POST(request: Request, context: { params: Promise<{requestId: string}> }) {
  try {
    await connectDB();
    const params = await context.params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: params.requestId,
      receiver: authResult.userId,
      status: "pending",
    });

    if (!connectionRequest) {
      return NextResponse.json(
        { error: "Connection request not found" },
        { status: 404 },
      );
    }

    connectionRequest.status = "rejected";
    await connectionRequest.save();

    return NextResponse.json({ data: connectionRequest }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to reject connection request" },
      { status: 500 },
    );
  }
}