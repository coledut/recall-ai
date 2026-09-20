'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AskRecallInterface } from '@/components/ask-recall-interface';
import { QuickCaptureModal } from '@/components/quick-capture-modal';

export default function AskRecallPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask Recall</h1>
        <p className="text-gray-600 mb-8">
          Query all your memories and commitments conversationally
        </p>

        <div className="bg-white rounded-lg shadow-md h-[600px]">
          <AskRecallInterface />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Ask questions about your memories in natural language
            </li>
            <li>
              • Recall searches across Quick Captures, Gmail, and Calendar
            </li>
            <li>• Every answer is grounded in your actual memories</li>
            <li>
              • Confidence scores show how certain Recall is about the answer
            </li>
          </ul>
        </div>
      </div>

      <QuickCaptureModal />
    </div>
  );
}
