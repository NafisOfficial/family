import { connectDB } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
import User from "@/models/User";
import { NextResponse } from "next/server";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        { data: { message: "If an account exists, a new OTP has been sent." } },
        { status: 200 },
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 },
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtpEmail(email.toLowerCase(), otp);

    return NextResponse.json(
      { data: { message: "If an account exists, a new OTP has been sent." } },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
