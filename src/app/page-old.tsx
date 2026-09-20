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
                gradient: 'from-purple-400 to-pink-400',
                svgPath: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
                title: 'Universal Capture',
                desc: 'Capture from email, calendar, voice messages, and files in one place.',
              },
              {
                gradient: 'from-cyan-400 to-blue-500',
                svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
                title: 'AI-Powered',
                desc: 'Claude AI extracts and organizes commitments automatically.',
              },
              {
                gradient: 'from-yellow-400 to-orange-500',
                svgPath: 'M13 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-7-7zM5.5 20c-.83 0-1.5-.67-1.5-1.5S4.67 17 5.5 17 7 17.67 7 18.5 6.33 20 5.5 20zm6.5-4H6V4h5.5v12z',
                title: 'Lightning Fast',
                desc: 'Instant search and retrieval of all your memories.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-lg transition transform hover:-translate-y-2 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={feature.svgPath} />
                  </svg>
                </div>
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
