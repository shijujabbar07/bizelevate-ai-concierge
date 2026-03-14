'use client';
import { useState, useEffect, useCallback } from 'react';
import type { IngestJob } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-700 text-gray-300',
  downloading: 'bg-yellow-900 text-yellow-300',
  transcribing: 'bg-blue-900 text-blue-300',
  summarizing: 'bg-purple-900 text-purple-300',
  done: 'bg-green-900 text-green-300',
  failed: 'bg-red-900 text-red-300',
};

export default function QueuePage() {
  const [jobs, setJobs] = useState<IngestJob[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [autoProcess, setAutoProcess] = useState(false);

  const fetchStatus = useCallback(async () => {
    const res = await fetch('/api/status');
    if (res.ok) {
      const data = await res.json();
      setJobs(data.jobs || []);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  async function processNext() {
    const pending = jobs.find(j => j.status === 'pending');
    if (!pending || processing) return;
    setProcessing(pending.id);
    try {
      await fetch(`/api/process/${pending.id}`, { method: 'POST' });
    } finally {
      setProcessing(null);
      fetchStatus();
    }
  }

  async function retryJob(id: string) {
    await fetch(`/api/retry/${id}`, { method: 'POST' });
    fetchStatus();
  }

  async function retryAllFailed() {
    const failed = jobs.filter(j => j.status === 'failed');
    await Promise.all(failed.map(j => fetch(`/api/retry/${j.id}`, { method: 'POST' })));
    fetchStatus();
  }

  useEffect(() => {
    if (!autoProcess) return;
    const hasPending = jobs.some(j => j.status === 'pending');
    const hasActive = jobs.some(j => ['downloading', 'transcribing', 'summarizing'].includes(j.status));
    if (hasPending && !hasActive && !processing) {
      processNext();
    }
  });

  const pendingCount = jobs.filter(j => j.status === 'pending').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;
  const activeJob = jobs.find(j => ['downloading', 'transcribing', 'summarizing'].includes(j.status));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Queue</h1>
        <div className="flex items-center gap-3">
          {failedCount > 0 && (
            <button
              onClick={retryAllFailed}
              className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium"
            >
              Retry All Failed ({failedCount})
            </button>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoProcess}
              onChange={e => setAutoProcess(e.target.checked)}
              className="rounded"
            />
            Auto-process
          </label>
          <button
            onClick={processNext}
            disabled={pendingCount === 0 || !!processing || !!activeJob}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
          >
            {processing || activeJob ? 'Processing...' : `Process Next (${pendingCount})`}
          </button>
        </div>
      </div>

      {jobs.length === 0 && (
        <div className="text-center text-gray-500 py-16">
          No videos in queue. <a href="/" className="text-blue-400 hover:underline">Search and add some.</a>
        </div>
      )}

      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white mb-1 truncate">{job.title}</div>
                <div className="text-sm text-gray-400">{job.channel}</div>
                {job.error && (
                  <div className="text-xs text-red-400 mt-1 font-mono break-all">{job.error}</div>
                )}
                {job.topic && job.status === 'done' && (
                  <div className="text-xs text-gray-500 mt-1">Topic: {job.topic} · {job.folder_path}</div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {job.status === 'failed' && (
                  <button
                    onClick={() => retryJob(job.id)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                  >
                    Retry
                  </button>
                )}
                <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[job.status] || ''}`}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
