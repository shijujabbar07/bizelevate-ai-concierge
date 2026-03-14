import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import type { IngestJob, Topic, IndexEntry } from '@/types';

export function getKnowledgeBase(): string {
  return process.env.KNOWLEDGE_BASE_PATH ||
    path.resolve(process.cwd(), '..', '..', 'knowledge', 'youtube-research');
}

export function initKnowledgeBase() {
  const base = getKnowledgeBase();
  const dirs = [
    'inbox',
    'processed',
    'indexes',
    'topics/voice-agents',
    'topics/ai-agency',
    'topics/sms-automation',
    'topics/appointment-reminders',
    'topics/general',
  ];
  for (const dir of dirs) {
    const full = path.join(base, dir);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  }
}

export function makeSlug(title: string, date: string): string {
  const clean = slugify(title, { lower: true, strict: true, trim: true }).slice(0, 60);
  return `${date}-${clean}`;
}

export interface KnowledgeFiles {
  video: Pick<IngestJob, 'id' | 'title' | 'channel' | 'url' | 'duration' | 'thumbnail'>;
  rawTranscript: string;
  cleanedTranscript: string;
  summary: string;
  brief: string;
  topic: Topic;
  toolsMentioned: string[];
  shortSummary: string;
}

export function saveKnowledgeFiles(data: KnowledgeFiles): string {
  initKnowledgeBase();
  const base = getKnowledgeBase();
  const date = new Date().toISOString().split('T')[0];
  const slug = makeSlug(data.video.title, date);
  const folder = path.join(base, 'processed', slug);

  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  // source.json
  fs.writeFileSync(path.join(folder, 'source.json'), JSON.stringify({
    id: data.video.id,
    title: data.video.title,
    channel: data.video.channel,
    url: data.video.url,
    duration: data.video.duration,
    thumbnail: data.video.thumbnail,
    topic: data.topic,
    tools_mentioned: data.toolsMentioned,
    short_summary: data.shortSummary,
    ingest_date: date,
    slug,
  }, null, 2));

  // transcript.raw.txt
  fs.writeFileSync(path.join(folder, 'transcript.raw.txt'), data.rawTranscript);

  // transcript.cleaned.md
  fs.writeFileSync(path.join(folder, 'transcript.cleaned.md'), `# Transcript: ${data.video.title}\n\n${data.cleanedTranscript}`);

  // summary.md
  fs.writeFileSync(path.join(folder, 'summary.md'), `# Summary: ${data.video.title}\n\n**Channel:** ${data.video.channel}  \n**URL:** ${data.video.url}  \n**Date:** ${date}  \n\n${data.summary}`);

  // claude-brief.md
  fs.writeFileSync(path.join(folder, 'claude-brief.md'), data.brief);

  return path.relative(base, folder).replace(/\\/g, '/');
}
