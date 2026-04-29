import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/app/lib/jwt';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

    // Query Firebase for admin with matching access code
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('accessCode', '==', accessCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      );
    }

    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data();

    // Check if admin is active
    if (adminData.status !== 'active') {
      return NextResponse.json(
        { error: 'Your admin account is not active. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // Create JWT token
    const jwttoken = await signToken({
      id: adminDoc.id,
      name: adminData.name,
      email: adminData.email,
      role: 'admin',
    });

    // Return token and admin info
    const response = NextResponse.json(
      {
        success: true,
        token: jwttoken,
        admin: {
          id: adminDoc.id,
          name: adminData.name,
          email: adminData.email,
          accessCode: adminData.accessCode,
          status: adminData.status,
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
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
