import { StoryCard } from "@/components/story/StoryCard";
import { connectDB } from "@/lib/db";
import Story from "@/models/Story";
import User from "@/models/User";
import { Calendar, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  await connectDB();
  const resolvedParams = await params;

  const user = await User.findOne({
    username: resolvedParams.username.toLowerCase(),
  }).lean();

  if (!user) {
    notFound();
  }

  const storyCount = await Story.countDocuments({ author: user._id });
  const stories = await Story.find({ author: user._id })
    .sort({ createdAt: -1 })
    .populate("author", "username displayName avatarUrl")
    .lean();

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-8 sm:px-6 lg:px-8 font-body">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_15px_50px_-30px_rgba(31,61,43,0.35)]">
          <div className="relative h-56 w-full bg-[hsl(var(--primary))]">
            {user.coverUrl ? (
              <Image
                src={user.coverUrl}
                alt="Profile cover"
                fill
                className="object-cover opacity-80"
              />
            ) : null}
            <div className="absolute inset-0 bg-linear-to-t from-[hsl(var(--primary))]/60 to-transparent" />
          </div>

          <div className="relative space-y-6 p-8 pt-0 sm:p-10 sm:pt-0">
            <div className="relative -mt-16 mb-6 flex justify-between items-end flex-wrap gap-4">
              {user.avatarUrl ? (
                <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-[hsl(var(--card))] bg-[hsl(var(--card))] shadow-md">
                  <Image
                    src={user.avatarUrl}
                    alt={user.displayName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[hsl(var(--card))] bg-[hsl(var(--primary))] font-display text-3xl font-semibold text-[hsl(var(--primary-foreground))] shadow-md">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] px-5 py-2.5 text-center">
                <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
                  Stories
                </p>
                <p className="font-display text-xl font-semibold text-[hsl(var(--primary))] mt-0.5">
                  {storyCount}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-[hsl(var(--accent))]/10 px-2.5 py-0.5 text-xs font-semibold text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/20">
                Public profile
              </span>
              <h1 className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">
                {user.displayName}
              </h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))] font-semibold mt-0.5">
                @{user.username}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1.5fr_0.98fr] border-t border-[hsl(var(--border))] pt-6">
              <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 p-5">
                <h2 className="font-display text-sm font-semibold text-[hsl(var(--primary))]">
                  About
                </h2>
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {user.bio || "This user has not added a bio yet."}
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase">
                      Joined
                    </p>
                    <p className="text-xs font-semibold text-[hsl(var(--foreground))] mt-0.5">
                      {user.createdAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </div>

                {user.gender && user.gender !== "prefer_not_to_say" && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase">
                        Gender
                      </p>
                      <p className="text-xs font-semibold text-[hsl(var(--foreground))] mt-0.5 capitalize">
                        {user.gender.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">
                Posts
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[hsl(var(--primary))]">
                {user.displayName}'s stories
              </h2>
            </div>
            <div className="rounded-2xl bg-[hsl(var(--muted))] px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))]">
              {storyCount} {storyCount === 1 ? "story" : "stories"}
            </div>
          </div>

          {stories.length ? (
            <div className="space-y-6">
              {stories.map((story) => (
                <StoryCard
                  key={story._id.toString()}
                  story={{
                    _id: story._id.toString(),
                    title: story.title,
                    content: story.content,
                    visibility: story.visibility,
                    createdAt: story.createdAt.toISOString(),
                    upvotesCount: story.upvotesCount,
                    downvotesCount: story.downvotesCount,
                    commentsCount: story.commentsCount,
                    author: {
                      username: story.author.username,
                      displayName: story.author.displayName,
                      avatarUrl: story.author.avatarUrl,
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center text-slate-600">
              <p className="font-semibold text-[hsl(var(--foreground))]">
                No stories yet.
              </p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                When this user posts, their memories will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
