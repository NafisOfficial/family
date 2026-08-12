import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Story from "@/models/Story";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; cid: string }> },
) {
  try {
    await connectDB();
    const params = await context.params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const comment = await Comment.findById(params.cid);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.author.toString() !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await comment.deleteOne();

    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    story.commentsCount = Math.max(0, Number(story.commentsCount ?? 0) - 1);
    await story.save();

    return NextResponse.json({ data: { id: params.cid } }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete comment" },
      { status: 500 },
    );
  }
}
