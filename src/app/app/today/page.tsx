'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import FileUpload from '@/app/components/FileUpload';

interface Memory {
  id: string;
  title: string;
  content: string;
  source: string;
  type: string;
  priority?: 'high' | 'medium' | 'low';
  due_date?: string;
  tags: string[];
  status: string;
  created_at: string;
}

type CategoryKey = 'needs_attention' | 'due_today' | 'waiting' | 'coming_up' | 'other';

export default function TodayPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [notifications, setNotifications] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [extractedFileText, setExtractedFileText] = useState('');
  const [sessionToken, setSessionToken] = useState('');

  useEffect(() => {
    console.log('⚡ useEffect mounted');
    loadData();
  }, []);

  const loadData = async () => {
    console.log('🚀 loadData started');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('📋 Got session:', session?.user?.email);
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }
    setSessionToken(session.access_token);

    // Check for Gmail/Calendar/Slack tokens in URL
    const params = new URLSearchParams(window.location.search);
    const gmailToken = params.get('gmail_token');
    const slackToken = params.get('slack_token');

    if (gmailToken) {
      await fetchEmails(gmailToken, session.access_token);
      await syncCalendar(gmailToken, session.access_token);
    }

    if (slackToken) {
      await syncSlack(slackToken, session.access_token);
    }

    if (gmailToken || slackToken) {
      // Remove tokens from URL
      window.history.replaceState({}, '', '/app/today');
    }

    await fetchMemories();
    await fetchNotifications(session.access_token);
  };

  const fetchEmails = async (accessToken: string, authToken: string) => {
    try {
      const res = await fetch('/api/gmail/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, authToken }),
      });
      const data = await res.json();
      console.log('Gmail fetch result:', data);
    } catch (error) {
      console.error('Gmail fetch error:', error);
    }
  };

  const syncCalendar = async (accessToken: string, authToken: string) => {
    try {
      const res = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, authToken }),
      });
      const data = await res.json();
      console.log('Calendar sync result:', data);
    } catch (error) {
      console.error('Calendar sync error:', error);
    }
  };

  const syncSlack = async (slackToken: string, authToken: string) => {
    try {
      const res = await fetch('/api/slack/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slackToken, authToken }),
      });
      const data = await res.json();
      console.log('Slack sync result:', data);
    } catch (error) {
      console.error('Slack sync error:', error);
    }
  };

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Fetched memories:', {
      count: data?.length,
      error: error?.message || error?.code || 'none',
      fullError: JSON.stringify(error)
    });

    if (error) {
      console.error('Full error details:', error);
    }

    console.log('CHECK: error=', error, 'data=', data?.length);

    if (!error && data) {
      console.log('✅ SETTING MEMORIES with', data.length, 'items');
      console.log('First memory:', data[0]);
      setMemories(data);
      console.log('✅ setMemories called, state should update');
    } else if (error) {
      console.log('❌ No data due to error:', error);
    } else {
      console.log('❌ No data, no error - strange state');
    }
    setLoading(false);
  };

  const fetchNotifications = async (token: string) => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        console.log('Notifications:', data);
      }
    } catch (error) {
      console.error('Notifications fetch error:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
        console.log('Search results:', data.count, 'items');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setExtracting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('authToken', session.access_token);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Transcribed:', data.transcript);
        await fetchMemories();
      }
    } catch (error) {
      console.error('Transcribe failed:', error);
    } finally {
      setExtracting(false);
    }
  };

  const testVoiceCapture = async () => {
    setExtracting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setExtracting(false);
      return;
    }

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Meeting with Sarah on Friday morning to review the Q4 marketing strategy and budget. Need to finalize by Thursday EOD. Also need to send status report to executives by Wednesday.',
          authToken: session.access_token,
        }),
      });

      if (res.ok) {
        await fetchMemories();
      }
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setExtracting(false);
    }
  };

  const categorizeMemory = (memory: Memory): CategoryKey => {
    if (memory.priority === 'high' && !memory.due_date) return 'needs_attention';
    if (memory.due_date) {
      const dateStr = typeof memory.due_date === 'string' ? memory.due_date.split('T')[0] : memory.due_date;
      const dueDate = new Date(dateStr + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate.getTime() === today.getTime()) return 'due_today';
      if (dueDate.getTime() > today.getTime()) return 'coming_up';
    }
    return 'other';
  };

  const groupedMemories = memories.reduce(
    (acc, memory) => {
      const category = categorizeMemory(memory);
      if (!acc[category]) acc[category] = [];
      acc[category].push(memory);
      return acc;
    },
    {} as Record<CategoryKey, Memory[]>
  );

  console.log('Grouped memories BEFORE render:', {
    total: memories.length,
    needs_attention: groupedMemories.needs_attention?.length || 0,
    due_today: groupedMemories.due_today?.length || 0,
    coming_up: groupedMemories.coming_up?.length || 0,
    other: groupedMemories.other?.length || 0,
    allKeys: Object.keys(groupedMemories)
  });

  console.log('Full groupedMemories object:', groupedMemories);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullText = extractedFileText ? `${extractedFileText}\n\n${content}` : content;
    if (!fullText.trim()) return;

    setExtracting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setExtracting(false);
      return;
    }

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          authToken: session.access_token,
        }),
      });

      if (response.ok) {
        setContent('');
        setExtractedFileText('');
        await fetchMemories();
      }
    } catch (error) {
      console.error('Extract failed:', error);
    } finally {
      setExtracting(false);
    }
  };

  const categories: { key: CategoryKey; label: string; color: string; gradient: string; svgPath: string }[] = [
    {
      key: 'needs_attention',
      label: 'Needs Attention',
      color: 'border-red-200 bg-red-50',
      gradient: 'from-red-400 to-red-500',
      svgPath: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
    },
    {
      key: 'due_today',
      label: 'Due Today',
      color: 'border-orange-200 bg-orange-50',
      gradient: 'from-orange-400 to-orange-500',
      svgPath: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z'
    },
    {
      key: 'coming_up',
      label: 'Coming Up',
      color: 'border-blue-200 bg-blue-50',
      gradient: 'from-blue-400 to-blue-500',
      svgPath: 'M11.99 5V1h-8v4H1v14h22V5h-11.01zm7 10h-5v5h-4v-5H4v-4h5V7h4v4h5v4z'
    },
    {
      key: 'other',
      label: 'Other',
      color: 'border-gray-200 bg-gray-50',
      gradient: 'from-gray-400 to-gray-500',
      svgPath: 'M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z'
    },
  ];

  const renderIcon = (gradient: string, svgPath: string) => (
    <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center`}>
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d={svgPath} />
      </svg>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <nav className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-purple-400/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white truncate">Recall AI</h1>
          </div>
          <div className="hidden md:flex gap-4 lg:gap-6 items-center flex-wrap justify-end">
            <a href="/app/ask" className="text-white/90 hover:text-white font-semibold text-sm px-3 py-2 rounded-lg hover:bg-white/20 transition-all">Ask</a>
            <a href="/app/today" className="text-white/90 hover:text-white font-semibold text-sm px-3 py-2 rounded-lg hover:bg-white/20 transition-all">Dashboard</a>
            <a href="/app/people" className="text-white/90 hover:text-white font-semibold text-sm px-3 py-2 rounded-lg hover:bg-white/20 transition-all">People</a>
            <a href="/app/analytics" className="text-white/90 hover:text-white font-semibold text-sm px-3 py-2 rounded-lg hover:bg-white/20 transition-all">Analytics</a>
            <a href="/app/settings" className="text-white/90 hover:text-white font-semibold text-sm px-3 py-2 rounded-lg hover:bg-white/20 transition-all">Settings</a>
            <button onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/'))} className="text-white/90 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/20 transition-all">Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-1 h-fit sticky top-8">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-2xl p-6 backdrop-blur-sm border border-purple-400/30">
              <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                Capture Memory
              </h3>
              <form onSubmit={handleAddMemory} className="space-y-3">
                {extractedFileText && (
                  <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-xs text-green-200 font-semibold mb-1">✅ File Extracted:</p>
                    <p className="text-sm text-white/90 line-clamp-2">{extractedFileText.substring(0, 100)}...</p>
                  </div>
                )}
                <textarea
                  placeholder="Tell me what you need to remember..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:bg-white/20 transition-all duration-200"
                />
                <FileUpload
                  onExtractedText={(text, fileName) => {
                    setExtractedFileText(text);
                    console.log(`📎 Extracted from ${fileName}:`, text.substring(0, 100));
                  }}
                  authToken={sessionToken}
                />
                <button
                  type="submit"
                  disabled={extracting || recording}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54h2.04v2.06h3.02v-2.05h2.04l-2.75-3.54-1.56 1.99z" />
                    </svg>
                  </div>
                  {extracting ? '⏳ Extracting...' : 'Capture & Extract'}
                </button>
              </form>
              <div className="border-t border-white/20 pt-4 mt-4">
                <p className="text-sm text-white/80 mb-3 font-semibold">Or record:</p>
                <button
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  disabled={extracting}
                  className={`w-full py-3 font-bold rounded-xl text-white transition-all duration-200 border shadow-lg hover:shadow-xl mb-2 flex items-center justify-center gap-2 ${
                    recording
                      ? 'bg-red-500/80 hover:bg-red-600 border-red-400/50'
                      : 'bg-white/20 hover:bg-white/30 border-white/30 hover:border-white/50 disabled:opacity-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${recording ? 'bg-red-300' : 'bg-gradient-to-br from-cyan-300 to-blue-300'}`}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                    </svg>
                  </div>
                  {recording ? 'Stop Recording' : 'Record Voice'}
                </button>
                <button
                  type="button"
                  onClick={testVoiceCapture}
                  disabled={extracting}
                  className="w-full py-2 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 disabled:opacity-50 transition-all duration-200 border border-white/20 text-sm flex items-center justify-center gap-2"
                >
                  <div className="w-4 h-4 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9.5c0 .83-.67 1.5-1.5 1.5S11 13.33 11 12.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5z" />
                    </svg>
                  </div>
                  Test Demo
                </button>
              </div>
              <div className="border-t border-white/20 pt-4 mt-4">
                <p className="text-sm text-white/80 mb-3 font-semibold">Or sync from:</p>
                <a
                  href="/api/auth/gmail"
                  className="w-full block py-2 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 text-center mb-2 transition-all duration-200 border border-white/20 hover:border-white/50 flex items-center justify-center gap-2 group"
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-red-400/50">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>
                  Gmail
                </a>
                <a
                  href="/api/auth/gmail"
                  className="w-full block py-2 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 text-center mb-2 transition-all duration-200 border border-white/20 hover:border-white/50 flex items-center justify-center gap-2 group"
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-400/50">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                    </svg>
                  </div>
                  Calendar
                </a>
                <a
                  href="/api/auth/slack"
                  className="w-full block py-2 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 text-center transition-all duration-200 border border-white/20 hover:border-white/50 flex items-center justify-center gap-2 group"
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-400/50">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 2c-2.2 0-4 1.8-4 4v6c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4H6zm0 4h4v4H6V6zm12 0c0-2.2-1.8-4-4-4s-4 1.8-4 4v2h4v4h4V6zm-4 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
                    </svg>
                  </div>
                  Slack
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {notifications && (notifications.summary.overdue > 0 || notifications.summary.dueToday > 0) && (
              <div className="mb-8 space-y-3">
                {notifications.summary.overdue > 0 && (
                  <div className="bg-gradient-to-r from-red-600/20 to-red-600/10 border-l-4 border-red-500 p-4 rounded-xl backdrop-blur-sm">
                    <h3 className="font-bold text-red-200">🚨 {notifications.summary.overdue} Overdue Item{notifications.summary.overdue !== 1 ? 's' : ''}</h3>
                    <div className="text-sm text-red-100 mt-2 space-y-1">
                      {notifications.overdue.slice(0, 3).map((item: any) => (
                        <p key={item.id}>• {item.title} ({item.daysOverdue} days overdue)</p>
                      ))}
                    </div>
                  </div>
                )}
                {notifications.summary.dueToday > 0 && (
                  <div className="bg-gradient-to-r from-orange-600/20 to-orange-600/10 border-l-4 border-orange-500 p-4 rounded-xl backdrop-blur-sm">
                    <h3 className="font-bold text-orange-200">⏰ {notifications.summary.dueToday} Due Today</h3>
                    <div className="text-sm text-orange-100 mt-2 space-y-1">
                      {notifications.dueToday.slice(0, 3).map((item: any) => (
                        <p key={item.id}>• {item.title} {item.priority === 'high' && '(High Priority)'}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <h2 className="text-4xl font-bold text-purple-900 mb-8">Today's Memories</h2>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center pointer-events-none">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search your memories..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-5 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/10 text-gray-900 placeholder-gray-700 backdrop-blur-sm focus:bg-white/20 transition-all duration-200 group-focus-within:border-purple-400/50"
                />
              </div>
              {isSearching && <p className="text-sm text-purple-300 mt-3 animate-pulse">✨ Searching...</p>}
              {searchQuery && searchResults.length > 0 && (
                <p className="text-sm text-purple-200 mt-3">🎯 Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
              )}
            </div>

            {/* Search Results or All Memories */}
            {searchQuery && searchResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/90">✨ Search Results</h3>
                {searchResults.map((memory: Memory) => (
                  <div key={memory.id} className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 p-4 rounded-xl border border-white/20 hover:border-white/40 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm hover:scale-105 hover:-translate-y-1">
                    <h4 className="font-semibold text-white">{memory.title}</h4>
                    {memory.content && <p className="text-sm text-white/80 mt-2 line-clamp-2">{memory.content}</p>}
                    {memory.due_date && <p className="text-xs text-purple-300 mt-2">📅 Due: {memory.due_date}</p>}
                  </div>
                ))}
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <p className="text-white/60 text-center py-8">No memories found matching "{searchQuery}"</p>
            ) : loading ? (
              <p className="text-white/60">Loading...</p>
            ) : memories.length === 0 ? (
              <p className="text-white/60">No memories yet. Start capturing!</p>
            ) : (
              <div className="space-y-8">
                {categories.map(({ key, label, color, gradient, svgPath }) => (
                  <div key={key}>
                    {groupedMemories[key] && groupedMemories[key].length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold mb-5 text-purple-700 flex items-center gap-3">
                          {renderIcon(gradient, svgPath)} {label} <span className="text-lg font-semibold text-purple-600">({groupedMemories[key].length})</span>
                        </h3>
                        <div className="space-y-3">
                          {groupedMemories[key].map((memory) => (
                            <div
                              key={memory.id}
                              className="border-l-4 rounded-xl p-5 bg-white/60 backdrop-blur-sm border-purple-400 hover:border-purple-600 hover:shadow-2xl hover:shadow-purple-400/30 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group cursor-pointer"
                            >
                              <div className="flex justify-between items-start mb-2 gap-2">
                                <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2">{memory.title}</h4>
                                {memory.priority && (
                                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                                    memory.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-300' :
                                    memory.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                    'bg-green-100 text-green-700 border border-green-300'
                                  }`}>
                                    {memory.priority}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 mb-3 group-hover:text-gray-900 transition-colors line-clamp-3">{memory.content}</p>
                              <div className="flex flex-wrap gap-2">
                                {memory.tags?.map((tag) => (
                                  <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-300 hover:bg-purple-200 transition-all">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
