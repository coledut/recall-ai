'use client';

import { useState } from 'react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: '📧',
    title: 'Smart Capture',
    description: 'Capture from Gmail, Calendar, Slack, voice, files & quick text. All in one place.',
  },
  {
    icon: '🧠',
    title: 'AI Extraction',
    description: 'Claude AI automatically extracts commitments, dates, and priorities from your inputs.',
  },
  {
    icon: '📋',
    title: 'Smart Organization',
    description: 'Automatically categorized: Overdue, Due Today, Coming Up. Never miss a deadline.',
  },
  {
    icon: '💬',
    title: 'Ask Recall',
    description: '"What did I promise Sarah?" Get instant answers grounded in your actual memories.',
  },
  {
    icon: '📧',
    title: 'Daily Briefs',
    description: 'Automated email summaries of your commitments. Customizable schedule & quiet hours.',
  },
  {
    icon: '👥',
    title: 'People Tracking',
    description: 'Track relationships. Never forget who you need to follow up with and when.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya S.',
    role: 'Founder, TechStartup',
    quote: 'Recall AI transformed how I manage commitments. I never miss a deadline anymore.',
    avatar: '👩‍💼',
  },
  {
    name: 'Ahmed K.',
    role: 'CEO, Digital Agency',
    quote: 'The semantic search finds relevant memories I forgot existed. Game changer.',
    avatar: '👨‍💼',
  },
  {
    name: 'Jessica M.',
    role: 'Product Manager',
    quote: 'Daily briefs keep me organized. The team features let us collaborate seamlessly.',
    avatar: '👩‍💻',
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Subscribe logic here
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Recall AI
          </div>
          <div className="flex gap-6 items-center">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">
              Pricing
            </Link>
            <Link href="/auth/login" className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Never Forget What
              <span className="block bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Matters
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your AI-powered memory assistant. Capture commitments from email, calendar, voice & more. Get automated daily briefs. Never miss a deadline again.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Start Free Today
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-xl font-bold text-lg hover:border-green-600 transition-all"
              >
                See Features →
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">6</div>
                <div className="text-sm text-gray-600">Capture Sources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">AI-Powered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-teal-200 rounded-2xl blur-2xl opacity-30" />
            <div className="relative bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100 shadow-2xl">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-semibold text-gray-900 text-sm">Meeting with Sarah Friday</span>
                  </div>
                  <p className="text-xs text-gray-600">Discuss Q4 strategy · Priority: High · Due: 2 days</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="font-semibold text-gray-900 text-sm">Email report to CEO</span>
                  </div>
                  <p className="text-xs text-gray-600">Status update · Priority: High · Due: Today</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-semibold text-gray-900 text-sm">Follow up with Ahmed</span>
                  </div>
                  <p className="text-xs text-gray-600">Project update · Priority: Medium · Due: 5 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to master your commitments</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Users</h2>
            <p className="text-xl text-gray-600">See what people are saying about Recall AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="mt-4 flex gap-1">⭐⭐⭐⭐⭐</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-8 text-white/90">Get tips, features & updates delivered to your inbox</p>

          <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-100 transition-all"
            >
              Subscribe
            </button>
          </form>

          {subscribed && (
            <p className="mt-4 text-green-100">✓ Thanks for subscribing!</p>
          )}
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-green-600 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">$0</div>
              <button className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-all mb-8">
                Get Started
              </button>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>✓ Unlimited memories</li>
                <li>✓ AI extraction</li>
                <li>✓ People tracking</li>
                <li>✓ Daily emails</li>
                <li>✗ Team collaboration</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white rounded-2xl p-8 transform scale-105 shadow-2xl">
              <div className="absolute top-6 right-6 bg-yellow-300 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">$9<span className="text-lg">/mo</span></div>
              <button className="w-full py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-100 transition-all mb-8">
                Start Free Trial
              </button>
              <ul className="space-y-3 text-sm text-white/90">
                <li>✓ Everything in Free</li>
                <li>✓ Team collaboration</li>
                <li>✓ Shared memories</li>
                <li>✓ 10K API calls/month</li>
                <li>✓ Priority support</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-green-600 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-2xl font-bold text-gray-900 mb-6">Custom</div>
              <button className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all mb-8">
                Contact Sales
              </button>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>✓ Everything in Pro</li>
                <li>✓ Unlimited API calls</li>
                <li>✓ White-label</li>
                <li>✓ SSO/SAML</li>
                <li>✓ Dedicated support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gray-900 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Productivity?</h2>
        <p className="text-xl text-gray-300 mb-8">Join thousands of professionals who never miss a commitment</p>
        <Link
          href="/auth/signup"
          className="inline-block px-10 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
        >
          Start Free Today - No Credit Card Required
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2026 Recall AI. All rights reserved.</p>
          <div className="flex gap-6 justify-center mt-6">
            <Link href="#" className="hover:text-white transition-all">Privacy</Link>
            <Link href="#" className="hover:text-white transition-all">Terms</Link>
            <Link href="#" className="hover:text-white transition-all">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
