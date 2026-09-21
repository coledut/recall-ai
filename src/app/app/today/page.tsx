'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import FileUpload from '@/app/components/FileUpload';
import PremiumNav from '@/app/components/PremiumNav';
import { AlertCircle, Clock, Flag, BarChart3, Send, Mic, FileText, Search, Settings, Mail, Slack, Calendar, Phone, Upload } from 'lucide-react';

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

export default function DashboardPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState('');
  const [selectedCapture, setSelectedCapture] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }
    setSessionToken(session.access_token);
    await fetchMemories();
    await fetchNotifications(session.access_token);
  };

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setMemories(data);
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
      }
    } catch (error) {
      console.error('Notifications fetch error:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      <PremiumNav currentPage="today" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Two-Column Layout: Mobile Stack, Desktop Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Capture Widget */}
          <div className="lg:col-span-1 h-fit sticky top-20 lg:top-24">
            {/* Notification Alert */}
            {notifications && (notifications.summary?.overdue > 0 || notifications.summary?.dueToday > 0) && (
              <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                {notifications.summary.overdue > 0 && (
                  <div className="card-premium bg-red-50 border-2 border-red-200 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-bold text-red-900 text-xs sm:text-sm">{notifications.summary.overdue} Overdue</p>
                        <p className="text-red-700 text-xs mt-1">Check your overdue items</p>
                      </div>
                    </div>
                  </div>
                )}
                {notifications.summary.dueToday > 0 && (
                  <div className="card-premium bg-orange-50 border-2 border-orange-200 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-bold text-orange-900 text-xs sm:text-sm">{notifications.summary.dueToday} Due Today</p>
                        <p className="text-orange-700 text-xs mt-1">Review today's tasks</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Capture Sources */}
            <div className="card-premium bg-gradient-to-br from-purple-50 to-white p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-purple-200 mb-6 reveal-up">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Capture from:</h3>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-3">
                <button onClick={() => setSelectedCapture('voice')} className={`btn-premium p-2 sm:p-3 rounded-lg transition-all flex flex-col items-center gap-1 text-center border-2 hover-lift cursor-pointer ${selectedCapture === 'voice' ? 'bg-purple-500 border-purple-600 text-white' : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50'}`}>
                  <Mic className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedCapture === 'voice' ? 'text-white' : 'text-purple-600'}`} />
                  <span className={`text-xs font-semibold ${selectedCapture === 'voice' ? 'text-white' : 'text-gray-900'}`}>Voice</span>
                </button>
                <button onClick={() => setSelectedCapture('email')} className={`btn-premium p-2 sm:p-3 rounded-lg transition-all flex flex-col items-center gap-1 text-center border-2 hover-lift cursor-pointer ${selectedCapture === 'email' ? 'bg-purple-500 border-purple-600 text-white' : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50'}`}>
                  <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedCapture === 'email' ? 'text-white' : 'text-purple-600'}`} />
                  <span className={`text-xs font-semibold ${selectedCapture === 'email' ? 'text-white' : 'text-gray-900'}`}>Email</span>
                </button>
                <button onClick={() => setSelectedCapture('slack')} className={`btn-premium p-2 sm:p-3 rounded-lg transition-all flex flex-col items-center gap-1 text-center border-2 hover-lift cursor-pointer ${selectedCapture === 'slack' ? 'bg-purple-500 border-purple-600 text-white' : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50'}`}>
                  <Slack className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedCapture === 'slack' ? 'text-white' : 'text-purple-600'}`} />
                  <span className={`text-xs font-semibold ${selectedCapture === 'slack' ? 'text-white' : 'text-gray-900'}`}>Slack</span>
                </button>
                <button onClick={() => setSelectedCapture('calendar')} className={`btn-premium p-2 sm:p-3 rounded-lg transition-all flex flex-col items-center gap-1 text-center border-2 hover-lift cursor-pointer ${selectedCapture === 'calendar' ? 'bg-purple-500 border-purple-600 text-white' : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50'}`}>
                  <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedCapture === 'calendar' ? 'text-white' : 'text-purple-600'}`} />
                  <span className={`text-xs font-semibold ${selectedCapture === 'calendar' ? 'text-white' : 'text-gray-900'}`}>Calendar</span>
                </button>
                <button onClick={() => setSelectedCapture('files')} className={`btn-premium p-2 sm:p-3 rounded-lg transition-all flex flex-col items-center gap-1 text-center border-2 hover-lift cursor-pointer ${selectedCapture === 'files' ? 'bg-purple-500 border-purple-600 text-white' : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50'}`}>
                  <Upload className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedCapture === 'files' ? 'text-white' : 'text-purple-600'}`} />
                  <span className={`text-xs font-semibold ${selectedCapture === 'files' ? 'text-white' : 'text-gray-900'}`}>Files</span>
                </button>
                <button onClick={() => setSelectedCapture('manual')} className={`btn-premium p-2 sm:p-3 rounded-lg transition-all flex flex-col items-center gap-1 text-center border-2 hover-lift cursor-pointer ${selectedCapture === 'manual' ? 'bg-purple-500 border-purple-600 text-white' : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50'}`}>
                  <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedCapture === 'manual' ? 'text-white' : 'text-purple-600'}`} />
                  <span className={`text-xs font-semibold ${selectedCapture === 'manual' ? 'text-white' : 'text-gray-900'}`}>Manual</span>
                </button>
              </div>
            </div>

            {/* Quick Capture Card */}
            <div className="card-premium bg-gradient-to-br from-purple-100 to-purple-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-purple-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Quick Capture</h3>

              <form onSubmit={handleAddMemory} className="space-y-3">
                <textarea
                  placeholder="Tell me what you need to remember..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="input-premium w-full text-xs sm:text-sm"
                />

                <FileUpload
                  onExtractedText={() => {}}
                  authToken={sessionToken}
                />

                <button
                  type="submit"
                  disabled={extracting || !content.trim()}
                  className="btn-premium w-full py-3 sm:py-4 bg-gradient-to-r from-purple-700 to-purple-900 text-white font-bold text-base sm:text-lg rounded-lg hover-lift disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-purple-500/40 border-2 border-purple-600"
                >
                  <Send className="w-5 h-5" />
                  {extracting ? 'Capturing...' : 'Capture & Extract'}
                </button>
              </form>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 sm:mb-8 lg:mb-10 reveal-up">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Today's Dashboard</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Manage and review your captured memories</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 sm:mb-8 reveal-up">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-purple-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-premium w-full pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Memories Grid */}
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton-loader h-24 sm:h-28 rounded-lg" />
                ))}
              </div>
            ) : memories.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-purple-200 mx-auto mb-4 sm:mb-6" />
                <p className="text-sm sm:text-base text-gray-600">No memories yet. Start capturing!</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 reveal-up">
                {memories.slice(0, 10).map((memory, idx) => (
                  <div
                    key={memory.id}
                    className="card-premium bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl border-l-4 border-purple-400 hover-lift reveal-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 flex-1">{memory.title}</h3>
                      {memory.priority && (
                        <span className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex-shrink-0 ${
                          memory.priority === 'high' ? 'bg-red-100 text-red-700' :
                          memory.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {memory.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm mb-3 line-clamp-2">{memory.content}</p>
                    {memory.due_date && (
                      <div className="flex items-center gap-1 text-purple-600 text-xs sm:text-sm">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        Due: {new Date(memory.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
