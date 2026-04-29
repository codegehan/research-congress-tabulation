import { signToken } from '@/app/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';

interface TokenPayload {
  id: string;
  name?: string;
  email?: string;
  role: 'judge' | 'admin';
  iat?: number;
  exp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, role } = body;

    if (!id || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: id and role' },
        { status: 400 }
      );
    }

    // Create JWT payload
    const payload: TokenPayload = {
      id,
      role,
      ...(name && { name }),
      ...(email && { email }),
    };

    // Sign the token (expires in 24 hours)
    const token = await signToken(payload, '24h');

    return NextResponse.json({
      token,
      payload,
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
