'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { PLAN_FEATURES } from '@/lib/payment-config';
import PremiumNav from '@/app/components/PremiumNav';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [country, setCountry] = useState('US');
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    fetchSubscription();
    detectCountry();
  }, []);

  const detectCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      setCountry(data.country_code || 'US');
    } catch {
      setCountry('US');
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/payments/subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeToProOrEnterprise = async (plan: 'pro' | 'enterprise') => {
    setPaymentLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const isIndia = country === 'IN';

      if (isIndia) {
        const response = await fetch('/api/payments/razorpay/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan }),
        });

        const { order_id, key, amount, email, name, description } = await response.json();

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const options = {
            key,
            order_id,
            amount,
            currency: 'INR',
            name,
            description,
            prefill: { email },
            handler: async (response: any) => {
              await fetchSubscription();
            },
          };
          (window as any).Razorpay && new (window as any).Razorpay(options).open();
        };
        document.body.appendChild(script);
      } else {
        const response = await fetch('/api/payments/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan }),
        });

        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <PremiumNav currentPage="billing" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-loader h-64 rounded-lg"></div>
            ))}
          </div>
          <div className="skeleton-loader h-40 rounded-lg"></div>
        </main>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <PremiumNav currentPage="billing" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 reveal-up">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Billing & Plans</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Manage your subscription and access premium features</p>
        </div>

        {/* Success/Canceled Messages */}
        {success && (
          <div className="mb-6 p-3 sm:p-4 bg-green-100 border-2 border-green-400 rounded-lg text-green-800 flex items-center gap-2 text-xs sm:text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            Payment successful! Your subscription has been updated.
          </div>
        )}
        {canceled && (
          <div className="mb-6 p-3 sm:p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-yellow-800 flex items-center gap-2 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Payment canceled. Try again when ready.
          </div>
        )}

        {/* Current Plan */}
        {currentPlan !== 'free' && (
          <div className="mb-8 card-premium bg-gradient-to-br from-purple-100 to-purple-50 border-2 border-purple-300 p-4 sm:p-6 rounded-lg sm:rounded-xl reveal-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize mb-2">Current Plan: {currentPlan}</h2>
                {subscription?.current_period_end && (
                  <p className="text-sm text-gray-600">
                    Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {subscription?.currency === 'inr' ? '₹' : '$'}
                  {subscription?.currency === 'inr' ? '299' : '9'}
                </div>
                <p className="text-sm text-gray-600">/month</p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {[
            { name: 'Free', price: '$0', icon: '🎯' },
            { name: 'Pro', price: country === 'IN' ? '₹299' : '$9', icon: '⚡', popular: true },
            { name: 'Enterprise', price: country === 'IN' ? '₹4,999' : '$299', icon: '👑' },
          ].map((plan, idx) => (
            <div
              key={plan.name}
              className={`card-premium relative rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 hover-lift reveal-up ${
                currentPlan === plan.name.toLowerCase()
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-purple-200 bg-white'
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Popular
                </div>
              )}

              <div className="text-2xl mb-3">{plan.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-2xl sm:text-3xl font-bold gradient-primary mb-4">{plan.price}<span className="text-base text-gray-600">/mo</span></div>

              <ul className="space-y-2 mb-6 text-xs sm:text-sm">
                {Object.entries(PLAN_FEATURES[plan.name.toLowerCase() as 'free' | 'pro' | 'enterprise']).map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="text-gray-600">{value}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {currentPlan === plan.name.toLowerCase() ? (
                <button disabled className="w-full py-2.5 bg-gray-200 text-gray-600 rounded-lg font-bold cursor-not-allowed text-sm">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => upgradeToProOrEnterprise(plan.name.toLowerCase() as 'pro' | 'enterprise')}
                  disabled={paymentLoading}
                  className="btn-premium w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold hover-lift disabled:opacity-50 text-sm"
                >
                  {paymentLoading ? 'Processing...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Payment History */}
        <div className="card-premium bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-purple-200 reveal-up">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Payment History</h3>
          <p className="text-xs sm:text-sm text-gray-600">Your payment history will appear here once you make a purchase.</p>
        </div>
      </main>
    </div>
  );
}
