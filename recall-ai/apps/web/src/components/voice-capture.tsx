'use client';

import { useState, useRef } from 'react';
import { useCapture } from '@/lib/use-capture';

export const VoiceCapture = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { capture, loading } = useCapture();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Please allow microphone access to record voice memos');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('file', audioBlob, 'voice-memo.webm');

    try {
      const response = await fetch('/api/capture/voice', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setAudioBlob(null);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error uploading voice:', error);
      alert('Failed to process voice memo');
    }
  };

  const duration = audioBlob
    ? Math.round(audioBlob.size / (16000 * 2 / 8))
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {!audioBlob ? (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                🎤 Start Recording
              </button>
            ) : (
              <>
                <div className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  Recording...
                </div>
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Stop
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              ✓ {duration}s recorded
            </div>
            <button
              onClick={uploadAudio}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Send'}
            </button>
            <button
              onClick={() => setAudioBlob(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );
};
