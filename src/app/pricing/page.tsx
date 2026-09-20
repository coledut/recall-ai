'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started',
    features: [
      'Up to 100 memories',
      'Basic capture (text, email)',
      'Search memories',
      'Mobile app access',
    ],
    cta: 'Get Started',
    href: '/auth/signup',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For professionals',
    features: [
      'Unlimited memories',
      'All capture methods (email, calendar, Slack, voice)',
      'AI-powered extraction',
      'Daily email briefs',
      'People tracking',
      'Advanced search',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/auth/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: '/month',
    description: 'For teams',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced analytics',
      'Custom integrations',
      'Zapier + Make support',
      'Webhook API access',
      'Dedicated support',
      'SOC 2 compliance',
    ],
    cta: 'Contact Sales',
    href: 'mailto:sales@recall-ai.com',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Recall AI
          </Link>
          <div className="hidden sm:flex gap-6 items-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/pricing" className="text-sm text-gray-900 font-semibold">Pricing</Link>
            <Link href="/auth/login" className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm rounded-lg font-semibold hover:shadow-lg transition-all">
              Sign In
            </Link>
          </div>
          <Link href="/auth/login" className="sm:hidden px-3 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white text-xs rounded-lg font-semibold">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12">
            Choose the plan that works for you. Always flexible to scale.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col h-full ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-green-600 to-teal-600 text-white shadow-2xl scale-100 md:scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-green-600'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="px-4 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.highlighted ? 'text-green-50' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className={`text-4xl sm:text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`${plan.highlighted ? 'text-green-50' : 'text-gray-600'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="space-y-3 sm:space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-green-200' : 'text-green-600'}`} />
                        <span className={`text-sm sm:text-base ${plan.highlighted ? 'text-green-50' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={plan.href as any}
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-center mt-8 transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-white text-green-600 hover:shadow-lg hover:scale-105'
                      : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:shadow-lg'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12 sm:mb-16">
            Questions?
          </h2>
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-sm sm:text-base text-gray-600">Yes! Upgrade or downgrade your plan anytime. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-sm sm:text-base text-gray-600">Yes! Start with Free tier and upgrade to Pro anytime. Pro plan includes a 14-day free trial.</p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-sm sm:text-base text-gray-600">We accept credit cards via Stripe (global) and Razorpay (India). All payments are secure and encrypted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-8">
            Ready to get started?
          </h2>
          <Link
            href="/auth/signup"
            className="inline-block px-8 sm:px-12 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white text-base sm:text-lg rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105"
          >
            Start Free Today
          </Link>
        </div>
      </section>
    </div>
  );
}
