import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Recall AI',
  description: 'Latest updates and tips from Recall AI',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-xl text-gray-600 mb-12">
          Tips, updates, and stories from the Recall AI team.
        </p>

        <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Coming soon. Check back for productivity tips and product updates.</p>
        </div>
      </div>
    </div>
  );
}
