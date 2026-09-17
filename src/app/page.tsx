'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <Logo size="md" />
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 bg-gradient-to-br from-green-50 via-white to-teal-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div
          className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />

        <div className="max-w-4xl mx-auto px-8 text-center z-10">
          <div
            className="mb-8"
            style={{ transform: `translateY(${scrollY * -0.3}px)` }}
          >
            <Logo size="lg" />
          </div>

          <h1
            className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            style={{ transform: `translateY(${scrollY * -0.2}px)` }}
          >
            Remember Everything
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
              {' '}
              That Matters
            </span>
          </h1>

          <p
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ transform: `translateY(${scrollY * -0.15}px)` }}
          >
            Capture commitments from email, calendar, voice, and files. Recall AI
            helps you organize and never miss what's important.
          </p>

          <div
            className="flex gap-6 justify-center"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
            <Link
              href="/app/today"
              className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border-2 border-gray-300 text-gray-900 text-lg font-semibold rounded-lg hover:border-green-600 hover:text-green-600 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center mb-16 text-gray-900">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📧',
                title: 'Universal Capture',
                desc: 'Capture from email, calendar, voice messages, and files in one place.',
              },
              {
                icon: '🧠',
                title: 'AI-Powered',
                desc: 'Claude AI extracts and organizes commitments automatically.',
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                desc: 'Instant search and retrieval of all your memories.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-lg transition transform hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Ready to Remember Everything?
          </h2>
          <p className="text-xl text-green-50 mb-12">
            Start capturing your commitments today. Free to try.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-10 py-4 bg-white text-green-600 text-xl font-bold rounded-lg hover:bg-green-50 transition transform hover:scale-105"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="mb-2">© 2026 Recall AI. All rights reserved.</p>
          <p className="text-sm text-gray-500">
            Your memory assistant powered by Claude AI
          </p>
        </div>
      </footer>
    </main>
  );
}
