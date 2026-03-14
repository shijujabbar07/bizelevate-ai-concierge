import { NextRequest, NextResponse } from 'next/server';
import { updateStatus, getVideo } from '@/lib/db';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const video = getVideo(params.id);
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  updateStatus(params.id, 'pending', { error: null });
  return NextResponse.json({ ok: true });
}
