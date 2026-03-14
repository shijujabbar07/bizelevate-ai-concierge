import { NextRequest, NextResponse } from 'next/server';
import { searchYouTube } from '@/lib/downloader';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

  if (!q.trim()) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const results = await searchYouTube(q, Math.min(limit, 20));
    return NextResponse.json({ results });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
