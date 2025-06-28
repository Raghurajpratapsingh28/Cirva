import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { publicKey } = await request.json();
    if (!publicKey) {
      return NextResponse.json({ error: 'publicKey is required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { publicKey },
      update: {},
      create: { publicKey },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User register error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 

