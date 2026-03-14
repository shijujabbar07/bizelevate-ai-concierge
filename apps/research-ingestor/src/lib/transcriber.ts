import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const MAX_WHISPER_BYTES = 24 * 1024 * 1024; // 24MB (Whisper limit is 25MB)

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set in .env.local');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function transcribeFile(filePath: string): Promise<string> {
  const client = getOpenAI();
  const response = await client.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    response_format: 'text',
  });
  return typeof response === 'string' ? response : (response as { text: string }).text;
}

async function splitAudio(filePath: string): Promise<string[]> {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const chunkPattern = path.join(dir, `${base}_chunk_%03d.mp3`);

  await new Promise<void>((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-i', filePath,
      '-f', 'segment',
      '-segment_time', '600', // 10-minute chunks
      '-c', 'copy',
      chunkPattern,
      '-y',
    ], { shell: process.platform === 'win32' });
    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error('ffmpeg split failed')));
    proc.on('error', (err) => reject(new Error(`ffmpeg not found: ${err.message}`)));
  });

  return fs.readdirSync(dir)
    .filter(f => f.startsWith(`${base}_chunk_`))
    .sort()
    .map(f => path.join(dir, f));
}

export async function transcribeAudio(filePath: string): Promise<string> {
  const stats = fs.statSync(filePath);

  if (stats.size <= MAX_WHISPER_BYTES) {
    return transcribeFile(filePath);
  }

  // File too large — split and transcribe chunks
  const chunks = await splitAudio(filePath);
  const transcripts: string[] = [];

  for (const chunk of chunks) {
    try {
      const text = await transcribeFile(chunk);
      transcripts.push(text);
    } finally {
      if (fs.existsSync(chunk)) fs.unlinkSync(chunk);
    }
  }

  return transcripts.join(' ');
}

export function cleanTranscript(raw: string): string {
  return raw
    .replace(/\[.*?\]/g, '') // remove [MUSIC], [APPLAUSE] etc
    .replace(/\(.*?\)/g, '') // remove (inaudible) etc
    .replace(/ {2,}/g, ' ')  // collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n') // collapse multiple newlines
    .trim();
}
