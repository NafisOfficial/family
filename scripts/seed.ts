import { connectDB } from "@/lib/db";
import FamilyMember from "@/models/FamilyMember";
import FamilyRelationship from "@/models/FamilyRelationship";
import User from "@/models/User";
import bcrypt from "bcryptjs";

async function seed() {
  await connectDB();

  const demoEmail = "demo@familytree.com";
  const demoPassword = "DemoPassword123";

  const existingUser = await User.findOne({ email: demoEmail });
  if (existingUser) {
    console.log("Demo user already exists. Skipping seed.");
    return;
  }

  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const demoUser = await User.create({
    username: "demo_user",
    email: demoEmail,
    passwordHash,
    displayName: "You",
    bio: "Demo account for exploring the family tree interface.",
    avatarUrl: "",
    coverUrl: "",
    dateOfBirth: new Date("1990-06-15"),
    gender: "other",
    isEmailVerified: true,
  });

  const treeOwner = demoUser._id;

  const members = await FamilyMember.create([
    {
      treeOwner,
      displayName: "You",
      gender: "other",
      bio: "The center of your demo family tree.",
      dateOfBirth: new Date("1990-06-15"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Father",
      gender: "male",
      bio: "Your father in the demo family.",
      dateOfBirth: new Date("1965-02-12"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Mother",
      gender: "female",
      bio: "Your mother in the demo family.",
      dateOfBirth: new Date("1967-09-08"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Grandfather",
      gender: "male",
      bio: "Your grandfather in the demo family.",
      dateOfBirth: new Date("1940-03-21"),
      isAlive: false,
    },
    {
      treeOwner,
      displayName: "Grandmother",
      gender: "female",
      bio: "Your grandmother in the demo family.",
      dateOfBirth: new Date("1942-07-11"),
      isAlive: false,
    },
    {
      treeOwner,
      displayName: "Uncle",
      gender: "male",
      bio: "Your uncle from your parents' side.",
      dateOfBirth: new Date("1968-11-30"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Aunt",
      gender: "female",
      bio: "Your aunt from your parents' side.",
      dateOfBirth: new Date("1970-05-19"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Brother",
      gender: "male",
      bio: "Your brother in the demo family.",
      dateOfBirth: new Date("1993-12-02"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Sister",
      gender: "female",
      bio: "Your sister in the demo family.",
      dateOfBirth: new Date("1995-08-23"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Cousin",
      gender: "female",
      bio: "Your cousin in the demo family.",
      dateOfBirth: new Date("1994-04-05"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Son",
      gender: "male",
      bio: "Your son in the demo family.",
      dateOfBirth: new Date("2018-01-10"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Daughter",
      gender: "female",
      bio: "Your daughter in the demo family.",
      dateOfBirth: new Date("2020-10-20"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Nephew",
      gender: "male",
      bio: "Your nephew in the demo family.",
      dateOfBirth: new Date("2019-05-30"),
      isAlive: true,
    },
    {
      treeOwner,
      displayName: "Niece",
      gender: "female",
      bio: "Your niece in the demo family.",
      dateOfBirth: new Date("2021-11-15"),
      isAlive: true,
    },
  ]);

  const memberByName = new Map(
    members.map((member: any) => [member.displayName, member]),
  );
  const you = memberByName.get("You")!;
  const father = memberByName.get("Father")!;
  const mother = memberByName.get("Mother")!;
  const grandfather = memberByName.get("Grandfather")!;
  const grandmother = memberByName.get("Grandmother")!;
  const uncle = memberByName.get("Uncle")!;
  const aunt = memberByName.get("Aunt")!;
  const brother = memberByName.get("Brother")!;
  const sister = memberByName.get("Sister")!;
  const cousin = memberByName.get("Cousin")!;
  const son = memberByName.get("Son")!;
  const daughter = memberByName.get("Daughter")!;
  const nephew = memberByName.get("Nephew")!;
  const niece = memberByName.get("Niece")!;

  const createRelation = async (
    fromMember: (typeof members)[number],
    toMember: (typeof members)[number],
    relationshipType: string,
  ) => {
    await FamilyRelationship.create({
      treeOwner,
      fromMember: fromMember._id,
      toMember: toMember._id,
      relationshipType,
      isConfirmed: true,
    });
  };

  const relationships: { from: any; to: any; type: string }[] = [
    { from: you, to: father, type: "father" },
    { from: you, to: mother, type: "mother" },
    { from: you, to: brother, type: "brother" },
    { from: you, to: sister, type: "sister" },
    { from: you, to: cousin, type: "cousin" },
    { from: you, to: son, type: "son" },
    { from: you, to: daughter, type: "daughter" },
    { from: you, to: nephew, type: "nephew" },
    { from: you, to: niece, type: "niece" },
    { from: father, to: grandfather, type: "father" },
    { from: father, to: grandmother, type: "mother" },
    { from: mother, to: grandfather, type: "grandfather" },
    { from: mother, to: grandmother, type: "grandmother" },
    { from: father, to: uncle, type: "brother" },
    { from: mother, to: aunt, type: "sister" },
  ];

  for (const relation of relationships) {
    await createRelation(relation.from, relation.to, relation.type as any);
    const inverseType = inferInverse(
      relation.type as any,
      relation.to.gender as any,
    );
    await FamilyRelationship.create({
      treeOwner,
      fromMember: relation.to._id,
      toMember: relation.from._id,
      relationshipType: inverseType,
      isConfirmed: true,
    });
  }

  console.log(
    "Demo seed complete. Login with demo@familytree.com / DemoPassword123",
  );
}

function inferInverse(type: string, gender: string) {
  const inverseMap: Record<string, string> = {
    father: gender === "male" ? "son" : "daughter",
    mother: gender === "male" ? "son" : "daughter",
    son: "father",
    daughter: "father",
    spouse: "spouse",
    brother: gender === "male" ? "brother" : "sister",
    sister: gender === "male" ? "brother" : "sister",
    grandfather: gender === "male" ? "grandson" : "granddaughter",
    grandmother: gender === "male" ? "grandson" : "granddaughter",
    grandson: "grandfather",
    granddaughter: "grandfather",
    uncle: gender === "male" ? "nephew" : "niece",
    aunt: gender === "male" ? "nephew" : "niece",
    nephew: "uncle",
    niece: "uncle",
    cousin: "cousin",
  };
  return inverseMap[type] || "cousin";
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
