'use client';
import { useState, useEffect } from 'react';
import type { IngestJob } from '@/types';

const TOPICS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Topics' },
  { value: 'voice-agents', label: 'Voice Agents' },
  { value: 'ai-agency', label: 'AI Agency' },
  { value: 'sms-automation', label: 'SMS Automation' },
  { value: 'appointment-reminders', label: 'Appointment Reminders' },
  { value: 'general', label: 'General' },
];

export default function LibraryPage() {
  const [videos, setVideos] = useState<IngestJob[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/library').then(r => r.json()).then(d => setVideos(d.videos || []));
  }, []);

  const filtered = filter === 'all' ? videos : videos.filter(v => v.topic === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Knowledge Library</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TOPICS.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === t.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 py-16">No videos ingested yet.</div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {filtered.map(video => (
          <div key={video.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <img
                src={video.thumbnail}
                alt=""
                className="w-20 h-14 object-cover rounded flex-shrink-0 bg-gray-800"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="flex-1 min-w-0">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-white hover:text-blue-400 line-clamp-2 text-sm"
                >
                  {video.title}
                </a>
                <div className="text-xs text-gray-400 mt-1">{video.channel}</div>
                <div className="flex items-center gap-2 mt-2">
                  {video.topic && (
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{video.topic}</span>
                  )}
                  {video.ingest_date && (
                    <span className="text-xs text-gray-500">{video.ingest_date}</span>
                  )}
                </div>
                {video.folder_path && (
                  <div className="text-xs text-gray-600 mt-1 font-mono truncate">{video.folder_path}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
