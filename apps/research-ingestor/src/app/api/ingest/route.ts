import { NextRequest, NextResponse } from 'next/server';
import { addVideo } from '@/lib/db';
import type { VideoResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const videos: VideoResult[] = body.videos || [];

    if (videos.length === 0) {
      return NextResponse.json({ error: 'No videos provided' }, { status: 400 });
    }

    let added = 0;
    let skipped = 0;

    for (const video of videos) {
      const wasAdded = addVideo({
        id: video.id,
        title: video.title,
        channel: video.channel,
        url: video.url,
        duration: video.duration,
        thumbnail: video.thumbnail,
      });
      if (wasAdded) added++;
      else skipped++;
    }

    return NextResponse.json({ added, skipped });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add' },
      { status: 500 }
    );
  }
}
