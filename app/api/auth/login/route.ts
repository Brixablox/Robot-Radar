import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, getUserByUsername } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const user = await getUserByUsername(username);
    if (!user || !user.password || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionToken = Buffer.from(JSON.stringify({ id: user.id, username: user.username, teamNumber: user.teamNumber, role: user.role })).toString('base64');

    const response = NextResponse.json({ success: true, user: { id: user.id, username: user.username, teamNumber: user.teamNumber } });
    response.cookies.set('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
