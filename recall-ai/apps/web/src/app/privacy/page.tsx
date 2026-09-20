import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Recall AI',
  description: 'Privacy policy for Recall AI',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto prose prose-sm">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Recall AI ("Company," "we," "us," or "our") operates the Recall AI service
              ("Service"). This page informs you of our policies regarding the collection, use, and
              disclosure of personal data when you use our Service and the choices you have
              associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information Collection and Use</h2>
            <p>
              <strong>Email and Account Information:</strong> We collect your email address and
              name when you sign up for an account.
            </p>
            <p>
              <strong>Memory Data:</strong> We collect and store memories, commitments, deadlines,
              and follow-ups you capture through our Service.
            </p>
            <p>
              <strong>Integration Data:</strong> When you authorize integrations (Gmail, Google
              Calendar), we collect data necessary to sync with those services.
            </p>
            <p>
              <strong>Usage Analytics:</strong> We use PostHog to track feature usage and improve
              our Service. This is anonymous and can be disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
            <p>
              We use Supabase for secure storage with encryption at rest. OAuth tokens are
              encrypted. Row-level security (RLS) ensures only you can access your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
            <p>
              <strong>Supabase:</strong> Database and authentication provider.
            </p>
            <p>
              <strong>Anthropic:</strong> AI services for memory extraction and answering.
            </p>
            <p>
              <strong>Deepgram:</strong> Voice transcription services.
            </p>
            <p>
              <strong>Google:</strong> For Gmail and Calendar integrations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
            <p>
              Your memories are retained as long as your account is active. You can delete
              memories or request account deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@recall.ai" className="text-indigo-600 hover:underline">
                privacy@recall.ai
              </a>
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-12">
            Last updated: 2026-09-16
          </p>
        </div>
      </div>
    </div>
  );
}
