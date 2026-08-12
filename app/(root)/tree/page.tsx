import { TreeManager } from "@/components/tree/TreeManager";
import { getAuthPayload } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FamilyMember from "@/models/FamilyMember";
import FamilyRelationship from "@/models/FamilyRelationship";

export default async function TreePage() {
  const authPayload = await getAuthPayload();

  if (!authPayload) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-lg font-semibold text-slate-900">
            Sign in to view your memory tree.
          </p>
        </div>
      </main>
    );
  }

  await connectDB();

  const members = await FamilyMember.find({
    treeOwner: authPayload.userId,
  }).lean();
  const relationships = await FamilyRelationship.find({
    treeOwner: authPayload.userId,
  }).lean();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <TreeManager
          members={JSON.parse(JSON.stringify(members))}
          relationships={JSON.parse(JSON.stringify(relationships))}
        />
      </div>
    </main>
  );
}
