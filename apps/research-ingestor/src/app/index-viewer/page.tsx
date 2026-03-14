'use client';
import { useState, useEffect } from 'react';

const INDEXES = [
  { value: 'master-index', label: 'Master Index' },
  { value: 'voice-agents', label: 'Voice Agents' },
  { value: 'ai-agency', label: 'AI Agency' },
  { value: 'sms-automation', label: 'SMS Automation' },
  { value: 'appointment-reminders', label: 'Appointment Reminders' },
  { value: 'general', label: 'General' },
];

export default function IndexViewerPage() {
  const [current, setCurrent] = useState('master-index');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/api/index?name=${current}`)
      .then(r => r.json())
      .then(d => setContent(d.content || '_Empty_'));
  }, [current]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Index Viewer</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {INDEXES.map(idx => (
          <button
            key={idx.value}
            onClick={() => setCurrent(idx.value)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              current === idx.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {idx.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">{content}</pre>
      </div>
    </div>
  );
}
