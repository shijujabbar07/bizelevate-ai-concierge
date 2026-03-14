import { NextResponse } from 'next/server';
import { getDoneVideos } from '@/lib/db';

export async function GET() {
  try {
    const videos = getDoneVideos();
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: 'Failed to load library' }, { status: 500 });
  }
}
