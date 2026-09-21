'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail, Brain, Users, Search, Zap, ArrowRight, CheckCircle, Crown,
  Sparkles, GitBranch, Layers, Compass, Target, Code2, Database, Network
} from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes flowData {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(147, 51, 234, 0.5); }
          50% { opacity: 0.6; box-shadow: 0 0 40px rgba(147, 51, 234, 0.8); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .workflow-stage {
          animation: slideUp 0.8s ease-out forwards;
        }

        .workflow-stage:nth-child(1) { animation-delay: 0.1s; }
        .workflow-stage:nth-child(2) { animation-delay: 0.2s; }
        .workflow-stage:nth-child(3) { animation-delay: 0.3s; }
        .workflow-stage:nth-child(4) { animation-delay: 0.4s; }
        .workflow-stage:nth-child(5) { animation-delay: 0.5s; }
        .workflow-stage:nth-child(6) { animation-delay: 0.6s; }

        .data-flow {
          animation: flowData 2.5s infinite;
        }

        .pulse-glow {
          animation: pulseGlow 2s infinite;
        }

        .gradient-primary {
          background: linear-gradient(135deg, #9333ea, #7e22ce);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .icon-premium {
          width: 40px;
          height: 40px;
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-primary">
            Recall AI
          </div>
          <div className="hidden sm:flex gap-8 items-center">
            <Link href="#workflow" className="text-sm text-gray-700 hover:text-purple-600 font-medium transition">
              How It Works
            </Link>
            <Link href="#features" className="text-sm text-gray-700 hover:text-purple-600 font-medium transition">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-gray-700 hover:text-purple-600 font-medium transition">
              Pricing
            </Link>
            <Link href="/auth/login" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              Sign In
            </Link>
          </div>
          <Link href="/auth/login" className="sm:hidden px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg font-semibold">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your AI Never Forgets
            <span className="block gradient-primary">What Matters Most</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Intelligent workflow that captures from everywhere, understands relationships, and keeps you accountable to your network every single day.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-base rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/30 transition-all transform hover:scale-105"
            >
              Start Free for 14 Days
            </Link>
            <Link
              href="#workflow"
              className="px-8 py-4 border-2 border-purple-300 text-gray-900 text-base rounded-xl font-bold hover:border-purple-600 hover:bg-purple-50 transition-all"
            >
              See the Workflow →
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 sm:gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-primary mb-2">6</div>
            <div className="text-sm text-gray-600">Capture Sources</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-primary mb-2">5</div>
            <div className="text-sm text-gray-600">AI Agents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-primary mb-2">∞</div>
            <div className="text-sm text-gray-600">Relationships Tracked</div>
          </div>
        </div>
      </section>

      {/* Intelligent Workflow */}
      <section id="workflow" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              The Intelligent Workflow
            </h2>
            <p className="text-lg text-gray-600">
              From chaos to clarity in 6 stages
            </p>
          </div>

          {/* Workflow Pipeline */}
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Stage 1 */}
            <div className="workflow-stage">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-blue-100">
                    <Mail className="icon-premium text-blue-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Stage 1: Unstructured Input</h3>
                  <p className="text-gray-600">Email • Calendar • Slack • Voice • Files • Messages. Chaos everywhere.</p>
                </div>
                <ArrowRight className="h-6 w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-300 to-purple-300"></div>
            </div>

            {/* Stage 2 */}
            <div className="workflow-stage">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-purple-100">
                    <Layers className="icon-premium text-purple-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Stage 2: Smart Capture Agent</h3>
                  <p className="text-gray-600">Seamlessly captures everything. No context switching. One unified inbox of intelligence.</p>
                </div>
                <ArrowRight className="h-6 w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-300 to-purple-400"></div>
            </div>

            {/* Stage 3 */}
            <div className="workflow-stage">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-purple-100">
                    <Brain className="icon-premium text-purple-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Stage 3: AI Extraction Agent</h3>
                  <p className="text-gray-600">Extracts commitments ("I'll send..."), dates ("Friday"), priorities ("urgent"), and context automatically.</p>
                </div>
                <ArrowRight className="h-6 w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-300"></div>
            </div>

            {/* Stage 4 */}
            <div className="workflow-stage">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-pink-50 to-white border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-pink-100">
                    <Users className="icon-premium text-pink-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Stage 4: Relationship Intelligence Agent</h3>
                  <p className="text-gray-600">Recognizes who matters. Identifies roles (mentor, colleague, friend, manager). Scores importance automatically.</p>
                </div>
                <ArrowRight className="h-6 w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-pink-300 to-cyan-300"></div>
            </div>

            {/* Stage 5 */}
            <div className="workflow-stage">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-cyan-50 to-white border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-cyan-100">
                    <Search className="icon-premium text-cyan-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Stage 5: Semantic Search & Ranking Agent</h3>
                  <p className="text-gray-600">Ranks by relevance, recency, importance. "What did I promise Sarah?" returns perfect context.</p>
                </div>
                <ArrowRight className="h-6 w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-300 to-green-300"></div>
            </div>

            {/* Stage 6 */}
            <div className="workflow-stage">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-green-50 to-white border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-green-100">
                    <Zap className="icon-premium text-green-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Stage 6: Intelligent Outputs</h3>
                  <p className="text-gray-600">Daily briefs • People tracking • Smart search • Automated reminders. Never miss again.</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Powerful Capabilities
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to master your relationships
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Mail, title: 'Smart Capture', desc: 'Gmail, Calendar, Slack, voice, files & more' },
              { icon: Brain, title: 'AI Extraction', desc: 'Commitments, dates, priorities auto-detected' },
              { icon: Users, title: 'People Tracking', desc: 'Relationships ranked by importance' },
              { icon: Search, title: 'Semantic Search', desc: 'Find by meaning, not keywords' },
              { icon: Crown, title: 'Daily Briefs', desc: 'Automated summaries of commitments' },
              { icon: Sparkles, title: 'Ask Recall', desc: '"What did I promise?" - instant answers' },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-xl bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <feature.icon className="icon-premium text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Loved by Professionals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Priya S.', role: 'Founder', quote: 'Never felt so in control of my commitments.' },
              { name: 'Ahmed K.', role: 'CEO', quote: 'Relationships are tracked, follow-ups automated.' },
              { name: 'Jessica M.', role: 'Product Manager', quote: 'My daily brief is my most trusted routine.' },
            ].map((testimonial, idx) => (
              <div key={idx} className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 font-medium">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-purple-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Never Disappoint Your Network Again
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Start your free 14-day trial. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-white text-purple-600 text-lg rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-purple-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
          <p>&copy; 2026 Recall AI. All rights reserved. • Privacy • Terms • Contact</p>
        </div>
      </footer>
    </div>
  );
}
