'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (data.session) {
        // Wait for session to be stored
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = '/app/today';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-green-50 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="w-full max-w-md bg-gradient-to-br from-white/20 to-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-xl border border-white/30 relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
            Recall AI
          </h1>
          <p className="text-teal-700/80 text-sm mt-2">Your intelligent memory assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-gradient-to-r from-red-600/30 to-red-600/10 border border-red-400/50 rounded-xl text-red-700 backdrop-blur-sm">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-green-700 mb-3">
              📧 Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-green-300/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 text-gray-900 placeholder-gray-500 backdrop-blur-sm focus:bg-white/70 transition-all duration-200"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-700 mb-3">
              🔐 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-green-300/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 text-gray-900 placeholder-gray-500 backdrop-blur-sm focus:bg-white/70 transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-green-500/30 border border-green-400/30"
          >
            {loading ? '⏳ Signing in...' : '✨ Sign In'}
          </button>
        </form>

        <p className="text-center text-green-700/70 mt-8">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-teal-600 hover:text-teal-700 font-bold transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
