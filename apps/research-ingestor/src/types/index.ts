export type VideoStatus = 'pending' | 'downloading' | 'transcribing' | 'summarizing' | 'done' | 'failed';

export type Topic = 'voice-agents' | 'ai-agency' | 'sms-automation' | 'appointment-reminders' | 'general';

export interface VideoResult {
  id: string;
  title: string;
  channel: string;
  url: string;
  duration: number;
  thumbnail: string;
  description?: string;
}

export interface IngestJob {
  id: string;
  title: string;
  channel: string;
  url: string;
  duration: number;
  thumbnail: string;
  status: VideoStatus;
  error?: string | null;
  topic?: Topic | null;
  folder_path?: string | null;
  ingest_date?: string | null;
  created_at: string;
}

export interface IndexEntry {
  id: string;
  title: string;
  channel: string;
  url: string;
  short_summary: string;
  tools_mentioned: string[];
  topic: Topic;
  folder_path: string;
  ingest_date: string;
}
