export interface Plan {
  name: string;
  id: 'free' | 'pro' | 'enterprise';
  price: number;
  billing: 'monthly' | 'yearly' | 'custom';
  description: string;
  features: string[];
  limits: {
    memories: number;
    people: number;
    apiCalls: number;
    teamMembers: number;
    storage: number; // GB
  };
  highlighted: boolean;
}

export const PLANS: Plan[] = [
  {
    name: 'Free',
    id: 'free',
    price: 0,
    billing: 'monthly',
    description: 'Perfect for personal use',
    features: [
      'Unlimited memories',
      'AI extraction',
      'Smart categorization',
      'Daily emails',
      'People tracking',
      'Analytics',
      'Voice capture',
      'File upload (OCR)',
    ],
    limits: {
      memories: Infinity,
      people: Infinity,
      apiCalls: 100,
      teamMembers: 1,
      storage: 1,
    },
    highlighted: false,
  },
  {
    name: 'Pro',
    id: 'pro',
    price: 9,
    billing: 'monthly',
    description: 'For power users & small teams',
    features: [
      'Everything in Free',
      'Team collaboration',
      'Shared memories',
      'Comments & discussions',
      'Custom integrations',
      'Priority support',
      'Advanced analytics',
      'Recurring tasks',
      'Batch operations',
      'Data export',
      'API access',
      'Webhook support',
    ],
    limits: {
      memories: Infinity,
      people: Infinity,
      apiCalls: 10000,
      teamMembers: 10,
      storage: 100,
    },
    highlighted: true,
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    price: 0, // Custom pricing
    billing: 'custom',
    description: 'For organizations & teams',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Single sign-on (SSO)',
      'Custom branding',
      'White-label options',
      'Role-based access control',
      'Audit logging',
      'SLA support',
      'Dedicated account manager',
      'Custom integrations',
      'On-premise deployment',
    ],
    limits: {
      memories: Infinity,
      people: Infinity,
      apiCalls: Infinity,
      teamMembers: Infinity,
      storage: Infinity,
    },
    highlighted: false,
  },
];

export function getPlan(planId: string): Plan | null {
  return PLANS.find(p => p.id === planId) || null;
}

export function checkFeatureAccess(plan: Plan, feature: string): boolean {
  return plan.features.includes(feature);
}

export function checkLimitAccess(plan: Plan, limitType: keyof Plan['limits'], current: number): boolean {
  const limit = plan.limits[limitType];
  return current < limit;
}
