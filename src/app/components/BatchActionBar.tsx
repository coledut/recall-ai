'use client';

import { useState } from 'react';

interface BatchActionBarProps {
  selectedCount: number;
  onComplete: () => void;
  onDelete: () => void;
  onPrioritize: (priority: string) => void;
  onExport: () => void;
}

export default function BatchActionBar({
  selectedCount,
  onComplete,
  onDelete,
  onPrioritize,
  onExport,
}: BatchActionBarProps) {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl shadow-2xl p-4 z-40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-bold">
          {selectedCount} selected
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            ✓ Mark Complete
          </button>

          <div className="relative">
            <button
              onClick={() => setShowPriorityMenu(!showPriorityMenu)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all"
            >
              ⭐ Prioritize
            </button>
            {showPriorityMenu && (
              <div className="absolute top-12 right-0 bg-white text-gray-900 rounded-lg shadow-xl z-50">
                <button
                  onClick={() => {
                    onPrioritize('high');
                    setShowPriorityMenu(false);
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-red-100 border-b"
                >
                  🔴 High
                </button>
                <button
                  onClick={() => {
                    onPrioritize('medium');
                    setShowPriorityMenu(false);
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-yellow-100 border-b"
                >
                  🟡 Medium
                </button>
                <button
                  onClick={() => {
                    onPrioritize('low');
                    setShowPriorityMenu(false);
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-green-100"
                >
                  🟢 Low
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onExport}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            📥 Export
          </button>

          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500/80 hover:bg-red-600 rounded-lg font-semibold transition-all"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
