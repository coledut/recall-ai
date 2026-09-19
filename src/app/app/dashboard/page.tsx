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
  const [sortBy, setSortBy] = useState<'due-date' | 'created-date' | 'priority'>('due-date');

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

  const categorizeMemory = (memory: Memory): 'overdue' | 'due-today' | 'coming-up' | 'other' => {
    if (!memory.due_date) return 'other';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(memory.due_date.split('T')[0] + 'T00:00:00');
    if (dueDate < today) return 'overdue';
    if (dueDate.getTime() === today.getTime()) return 'due-today';
    if (dueDate > today) return 'coming-up';
    return 'other';
  };

  const sortMemories = (list: Memory[]) => {
    return list.sort((a, b) => {
      if (sortBy === 'due-date') {
        const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return aDate - bDate;
      }
      if (sortBy === 'created-date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) -
               (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3);
      }
      return 0;
    });
  };

  const filteredMemories = selectedPriority === 'all'
    ? memories
    : memories.filter(m => m.priority === selectedPriority);

  const groupedMemories = {
    overdue: sortMemories(filteredMemories.filter(m => categorizeMemory(m) === 'overdue')),
    'due-today': sortMemories(filteredMemories.filter(m => categorizeMemory(m) === 'due-today')),
    'coming-up': sortMemories(filteredMemories.filter(m => categorizeMemory(m) === 'coming-up')),
    other: sortMemories(filteredMemories.filter(m => categorizeMemory(m) === 'other')),
  };

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
            className="text-white hover:text-green-100 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200"
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
            <p className="text-xs text-green-700 mt-4 group-hover:text-green-600 transition-colors">
              <span className="inline-block w-4 h-4 bg-gradient-to-br from-green-300 to-green-400 rounded-full mr-1 align-text-bottom"></span>
              {stats.createdThisMonth} this month
            </p>
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
            <p className="text-xs text-red-700 mt-4 group-hover:text-red-600 transition-colors">
              <span className="inline-block w-4 h-4 bg-gradient-to-br from-red-300 to-red-400 rounded-full mr-1 align-text-bottom"></span>
              Needs attention
            </p>
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
            <p className="text-xs text-orange-700 mt-4 group-hover:text-orange-600 transition-colors">
              <span className="inline-block w-4 h-4 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full mr-1 align-text-bottom"></span>
              Past due date
            </p>
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
            <p className="text-xs text-teal-700 mt-4 group-hover:text-teal-600 transition-colors">
              <span className="inline-block w-4 h-4 bg-gradient-to-br from-teal-300 to-teal-400 rounded-full mr-1 align-text-bottom"></span>
              Action needed today
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Priority Distribution */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl shadow-lg p-6 border-2 border-gray-300 hover:shadow-2xl hover:shadow-gray-400/30 transition-all duration-300 group cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 group-hover:text-gray-700 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                </svg>
              </div>
              Priority Distribution
            </h3>
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
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 group-hover:text-gray-700 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 5V1h-8v4H1v14h22V5h-11.01zm7 10h-5v5h-4v-5H4v-4h5V7h4v4h5v4z" />
                </svg>
              </div>
              Upcoming
            </h3>
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
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 group-hover:text-gray-700 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z" />
                </svg>
              </div>
              By Type
            </h3>
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

        {/* Recent Memories Categorized */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl shadow-lg p-6 border-2 border-gray-300 hover:shadow-2xl hover:shadow-gray-400/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 hover:text-gray-700 transition-colors">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z" />
                </svg>
              </div>
              Memories
            </h3>
            <div className="flex gap-3 flex-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'due-date' | 'created-date' | 'priority')}
                className="px-4 py-2 rounded-full text-sm font-bold border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 transition-all cursor-pointer"
              >
                <option value="due-date">📅 Due Date</option>
                <option value="created-date">✨ Created Date</option>
                <option value="priority">⚡ Priority</option>
              </select>
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

          <div className="space-y-6">
            {/* Overdue Section */}
            {groupedMemories.overdue.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                    </svg>
                  </div>
                  Overdue ({groupedMemories.overdue.length})
                </h4>
                <div className="space-y-3">
                  {groupedMemories.overdue.slice(0, 5).map(memory => (
                    <div
                      key={memory.id}
                      className="border-l-4 rounded-xl p-4 bg-white/80 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-2 group cursor-pointer"
                      style={{
                        borderColor: memory.priority === 'high' ? '#dc2626' : memory.priority === 'medium' ? '#eab308' : '#16a34a',
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">{memory.title}</h4>
                        {memory.priority && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0 ${memory.priority === 'high' ? 'bg-red-100 text-red-700 border-red-300' : memory.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
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
            )}

            {/* Due Today Section */}
              {groupedMemories['due-today'].length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-orange-700 mb-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                      </svg>
                    </div>
                    Due Today ({groupedMemories['due-today'].length})
                  </h4>
                  <div className="space-y-3">
                    {groupedMemories['due-today'].slice(0, 5).map(memory => (
                      <div key={memory.id} className="border-l-4 rounded-xl p-4 bg-white/80 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-2 group cursor-pointer" style={{borderColor: memory.priority === 'high' ? '#dc2626' : memory.priority === 'medium' ? '#eab308' : '#16a34a'}}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{memory.title}</h4>
                          {memory.priority && <span className={`text-xs font-bold px-3 py-1 rounded-full border ${memory.priority === 'high' ? 'bg-red-100 text-red-700 border-red-300' : memory.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300'}`}>{memory.priority}</span>}
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
              )}

              {/* Coming Up Section */}
              {groupedMemories['coming-up'].length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                    </div>
                    Coming Up ({groupedMemories['coming-up'].length})
                  </h4>
                  <div className="space-y-3">
                    {groupedMemories['coming-up'].slice(0, 5).map(memory => (
                      <div key={memory.id} className="border-l-4 rounded-xl p-4 bg-white/80 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-2 group cursor-pointer" style={{borderColor: memory.priority === 'high' ? '#dc2626' : memory.priority === 'medium' ? '#eab308' : '#16a34a'}}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{memory.title}</h4>
                          {memory.priority && <span className={`text-xs font-bold px-3 py-1 rounded-full border ${memory.priority === 'high' ? 'bg-red-100 text-red-700 border-red-300' : memory.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300'}`}>{memory.priority}</span>}
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
              )}

              {/* Other Section */}
              {groupedMemories.other.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z" />
                      </svg>
                    </div>
                    Other ({groupedMemories.other.length})
                  </h4>
                  <div className="space-y-3">
                    {groupedMemories.other.slice(0, 5).map(memory => (
                      <div key={memory.id} className="border-l-4 rounded-xl p-4 bg-white/80 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-2 group cursor-pointer" style={{borderColor: memory.priority === 'high' ? '#dc2626' : memory.priority === 'medium' ? '#eab308' : '#16a34a'}}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{memory.title}</h4>
                          {memory.priority && <span className={`text-xs font-bold px-3 py-1 rounded-full border ${memory.priority === 'high' ? 'bg-red-100 text-red-700 border-red-300' : memory.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300'}`}>{memory.priority}</span>}
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
              )}

              {Object.values(groupedMemories).every(cat => cat.length === 0) && (
                <p className="text-gray-600 text-center py-8">No memories to display</p>
              )}
            </div>
        </div>
      </div>
    </main>
  );
}
