import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/app/lib/jwt';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessCode } = body;

    if (!accessCode || !accessCode.trim()) {
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 400 }
      );
    }

    // Query Firebase for judge with matching access code
    const configRef = doc(db, 'appData', 'config');
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
        return NextResponse.json({ error: 'Configuration not found' }, { status: 500 });
    }

    const configData = configSnap.data();
    const judges: any[] = configData.judges || [];

    // Find judge with matching accessCode
    const judge = judges.find(j => j.accessCode === accessCode.trim());

    if (!judge) {
        return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
    }

    // if (judge.status !== 'active') {
    //     return NextResponse.json(
    //         { error: 'Your account is not active. Please contact the administrator.' },
    //         { status: 403 }
    //     );
    // }

    // Create JWT token
    const jwttoken = await signToken({
        id: judge.id,
        name: judge.name,
        email: judge.credentials,
        role: 'judge',
    });
    // Return token and judge info
    const response = NextResponse.json(
      {
        success: true,
        token: jwttoken,
        judge: {
            id: judge.id,
            name: judge.name,
            credentials: judge.credentials,
            accessCode: judge.accessCode,
            status: judge.status,
        },
      },
      { status: 200 }
    );
    response.cookies.set('token', jwttoken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',  
        sameSite: 'strict',  
        maxAge: 60 * 60 * 24,
        path: '/',
    });

    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
