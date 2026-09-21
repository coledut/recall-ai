'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Brain, Users, Search, Zap, ArrowRight, CheckCircle, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <style>{`
        :root {
          --color-primary: #a78bfa;
          --color-secondary: #e9d5ff;
          --color-accent: #c4b5fd;
        }

        @keyframes flowData {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .agent-pipeline {
          animation: slideUp 0.8s ease-out forwards;
        }

        .agent-pipeline:nth-child(2) { animation-delay: 0.1s; }
        .agent-pipeline:nth-child(3) { animation-delay: 0.2s; }
        .agent-pipeline:nth-child(4) { animation-delay: 0.3s; }
        .agent-pipeline:nth-child(5) { animation-delay: 0.4s; }

        .data-flow {
          animation: flowData 2s infinite;
        }

        .pulse-glow {
          animation: pulseGlow 2s infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #a78bfa, #f472b6, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">
            Recall AI
          </div>
          <div className="hidden sm:flex gap-8 items-center">
            <Link href="#how-it-works" className="text-sm text-purple-200 hover:text-purple-100 font-medium transition">
              How It Works
            </Link>
            <Link href="#features" className="text-sm text-purple-200 hover:text-purple-100 font-medium transition">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-purple-200 hover:text-purple-100 font-medium transition">
              Pricing
            </Link>
            <Link href="/auth/login" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all">
              Sign In
            </Link>
          </div>
          <Link href="/auth/login" className="sm:hidden px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg font-semibold">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your AI Never Forgets
            <span className="block gradient-text">What Matters</span>
          </h1>
          <p className="text-lg sm:text-xl text-purple-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Capture from email, calendar, Slack, voice. Intelligent AI agents extract commitments, understand relationships, and keep you accountable to your network.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
            >
              Start Free for 14 Days
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 border-2 border-purple-500/50 text-purple-100 text-base rounded-xl font-bold hover:border-purple-400 hover:bg-purple-500/10 transition-all"
            >
              See How It Works →
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 sm:gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">6</div>
            <div className="text-sm text-purple-300">Capture Sources</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">AI Agents</div>
            <div className="text-sm text-purple-300">Intelligent Processing</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">100%</div>
            <div className="text-sm text-purple-300">Private & Secure</div>
          </div>
        </div>
      </section>

      {/* AI Agent Pipeline - Main Visual Story */}
      <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Intelligent Processing Pipeline
            </h2>
            <p className="text-lg text-purple-300">
              Watch how AI agents transform raw inputs into actionable intelligence
            </p>
          </div>

          {/* Pipeline Visualization */}
          <div className="space-y-6">
            {/* Stage 1: Capture */}
            <div className="agent-pipeline">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">Multi-Source Capture</h3>
                  <p className="text-purple-300">Gmail • Calendar • Slack • Voice • Files • Messages</p>
                </div>
                <ArrowRight className="h-6 w-6 text-purple-400 flex-shrink-0" />
              </div>
            </div>

            {/* Data Flow Animation */}
            <div className="relative h-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                <div className="data-flow absolute h-2 w-2 rounded-full bg-purple-400 pulse-glow"></div>
              </div>
            </div>

            {/* Stage 2: Extraction Agent */}
            <div className="agent-pipeline">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">Extraction Agent</h3>
                  <p className="text-purple-300">Understands commitments, dates, priorities, and context from unstructured data</p>
                </div>
                <ArrowRight className="h-6 w-6 text-purple-400 flex-shrink-0" />
              </div>
            </div>

            {/* Data Flow Animation */}
            <div className="relative h-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                <div className="data-flow absolute h-2 w-2 rounded-full bg-purple-400 pulse-glow" style={{animationDelay: '0.5s'}}></div>
              </div>
            </div>

            {/* Stage 3: People Agent */}
            <div className="agent-pipeline">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">People Intelligence Agent</h3>
                  <p className="text-purple-300">Recognizes relationships, roles (mentor, colleague, friend), and importance scores each person</p>
                </div>
                <ArrowRight className="h-6 w-6 text-purple-400 flex-shrink-0" />
              </div>
            </div>

            {/* Data Flow Animation */}
            <div className="relative h-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                <div className="data-flow absolute h-2 w-2 rounded-full bg-purple-400 pulse-glow" style={{animationDelay: '1s'}}></div>
              </div>
            </div>

            {/* Stage 4: Ranking Agent */}
            <div className="agent-pipeline">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">Ranking & Search Agent</h3>
                  <p className="text-purple-300">Scores by relevance, recency, and importance. Powers semantic search across all memories</p>
                </div>
                <ArrowRight className="h-6 w-6 text-purple-400 flex-shrink-0" />
              </div>
            </div>

            {/* Data Flow Animation */}
            <div className="relative h-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                <div className="data-flow absolute h-2 w-2 rounded-full bg-purple-400 pulse-glow" style={{animationDelay: '1.5s'}}></div>
              </div>
            </div>

            {/* Stage 5: Output */}
            <div className="agent-pipeline">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">Intelligent Output</h3>
                  <p className="text-purple-300">Daily briefs • Relationship tracking • Semantic search • Smart notifications</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Detailed Agent Explanations */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              AI Agents That Understand You
            </h2>
            <p className="text-lg text-purple-300">
              Each agent specializes in a different aspect of your memory management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Smart Capture</h3>
              </div>
              <p className="text-purple-300 leading-relaxed">
                Seamlessly capture from Gmail, Calendar, Slack, voice notes, files, and quick text. No context switching. Your AI captures everything across all your tools.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex-shrink-0">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Extraction Agent</h3>
              </div>
              <p className="text-purple-300 leading-relaxed">
                Understands natural language. Extracts commitments ("I'll send you..."), dates ("Friday meeting"), priorities ("urgent"), and context automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">People Intelligence</h3>
              </div>
              <p className="text-purple-300 leading-relaxed">
                Recognizes relationships. Knows who's your mentor, colleague, friend, or manager. Ranks by importance and tracks follow-ups. Your personal CRM.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex-shrink-0">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Semantic Search</h3>
              </div>
              <p className="text-purple-300 leading-relaxed">
                Find memories by meaning, not keywords. "What did I promise Sarah?" returns relevant context. Ranked by relevance, recency, and importance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Daily Briefs</h3>
              </div>
              <p className="text-purple-300 leading-relaxed">
                Get automated email summaries of your commitments, follow-ups, and important relationships. Customizable schedule & quiet hours.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex-shrink-0">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Always-On Intelligence</h3>
              </div>
              <p className="text-purple-300 leading-relaxed">
                Runs 24/7. Captures while you sleep. Processes in background. By morning, your daily brief is ready. Never miss a commitment again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Loved by Professionals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya S.',
                role: 'Founder, TechStartup',
                quote: "I've never felt so in control of my commitments. Every promise tracked, nothing forgotten.",
              },
              {
                name: 'Ahmed K.',
                role: 'CEO, Digital Agency',
                quote: 'My relationships matter. This AI understands who needs follow-ups and reminds me automatically.',
              },
              {
                name: 'Jessica M.',
                role: 'Product Manager',
                quote: 'Daily briefs are my trusted routine. I start each day knowing exactly what I promised.',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-purple-100 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-sm text-purple-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-t border-purple-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Never Disappoint Your Network Again
          </h2>
          <p className="text-xl text-purple-200 mb-8">
            Let AI handle the memory. You focus on relationships.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-purple-500/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-purple-400 text-sm">
          <p>&copy; 2026 Recall AI. All rights reserved. • Privacy • Terms • Contact</p>
        </div>
      </footer>
    </div>
  );
}
