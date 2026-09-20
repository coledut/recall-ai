'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Analytics {
  summary: {
    totalMemories: number;
    totalPeople: number;
    avgInteractionsPerPerson: number;
    completionRate: number;
  };
  urgency: {
    overdue: number;
    dueToday: number;
    dueSoon: number;
  };
  priority: {
    high: number;
    medium: number;
    low: number;
  };
  sources: Record<string, number>;
  timeline: Record<string, number>;
  mostActive: Array<{
    name: string;
    interaction_count: number;
    last_contact_date: string;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch('/api/analytics/stats', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const priorityTotal = analytics.priority.high + analytics.priority.medium + analytics.priority.low;
  const sourceTotal = Object.values(analytics.sources).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12 px-4">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-green-600 to-teal-600 text-white mb-8 p-4 rounded-xl shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Recall AI</h1>
          <div className="flex items-center gap-4">
            <a href="/app/today" className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all">
              Today
            </a>
            <a href="/app/analytics" className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all font-bold">
              Analytics
            </a>
            <button
              onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/'))}
              className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Analytics</h2>
          <p className="text-gray-600">Your memory and productivity insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
            <div className="text-sm font-semibold text-gray-600 uppercase mb-2">Total Memories</div>
            <div className="text-4xl font-bold text-gray-900">{analytics.summary.totalMemories}</div>
            <p className="text-xs text-gray-500 mt-2">commitments tracked</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
            <div className="text-sm font-semibold text-gray-600 uppercase mb-2">People</div>
            <div className="text-4xl font-bold text-gray-900">{analytics.summary.totalPeople}</div>
            <p className="text-xs text-gray-500 mt-2">relationships</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
            <div className="text-sm font-semibold text-gray-600 uppercase mb-2">Avg Interactions</div>
            <div className="text-4xl font-bold text-gray-900">{analytics.summary.avgInteractionsPerPerson}</div>
            <p className="text-xs text-gray-500 mt-2">per person</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
            <div className="text-sm font-semibold text-gray-600 uppercase mb-2">Completion Rate</div>
            <div className="text-4xl font-bold text-green-600">{analytics.summary.completionRate}%</div>
            <p className="text-xs text-gray-500 mt-2">have due dates</p>
          </div>
        </div>

        {/* Urgency Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white">
            <div className="text-sm font-semibold uppercase mb-2 opacity-90">Overdue</div>
            <div className="text-4xl font-bold mb-2">{analytics.urgency.overdue}</div>
            <p className="text-sm opacity-75">Items overdue</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg p-6 text-white">
            <div className="text-sm font-semibold uppercase mb-2 opacity-90">Due Today</div>
            <div className="text-4xl font-bold mb-2">{analytics.urgency.dueToday}</div>
            <p className="text-sm opacity-75">Due this week</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <div className="text-sm font-semibold uppercase mb-2 opacity-90">Coming Up</div>
            <div className="text-4xl font-bold mb-2">{analytics.urgency.dueSoon}</div>
            <p className="text-sm opacity-75">Due next 7 days</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Priority Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Priority Distribution</h3>
            <div className="space-y-4">
              {/* High Priority */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-red-600">High Priority</span>
                  <span className="text-sm text-gray-600">
                    {analytics.priority.high} ({priorityTotal > 0 ? Math.round((analytics.priority.high / priorityTotal) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{
                      width: `${priorityTotal > 0 ? (analytics.priority.high / priorityTotal) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Medium Priority */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-yellow-600">Medium Priority</span>
                  <span className="text-sm text-gray-600">
                    {analytics.priority.medium} ({priorityTotal > 0 ? Math.round((analytics.priority.medium / priorityTotal) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full"
                    style={{
                      width: `${priorityTotal > 0 ? (analytics.priority.medium / priorityTotal) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Low Priority */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-green-600">Low Priority</span>
                  <span className="text-sm text-gray-600">
                    {analytics.priority.low} ({priorityTotal > 0 ? Math.round((analytics.priority.low / priorityTotal) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${priorityTotal > 0 ? (analytics.priority.low / priorityTotal) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Source Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Capture Sources</h3>
            <div className="space-y-3">
              {Object.entries(analytics.sources)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div key={source}>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-700 capitalize">{source}</span>
                      <span className="text-sm text-gray-600">
                        {count} ({sourceTotal > 0 ? Math.round((count / sourceTotal) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{
                          width: `${sourceTotal > 0 ? (count / sourceTotal) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Most Active People */}
        {analytics.mostActive.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Most Frequent Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analytics.mostActive.map((person, idx) => (
                <div key={person.name} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">#{idx + 1}</div>
                  <p className="font-semibold text-gray-900 truncate">{person.name}</p>
                  <p className="text-sm text-gray-600 mb-3">{person.interaction_count} interactions</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${(person.interaction_count / (analytics.mostActive[0]?.interaction_count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Capture Activity (Last 7 Days)</h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {Object.entries(analytics.timeline).map(([date, count]) => {
              const maxCount = Math.max(...Object.values(analytics.timeline), 1);
              const height = (count / maxCount) * 100;
              return (
                <div key={date} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t" style={{ height: `${height}%`, minHeight: '4px' }} />
                  <p className="text-xs text-gray-600 mt-2">{date}</p>
                  <p className="text-xs font-semibold text-gray-900">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
