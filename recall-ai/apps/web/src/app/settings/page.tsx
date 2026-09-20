'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface NotificationPreferences {
  emailDigestFrequency: 'daily' | 'weekly' | 'off';
  pushNotificationsEnabled: boolean;
  quietHourStart: string | null;
  quietHourEnd: string | null;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      fetchPreferences();
    }
  }, [user, loading]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/notifications/preferences');
      if (res.ok) {
        setPrefs(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  const savePreferences = async () => {
    if (!prefs) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      if (!res.ok) {
        throw new Error('Failed to save preferences');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError('Push notifications not supported in this browser');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to subscribe to push notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
    }
  };

  if (loading || !prefs) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            ✓ Settings saved
          </div>
        )}

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>

          {/* Email Digest Frequency */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Email Digest
            </label>
            <div className="space-y-2">
              {(['daily', 'weekly', 'off'] as const).map((freq) => (
                <label key={freq} className="flex items-center">
                  <input
                    type="radio"
                    name="emailDigest"
                    value={freq}
                    checked={prefs.emailDigestFrequency === freq}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        emailDigestFrequency: e.target.value as any,
                      })
                    }
                    className="rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {freq === 'daily' && 'Daily'}
                    {freq === 'weekly' && 'Weekly'}
                    {freq === 'off' && 'Off'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="mb-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={prefs.pushNotificationsEnabled}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    pushNotificationsEnabled: e.target.checked,
                  })
                }
                className="rounded"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                Enable push notifications
              </span>
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Get notified when commitments are due or overdue
            </p>
          </div>

          {/* Quiet Hours */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quiet Hours
            </label>
            <p className="text-xs text-gray-500 mb-3">
              No notifications during these hours (your timezone)
            </p>
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start</label>
                <input
                  type="time"
                  value={prefs.quietHourStart || ''}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      quietHourStart: e.target.value || null,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End</label>
                <input
                  type="time"
                  value={prefs.quietHourEnd || ''}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      quietHourEnd: e.target.value || null,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={savePreferences}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>

            {prefs.pushNotificationsEnabled && (
              <button
                onClick={subscribeToPush}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
              >
                Enable Push
              </button>
            )}
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
          <p className="text-sm text-gray-600 mb-4">Email: {user?.email}</p>
          <button
            onClick={async () => {
              const res = await fetch('/api/auth/signout', { method: 'POST' });
              if (res.ok) router.push('/auth');
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
