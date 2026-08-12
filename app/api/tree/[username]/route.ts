import { connectDB } from "@/lib/db";
import FamilyMember from "@/models/FamilyMember";
import FamilyRelationship from "@/models/FamilyRelationship";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{username: string}> }) {
  try {
    await connectDB();
    const params = await context.params;

    const user = await User.findOne({
      username: params.username.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const members = await FamilyMember.find({ treeOwner: user._id }).lean();
    const relationships = await FamilyRelationship.find({
      treeOwner: user._id,
    }).lean();

    return NextResponse.json(
      {
        data: {
          user: {
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            coverUrl: user.coverUrl,
          },
          members,
          relationships,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to load public tree" },
      { status: 500 },
    );
  }
}