import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, getUserByUsername } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';
import { AuthFormData } from '../../../types/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body: AuthFormData = await request.json();
    const { username, password, teamNumber } = body;

    if (!username || !password || username.length < 3) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 400 });
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        teamNumber,
      },
    });

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
