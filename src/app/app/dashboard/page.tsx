'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Memory {
  id: string;
  title: string;
  content: string;
  priority?: 'high' | 'medium' | 'low';
  type: string;
  due_date?: string;
  tags: string[];
  created_at: string;
  status: string;
}

interface DashboardStats {
  totalMemories: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  memoryTypes: Record<string, number>;
  createdThisWeek: number;
  createdThisMonth: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Load error:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      setMemories(data);

      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const highPriority = data.filter(m => m.priority === 'high').length;
      const mediumPriority = data.filter(m => m.priority === 'medium').length;
      const lowPriority = data.filter(m => m.priority === 'low').length;

      const overdue = data.filter(m => {
        if (!m.due_date) return false;
        const dueDate = new Date(m.due_date.split('T')[0] + 'T00:00:00');
        return dueDate < today;
      }).length;

      const dueToday = data.filter(m => {
        if (!m.due_date) return false;
        const dueDate = new Date(m.due_date.split('T')[0] + 'T00:00:00');
        return dueDate.getTime() === today.getTime();
      }).length;

      const dueThisWeek = data.filter(m => {
        if (!m.due_date) return false;
        const dueDate = new Date(m.due_date.split('T')[0] + 'T00:00:00');
        const weekEnd = new Date(thisWeekStart);
        weekEnd.setDate(thisWeekStart.getDate() + 7);
        return dueDate >= thisWeekStart && dueDate < weekEnd;
      }).length;

      const createdThisWeek = data.filter(m => {
        const createdDate = new Date(m.created_at.split('T')[0] + 'T00:00:00');
        const weekEnd = new Date(thisWeekStart);
        weekEnd.setDate(thisWeekStart.getDate() + 7);
        return createdDate >= thisWeekStart && createdDate < weekEnd;
      }).length;

      const createdThisMonth = data.filter(m => {
        const createdDate = new Date(m.created_at.split('T')[0] + 'T00:00:00');
        return createdDate >= thisMonthStart;
      }).length;

      // Count memory types
      const memoryTypes: Record<string, number> = {};
      data.forEach(m => {
        memoryTypes[m.type] = (memoryTypes[m.type] || 0) + 1;
      });

      setStats({
        totalMemories: data.length,
        highPriority,
        mediumPriority,
        lowPriority,
        overdue,
        dueToday,
        dueThisWeek,
        memoryTypes,
        createdThisWeek,
        createdThisMonth,
      });

      setLoading(false);
    } catch (error) {
      console.error('Dashboard error:', error);
      setLoading(false);
    }
  };

  const filteredMemories = selectedPriority === 'all'
    ? memories
    : memories.filter(m => m.priority === selectedPriority);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <nav className="bg-white shadow px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-700">Dashboard</h1>
        </nav>
        <div className="max-w-7xl mx-auto px-8 py-12">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <nav className="bg-white shadow px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-700">Dashboard</h1>
        </nav>
        <div className="max-w-7xl mx-auto px-8 py-12">
          <p className="text-gray-600">No data available</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-green-50">
      <nav className="bg-gradient-to-r from-green-600 to-teal-600 shadow-2xl px-8 py-5 border-b border-green-400/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-sm text-green-50 mt-1">Memory insights and trends</p>
            </div>
          </div>
          <a
            href="/app/today"
            className="text-green-700 hover:text-green-800 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-100 transition-all duration-200"
          >
            ← Back to Memories
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Key Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Memories */}
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl shadow-lg p-6 border-2 border-green-400 hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-bold">Total Memories</p>
                <p className="text-5xl font-bold text-green-900 mt-2 group-hover:text-green-600 transition-colors">{stats.totalMemories}</p>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-green-500/50">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-700 mt-4 group-hover:text-green-600 transition-colors">📈 {stats.createdThisMonth} this month</p>
          </div>

          {/* High Priority */}
          <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-2xl shadow-lg p-6 border-2 border-red-400 hover:shadow-2xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-bold">High Priority</p>
                <p className="text-5xl font-bold text-red-900 mt-2 group-hover:text-red-600 transition-colors">{stats.highPriority}</p>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center group-hover:animate-pulse group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-red-500/50">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-red-700 mt-4 group-hover:text-red-600 transition-colors">⚡ Needs attention</p>
          </div>

          {/* Overdue Items */}
          <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-orange-400 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-bold">Overdue</p>
                <p className="text-5xl font-bold text-orange-900 mt-2 group-hover:text-orange-600 transition-colors">{stats.overdue}</p>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center group-hover:animate-bounce transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-orange-500/50">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-orange-700 mt-4 group-hover:text-orange-600 transition-colors">⚠️ Past due date</p>
          </div>

          {/* Due Today */}
          <div className="bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl shadow-lg p-6 border-2 border-teal-400 hover:shadow-2xl hover:shadow-teal-500/40 transition-all duration-300 hover:scale-105 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-700 text-sm font-bold">Due Today</p>
                <p className="text-5xl font-bold text-teal-900 mt-2 group-hover:text-teal-600 transition-colors">{stats.dueToday}</p>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-teal-500/50">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm-5-5h5v5h-5z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-teal-700 mt-4 group-hover:text-teal-600 transition-colors">✅ Action needed today</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Priority Distribution */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl shadow-lg p-6 border-2 border-gray-300 hover:shadow-2xl hover:shadow-gray-400/30 transition-all duration-300 group cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 group-hover:text-gray-700 transition-colors">🎯 Priority Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-700 font-semibold">High</span>
                  <span className="font-bold text-red-900">{stats.highPriority}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.totalMemories > 0 ? (stats.highPriority / stats.totalMemories) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-yellow-700 font-semibold">Medium</span>
                  <span className="font-bold text-yellow-900">{stats.mediumPriority}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.totalMemories > 0 ? (stats.mediumPriority / stats.totalMemories) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-700 font-semibold">Low</span>
                  <span className="font-bold text-green-900">{stats.lowPriority}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-600 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.totalMemories > 0 ? (stats.lowPriority / stats.totalMemories) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl shadow-lg p-6 border-2 border-gray-300 hover:shadow-2xl hover:shadow-gray-400/30 transition-all duration-300 group cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 group-hover:text-gray-700 transition-colors">⏰ Upcoming</h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-4 rounded-xl border-2 border-orange-300">
                <p className="text-orange-700 text-sm font-semibold">Due This Week</p>
                <p className="text-4xl font-bold text-orange-900 mt-2">{stats.dueThisWeek}</p>
              </div>
              <div className="bg-gradient-to-r from-teal-100 to-teal-50 p-4 rounded-xl border-2 border-teal-300">
                <p className="text-teal-700 text-sm font-semibold">Created This Week</p>
                <p className="text-4xl font-bold text-teal-900 mt-2">{stats.createdThisWeek}</p>
              </div>
            </div>
          </div>

          {/* Memory Types */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl shadow-lg p-6 border-2 border-gray-300 hover:shadow-2xl hover:shadow-gray-400/30 transition-all duration-300 group cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 group-hover:text-gray-700 transition-colors">🏷️ By Type</h3>
            <div className="space-y-3">
              {Object.entries(stats.memoryTypes)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-200 transition-all">
                    <span className="text-gray-800 capitalize font-medium">{type}</span>
                    <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Memories by Priority */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl shadow-lg p-6 border-2 border-gray-300 hover:shadow-2xl hover:shadow-gray-400/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 hover:text-gray-700 transition-colors">📝 Recent Memories</h3>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'high', 'medium', 'low'] as const).map(priority => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
                    selectedPriority === priority
                      ? priority === 'high'
                        ? 'bg-red-100 text-red-700 border-red-300 shadow-lg shadow-red-200'
                        : priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-300 shadow-lg shadow-yellow-200'
                        : priority === 'low'
                        ? 'bg-green-100 text-green-700 border-green-300 shadow-lg shadow-green-200'
                        : 'bg-blue-100 text-blue-700 border-blue-300 shadow-lg shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 hover:text-gray-700'
                  }`}
                >
                  {priority === 'all' ? '📌 All' : priority === 'high' ? '🔴 High' : priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {filteredMemories.slice(0, 10).map(memory => (
              <div
                key={memory.id}
                className="border-l-4 rounded-xl p-4 bg-white/80 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-2 group cursor-pointer"
                style={{
                  borderColor:
                    memory.priority === 'high'
                      ? '#dc2626'
                      : memory.priority === 'medium'
                      ? '#eab308'
                      : '#16a34a',
                  boxShadow: `0 0 20px 0 ${
                    memory.priority === 'high'
                      ? 'rgba(220, 38, 38, 0.1)'
                      : memory.priority === 'medium'
                      ? 'rgba(234, 179, 8, 0.1)'
                      : 'rgba(22, 163, 74, 0.1)'
                  }`,
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{memory.title}</h4>
                  {memory.priority && (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        memory.priority === 'high'
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : memory.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          : 'bg-green-100 text-green-700 border-green-300'
                      }`}
                    >
                      {memory.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900 transition-colors">{memory.content}</p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-600">
                  <span className="capitalize px-2 py-1 bg-gray-100 rounded-lg">{memory.type}</span>
                  {memory.due_date && <span className="text-green-700">📅 {memory.due_date.split('T')[0]}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
