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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="bg-white shadow px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Memory insights and analytics</p>
          </div>
          <a
            href="/app/today"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Memories
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Key Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Memories */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Memories</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalMemories}</p>
              </div>
              <div className="text-5xl">📚</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">{stats.createdThisMonth} this month</p>
          </div>

          {/* High Priority */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">High Priority</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.highPriority}</p>
              </div>
              <div className="text-5xl">🔴</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Needs immediate attention</p>
          </div>

          {/* Overdue Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Overdue</p>
                <p className="text-4xl font-bold text-red-500 mt-2">{stats.overdue}</p>
              </div>
              <div className="text-5xl">⚠️</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Past due date</p>
          </div>

          {/* Due Today */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Due Today</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">{stats.dueToday}</p>
              </div>
              <div className="text-5xl">📅</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Action needed today</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Priority Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">High</span>
                  <span className="font-semibold">{stats.highPriority}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalMemories > 0 ? (stats.highPriority / stats.totalMemories) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Medium</span>
                  <span className="font-semibold">{stats.mediumPriority}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalMemories > 0 ? (stats.mediumPriority / stats.totalMemories) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Low</span>
                  <span className="font-semibold">{stats.lowPriority}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalMemories > 0 ? (stats.lowPriority / stats.totalMemories) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
            <div className="space-y-3">
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Due This Week</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.dueThisWeek}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Created This Week</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.createdThisWeek}</p>
              </div>
            </div>
          </div>

          {/* Memory Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By Type</h3>
            <div className="space-y-2">
              {Object.entries(stats.memoryTypes)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{type}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Memories by Priority */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Memories</h3>
            <div className="flex gap-2">
              {(['all', 'high', 'medium', 'low'] as const).map(priority => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    selectedPriority === priority
                      ? priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : priority === 'low'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {priority === 'all' ? '📌 All' : priority === 'high' ? '🔴 High' : priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredMemories.slice(0, 10).map(memory => (
              <div
                key={memory.id}
                className="border-l-4 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                style={{
                  borderColor:
                    memory.priority === 'high'
                      ? '#dc2626'
                      : memory.priority === 'medium'
                      ? '#f59e0b'
                      : '#10b981',
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{memory.title}</h4>
                  {memory.priority && (
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        memory.priority === 'high'
                          ? 'bg-red-200 text-red-700'
                          : memory.priority === 'medium'
                          ? 'bg-yellow-200 text-yellow-700'
                          : 'bg-green-200 text-green-700'
                      }`}
                    >
                      {memory.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{memory.content}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{memory.type}</span>
                  {memory.due_date && <span>Due: {memory.due_date.split('T')[0]}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
