'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader, Sparkles, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PremiumNav from '@/app/components/PremiumNav';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  references?: any[];
}

export default function AskRecallPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/login';
        return;
      }

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          authToken: session.access_token,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer,
            references: data.references,
          },
        ]);
      }
    } catch (error) {
      console.error('Ask failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      <PremiumNav currentPage="ask" />

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 reveal-up">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Ask Recall</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Ask questions about your memories naturally</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 card-premium bg-white rounded-lg sm:rounded-xl border-2 border-purple-200 overflow-hidden flex flex-col mb-4 sm:mb-6 min-h-[500px] sm:min-h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-white to-purple-50/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Start asking</p>
                <p className="text-xs sm:text-sm text-gray-600 max-w-xs">
                  Ask me anything about your memories. I will search through them and give you accurate answers.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} reveal-up`} style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div
                      className={`max-w-xs sm:max-w-sm md:max-w-md px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.content}</p>
                      {msg.references && msg.references.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                          <p className="text-xs font-semibold opacity-75">Sources:</p>
                          {msg.references.slice(0, 2).map((ref) => (
                            <p key={ref.id} className="text-xs opacity-80">{ref.title}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start reveal-up">
                    <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-purple-200 p-3 sm:p-4 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                disabled={loading}
                className="input-premium flex-1 text-xs sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-premium px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover-lift disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
