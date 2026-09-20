'use client';

import { PLANS } from '@/lib/plans';

export default function PricingPlans() {
  return (
    <div className="py-12 px-4 bg-gradient-to-br from-green-50 to-teal-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-green-600 to-teal-600 text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-900 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="mb-8">
                {plan.price === 0 ? (
                  <div>
                    <span className="text-4xl font-bold">Free</span>
                  </div>
                ) : plan.billing === 'custom' ? (
                  <div>
                    <span className="text-lg font-semibold">Custom pricing</span>
                    <p className="text-sm mt-1">Contact us for details</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className={plan.highlighted ? 'text-white/80' : 'text-gray-600'}>/month</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 px-4 rounded-xl font-bold mb-8 transition-all ${
                  plan.highlighted
                    ? 'bg-white text-green-600 hover:bg-gray-100'
                    : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:shadow-lg'
                }`}
              >
                {plan.id === 'free' ? 'Get Started' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
              </button>

              {/* Features */}
              <div className="space-y-3">
                <p className={`font-semibold mb-4 ${plan.highlighted ? 'text-white/90' : 'text-gray-900'}`}>
                  Features:
                </p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className={`text-lg ${plan.highlighted ? 'text-green-300' : 'text-green-500'}`}>✓</span>
                    <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Limits */}
              <div className={`mt-8 pt-8 border-t ${plan.highlighted ? 'border-white/20' : 'border-gray-200'}`}>
                <p className={`font-semibold mb-3 ${plan.highlighted ? 'text-white/90' : 'text-gray-900'}`}>
                  Limits:
                </p>
                <div className={`text-sm space-y-2 ${plan.highlighted ? 'text-white/80' : 'text-gray-600'}`}>
                  <p>API calls: {plan.limits.apiCalls === Infinity ? 'Unlimited' : `${plan.limits.apiCalls}/month`}</p>
                  <p>Team members: {plan.limits.teamMembers === Infinity ? 'Unlimited' : plan.limits.teamMembers}</p>
                  <p>Storage: {plan.limits.storage === Infinity ? 'Unlimited' : `${plan.limits.storage} GB`}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg text-left">
              <h4 className="font-bold text-gray-900 mb-2">Can I switch plans anytime?</h4>
              <p className="text-gray-600 text-sm">Yes, upgrade or downgrade your plan anytime. Changes take effect immediately.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-left">
              <h4 className="font-bold text-gray-900 mb-2">Do you offer discounts for annual billing?</h4>
              <p className="text-gray-600 text-sm">Yes! Annual Pro plans get 20% off. Contact us for bulk discounts.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-left">
              <h4 className="font-bold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">Free tier is forever free! Try Pro features risk-free for 14 days.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-left">
              <h4 className="font-bold text-gray-900 mb-2">What if I need a custom plan?</h4>
              <p className="text-gray-600 text-sm">Contact our sales team for enterprise solutions tailored to your needs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
