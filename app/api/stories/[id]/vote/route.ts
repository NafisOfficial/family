import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { voteStorySchema } from "@/lib/validations/story";
import ConnectionRequest from "@/models/ConnectionRequest";
import Notification from "@/models/Notification";
import Story from "@/models/Story";
import Vote from "@/models/Vote";
import { NextResponse } from "next/server";

type AuthViewableStory = {
  visibility: string;
  author: { toString(): string };
};

type AuthPayload = { userId: string } | null;

async function isAuthorizedToViewStory(
  story: AuthViewableStory,
  authPayload: AuthPayload,
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

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const params = await context.params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = voteStorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid vote data", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const allowed = await isAuthorizedToViewStory(story, authResult);
    if (!allowed) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const existingVote = await Vote.findOne({
      user: authResult.userId,
      story: story._id,
    });

    let userVote: "up" | "down" | null = null;
    let shouldNotify = false;

    if (existingVote) {
      if (existingVote.type === validation.data.type) {
        // Toggle off — remove vote
        await existingVote.deleteOne();
        await Story.findByIdAndUpdate(story._id, {
          $inc: { [`${validation.data.type}votesCount`]: -1 },
        });
        userVote = null;
      } else {
        // Switch vote type
        await Vote.findByIdAndUpdate(existingVote._id, {
          type: validation.data.type,
        });
        await Story.findByIdAndUpdate(story._id, {
          $inc: {
            [`${existingVote.type}votesCount`]: -1,
            [`${validation.data.type}votesCount`]: 1,
          },
        });
        userVote = validation.data.type;
        shouldNotify = story.author.toString() !== authResult.userId;
      }
    } else {
      // New vote
      await Vote.create({
        user: authResult.userId,
        story: story._id,
        type: validation.data.type,
      });
      await Story.findByIdAndUpdate(story._id, {
        $inc: { [`${validation.data.type}votesCount`]: 1 },
      });
      userVote = validation.data.type;
      shouldNotify = story.author.toString() !== authResult.userId;
    }

    if (shouldNotify) {
      const notificationType =
        validation.data.type === "up" ? "story_upvote" : "story_downvote";
      await Notification.create({
        recipient: story.author,
        actor: authResult.userId,
        type: notificationType,
        story: story._id,
      });
    }

    const updatedStory = await Story.findById(params.id);
    if (!updatedStory) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: {
          upvotesCount: updatedStory.upvotesCount,
          downvotesCount: updatedStory.downvotesCount,
          userVote,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to record vote" },
      { status: 500 },
    );
  }
}
