import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { inferInverseRelationship } from "@/lib/helpers/relationships";
import { addRelationshipSchema } from "@/lib/validations/tree";
import FamilyMember from "@/models/FamilyMember";
import FamilyRelationship from "@/models/FamilyRelationship";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = addRelationshipSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid relationship data",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { fromMemberId, toMemberId, relationshipType } = validation.data;

    if (fromMemberId === toMemberId) {
      return NextResponse.json(
        { error: "A member cannot relate to itself" },
        { status: 400 },
      );
    }

    const [fromMember, toMember] = await Promise.all([
      FamilyMember.findOne({ _id: fromMemberId, treeOwner: authResult.userId }),
      FamilyMember.findOne({ _id: toMemberId, treeOwner: authResult.userId }),
    ]);

    if (!fromMember || !toMember) {
      return NextResponse.json(
        { error: "Invalid family members selected" },
        { status: 404 },
      );
    }

    const existing = await FamilyRelationship.findOne({
      treeOwner: authResult.userId,
      fromMember: fromMember._id,
      toMember: toMember._id,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Relationship already exists" },
        { status: 409 },
      );
    }

    const inverseType = inferInverseRelationship(
      relationshipType,
      toMember.gender,
    );

    const relationship = await FamilyRelationship.create({
      treeOwner: authResult.userId,
      fromMember: fromMember._id,
      toMember: toMember._id,
      relationshipType,
      isConfirmed: true,
    });

    const inverseRelationship = await FamilyRelationship.create({
      treeOwner: authResult.userId,
      fromMember: toMember._id,
      toMember: fromMember._id,
      relationshipType: inverseType,
      isConfirmed: true,
    });

    return NextResponse.json(
      { data: { relationship, inverseRelationship } },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Could not create relationship" },
      { status: 500 },
    );
  }
}
