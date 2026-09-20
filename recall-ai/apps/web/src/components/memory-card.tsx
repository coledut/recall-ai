'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Memory } from '@/lib/types';

interface MemoryCardProps {
  memory: Memory;
  onAction?: () => void;
}

export const MemoryCard = ({ memory, onAction }: MemoryCardProps) => {
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: 'complete' | 'snooze' | 'dismiss') => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/memories/${memory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        onAction?.();
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const typeColors: Record<string, string> = {
    COMMITMENT: 'bg-blue-100 text-blue-800',
    FOLLOW_UP: 'bg-purple-100 text-purple-800',
    DEADLINE: 'bg-red-100 text-red-800',
    WAITING_FOR: 'bg-yellow-100 text-yellow-800',
    DECISION: 'bg-green-100 text-green-800',
    TASK: 'bg-gray-100 text-gray-800',
    IMPORTANT_FACT: 'bg-indigo-100 text-indigo-800',
  };

  const dueDate = memory.dueAt ? new Date(memory.dueAt) : null;
  const isOverdue = dueDate && dueDate < new Date() && memory.status !== 'COMPLETED';
  const daysUntilDue = dueDate
    ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`p-4 rounded-lg border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[memory.type] || typeColors.TASK}`}>
              {memory.type.replace('_', ' ')}
            </span>
            {memory.confidence < 0.7 && (
              <span className="text-xs text-gray-500">(Low confidence)</span>
            )}
          </div>

          <Link href={`/memories/${memory.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
              {memory.title}
            </h3>
          </Link>

          <p className="text-gray-600 text-sm mt-1">{memory.summary}</p>

          {memory.personRaw && (
            <p className="text-gray-500 text-sm mt-2">
              <strong>Person:</strong> {memory.personRaw}
            </p>
          )}

          {dueDate && (
            <p className={`text-sm mt-2 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              Due:{' '}
              {isOverdue
                ? `${Math.abs(daysUntilDue!)} days ago`
                : daysUntilDue === 0
                  ? 'Today'
                  : daysUntilDue === 1
                    ? 'Tomorrow'
                    : `in ${daysUntilDue} days`}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {memory.status !== 'COMPLETED' && (
            <>
              <button
                onClick={() => handleAction('complete')}
                disabled={actionLoading}
                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition disabled:opacity-50"
                title="Mark as complete"
              >
                ✓
              </button>
              <button
                onClick={() => handleAction('snooze')}
                disabled={actionLoading}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition disabled:opacity-50"
                title="Snooze"
              >
                ⏰
              </button>
            </>
          )}
          <button
            onClick={() => handleAction('dismiss')}
            disabled={actionLoading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition disabled:opacity-50"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
