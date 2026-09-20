'use client';

import { useState, useRef } from 'react';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const FileCapture = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('File type not supported. Use PDF, images, or documents.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File too large (max 10MB)');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/capture/file', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fileInputRef.current!.value = '';
        onSuccess?.();
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      setError('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        accept=".pdf,.png,.jpg,.jpeg,.gif,.txt,.doc,.docx"
        className="hidden"
        id="file-input"
      />

      <label
        htmlFor="file-input"
        className="block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer text-center disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : '📎 Upload File or Image'}
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      <p className="text-xs text-gray-500">
        PDF, images, Word docs (max 10MB)
      </p>
    </div>
  );
};
