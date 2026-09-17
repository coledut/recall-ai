'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Memory {
  id: string;
  title: string;
  content: string;
  source: string;
  type: string;
  tags: string[];
}

export default function TodayPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }

    await fetchMemories();
  };

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMemories(data);
    }
    setLoading(false);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { title, content });
    if (!title.trim() || !content.trim()) {
      console.log('Validation failed');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session:', session?.user?.email);
    if (!session) {
      console.log('No session');
      return;
    }

    const { error } = await supabase.from('memories').insert([
      {
        user_id: session.user.id,
        title,
        content,
        source: 'manual',
        type: 'note',
        tags: [],
        status: 'captured',
      },
    ]);

    if (!error) {
      setTitle('');
      setContent('');
      await fetchMemories();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <nav className="bg-white shadow px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">Recall AI</h1>
          <button
            onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/'))}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-12">Today's Memories</h2>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 h-fit">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                New Memory
              </h3>
              <form onSubmit={handleAddMemory} className="space-y-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                >
                  Add Memory
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : memories.length === 0 ? (
              <p className="text-gray-600">No memories yet.</p>
            ) : (
              memories.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {memory.title}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                      {memory.source}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{memory.content}</p>
                  {memory.tags && memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {memory.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
