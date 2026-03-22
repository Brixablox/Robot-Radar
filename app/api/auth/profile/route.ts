import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('sessionToken')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let sessionData;
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString();
      sessionData = JSON.parse(decoded);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionData.id },
      select: {
        id: true,
        username: true,
        teamNumber: true,
        role: true,
        memberships: {
          select: {
            status: true,
            teamNumber: true,
          },
        },
      },
    });

    if (!user || user.username !== sessionData.username) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
