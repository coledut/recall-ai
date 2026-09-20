'use client';

import { useState } from 'react';
import type { AskRecallResponse } from '@/app/api/ask-recall/route';

interface Message {
  id: string;
  type: 'question' | 'answer';
  text: string;
  sources?: Array<{ memoryId: string; excerpt: string }>;
  confidence?: number;
}

export const AskRecallInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `q-${Date.now()}`,
      type: 'question',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ask-recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data: AskRecallResponse = await response.json();

      const answerMessage: Message = {
        id: `a-${Date.now()}`,
        type: 'answer',
        text: data.answer,
        sources: data.sources,
        confidence: data.confidence,
      };

      setMessages((prev) => [...prev, answerMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `e-${Date.now()}`,
        type: 'answer',
        text: `Sorry, I couldn't answer that. Try rephrasing your question.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'What am I forgetting?',
    'Who am I waiting for?',
    'What deadlines are coming up?',
    'What did I commit to Ahmed?',
    'What decisions have we made?',
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ask Recall
            </h2>
            <p className="text-gray-600 mb-8">
              Ask questions about your memories and commitments
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-4">Try asking:</p>
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                  }}
                  className="block w-full text-left px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 transition"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'question' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl p-4 rounded-lg ${
                  msg.type === 'question'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{msg.text}</p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs font-semibold mb-2">Sources:</p>
                    <ul className="space-y-1">
                      {msg.sources.map((source) => (
                        <li
                          key={source.memoryId}
                          className="text-xs opacity-90 italic"
                        >
                          "{source.excerpt.slice(0, 100)}..."
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.confidence !== undefined && msg.type === 'answer' && (
                  <p className="text-xs mt-2 opacity-75">
                    Confidence: {Math.round(msg.confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleAsk} className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
};
