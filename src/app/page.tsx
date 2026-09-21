'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Sparkles, FileText, MessageCircle, Send, Users, Brain, Search, Network } from 'lucide-react';

const FEATURES = [
  {
    icon: Mail,
    gradient: 'from-red-400 to-pink-500',
    title: 'Smart Capture',
    description: 'Capture from Gmail, Calendar, Slack, voice, files & quick text. All in one place.',
  },
  {
    icon: Sparkles,
    gradient: 'from-purple-400 to-indigo-500',
    title: 'AI Extraction',
    description: 'Claude AI automatically extracts commitments, dates, and priorities from your inputs.',
  },
  {
    icon: FileText,
    gradient: 'from-blue-400 to-cyan-500',
    title: 'Smart Organization',
    description: 'Automatically categorized: Overdue, Due Today, Coming Up. Never miss a deadline.',
  },
  {
    icon: MessageCircle,
    gradient: 'from-green-400 to-teal-500',
    title: 'Ask Recall',
    description: '"What did I promise Sarah?" Get instant answers grounded in your actual memories.',
  },
  {
    icon: Send,
    gradient: 'from-orange-400 to-red-500',
    title: 'Daily Briefs',
    description: 'Automated email summaries of your commitments. Customizable schedule & quiet hours.',
  },
  {
    icon: Users,
    gradient: 'from-yellow-400 to-orange-500',
    title: 'People Tracking',
    description: 'Track relationships. Never forget who you need to follow up with and when.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya S.',
    role: 'Founder, TechStartup',
    quote: 'Recall AI transformed how I manage commitments. I never miss a deadline anymore.',
    initials: 'PS',
  },
  {
    name: 'Ahmed K.',
    role: 'CEO, Digital Agency',
    quote: 'The semantic search finds relevant memories I forgot existed. Game changer.',
    initials: 'AK',
  },
  {
    name: 'Jessica M.',
    role: 'Product Manager',
    quote: 'Daily briefs keep me organized. The team features let us collaborate seamlessly.',
    initials: 'JM',
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Recall AI
          </div>
          <div className="hidden sm:flex gap-4 sm:gap-6 items-center">
            <Link href="#features" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium">
              Features
            </Link>
            <Link href="/pricing" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium">
              Pricing
            </Link>
            <Link href="/auth/login" className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm rounded-lg font-semibold hover:shadow-lg transition-all">
              Sign In
            </Link>
          </div>
          <Link href="/auth/login" className="sm:hidden px-3 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white text-xs rounded-lg font-semibold">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Never Forget What
              <span className="block bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Matters
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Your AI-powered memory assistant. Capture commitments from email, calendar, voice & more. Get automated daily briefs. Never miss a deadline again.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-3 sm:gap-4 flex-wrap">
              <Link
                href="/auth/signup"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm sm:text-base rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Start Free Today
              </Link>
              <Link
                href="#features"
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-900 text-sm sm:text-base rounded-xl font-bold hover:border-green-600 transition-all"
              >
                See Features →
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 sm:mt-12 flex gap-4 sm:gap-6">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">6</div>
                <div className="text-xs sm:text-sm text-gray-600">Capture Sources</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">100%</div>
                <div className="text-xs sm:text-sm text-gray-600">AI-Powered</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">3</div>
                <div className="text-xs sm:text-sm text-gray-600">Languages</div>
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
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Powerful Features</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">Everything you need to master your commitments</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 transform hover:scale-105">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mb-4 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intelligent Memory Understanding Section - USP */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <style>{`
          @keyframes typewriter {
            0% { width: 0; }
            100% { width: 100%; }
          }
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
          .typing-animation {
            overflow: hidden;
            border-right: 2px solid rgba(255,255,255,0.7);
            white-space: nowrap;
            animation: typewriter 3s steps(40, end) forwards, blink 0.7s infinite;
            animation-delay: 0.5s, 3.5s;
          }
          .processing-step {
            opacity: 0;
            animation: fadeInUp 0.6s ease-out forwards;
          }
          .processing-step:nth-child(1) { animation-delay: 0.8s; }
          .processing-step:nth-child(2) { animation-delay: 1.4s; }
          .processing-step:nth-child(3) { animation-delay: 2.0s; }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Intelligent Memory Understanding</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90">Advanced AI that truly understands relationships, context, and what matters most</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* People Intelligence */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Network className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Relationships</h3>
              <p className="text-white/80 mb-4">TypeSafe automatically understands who's important to you:</p>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-blue-300 mt-1">•</span>
                  <span><strong>Role Recognition:</strong> Identifies mentors, managers, colleagues, friends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300 mt-1">•</span>
                  <span><strong>Importance Scoring:</strong> Ranks relationships 1-5 based on context</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300 mt-1">•</span>
                  <span><strong>Context Understanding:</strong> Knows professional vs personal relationships</span>
                </li>
              </ul>
            </div>

            {/* Search Intelligence */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Semantic Search Ranking</h3>
              <p className="text-white/80 mb-4">Find what matters with intelligent multi-factor ranking:</p>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-purple-300 mt-1">•</span>
                  <span><strong>Relevance Analysis:</strong> True semantic understanding, not keywords</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-300 mt-1">•</span>
                  <span><strong>Recency Boost:</strong> Prioritizes recent, timely information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-300 mt-1">•</span>
                  <span><strong>Importance Weighting:</strong> Surfaces critical memories first</span>
                </li>
              </ul>
            </div>

            {/* AI Judgment */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Calibrated Judgment</h3>
              <p className="text-white/80 mb-4">AI that makes reliable, predictable decisions:</p>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-pink-300 mt-1">•</span>
                  <span><strong>Confidence Scores:</strong> Know how certain the AI is</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-300 mt-1">•</span>
                  <span><strong>Structured Answers:</strong> Typed, reliable outputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-300 mt-1">•</span>
                  <span><strong>Fast Decisions:</strong> Real-time semantic processing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* AI Processing Animation */}
          <div className="mt-12 sm:mt-16 bg-white/5 border border-white/20 rounded-2xl p-8 backdrop-blur-lg">
            <h3 className="text-lg sm:text-xl font-bold mb-6">See It In Action</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-white/80 mb-4"><strong>Your Input:</strong></p>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 text-sm">
                  <p className="text-white/90">"Had coffee with Sarah Chen, my mentor from engineering. She's been guiding me on the product roadmap. Also chatted with Alex, my friend - we haven't talked in months."</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/80 mb-4"><strong>AI Understanding:</strong></p>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 text-sm space-y-3 min-h-24">
                  {/* Typing animation for input */}
                  <div className="text-xs text-white/60 mb-3">
                    <span className="typing-animation">Analyzing text...</span>
                  </div>

                  {/* Processing steps with staggered animation */}
                  <div className="processing-step flex items-start gap-2">
                    <span className="text-blue-300 text-lg">→</span>
                    <div>
                      <span className="text-white/90"><strong>Sarah Chen</strong></span>
                      <span className="text-blue-300 text-xs ml-2">Mentor • 5/5 • Professional ✓</span>
                    </div>
                  </div>

                  <div className="processing-step flex items-start gap-2">
                    <span className="text-purple-300 text-lg">→</span>
                    <div>
                      <span className="text-white/90"><strong>Alex</strong></span>
                      <span className="text-pink-300 text-xs ml-2">Friend • 3/5 • Personal ✗</span>
                    </div>
                  </div>

                  <div className="processing-step flex items-start gap-2">
                    <span className="text-green-300 text-lg">✓</span>
                    <span className="text-green-300 text-xs">Relationships extracted & ranked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Loved by Users</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">See what people are saying about Recall AI</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Stay Updated</h2>
          <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-white/90">Get tips, features & updates delivered to your inbox</p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 sm:px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
              required
            />
            <button
              type="submit"
              className="px-6 sm:px-8 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-100 transition-all text-sm sm:text-base whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>

          {subscribed && (
            <p className="mt-4 text-green-100 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              Thanks for subscribing!
            </p>
          )}
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Simple Pricing</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8 hover:border-green-600 transition-all">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">$0</div>
              <button className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-all mb-8 text-sm sm:text-base">
                Get Started
              </button>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>Unlimited memories</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>AI extraction</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>People tracking</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>Daily emails</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>Team collaboration</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white rounded-2xl p-6 sm:p-8 transform sm:scale-105 shadow-2xl">
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-yellow-300 text-gray-900 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold">
                Popular
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Pro</h3>
              <div className="text-3xl sm:text-4xl font-bold mb-6">$9<span className="text-base sm:text-lg">/mo</span></div>
              <button className="w-full py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-100 transition-all mb-8 text-sm sm:text-base">
                Start Free Trial
              </button>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-white/90">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>Everything in Free</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>Team collaboration</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>Shared memories</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>10K API calls/month</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>Priority support</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8 hover:border-green-600 transition-all">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Custom</div>
              <button className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all mb-8 text-sm sm:text-base">
                Contact Sales
              </button>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>Everything in Pro</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>Unlimited API calls</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>White-label</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>SSO/SAML</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>Dedicated support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Ready to Transform Your Productivity?</h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8">Join thousands of professionals who never miss a commitment</p>
        <Link
          href="/auth/signup"
          className="inline-block px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm sm:text-base md:text-lg rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105"
        >
          Start Free Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm">&copy; 2026 Recall AI. All rights reserved.</p>
          <div className="flex gap-3 sm:gap-6 justify-center mt-4 sm:mt-6">
            <Link href="#" className="text-xs sm:text-sm hover:text-white transition-all">Privacy</Link>
            <Link href="#" className="text-xs sm:text-sm hover:text-white transition-all">Terms</Link>
            <Link href="#" className="text-xs sm:text-sm hover:text-white transition-all">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
