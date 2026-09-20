import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Recall AI - Never Forget What Matters',
  description:
    'AI-powered memory assistant that captures commitments from email, calendar, voice, and files. Smart reminders and grounded Q&A.',
  openGraph: {
    title: 'Recall AI - Never Forget What Matters',
    description:
      'Capture memories from multiple sources. Get smart reminders. Answer questions with sources.',
    type: 'website',
    url: 'https://recall.ai',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600">Recall AI</div>
          <div className="flex gap-4">
            <Link
              href="/auth"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Never Forget What Matters
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Recall AI captures commitments, deadlines, and follow-ups from your email, calendar,
            voice memos, and files. Smart AI extracts what's important and reminds you exactly
            when you need it.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-lg font-medium"
            >
              Start Free
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 border-2 border-gray-300 text-gray-900 rounded-lg hover:border-gray-400 transition text-lg font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Capture from Anywhere
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '📧',
                title: 'Email',
                desc: 'Auto-sync Gmail. Extract commitments from threads.',
              },
              {
                icon: '📅',
                title: 'Calendar',
                desc: 'Extract action items from calendar events.',
              },
              {
                icon: '🎤',
                title: 'Voice Memos',
                desc: 'Speak naturally. AI transcribes and extracts.',
              },
              {
                icon: '📄',
                title: 'Files & Images',
                desc: 'Upload PDFs, docs, images. Extract text automatically.',
              },
              {
                icon: '✏️',
                title: 'Quick Capture',
                desc: 'Type naturally. AI understands context.',
              },
              {
                icon: '🔗',
                title: 'Unified Inbox',
                desc: 'All sources feed one smart pipeline.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-lg transition"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            AI That Understands Context
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Extraction</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 font-bold mt-1">→</span>
                  <span>Identifies commitments, deadlines, and follow-ups automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 font-bold mt-1">→</span>
                  <span>Extracts relevant people and dates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 font-bold mt-1">→</span>
                  <span>Confidence scores for every extraction</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Grounded Answers</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 font-bold mt-1">→</span>
                  <span>"What did Ahmed say about the deadline?"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 font-bold mt-1">→</span>
                  <span>Every answer cites sources with links</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 font-bold mt-1">→</span>
                  <span>Never invents answers, always grounded</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Today View */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Your Day, at a Glance
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Smart Grouping, Not Drowning in Todos
              </h3>
              <p className="text-gray-600 mb-4">
                Recall groups your memories by context:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Needs Attention:</strong> Overdue items</li>
                <li>• <strong>Due Today:</strong> Deadlines coming</li>
                <li>• <strong>Waiting for Others:</strong> Blocked on someone</li>
                <li>• <strong>Coming Up:</strong> Next week's prep</li>
                <li>• <strong>Recently Remembered:</strong> Archive or action</li>
              </ul>
            </div>
            <div className="bg-indigo-100 h-64 rounded-lg flex items-center justify-center text-gray-500">
              [Today View Preview]
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Never Miss a Deadline
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📧',
                title: 'Daily Email Digest',
                desc: 'Morning summary of your commitments, grouped by priority',
              },
              {
                icon: '🔔',
                title: 'Push Notifications',
                desc: 'Real-time alerts for items due soon or overdue',
              },
              {
                icon: '⏰',
                title: 'Smart Scheduling',
                desc: 'Respects your timezone and quiet hours. No spam.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Remember What Matters
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Free to start. No credit card required.
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition text-lg font-bold"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/auth" className="hover:text-white transition">Sign In</Link></li>
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="hover:text-white transition">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li><a href="mailto:hello@recall.ai" className="hover:text-white transition">Email</a></li>
                <li><a href="https://twitter.com/recallai" className="hover:text-white transition">Twitter</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
                <li><a href="/docs" className="hover:text-white transition">Docs</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>© 2026 Recall AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Recall AI',
            description:
              'AI-powered memory assistant that captures commitments from multiple sources with smart reminders and grounded Q&A',
            url: 'https://recall.ai',
            applicationCategory: 'ProductivityApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              url: 'https://recall.ai/auth',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '42',
            },
          }),
        }}
      />
    </div>
  );
}
