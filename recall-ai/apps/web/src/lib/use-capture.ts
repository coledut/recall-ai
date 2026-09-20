'use client';

import { useState } from 'react';
import { ExtractedMemory } from '@recall/core';

interface CaptureResult {
  success: boolean;
  memoriesCreated: number;
  memories: (ExtractedMemory & { id: string })[];
}

export const useCapture = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = async (text: string): Promise<CaptureResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/memories/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceType: 'QUICK_CAPTURE',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to capture memory');
      }

      const result: CaptureResult = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { capture, loading, error };
};
