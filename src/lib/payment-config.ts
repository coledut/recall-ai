// Payment configuration based on user location

export type Currency = 'usd' | 'inr' | 'gbp' | 'eur';
export type PaymentProvider = 'stripe' | 'razorpay';

export interface PricingConfig {
  currency: Currency;
  provider: PaymentProvider;
  plans: {
    free: { price: number; name: string };
    pro: { price: number; name: string };
    enterprise: { price: number; name: string };
  };
}

export const PRICING_BY_REGION: Record<string, PricingConfig> = {
  IN: {
    currency: 'inr',
    provider: 'razorpay',
    plans: {
      free: { price: 0, name: 'Free' },
      pro: { price: 299, name: '₹299/month' },
      enterprise: { price: 4999, name: '₹4,999/month' },
    },
  },
  US: {
    currency: 'usd',
    provider: 'stripe',
    plans: {
      free: { price: 0, name: 'Free' },
      pro: { price: 9, name: '$9/month' },
      enterprise: { price: 299, name: '$299/month' },
    },
  },
  GB: {
    currency: 'gbp',
    provider: 'stripe',
    plans: {
      free: { price: 0, name: 'Free' },
      pro: { price: 7, name: '£7/month' },
      enterprise: { price: 250, name: '£250/month' },
    },
  },
  EU: {
    currency: 'eur',
    provider: 'stripe',
    plans: {
      free: { price: 0, name: 'Free' },
      pro: { price: 8, name: '€8/month' },
      enterprise: { price: 280, name: '€280/month' },
    },
  },
  DEFAULT: {
    currency: 'usd',
    provider: 'stripe',
    plans: {
      free: { price: 0, name: 'Free' },
      pro: { price: 9, name: '$9/month' },
      enterprise: { price: 299, name: '$299/month' },
    },
  },
};

export function getPricingConfig(countryCode?: string): PricingConfig {
  if (!countryCode) return PRICING_BY_REGION.DEFAULT;

  const upperCode = countryCode.toUpperCase();

  // Europe uses EUR
  const euCountries = ['AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'SE'];
  if (euCountries.includes(upperCode)) return PRICING_BY_REGION.EU;

  return PRICING_BY_REGION[upperCode] || PRICING_BY_REGION.DEFAULT;
}

export function detectCountryFromHeader(headers: Headers): string | null {
  // Try Cloudflare header first (Vercel provides this)
  const cfCountry = headers.get('cf-ipl-country-code');
  if (cfCountry) return cfCountry;

  // Fallback to x-vercel-ip-country
  const vercelCountry = headers.get('x-vercel-ip-country');
  if (vercelCountry) return vercelCountry;

  return null;
}

export const PLAN_FEATURES = {
  free: {
    name: 'Free',
    memories: 'Unlimited',
    apiCalls: '100/month',
    teamMembers: '1',
    fileUpload: '10MB',
    ocr: '✅',
    emailSchedule: '❌',
    integrations: '❌',
    support: 'Community',
  },
  pro: {
    name: 'Pro',
    memories: 'Unlimited',
    apiCalls: '10,000/month',
    teamMembers: '10',
    fileUpload: '100MB',
    ocr: '✅',
    emailSchedule: '✅ Daily',
    integrations: '✅ Webhooks + Zapier',
    support: 'Email Support',
  },
  enterprise: {
    name: 'Enterprise',
    memories: 'Unlimited',
    apiCalls: 'Unlimited',
    teamMembers: 'Unlimited',
    fileUpload: 'Unlimited',
    ocr: '✅',
    emailSchedule: '✅ Custom',
    integrations: '✅ All + White-label',
    support: '24/7 Dedicated',
  },
};
