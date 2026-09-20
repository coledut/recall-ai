import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Recall AI',
  description: 'Terms of service for Recall AI',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto prose prose-sm">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Recall AI, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to abide by the above, please do
              not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information
              or software) on Recall AI for personal, non-commercial transitory viewing only. This
              is the grant of a license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose</li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Removing any copyright or other proprietary notations</li>
              <li>Transferring the materials to another person or "mirroring" the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
            <p>
              The materials on Recall AI are provided on an 'as is' basis. Recall AI makes no
              warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations</h2>
            <p>
              In no event shall Recall AI or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on Recall AI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Recall AI could include technical, typographical, or
              photographic errors. Recall AI does not warrant that any of the materials on its
              Internet web site are accurate, complete, or current. Recall AI may make changes to
              the materials contained on its web site at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Links</h2>
            <p>
              Recall AI has not reviewed all of the sites linked to its Internet web site and is
              not responsible for the contents of any such linked site. The inclusion of any link
              does not imply endorsement by Recall AI of the site. Use of any such linked web site
              is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications</h2>
            <p>
              Recall AI may revise these terms of service for its web site at any time without
              notice. By using this web site, you are agreeing to be bound by the then current
              version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws
              of India, and you irrevocably submit to the exclusive jurisdiction of the courts
              located in India.
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
