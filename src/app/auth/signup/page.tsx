'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, AlertCircle, Loader, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-green-50 px-4 sm:px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-64 sm:w-80 h-64 sm:h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-64 sm:w-80 h-64 sm:h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="w-full max-w-md bg-gradient-to-br from-white/20 to-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl border border-white/30 relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <svg className="w-12 sm:w-16 h-12 sm:h-16 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700">
            Recall AI
          </h1>
          <p className="text-green-700/70 text-xs sm:text-sm mt-1 sm:mt-2">Create your memory companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <div className="p-3 sm:p-4 bg-gradient-to-r from-red-600/30 to-red-600/10 border border-red-400/50 rounded-xl text-red-700 text-xs sm:text-sm backdrop-blur-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" />
              </div>
              <label className="text-xs sm:text-sm font-semibold text-green-700">Full Name</label>
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-green-300/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 text-gray-900 placeholder-gray-500 backdrop-blur-sm focus:bg-white/70 transition-all duration-200 text-sm"
              placeholder="Your name"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" />
              </div>
              <label className="text-xs sm:text-sm font-semibold text-green-700">Email</label>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-green-300/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 text-gray-900 placeholder-gray-500 backdrop-blur-sm focus:bg-white/70 transition-all duration-200 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" />
              </div>
              <label className="text-xs sm:text-sm font-semibold text-green-700">Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-green-300/40 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 text-gray-900 placeholder-gray-500 backdrop-blur-sm focus:bg-white/70 transition-all duration-200 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-green-500/30 border border-green-400/30 mt-4 sm:mt-6 text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <p className="text-center text-green-700/70 mt-6 sm:mt-8 text-xs sm:text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
