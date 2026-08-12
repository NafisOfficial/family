import { setAuthCookie, signToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if OTP is expired
    if (!user.otpExpires || user.otpExpires < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Create token and login
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
          isEmailVerified: user.isEmailVerified,
        },
      },
      { status: 200 },
    );

    return await setAuthCookie(response, token);
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
