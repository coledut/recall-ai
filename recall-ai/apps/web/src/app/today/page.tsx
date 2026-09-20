'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { QuickCaptureModal } from '@/components/quick-capture-modal';
import { MemoryCard } from '@/components/memory-card';
import type { Memory } from '@/lib/types';

export default function TodayPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user, refreshKey]);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/memories');
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const needsAttention = memories.filter((m) => m.status === 'OVERDUE');
  const dueToday = memories.filter(
    (m) =>
      m.dueAt &&
      new Date(m.dueAt).toDateString() === new Date().toDateString() &&
      m.status !== 'COMPLETED'
  );
  const waitingFor = memories.filter((m) => m.type === 'WAITING_FOR' && m.status === 'OPEN');
  const upComing = memories.filter(
    (m) =>
      m.dueAt &&
      new Date(m.dueAt) > new Date() &&
      new Date(m.dueAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
      m.status !== 'COMPLETED'
  );
  const recent = memories.filter((m) => m.status === 'DETECTED' || m.status === 'OPEN');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Today</h1>

        {needsAttention.length > 0 && (
          <Section title="Needs Attention" memories={needsAttention} onRefresh={() => setRefreshKey((k) => k + 1)} />
        )}

        {dueToday.length > 0 && (
          <Section title="Due Today" memories={dueToday} onRefresh={() => setRefreshKey((k) => k + 1)} />
        )}

        {waitingFor.length > 0 && (
          <Section title="Waiting for Others" memories={waitingFor} onRefresh={() => setRefreshKey((k) => k + 1)} />
        )}

        {upComing.length > 0 && (
          <Section title="Coming Up" memories={upComing} onRefresh={() => setRefreshKey((k) => k + 1)} />
        )}

        {recent.length > 0 && (
          <Section title="Recently Remembered" memories={recent} onRefresh={() => setRefreshKey((k) => k + 1)} />
        )}

        {memories.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No memories yet. Capture something to get started!</p>
          </div>
        )}
      </div>

      <QuickCaptureModal onCaptureSuccess={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}

interface SectionProps {
  title: string;
  memories: Memory[];
  onRefresh: () => void;
}

function Section({ title, memories, onRefresh }: SectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="space-y-3">
        {memories.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            onAction={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
