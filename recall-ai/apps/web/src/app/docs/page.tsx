import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation - Recall AI',
  description: 'Help and documentation for Recall AI',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
        <p className="text-xl text-gray-600 mb-12">
          Help with Recall AI features and getting started.
        </p>

        <div className="space-y-8">
          {[
            {
              title: 'Getting Started',
              desc: 'Learn how to set up your account and capture your first memory',
              url: '#',
            },
            {
              title: 'Capture Methods',
              desc: 'Explore all the ways to capture: Quick Text, Email, Calendar, Voice, Files',
              url: '#',
            },
            {
              title: 'Notifications',
              desc: 'Configure email digests and push notifications',
              url: '#',
            },
            {
              title: 'Ask Recall',
              desc: 'Ask questions about your memories with grounded answers',
              url: '#',
            },
            {
              title: 'Integrations',
              desc: 'Connect Gmail, Google Calendar, and other services',
              url: '#',
            },
            {
              title: 'Privacy & Security',
              desc: 'How we keep your data safe and secure',
              url: '#',
            },
          ].map((doc, i) => (
            <a
              key={i}
              href={doc.url}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
              <p className="text-gray-600">{doc.desc}</p>
            </a>
          ))}
        </div>

        <div className="mt-12 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-gray-700">
            Can't find what you're looking for? Email us at{' '}
            <a href="mailto:support@recall.ai" className="text-indigo-600 hover:underline font-medium">
              support@recall.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
