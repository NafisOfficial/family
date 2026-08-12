import { ConnectionsManager } from "@/components/connections/ConnectionsManager";
import { getAuthPayload } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ConnectionRequest from "@/models/ConnectionRequest";

export default async function ConnectionsPage() {
  const authPayload = await getAuthPayload();

  if (!authPayload) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10 sm:px-6 lg:px-8 font-body">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Sign in to manage your connections.
          </p>
        </div>
      </main>
    );
  }

  await connectDB();

  const requests = await ConnectionRequest.find({
    $or: [{ sender: authPayload.userId }, { receiver: authPayload.userId }],
  })
    .populate("sender", "username displayName")
    .populate("receiver", "username displayName")
    .lean();

  const pending = requests
    .filter((request) => request.status === "pending")
    .map((request) => ({
      _id: request._id.toString(),
      senderUsername:
        typeof request.sender === "object" ? request.sender.username : "",
      receiverUsername:
        typeof request.receiver === "object" ? request.receiver.username : "",
      relationshipType: request.relationshipType,
      status: request.status,
    }));

  const accepted = requests
    .filter((request) => request.status === "accepted")
    .map((request) => ({
      _id: request._id.toString(),
      senderUsername:
        typeof request.sender === "object" ? request.sender.username : "",
      receiverUsername:
        typeof request.receiver === "object" ? request.receiver.username : "",
      relationshipType: request.relationshipType,
      status: request.status,
    }));

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10 sm:px-6 lg:px-8 font-body">
      <div className="mx-auto max-w-6xl">
        <ConnectionsManager pending={pending} accepted={accepted} />
      </div>
    </main>
  );
}
