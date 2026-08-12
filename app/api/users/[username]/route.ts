import { connectDB } from "@/lib/db";
import Story from "@/models/Story";
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

    const storyCount = await Story.countDocuments({ author: user._id });

    const profile = {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { data: { profile, storyCount } },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to load user profile" },
      { status: 500 },
    );
  }
}