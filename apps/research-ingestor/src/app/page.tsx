'use client';
import { useState } from 'react';
import type { VideoResult } from '@/types';

function formatDuration(secs: number) {
  if (!secs) return '?:??';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VideoResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    setResults([]);
    setSelected(new Set());
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults(data.results || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function addToQueue() {
    const toAdd = results.filter(r => selected.has(r.id));
    if (toAdd.length === 0) return;
    setAdding(true);
    setMessage('');
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: toAdd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add');
      setMessage(`Added ${data.added} video(s) to queue. ${data.skipped} skipped (already queued/done).`);
      setSelected(new Set());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search YouTube</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. VAPI voice agents tutorial 2024"
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded font-medium"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">{error}</div>}
      {message && <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded mb-4">{message}</div>}

      {results.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-gray-400 text-sm">{results.length} results — {selected.size} selected</span>
          <div className="flex gap-3">
            <button
              onClick={() => setSelected(new Set(results.map(r => r.id)))}
              className="text-sm text-blue-400 hover:text-blue-300"
            >Select All</button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-gray-400 hover:text-gray-300"
            >Clear</button>
            <button
              onClick={addToQueue}
              disabled={selected.size === 0 || adding}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 px-4 py-1.5 rounded text-sm font-medium"
            >
              {adding ? 'Adding...' : `Add ${selected.size} to Queue`}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {results.map(video => (
          <div
            key={video.id}
            onClick={() => toggleSelect(video.id)}
            className={`flex gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
              selected.has(video.id)
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 bg-gray-900 hover:border-gray-600'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(video.id)}
              onChange={() => toggleSelect(video.id)}
              onClick={e => e.stopPropagation()}
              className="mt-1 flex-shrink-0"
            />
            <img
              src={video.thumbnail}
              alt=""
              className="w-32 h-20 object-cover rounded flex-shrink-0 bg-gray-800"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white mb-1 line-clamp-2">{video.title}</div>
              <div className="text-sm text-gray-400">{video.channel} · {formatDuration(video.duration)}</div>
              {video.description && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{video.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
