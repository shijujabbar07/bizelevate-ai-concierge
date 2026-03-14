import fs from 'fs';
import path from 'path';
import type { IngestJob, VideoStatus } from '@/types';

// Pure JSON file store — no native deps, perfectly adequate for a local research tool.
const DB_PATH = path.resolve(process.cwd(), 'data', 'db.json');

function readDb(): IngestJob[] {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeDb(records: IngestJob[]) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2));
}

export function addVideo(video: Pick<IngestJob, 'id' | 'title' | 'channel' | 'url' | 'duration' | 'thumbnail'>): boolean {
  const records = readDb();
  const existing = records.find(r => r.id === video.id);
  if (existing) {
    if (existing.status === 'failed') {
      existing.status = 'pending';
      existing.error = null;
      writeDb(records);
      return true;
    }
    return false;
  }
  records.unshift({
    ...video,
    status: 'pending',
    created_at: new Date().toISOString(),
  });
  writeDb(records);
  return true;
}

export function getVideo(id: string): IngestJob | null {
  return readDb().find(r => r.id === id) ?? null;
}

export function getAllVideos(): IngestJob[] {
  return readDb();
}

export function getPendingVideo(): IngestJob | null {
  return readDb().find(r => r.status === 'pending') ?? null;
}

export function getDoneVideos(): IngestJob[] {
  return readDb().filter(r => r.status === 'done');
}

export function updateStatus(id: string, status: VideoStatus, extra: Partial<Pick<IngestJob, 'error' | 'topic' | 'folder_path' | 'ingest_date'>> = {}) {
  const records = readDb();
  const record = records.find(r => r.id === id);
  if (!record) return;
  record.status = status;
  if (extra.error !== undefined) record.error = extra.error;
  if (extra.topic !== undefined) record.topic = extra.topic;
  if (extra.folder_path !== undefined) record.folder_path = extra.folder_path;
  if (extra.ingest_date !== undefined) record.ingest_date = extra.ingest_date;
  writeDb(records);
}

export function isAlreadyDone(id: string): boolean {
  return readDb().some(r => r.id === id && r.status === 'done');
}
