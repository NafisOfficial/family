import { getAuthPayload, requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { updateStorySchema } from "@/lib/validations/story";
import ConnectionRequest from "@/models/ConnectionRequest";
import Story from "@/models/Story";
import { NextResponse } from "next/server";

type AuthViewableStory = {
  visibility: string;
  author: { toString(): string };
};

async function isAuthorizedToViewStory(
  story: AuthViewableStory,
  authPayload: Awaited<ReturnType<typeof getAuthPayload>>,
) {
  if (story.visibility === "public") {
    return true;
  }

  if (!authPayload) {
    return false;
  }

  if (story.author.toString() === authPayload.userId) {
    return true;
  }

  const connectionExists = await ConnectionRequest.exists({
    status: "accepted",
    $or: [
      { sender: authPayload.userId, receiver: story.author.toString() },
      { sender: story.author.toString(), receiver: authPayload.userId },
    ],
  });

  return Boolean(connectionExists);
}

export async function GET(request: Request, context: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    const params = await context.params;

    const story = await Story.findById(params.id)
      .populate("author", "username displayName avatarUrl")
      .lean();

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const authPayload = await getAuthPayload();
    const allowed = await isAuthorizedToViewStory(story, authPayload);

    if (!allowed) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ data: story }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch story" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    const params = await context.params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = updateStorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid story data", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.author.toString() !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    Object.assign(story, validation.data);
    await story.save();

    return NextResponse.json({ data: story }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to update story" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    const params = await context.params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.author.toString() !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await story.deleteOne();

    return NextResponse.json({ data: { id: params.id } }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete story" },
      { status: 500 },
    );
  }
}