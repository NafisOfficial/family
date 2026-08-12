import { setAuthCookie, signToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create token
    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
    });

    const response = NextResponse.json(
      {
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          coverUrl: user.coverUrl,
        },
      },
      { status: 200 },
    );

    return await setAuthCookie(response, token);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
