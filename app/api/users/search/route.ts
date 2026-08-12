import { getAuthPayload } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const auth = await getAuthPayload();
    const excludeId = auth?.userId ?? null;

    // build case-insensitive regex for partial match
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const users = await User.find(
      {
        $and: [
          { _id: { $ne: excludeId } },
          { $or: [{ username: regex }, { displayName: regex }] },
        ],
      },
      { username: 1, displayName: 1 },
    )
      .limit(20)
      .lean();

    const data = users.map((u: any) => ({
      _id: u._id.toString(),
      name: u.displayName,
      username: u.username,
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to search users" },
      { status: 500 },
    );
  }
}
