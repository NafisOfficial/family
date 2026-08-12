import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FamilyRelationship from "@/models/FamilyRelationship";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, context: { params: Promise<{id: string}> }) {
  try {
    await connectDB();
    const params = await context.params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const relationship = await FamilyRelationship.findOneAndDelete({
      _id: params.id,
      treeOwner: authResult.userId,
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 },
      );
    }

    await FamilyRelationship.deleteMany({
      treeOwner: authResult.userId,
      fromMember: relationship.toMember,
      toMember: relationship.fromMember,
    });

    return NextResponse.json(
      { data: { message: "Relationship removed" } },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to remove relationship" },
      { status: 500 },
    );
  }
}