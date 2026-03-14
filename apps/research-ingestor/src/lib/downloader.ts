import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import type { VideoResult } from '@/types';

const TMP_DIR = path.resolve(process.cwd(), 'tmp');

// cookies.txt takes priority if it exists in the app root (recommended for Chrome users).
// Chrome locks its DB while open, so --cookies-from-browser chrome fails.
// Export cookies.txt via the "Get cookies.txt LOCALLY" Chrome extension from youtube.com.
const COOKIES_FILE = path.resolve(process.cwd(), 'cookies.txt');
const BROWSER = process.env.YTDLP_BROWSER || 'edge';

function getCookieArgs(): string[] {
  if (fs.existsSync(COOKIES_FILE)) {
    return ['--cookies', COOKIES_FILE];
  }
  return ['--cookies-from-browser', BROWSER];
}

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function runCommand(cmd: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    // On Windows, build a single quoted shell string so multi-word args are preserved.
    // spawn(cmd, args, { shell: true }) joins args with spaces without quoting, breaking
    // arguments like "ytsearch10:some multi word query".
    let proc;
    if (process.platform === 'win32') {
      const quotedArgs = args.map(a => /[\s&|<>^]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a).join(' ');
      proc = spawn(`${cmd} ${quotedArgs}`, [], { shell: true });
    } else {
      proc = spawn(cmd, args);
    }
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d: Buffer) => stdout += d.toString());
    proc.stderr.on('data', (d: Buffer) => stderr += d.toString());
    proc.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${cmd} exited with code ${code}: ${stderr.slice(0, 500)}`));
    });
    proc.on('error', (err) => reject(new Error(`Failed to spawn ${cmd}: ${err.message}. Is yt-dlp installed?`)));
  });
}

export async function searchYouTube(query: string, limit = 10): Promise<VideoResult[]> {
  const { stdout } = await runCommand('yt-dlp', [
    `ytsearch${limit}:${query}`,
    '--flat-playlist',
    '--dump-json',
    '--no-warnings',
    ...getCookieArgs(),
  ]);

  const lines = stdout.split('\n').filter(l => l.trim().startsWith('{'));
  const results: VideoResult[] = [];

  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      if (!data.id) continue;
      results.push({
        id: data.id,
        title: data.title || 'Unknown Title',
        channel: data.uploader || data.channel || 'Unknown',
        url: data.url || `https://www.youtube.com/watch?v=${data.id}`,
        duration: data.duration || 0,
        thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${data.id}/mqdefault.jpg`,
        description: data.description?.slice(0, 300),
      });
    } catch {
      // skip malformed lines
    }
  }

  return results;
}

export async function downloadAudio(url: string, videoId: string): Promise<string> {
  ensureTmp();
  const outputTemplate = path.join(TMP_DIR, `${videoId}.%(ext)s`); // ext will be m4a or webm

  await runCommand('yt-dlp', [
    url,
    '-f', 'bestaudio/best',
    '-o', outputTemplate,
    '--no-playlist',
    '--no-warnings',
    ...getCookieArgs(),
  ]);

  // Find the downloaded file
  const files = fs.readdirSync(TMP_DIR).filter(f => f.startsWith(videoId));
  if (files.length === 0) throw new Error('Download completed but no audio file found');
  return path.join(TMP_DIR, files[0]);
}

export function formatDuration(seconds: number): string {
  if (!seconds) return 'Unknown';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
