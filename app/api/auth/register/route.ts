import { connectDB } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
import { registerSchema } from "@/lib/validations/auth";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateUniqueUsername(displayName: string): Promise<string> {
  // Create base username from display name
  let baseUsername = displayName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 20);

  if (!baseUsername) {
    baseUsername = "user";
  }

  let username = baseUsername;
  let counter = 1;
  const maxAttempts = 100;

  // Check if username already exists and generate a unique one
  while (counter <= maxAttempts) {
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });

    if (!existingUser) {
      return username;
    }

    username = `${baseUsername}${counter}`;
    counter++;
  }

  // Fallback: use timestamp if unable to generate unique username
  return `${baseUsername}${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password, displayName } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    // Generate unique username from display name
    const username = await generateUniqueUsername(displayName);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with OTP, not yet verified
    const newUser = await User.create({
      username: username.toLowerCase(),
      email: normalizedEmail,
      passwordHash,
      displayName,
      otp,
      otpExpires,
      isEmailVerified: false,
    });

    await sendOtpEmail(normalizedEmail, otp);

    return NextResponse.json(
      {
        data: {
          message:
            "User created. Please verify your email with the OTP sent to your email.",
          email: newUser.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
