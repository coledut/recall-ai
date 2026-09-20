'use client';

import { useEffect, useState } from 'react';
import { SHORTCUTS, groupShortcutsByCategory } from '@/lib/shortcuts';

export default function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const grouped = groupShortcutsByCategory();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !isOpen) {
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-2xl hover:bg-white/20 rounded-lg p-1 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {Object.entries(grouped).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-green-600">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-b-0">
                    <p className="text-gray-700">{shortcut.description}</p>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <div key={keyIdx} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 bg-gray-200 text-gray-900 rounded font-mono text-sm font-semibold">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-gray-400">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border-t p-4 text-center text-sm text-gray-600">
          Press <kbd className="px-2 py-1 bg-gray-200 rounded font-mono">?</kbd> to show this help anytime
        </div>
      </div>
    </div>
  );
}
