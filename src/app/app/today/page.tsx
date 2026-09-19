'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
    if (!content.trim()) return;

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
          text: content,
          authToken: session.access_token,
        }),
      });

      if (response.ok) {
        setContent('');
        await fetchMemories();
      }
    } catch (error) {
      console.error('Extract failed:', error);
    } finally {
      setExtracting(false);
    }
  };

  const categories: { key: CategoryKey; label: string; icon: string; color: string }[] = [
    { key: 'needs_attention', label: '🔴 Needs Attention', icon: '⚠️', color: 'border-red-200 bg-red-50' },
    { key: 'due_today', label: '📅 Due Today', icon: '🎯', color: 'border-orange-200 bg-orange-50' },
    { key: 'coming_up', label: '📆 Coming Up', icon: '⏰', color: 'border-blue-200 bg-blue-50' },
    { key: 'other', label: '📝 Other', icon: '📌', color: 'border-gray-200 bg-gray-50' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <nav className="bg-white shadow px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">Recall AI</h1>
          <button
            onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/'))}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 h-fit sticky top-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Capture</h3>
              <form onSubmit={handleAddMemory} className="space-y-3">
                <textarea
                  placeholder="Tell me what you need to remember..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={extracting || recording}
                  className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {extracting ? 'Extracting...' : 'Capture & Extract'}
                </button>
              </form>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-3">Or record:</p>
                <button
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  disabled={extracting}
                  className={`w-full py-2 font-semibold rounded-lg text-white ${
                    recording
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400'
                  }`}
                >
                  {recording ? '⏹️ Stop Recording' : '🎤 Record Voice'}
                </button>
                <button
                  type="button"
                  onClick={testVoiceCapture}
                  disabled={extracting}
                  className="w-full mt-2 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  🧪 Test Voice (Demo)
                </button>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-3">Or sync from:</p>
                <a
                  href="/api/auth/gmail"
                  className="w-full block py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-center mb-2"
                >
                  📧 Connect Gmail
                </a>
                <a
                  href="/api/auth/slack"
                  className="w-full block py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 text-center"
                >
                  💬 Connect Slack
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {notifications && (notifications.summary.overdue > 0 || notifications.summary.dueToday > 0) && (
              <div className="mb-8 space-y-3">
                {notifications.summary.overdue > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <h3 className="font-semibold text-red-800">🚨 {notifications.summary.overdue} Overdue Item{notifications.summary.overdue !== 1 ? 's' : ''}</h3>
                    <div className="text-sm text-red-700 mt-2 space-y-1">
                      {notifications.overdue.slice(0, 3).map((item: any) => (
                        <p key={item.id}>• {item.title} ({item.daysOverdue} days overdue)</p>
                      ))}
                    </div>
                  </div>
                )}
                {notifications.summary.dueToday > 0 && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                    <h3 className="font-semibold text-orange-800">⏰ {notifications.summary.dueToday} Due Today</h3>
                    <div className="text-sm text-orange-700 mt-2 space-y-1">
                      {notifications.dueToday.slice(0, 3).map((item: any) => (
                        <p key={item.id}>• {item.title} {item.priority === 'high' && '(High Priority)'}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Today's Memories</h2>

            {/* Search Bar */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="🔍 Search memories..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {isSearching && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
              {searchQuery && searchResults.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
              )}
            </div>

            {/* Search Results or All Memories */}
            {searchQuery && searchResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Search Results</h3>
                {searchResults.map((memory: Memory) => (
                  <div key={memory.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                    <h4 className="font-semibold text-gray-900">{memory.title}</h4>
                    {memory.content && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{memory.content}</p>}
                    {memory.due_date && <p className="text-xs text-gray-500 mt-2">Due: {memory.due_date}</p>}
                  </div>
                ))}
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <p className="text-gray-600">No memories found matching "{searchQuery}"</p>
            ) : loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : memories.length === 0 ? (
              <p className="text-gray-600">No memories yet. Start capturing!</p>
            ) : (
              <div className="space-y-8">
                {categories.map(({ key, label, icon, color }) => (
                  <div key={key}>
                    {groupedMemories[key] && groupedMemories[key].length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                          {icon} {label} ({groupedMemories[key].length})
                        </h3>
                        <div className="space-y-3">
                          {groupedMemories[key].map((memory) => (
                            <div
                              key={memory.id}
                              className={`border-l-4 rounded-lg p-4 ${color} hover:shadow-md transition`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{memory.title}</h4>
                                {memory.priority && (
                                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                    memory.priority === 'high' ? 'bg-red-200 text-red-700' :
                                    memory.priority === 'medium' ? 'bg-yellow-200 text-yellow-700' :
                                    'bg-green-200 text-green-700'
                                  }`}>
                                    {memory.priority}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 mb-2">{memory.content}</p>
                              <div className="flex flex-wrap gap-2">
                                {memory.tags?.map((tag) => (
                                  <span key={tag} className="text-xs bg-white px-2 py-1 rounded">
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
