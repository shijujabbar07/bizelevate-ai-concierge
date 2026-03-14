import Anthropic from '@anthropic-ai/sdk';
import type { IngestJob } from '@/types';

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set in .env.local');
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

interface Insights {
  summary: string;
  brief: string;
  tools_mentioned: string[];
  short_summary: string;
}

export async function generateInsights(transcript: string, video: Pick<IngestJob, 'title' | 'channel' | 'url'>): Promise<Insights> {
  const client = getClient();

  // Truncate very long transcripts to ~60k tokens equivalent (~240k chars) to stay within context
  const truncated = transcript.length > 200000 ? transcript.slice(0, 200000) + '\n\n[TRANSCRIPT TRUNCATED]' : transcript;

  const prompt = `You are analyzing a YouTube video for BizElevate, an AI automation consultancy focused on SMEs (clinics, service businesses). Your analysis will be stored as structured knowledge for future use.

VIDEO: "${video.title}"
CHANNEL: ${video.channel}
URL: ${video.url}

TRANSCRIPT:
${truncated}

Produce EXACTLY this output format (use these exact section headers):

===SHORT_SUMMARY===
One sentence (max 20 words) capturing what this video is about.

===TOOLS_MENTIONED===
Comma-separated list of tools, platforms, or technologies mentioned (e.g. VAPI, n8n, Twilio, Make, Zapier, Claude, GPT-4, etc.). If none, write: none

===SUMMARY===
Write a 3-paragraph summary:
- Paragraph 1: What the video covers and who it's for
- Paragraph 2: Key approaches, methods, or workflows demonstrated
- Paragraph 3: Main takeaways and practical applications

===CLAUDE_BRIEF===
Write a structured brief in this exact markdown format:

## Why It Matters
[1-2 sentences on why this matters for AI automation]

## Core Pattern
[The main workflow or approach demonstrated]

## Tools Mentioned
[Bullet list of tools]

## Reusable Ideas
[2-3 bullet points of patterns that can be reused]

## BizElevate Relevance
[How this applies to clinic/SME automation work]

## Cautions / Hype vs Reality
[Any caveats, oversimplifications, or implementation gaps]`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse sections
  const extract = (tag: string) => {
    const match = text.match(new RegExp(`===${tag}===\\s*([\\s\\S]*?)(?:===|$)`));
    return match ? match[1].trim() : '';
  };

  const short_summary = extract('SHORT_SUMMARY');
  const toolsRaw = extract('TOOLS_MENTIONED');
  const tools_mentioned = toolsRaw.toLowerCase() === 'none' || !toolsRaw
    ? []
    : toolsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const summary = extract('SUMMARY');
  const briefContent = extract('CLAUDE_BRIEF');

  const brief = `# ${video.title}

**Channel:** ${video.channel}
**URL:** ${video.url}
**Ingested:** ${new Date().toISOString().split('T')[0]}

${briefContent}`;

  return { summary, brief, tools_mentioned, short_summary };
}
