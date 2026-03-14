import type { Topic } from '@/types';

const RULES: Record<Topic, string[]> = {
  'voice-agents': ['vapi', 'voice', 'phone call', 'ivr', 'telephony', 'tts', 'speech', 'voice ai', 'voice bot', 'retell', 'bland ai', 'twilio voice', 'eleven labs', 'elevenlabs', 'voice assistant'],
  'ai-agency': ['ai agency', 'automation agency', 'n8n', 'make.com', 'zapier', 'workflow automation', 'client workflow', 'no-code', 'airtable', 'client automation', 'agency owner', 'sell automation'],
  'sms-automation': ['sms', 'text message', 'twilio sms', 'messaging', 'two-way sms', 'text automation', 'sms campaign', 'sms bot', 'whatsapp'],
  'appointment-reminders': ['appointment', 'booking', 'calendar', 'reminder', 'schedule', 'dental', 'clinic', 'medical', 'patient', 'health', 'practice management', 'no-show'],
  'general': [],
};

export function classifyVideo(title: string, transcript: string, toolsMentioned: string[]): Topic {
  const haystack = [title, transcript.slice(0, 5000), ...toolsMentioned].join(' ').toLowerCase();

  const scores: Record<Topic, number> = {
    'voice-agents': 0,
    'ai-agency': 0,
    'sms-automation': 0,
    'appointment-reminders': 0,
    'general': 0,
  };

  for (const [topic, keywords] of Object.entries(RULES) as [Topic, string[]][]) {
    if (topic === 'general') continue;
    for (const kw of keywords) {
      if (haystack.includes(kw)) scores[topic]++;
    }
  }

  const best = (Object.entries(scores) as [Topic, number][]).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'general';
}
