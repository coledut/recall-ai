'use client';

import { useServiceWorker } from '@/lib/use-service-worker';

export const ServiceWorkerInit = () => {
  const { registered, error } = useServiceWorker();

  if (error) {
    console.warn('Service Worker error:', error);
  }

  return null;
};
