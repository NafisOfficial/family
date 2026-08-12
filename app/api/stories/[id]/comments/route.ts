import { getAuthPayload, requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { addCommentSchema } from "@/lib/validations/story";
import Comment from "@/models/Comment";
import ConnectionRequest from "@/models/ConnectionRequest";
import Notification from "@/models/Notification";
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

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const params = await context.params;

    const story = await Story.findById(params.id).lean();
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const authPayload = await getAuthPayload();
    const allowed = await isAuthorizedToViewStory(story, authPayload);

    if (!allowed) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const comments = await Comment.find({ story: story._id })
      .sort({ createdAt: 1 })
      .populate("author", "username displayName avatarUrl")
      .lean();

    return NextResponse.json({ data: comments }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch comments" },
      { status: 500 },
    );
  }
}

function containsHarmfulKeywords(text: string) {
  const normalized = text.toLowerCase();
  const patterns = [
    /\bkill\b/,
    /\bdie\b/,
    /\brape\b/,
    /\bassault\b/,
    /\bfuck you\b/,
    /\bslap\b/,
    /\bstfu\b/,
    /\bhate you\b/,
    /\bdisgusting\b/,
    /\bworthless\b/,
  ];
  return patterns.some((pattern) => pattern.test(normalized));
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

    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const isAllowed = await isAuthorizedToViewStory(story, authResult);
    if (!isAllowed) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = addCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid comment data", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    let hidden = false;
    let harmfulLabel: string | null = null;
    let harmfulConfidence: number | null = null;

    try {
      const classifierResponse = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: validation.data.content }),
      });

      if (classifierResponse.ok) {
        const classifierPayload = await classifierResponse.json();
        harmfulLabel = classifierPayload.label ?? null;
        harmfulConfidence =
          typeof classifierPayload.confidence === "number"
            ? classifierPayload.confidence
            : null;
        hidden = harmfulLabel !== null && harmfulLabel !== "NOT_HARASSMENT";
      }
    } catch {
      hidden = false;
    }

    if (!hidden && containsHarmfulKeywords(validation.data.content)) {
      hidden = true;
      if (harmfulLabel === "NOT_HARASSMENT" || harmfulLabel === null) {
        harmfulLabel = "HARMFUL_FALLBACK";
      }
    }

    const comment = await Comment.create({
      author: authResult.userId,
      story: story._id,
      content: validation.data.content,
      hidden,
      harmfulLabel,
      harmfulConfidence,
    });

    await Story.findByIdAndUpdate(story._id, { $inc: { commentsCount: 1 } });

    if (story.author.toString() !== authResult.userId) {
      await Notification.create({
        recipient: story.author,
        actor: authResult.userId,
        type: "story_comment",
        story: story._id,
      });
    }

    const populated = await Comment.findById(comment._id)
      .populate("author", "username displayName avatarUrl")
      .lean();

    return NextResponse.json({ data: populated }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save comment" },
      { status: 500 },
    );
  }
}
