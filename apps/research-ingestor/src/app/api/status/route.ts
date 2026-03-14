import { NextResponse } from 'next/server';
import { getAllVideos } from '@/lib/db';

export async function GET() {
  try {
    const jobs = getAllVideos();
    return NextResponse.json({ jobs });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
