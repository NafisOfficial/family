import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface TokenPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

const AUTH_SECRET = process.env.AUTH_SECRET!;
const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
const COOKIE_NAME = 'token';

if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is not set');
}

export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
  const token = jwt.sign(payload, AUTH_SECRET, { expiresIn: TOKEN_EXPIRY });
  return token;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY,
  });
  return res;
}

export async function clearAuthCookie(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  });
  return res;
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function requireAuth() {
  const token = await getAuthToken();

  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return new NextResponse(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return payload;
}

export async function getAuthPayload() {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
