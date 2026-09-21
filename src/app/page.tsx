'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail, Brain, Users, Search, Zap, ArrowRight, CheckCircle,
  Sparkles, Layers, Star, Smartphone, Shield, Zap as ZapIcon
} from 'lucide-react';

export default function LandingPage() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .gradient-primary {
          background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .icon-box {
          width: 2.5rem;
          height: 2.5rem;
          @media (max-width: 640px) {
            width: 2rem;
            height: 2rem;
          }
        }

        @media (hover: hover) {
          .hover-lift {
            transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
          }

          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(147, 51, 234, 0.15);
          }
        }

        .workflow-stage {
          animation: revealUp 0.6s ease-out forwards;
        }

        .workflow-stage:nth-child(1) { animation-delay: 0.1s; }
        .workflow-stage:nth-child(3) { animation-delay: 0.2s; }
        .workflow-stage:nth-child(5) { animation-delay: 0.3s; }
        .workflow-stage:nth-child(7) { animation-delay: 0.4s; }
        .workflow-stage:nth-child(9) { animation-delay: 0.5s; }
        .workflow-stage:nth-child(11) { animation-delay: 0.6s; }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Premium Navigation - Mobile First */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-purple-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-4">
            {/* Logo & Branding */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg hover-lift">
                  <span className="text-white font-bold text-base sm:text-lg">i</span>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-bold text-purple-600">iRecall</div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-1 md:gap-2 flex-1 ml-6">
              <Link href="#workflow" className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-smooth">
                How It Works
              </Link>
              <Link href="#features" className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-smooth">
                Features
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/auth/login"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-smooth"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-premium px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs sm:text-sm font-bold rounded-lg hover-lift"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile First */}
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto text-center reveal-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Your AI Never Forgets
            <span className="block gradient-primary mt-2 sm:mt-3">What Matters Most</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl md:max-w-3xl mx-auto leading-relaxed">
            Intelligent workflow that captures from everywhere, understands relationships, and keeps you accountable to your network every single day.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 md:mb-20">
            <Link
              href="/auth/signup"
              className="btn-premium px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm sm:text-base font-bold rounded-lg hover-lift w-full sm:w-auto"
            >
              Start Free for 14 Days
            </Link>
            <Link
              href="#workflow"
              className="btn-premium px-6 sm:px-8 py-3 sm:py-4 border-2 border-purple-300 text-gray-900 text-sm sm:text-base font-bold rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-smooth w-full sm:w-auto"
            >
              See the Workflow →
            </Link>
          </div>

          {/* Trust Indicators - Responsive Grid */}
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2 sm:gap-6 md:gap-8">
            <div className="reveal-up stagger-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-primary mb-1 sm:mb-2">6</div>
              <div className="text-xs sm:text-sm text-gray-600">Capture Sources</div>
            </div>
            <div className="reveal-up stagger-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-primary mb-1 sm:mb-2">5</div>
              <div className="text-xs sm:text-sm text-gray-600">AI Agents</div>
            </div>
            <div className="reveal-up stagger-3">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-primary mb-1 sm:mb-2">∞</div>
              <div className="text-xs sm:text-sm text-gray-600">Relationships</div>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligent Workflow - Mobile First */}
      <section id="workflow" className="py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 md:mb-20 reveal-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              The Intelligent Workflow
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              From chaos to clarity in 6 stages
            </p>
          </div>

          {/* Workflow Pipeline - Responsive */}
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {/* Stage 1 */}
            <div className="workflow-stage">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50 to-white border border-sm:border-2 border-blue-200 hover:border-blue-400 hover-lift">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 sm:h-16 w-12 sm:w-16 rounded-lg bg-blue-100">
                    <Mail className="icon-box text-blue-600" />
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">Stage 1: Unstructured Input</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Email • Calendar • Slack • Voice • Files • Messages</p>
                </div>
                <ArrowRight className="hidden sm:block h-5 sm:h-6 w-5 sm:w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center sm:justify-start sm:ml-8">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-300 to-purple-300"></div>
            </div>

            {/* Stage 2 */}
            <div className="workflow-stage">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-50 to-white border border-sm:border-2 border-purple-200 hover:border-purple-400 hover-lift">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 sm:h-16 w-12 sm:w-16 rounded-lg bg-purple-100">
                    <Layers className="icon-box text-purple-600" />
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">Stage 2: Smart Capture</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Seamlessly captures everything. One unified inbox.</p>
                </div>
                <ArrowRight className="hidden sm:block h-5 sm:h-6 w-5 sm:w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center sm:justify-start sm:ml-8">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-300 to-purple-400"></div>
            </div>

            {/* Stage 3 */}
            <div className="workflow-stage">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-50 to-white border border-sm:border-2 border-purple-200 hover:border-purple-400 hover-lift">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 sm:h-16 w-12 sm:w-16 rounded-lg bg-purple-100">
                    <Brain className="icon-box text-purple-600" />
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">Stage 3: AI Extraction</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Extracts commitments, dates, priorities automatically.</p>
                </div>
                <ArrowRight className="hidden sm:block h-5 sm:h-6 w-5 sm:w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center sm:justify-start sm:ml-8">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-400 to-pink-300"></div>
            </div>

            {/* Stage 4 */}
            <div className="workflow-stage">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-50 to-white border border-sm:border-2 border-pink-200 hover:border-pink-400 hover-lift">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 sm:h-16 w-12 sm:w-16 rounded-lg bg-pink-100">
                    <Users className="icon-box text-pink-600" />
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">Stage 4: Relationship Intelligence</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Identifies roles, importance, and relationships.</p>
                </div>
                <ArrowRight className="hidden sm:block h-5 sm:h-6 w-5 sm:w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center sm:justify-start sm:ml-8">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-pink-300 to-cyan-300"></div>
            </div>

            {/* Stage 5 */}
            <div className="workflow-stage">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-50 to-white border border-sm:border-2 border-cyan-200 hover:border-cyan-400 hover-lift">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 sm:h-16 w-12 sm:w-16 rounded-lg bg-cyan-100">
                    <Search className="icon-box text-cyan-600" />
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">Stage 5: Semantic Ranking</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Ranks by relevance, recency, and importance.</p>
                </div>
                <ArrowRight className="hidden sm:block h-5 sm:h-6 w-5 sm:w-6 text-purple-600 flex-shrink-0" />
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center sm:justify-start sm:ml-8">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-cyan-300 to-green-300"></div>
            </div>

            {/* Stage 6 */}
            <div className="workflow-stage">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-50 to-white border border-sm:border-2 border-green-200 hover:border-green-400 hover-lift">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 sm:h-16 w-12 sm:w-16 rounded-lg bg-green-100">
                    <Zap className="icon-box text-green-600" />
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">Stage 6: Intelligent Outputs</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Daily briefs, people tracking, and smart search.</p>
                </div>
                <CheckCircle className="hidden sm:block h-5 sm:h-6 w-5 sm:w-6 text-green-600 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile First */}
      <section id="features" className="py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 md:mb-20 reveal-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Powerful Capabilities
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Everything you need to master your relationships
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: Mail, title: 'Smart Capture', desc: 'Gmail, Calendar, Slack, voice, files & more' },
              { icon: Brain, title: 'AI Extraction', desc: 'Commitments, dates, priorities auto-detected' },
              { icon: Users, title: 'People Tracking', desc: 'Relationships ranked by importance' },
              { icon: Search, title: 'Semantic Search', desc: 'Find by meaning, not keywords' },
              { icon: Star, title: 'Daily Briefs', desc: 'Automated summaries of commitments' },
              { icon: Sparkles, title: 'Ask Recall', desc: '"What did I promise?" - instant answers' },
            ].map((feature, idx) => (
              <div key={idx} className="card-premium p-4 sm:p-6 rounded-lg sm:rounded-xl hover-lift reveal-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-start gap-3 sm:gap-4 mb-3">
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                    <feature.icon className="icon-box text-purple-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="max-w-3xl mx-auto text-center reveal-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6">
            Never Disappoint Your Network
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-purple-100 mb-6 sm:mb-8">
            Start your free 14-day trial. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="btn-premium inline-block px-8 sm:px-10 py-3 sm:py-4 bg-white text-purple-600 text-base sm:text-lg font-bold rounded-lg hover-lift"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-purple-200 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-600 text-xs sm:text-sm">
          <p>&copy; 2026 iRecall.ai. All rights reserved. • Privacy • Terms • Contact</p>
        </div>
      </footer>
    </div>
  );
}
