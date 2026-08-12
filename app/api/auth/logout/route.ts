import { connectDB } from '@/lib/db';
import { clearAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await connectDB();

    const response = NextResponse.json(
      { data: { message: 'Logged out successfully' } },
      { status: 200 }
    );

    return await clearAuthCookie(response);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
