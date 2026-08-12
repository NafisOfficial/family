import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { editFamilyMemberSchema } from "@/lib/validations/tree";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, context: { params: Promise<{memberId: string}> }) {
  try {
    await connectDB();
    const params = await context.params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = editFamilyMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid member update", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const member = await FamilyMember.findOne({
      _id: params.memberId,
      treeOwner: authResult.userId,
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (validation.data.linkedUserId !== undefined) {
      if (validation.data.linkedUserId === null) {
        member.linkedUser = null;
      } else {
        const linkedUser = await User.findById(validation.data.linkedUserId);
        member.linkedUser = linkedUser ? linkedUser._id : member.linkedUser;
      }
    }

    Object.assign(member, validation.data);
    await member.save();

    return NextResponse.json({ data: member }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to update member" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{memberId: string}> }) {
  try {
    await connectDB();
    const params = await context.params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const member = await FamilyMember.findOneAndDelete({
      _id: params.memberId,
      treeOwner: authResult.userId,
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(
      { data: { message: "Member removed" } },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to remove member" },
      { status: 500 },
    );
  }
}