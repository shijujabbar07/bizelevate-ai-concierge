import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getVideo, updateStatus, isAlreadyDone } from '@/lib/db';
import { downloadAudio } from '@/lib/downloader';
import { transcribeAudio, cleanTranscript } from '@/lib/transcriber';
import { generateInsights } from '@/lib/summarizer';
import { classifyVideo } from '@/lib/classifier';
import { saveKnowledgeFiles } from '@/lib/knowledge';
import { updateIndexes } from '@/lib/indexer';

// Allow long-running requests (needed for download + transcribe pipeline)
export const maxDuration = 300;

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  let audioPath: string | null = null;

  try {
    const video = getVideo(id);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (isAlreadyDone(id)) {
      return NextResponse.json({ skipped: true, reason: 'Already processed' });
    }

    // Step 1: Download audio
    updateStatus(id, 'downloading');
    audioPath = await downloadAudio(video.url, id);

    // Step 2: Transcribe
    updateStatus(id, 'transcribing');
    const rawTranscript = await transcribeAudio(audioPath);
    const cleanedTranscript = cleanTranscript(rawTranscript);

    // Step 3: Generate insights
    updateStatus(id, 'summarizing');
    const { summary, brief, tools_mentioned, short_summary } = await generateInsights(rawTranscript, {
      title: video.title,
      channel: video.channel,
      url: video.url,
    });

    // Step 4: Classify
    const topic = classifyVideo(video.title, rawTranscript, tools_mentioned);

    // Step 5: Save knowledge files
    const folderPath = saveKnowledgeFiles({
      video: {
        id: video.id,
        title: video.title,
        channel: video.channel,
        url: video.url,
        duration: video.duration,
        thumbnail: video.thumbnail,
      },
      rawTranscript,
      cleanedTranscript,
      summary,
      brief,
      topic,
      toolsMentioned: tools_mentioned,
      shortSummary: short_summary,
    });

    // Step 6: Update indexes
    updateIndexes({
      id: video.id,
      title: video.title,
      channel: video.channel,
      url: video.url,
      short_summary,
      tools_mentioned,
      topic,
      folder_path: folderPath,
      ingest_date: new Date().toISOString().split('T')[0],
    });

    // Step 7: Mark done
    const ingestDate = new Date().toISOString().split('T')[0];
    updateStatus(id, 'done', { topic, folder_path: folderPath, ingest_date: ingestDate });

    // Step 8: Delete audio (objective complete — text is saved)
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    return NextResponse.json({ success: true, topic, folder_path: folderPath });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Pipeline failed';
    updateStatus(id, 'failed', { error: message });

    // Cleanup audio on failure too
    if (audioPath && fs.existsSync(audioPath)) {
      try { fs.unlinkSync(audioPath); } catch { /* ignore */ }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
