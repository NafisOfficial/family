import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { inferInverseRelationship } from "@/lib/helpers/relationships";
import ConnectionRequest from "@/models/ConnectionRequest";
import FamilyMember from "@/models/FamilyMember";
import FamilyRelationship from "@/models/FamilyRelationship";
import Notification from "@/models/Notification";
import User from "@/models/User";
import type { Types } from "mongoose";
import { NextResponse } from "next/server";

type LinkedUserShape = {
  _id: Types.ObjectId;
  displayName: string;
  avatarUrl: string;
  gender: string;
  bio: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ requestId: string }> },
) {
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

    const [sender, receiver] = await Promise.all([
      User.findById(connectionRequest.sender).lean(),
      User.findById(connectionRequest.receiver).lean(),
    ]);

    if (!sender || !receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const createMemberFor = async (
      userId: string,
      linkedUser: LinkedUserShape,
    ) => {
      let member = await FamilyMember.findOne({
        treeOwner: userId,
        linkedUser: linkedUser._id,
      });
      if (!member) {
        member = await FamilyMember.create({
          treeOwner: userId,
          linkedUser: linkedUser._id,
          displayName: linkedUser.displayName,
          avatarUrl: linkedUser.avatarUrl,
          gender: linkedUser.gender,
          bio: linkedUser.bio,
          isAlive: true,
        });
      }
      return member;
    };

    const [senderSelf, receiverSelf] = await Promise.all([
      createMemberFor(sender._id.toString(), sender),
      createMemberFor(receiver._id.toString(), receiver),
    ]);

    const inverseType = inferInverseRelationship(
      connectionRequest.relationshipType,
      sender.gender,
    );

    await Promise.all([
      FamilyRelationship.updateOne(
        {
          treeOwner: sender._id,
          fromMember: senderSelf._id,
          toMember: receiverSelf._id,
        },
        {
          treeOwner: sender._id,
          fromMember: senderSelf._id,
          toMember: receiverSelf._id,
          relationshipType: connectionRequest.relationshipType,
          isConfirmed: true,
        },
        { upsert: true },
      ),
      FamilyRelationship.updateOne(
        {
          treeOwner: receiver._id,
          fromMember: receiverSelf._id,
          toMember: senderSelf._id,
        },
        {
          treeOwner: receiver._id,
          fromMember: receiverSelf._id,
          toMember: senderSelf._id,
          relationshipType: inverseType,
          isConfirmed: true,
        },
        { upsert: true },
      ),
    ]);

    connectionRequest.status = "accepted";
    await connectionRequest.save();

    await Notification.create({
      recipient: connectionRequest.sender,
      actor: authResult.userId,
      type: "connection_accepted",
      connectionRequest: connectionRequest._id,
    });

    return NextResponse.json({ data: connectionRequest }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to accept connection request" },
      { status: 500 },
    );
  }
}
