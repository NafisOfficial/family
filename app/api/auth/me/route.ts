import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await connectDB();

    const authResult = await requireAuth();

    // If authResult is a NextResponse (error), return it
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = await User.findById(authResult.userId).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, __v, ...userWithoutSensitive } = user;

    return NextResponse.json({ data: userWithoutSensitive }, { status: 200 });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
