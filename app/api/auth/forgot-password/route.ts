import { connectDB } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether email exists — respond with success
      return NextResponse.json(
        {
          data: {
            message: "If an account exists, a reset link has been sent.",
          },
        },
        { status: 200 },
      );
    }

    // Generate token and expiry (1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;

    await user.save();

    // TODO: send real email. For now log reset link for developer/testing.
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${origin}/reset-password/${token}`;
    console.log(`Password reset for ${email}: ${resetUrl}`);

    return NextResponse.json(
      {
        data: { message: "If an account exists, a reset link has been sent." },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
