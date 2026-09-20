'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { PLAN_FEATURES } from '@/lib/payment-config';

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

  async function detectCountry() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      setCountry(data.country_code || 'US');
    } catch {
      setCountry('US');
    }
  }

  async function fetchSubscription() {
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
  }

  async function upgradeToProOrEnterprise(plan: 'pro' | 'enterprise') {
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
              console.log('Payment successful:', response);
              await fetchSubscription();
            },
          };
          // @ts-ignore
          new window.Razorpay(options).open();
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
      alert('Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Loading billing information...</div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">Billing & Plans</h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-400">Manage your subscription and access premium features</p>
        </div>

        {success && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            ✅ Payment successful! Your subscription has been updated.
          </div>
        )}
        {canceled && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400">
            ⚠️ Payment canceled. Try again when ready.
          </div>
        )}

        {currentPlan !== 'free' && (
          <div className="mb-12 p-6 bg-teal-500/10 border border-teal-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">Current Plan: {currentPlan}</h2>
                <p className="text-slate-400 mt-2">
                  {subscription?.current_period_end &&
                    `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-teal-400">
                  {subscription?.currency === 'inr' ? '₹' : '$'}
                  {subscription?.currency === 'inr' ? '299' : '9'}
                </div>
                <p className="text-slate-400">/month</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className={`p-8 rounded-lg border-2 transition-all ${
            currentPlan === 'free'
              ? 'border-teal-500 bg-teal-500/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}>
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <div className="text-3xl font-bold text-slate-300 mb-6">$0/mo</div>

            <ul className="space-y-3 mb-8">
              {Object.entries(PLAN_FEATURES.free).map(([key, value]) => (
                <li key={key} className="text-slate-400 flex items-start gap-3">
                  <span className="text-teal-400 mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-sm text-slate-500">{value}</div>
                  </div>
                </li>
              ))}
            </ul>

            {currentPlan === 'free' && (
              <button disabled className="w-full py-2 px-4 bg-slate-700 text-slate-400 rounded-lg font-semibold cursor-not-allowed">
                Current Plan
              </button>
            )}
          </div>

          <div className={`p-8 rounded-lg border-2 transition-all ${
            currentPlan === 'pro'
              ? 'border-teal-500 bg-teal-500/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-teal-500'
          } relative`}>
            <div className="absolute -top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Popular
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <div className="text-3xl font-bold text-teal-400 mb-6">
              {country === 'IN' ? '₹299' : '$9'}
              <span className="text-lg text-slate-400">/mo</span>
            </div>

            <ul className="space-y-3 mb-8">
              {Object.entries(PLAN_FEATURES.pro).map(([key, value]) => (
                <li key={key} className="text-slate-400 flex items-start gap-3">
                  <span className="text-teal-400 mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-sm text-slate-500">{value}</div>
                  </div>
                </li>
              ))}
            </ul>

            {currentPlan === 'pro' ? (
              <button disabled className="w-full py-2 px-4 bg-slate-700 text-slate-400 rounded-lg font-semibold cursor-not-allowed">
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => upgradeToProOrEnterprise('pro')}
                disabled={paymentLoading}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 disabled:opacity-50"
              >
                {paymentLoading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            )}
          </div>

          <div className={`p-8 rounded-lg border-2 transition-all ${
            currentPlan === 'enterprise'
              ? 'border-teal-500 bg-teal-500/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}>
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-3xl font-bold text-slate-300 mb-6">
              {country === 'IN' ? '₹4,999' : '$299'}
              <span className="text-lg text-slate-400">/mo</span>
            </div>

            <ul className="space-y-3 mb-8">
              {Object.entries(PLAN_FEATURES.enterprise).map(([key, value]) => (
                <li key={key} className="text-slate-400 flex items-start gap-3">
                  <span className="text-teal-400 mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-sm text-slate-500">{value}</div>
                  </div>
                </li>
              ))}
            </ul>

            {currentPlan === 'enterprise' ? (
              <button disabled className="w-full py-2 px-4 bg-slate-700 text-slate-400 rounded-lg font-semibold cursor-not-allowed">
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => upgradeToProOrEnterprise('enterprise')}
                disabled={paymentLoading}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 disabled:opacity-50"
              >
                {paymentLoading ? 'Processing...' : 'Upgrade to Enterprise'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Payment History</h3>
          <p className="text-slate-400">Your payment history will appear here once you make a purchase.</p>
        </div>
      </div>
    </div>
  );
}
