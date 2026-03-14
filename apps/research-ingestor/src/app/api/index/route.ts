import { NextRequest, NextResponse } from 'next/server';
import { readIndexFile } from '@/lib/indexer';

const ALLOWED = ['master-index', 'voice-agents', 'ai-agency', 'sms-automation', 'appointment-reminders', 'general'];

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name') || 'master-index';
  if (!ALLOWED.includes(name)) {
    return NextResponse.json({ error: 'Invalid index name' }, { status: 400 });
  }
  const content = readIndexFile(name);
  return NextResponse.json({ content });
}
