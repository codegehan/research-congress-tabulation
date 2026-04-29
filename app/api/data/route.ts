import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { verifyToken } from '@/app/lib/jwt';

const DOC_REF = doc(db, 'appData', 'config');

async function authenticateRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value
    ?? request.headers.get('authorization')?.split(' ')[1];

  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const payload = await authenticateRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snapshot = await getDoc(DOC_REF);
    if (!snapshot.exists()) {
      return NextResponse.json({
        categories: [],
        scoringSettings: {},
        presentations: [],
      });
    }
    return NextResponse.json(snapshot.data());
  } catch (error) {
    console.error('Error reading from Firestore:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = await authenticateRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    await setDoc(DOC_REF, body);
    return NextResponse.json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error writing to Firestore:', error);
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}