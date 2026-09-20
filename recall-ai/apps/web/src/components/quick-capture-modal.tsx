'use client';

import { useState } from 'react';
import { useCapture } from '@/lib/use-capture';
import { VoiceCapture } from './voice-capture';
import { FileCapture } from './file-capture';

interface QuickCaptureModalProps {
  onCaptureSuccess?: () => void;
}

type CaptureTab = 'text' | 'voice' | 'file';

export const QuickCaptureModal = ({ onCaptureSuccess }: QuickCaptureModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<CaptureTab>('text');
  const [text, setText] = useState('');
  const { capture, loading, error } = useCapture();

  const handleCapture = async () => {
    const result = await capture(text);
    if (result?.success) {
      setText('');
      setIsOpen(false);
      onCaptureSuccess?.();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition"
        aria-label="Open Quick Capture"
      >
        + Recall
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Capture</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(['text', 'voice', 'file'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-medium transition ${
                tab === t
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t === 'text' && '✏️ Text'}
              {t === 'voice' && '🎤 Voice'}
              {t === 'file' && '📎 File'}
            </button>
          ))}
        </div>

        {/* Text Tab */}
        {tab === 'text' && (
          <>
            <p className="text-gray-600 mb-4">
              Type naturally. Recall will extract commitments, deadlines, and follow-ups.
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you need to remember? E.g., 'Follow up with Ahmed Thursday about the proposal'"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              disabled={loading}
            />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCapture}
                disabled={loading || !text.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Remember'}
              </button>
            </div>
          </>
        )}

        {/* Voice Tab */}
        {tab === 'voice' && (
          <>
            <p className="text-gray-600 mb-4">
              Record a voice memo. Recall will transcribe and extract information.
            </p>
            <div className="mb-4">
              <VoiceCapture
                onSuccess={() => {
                  setIsOpen(false);
                  onCaptureSuccess?.();
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* File Tab */}
        {tab === 'file' && (
          <>
            <p className="text-gray-600 mb-4">
              Upload a document or image. Recall will extract information.
            </p>
            <div className="mb-4">
              <FileCapture
                onSuccess={() => {
                  setIsOpen(false);
                  onCaptureSuccess?.();
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
