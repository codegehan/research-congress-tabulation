import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error writing data file:', error);
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
