import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { addFamilyMemberSchema } from "@/lib/validations/tree";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = addFamilyMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid member data", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { linkedUserId, ...memberData } = validation.data;
    const linkedUser = linkedUserId ? await User.findById(linkedUserId) : null;

    const member = await FamilyMember.create({
      treeOwner: authResult.userId,
      linkedUser: linkedUser ? linkedUser._id : null,
      ...memberData,
    });

    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not add family member" },
      { status: 500 },
    );
  }
}
