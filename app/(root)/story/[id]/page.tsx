import { StoryDetail } from "@/components/story/StoryDetail";
import { getAuthPayload } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ConnectionRequest from "@/models/ConnectionRequest";
import Story from "@/models/Story";
import Vote from "@/models/Vote";
import { notFound } from "next/navigation";

interface StoryPageProps {
  params: {
    id: string;
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  await connectDB();

  const story = await Story.findById(params.id)
    .populate("author", "username displayName avatarUrl")
    .lean();

  if (!story) {
    notFound();
  }

  const authPayload = await getAuthPayload();
  const isPublic = story.visibility === "public";
  const isAuthor = authPayload?.userId === story.author._id.toString();

  let connectionAccepted = false;
  if (!isPublic && authPayload && !isAuthor) {
    connectionAccepted = Boolean(
      await ConnectionRequest.exists({
        status: "accepted",
        $or: [
          { sender: authPayload.userId, receiver: story.author._id },
          { sender: story.author._id, receiver: authPayload.userId },
        ],
      }),
    );
  }

  if (!isPublic && !isAuthor && !connectionAccepted) {
    notFound();
  }

  const vote = authPayload
    ? await Vote.findOne({ story: story._id, user: authPayload.userId }).lean()
    : null;

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10 sm:px-6 lg:px-8 font-body">
      <div className="mx-auto max-w-2xl space-y-8">
        <StoryDetail
          initialStory={story}
          initialUserVote={vote?.type ?? null}
        />
      </div>
    </main>
  );
}
