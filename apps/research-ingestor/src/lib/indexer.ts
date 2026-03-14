import fs from 'fs';
import path from 'path';
import type { Topic } from '@/types';
import { getKnowledgeBase } from './knowledge';

export interface IndexRecord {
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

function readIndex(filePath: string): IndexRecord[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const jsonPath = filePath.replace('.md', '.json');
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    }
  } catch { /* fall through */ }
  return [];
}

function writeIndex(filePath: string, records: IndexRecord[]) {
  const jsonPath = filePath.replace('.md', '.json');
  fs.writeFileSync(jsonPath, JSON.stringify(records, null, 2));

  // Also write human-readable markdown
  const lines = [
    `# Index: ${path.basename(filePath, '.md')}`,
    ``,
    `_Last updated: ${new Date().toISOString().split('T')[0]} | ${records.length} entries_`,
    ``,
    `---`,
    ``,
  ];

  for (const r of records) {
    lines.push(`## ${r.title}`);
    lines.push(`- **Channel:** ${r.channel}`);
    lines.push(`- **URL:** ${r.url}`);
    lines.push(`- **Topic:** ${r.topic}`);
    lines.push(`- **Date:** ${r.ingest_date}`);
    lines.push(`- **Summary:** ${r.short_summary}`);
    if (r.tools_mentioned.length > 0) lines.push(`- **Tools:** ${r.tools_mentioned.join(', ')}`);
    lines.push(`- **Folder:** ${r.folder_path}`);
    lines.push(``);
  }

  fs.writeFileSync(filePath, lines.join('\n'));
}

export function updateIndexes(record: IndexRecord) {
  const base = getKnowledgeBase();
  const indexDir = path.join(base, 'indexes');
  if (!fs.existsSync(indexDir)) fs.mkdirSync(indexDir, { recursive: true });

  // Master index
  const masterPath = path.join(indexDir, 'master-index.md');
  const master = readIndex(masterPath).filter(r => r.id !== record.id);
  master.unshift(record);
  writeIndex(masterPath, master);

  // Topic index
  const topicPath = path.join(indexDir, `${record.topic}.md`);
  const topicIndex = readIndex(topicPath).filter(r => r.id !== record.id);
  topicIndex.unshift(record);
  writeIndex(topicPath, topicIndex);
}

export function readMasterIndex(): IndexRecord[] {
  const base = getKnowledgeBase();
  const jsonPath = path.join(base, 'indexes', 'master-index.json');
  if (!fs.existsSync(jsonPath)) return [];
  try { return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')); } catch { return []; }
}

export function readTopicIndex(topic: Topic): IndexRecord[] {
  const base = getKnowledgeBase();
  const jsonPath = path.join(base, 'indexes', `${topic}.json`);
  if (!fs.existsSync(jsonPath)) return [];
  try { return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')); } catch { return []; }
}

export function readIndexFile(topic: string): string {
  const base = getKnowledgeBase();
  const mdPath = path.join(base, 'indexes', `${topic}.md`);
  if (!fs.existsSync(mdPath)) return '_No entries yet._';
  return fs.readFileSync(mdPath, 'utf-8');
}
