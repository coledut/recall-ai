import { useEffect, useState } from 'react';

export const useServiceWorker = () => {
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('serviceWorker' in navigator)) {
      setError('Service Workers not supported');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        setRegistered(true);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
        setError(err.message);
      });
  }, []);

  return { registered, error };
};

export const getVapidPublicKey = async (): Promise<string> => {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
};
