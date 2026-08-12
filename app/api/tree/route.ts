import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FamilyMember from "@/models/FamilyMember";
import FamilyRelationship from "@/models/FamilyRelationship";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const members = await FamilyMember.find({
      treeOwner: authResult.userId,
    }).lean();
    const relationships = await FamilyRelationship.find({
      treeOwner: authResult.userId,
    }).lean();

    return NextResponse.json(
      { data: { members, relationships } },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to load family tree" },
      { status: 500 },
    );
  }
}
