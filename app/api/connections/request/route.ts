import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { sendConnectionRequestSchema } from "@/lib/validations/tree";
import ConnectionRequest from "@/models/ConnectionRequest";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = sendConnectionRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid connection request",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const receiver = await User.findOne({
      username: validation.data.receiverUsername.toLowerCase(),
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 },
      );
    }

    if (receiver._id.toString() === authResult.userId) {
      return NextResponse.json(
        { error: "Cannot send a connection request to yourself" },
        { status: 400 },
      );
    }

    const existing = await ConnectionRequest.findOne({
      sender: authResult.userId,
      receiver: receiver._id,
      status: "pending",
    });

    if (existing) {
      return NextResponse.json(
        { error: "A pending request already exists" },
        { status: 409 },
      );
    }

    const requestDoc = await ConnectionRequest.create({
      sender: authResult.userId,
      receiver: receiver._id,
      relationshipType: validation.data.relationshipType,
    });

    await Notification.create({
      recipient: receiver._id,
      actor: authResult.userId,
      type: "connection_request",
      connectionRequest: requestDoc._id,
    });

    return NextResponse.json(
      {
        data: {
          _id: requestDoc._id.toString(),
          senderUsername: authResult.username,
          receiverUsername: receiver.username,
          relationshipType: requestDoc.relationshipType,
          status: requestDoc.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to send connection request" },
      { status: 500 },
    );
  }
}
