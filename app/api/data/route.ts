import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DOC_REF = doc(db, 'appData', 'config');

export async function GET() {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await setDoc(DOC_REF, body);
    return NextResponse.json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error writing to Firestore:', error);
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
