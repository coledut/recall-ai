'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PremiumNav from '@/app/components/PremiumNav';
import { BarChart3, TrendingUp, Users, Zap } from 'lucide-react';

interface Analytics {
  summary: {
    totalMemories: number;
    totalPeople: number;
    avgInteractionsPerPerson: number;
    completionRate: number;
  };
  urgency: { overdue: number; dueToday: number; dueSoon: number };
  priority: { high: number; medium: number; low: number };
  sources: Record<string, number>;
  timeline: Record<string, number>;
  mostActive: Array<{ name: string; interaction_count: number }>;
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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <PremiumNav currentPage="analytics" />
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const priorityTotal = analytics.priority.high + analytics.priority.medium + analytics.priority.low;
  const sourceTotal = Object.values(analytics.sources).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <PremiumNav currentPage="analytics" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 reveal-up">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Your memory and productivity insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 reveal-up">
          {[
            { icon: Zap, label: 'Total Memories', value: analytics.summary.totalMemories },
            { icon: Users, label: 'People', value: analytics.summary.totalPeople },
            { icon: TrendingUp, label: 'Avg Interactions', value: analytics.summary.avgInteractionsPerPerson },
            { icon: BarChart3, label: 'Completion', value: `${analytics.summary.completionRate}%` },
          ].map((card, idx) => (
            <div key={idx} className="card-premium bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-purple-200 hover-lift" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">{card.label}</p>
                <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Urgency Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 reveal-up">
          <div className="card-premium bg-gradient-to-br from-red-600 to-red-700 text-white p-4 sm:p-6 rounded-lg sm:rounded-xl">
            <p className="text-sm font-semibold opacity-90 mb-2">Overdue</p>
            <p className="text-3xl sm:text-4xl font-bold">{analytics.urgency.overdue}</p>
          </div>
          <div className="card-premium bg-gradient-to-br from-orange-600 to-orange-700 text-white p-4 sm:p-6 rounded-lg sm:rounded-xl">
            <p className="text-sm font-semibold opacity-90 mb-2">Due Today</p>
            <p className="text-3xl sm:text-4xl font-bold">{analytics.urgency.dueToday}</p>
          </div>
          <div className="card-premium bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-lg sm:rounded-xl">
            <p className="text-sm font-semibold opacity-90 mb-2">Coming Up</p>
            <p className="text-3xl sm:text-4xl font-bold">{analytics.urgency.dueSoon}</p>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card-premium bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-purple-200 mb-8 reveal-up">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Priority Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'High', color: 'bg-red-500', value: analytics.priority.high },
              { label: 'Medium', color: 'bg-yellow-500', value: analytics.priority.medium },
              { label: 'Low', color: 'bg-green-500', value: analytics.priority.low },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2 text-xs sm:text-sm">
                  <span className="font-semibold text-gray-900">{item.label}</span>
                  <span className="text-gray-600">{item.value} ({priorityTotal > 0 ? Math.round((item.value / priorityTotal) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${priorityTotal > 0 ? (item.value / priorityTotal) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
