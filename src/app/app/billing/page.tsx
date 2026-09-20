import { Suspense } from 'react';
import BillingContent from './billing-content';

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading billing...</div>}>
      <BillingContent />
    </Suspense>
  );
}
