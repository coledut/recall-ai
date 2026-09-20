'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Settings {
  email_daily_brief: boolean;
  daily_brief_time: string;
  daily_brief_frequency: string;
  timezone: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  notifications_enabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch('/api/user/settings', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('✅ Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Settings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-green-600 to-teal-600 text-white mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          <h1 className="text-lg sm:text-2xl font-bold truncate">Recall AI</h1>
          <div className="hidden sm:flex items-center gap-3 sm:gap-4">
            <a href="/app/today" className="text-sm hover:bg-white/20 px-3 py-2 rounded-lg transition-all">Today</a>
            <a href="/app/settings" className="text-sm hover:bg-white/20 px-3 py-2 rounded-lg transition-all font-bold">Settings</a>
            <button onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/'))} className="text-sm hover:bg-white/20 px-3 py-2 rounded-lg transition-all">Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Preferences</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-6 sm:mb-8">Customize how you receive your daily brief and notifications</p>

          {message && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg text-green-800">
              {message}
            </div>
          )}

          {settings && (
            <div className="space-y-8">
              {/* Daily Brief Section */}
              <div className="border-b pb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📧</span> Daily Brief Email
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_daily_brief}
                      onChange={(e) => handleChange('email_daily_brief', e.target.checked)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-gray-700 font-medium">Send daily brief email</span>
                  </label>

                  {settings.email_daily_brief && (
                    <>
                      <div className="ml-8 space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Send at (UTC)
                          </label>
                          <input
                            type="time"
                            value={settings.daily_brief_time}
                            onChange={(e) => handleChange('daily_brief_time', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Set your preferred time in UTC</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequency
                          </label>
                          <select
                            value={settings.daily_brief_frequency}
                            onChange={(e) => handleChange('daily_brief_frequency', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekdays">Weekdays only</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                          </label>
                          <input
                            type="text"
                            value={settings.timezone}
                            onChange={(e) => handleChange('timezone', e.target.value)}
                            placeholder="e.g., Asia/Kolkata"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">For reference only (time above is UTC)</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Quiet Hours Section */}
              <div className="border-b pb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🌙</span> Quiet Hours
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.quiet_hours_enabled}
                      onChange={(e) => handleChange('quiet_hours_enabled', e.target.checked)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-gray-700 font-medium">Don't send emails during quiet hours</span>
                  </label>

                  {settings.quiet_hours_enabled && (
                    <div className="ml-6 sm:ml-8 space-y-3 sm:space-y-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start time (UTC)
                          </label>
                          <input
                            type="time"
                            value={settings.quiet_hours_start}
                            onChange={(e) => handleChange('quiet_hours_start', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End time (UTC)
                          </label>
                          <input
                            type="time"
                            value={settings.quiet_hours_end}
                            onChange={(e) => handleChange('quiet_hours_end', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications Section */}
              <div className="pb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🔔</span> Notifications
                </h3>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications_enabled}
                    onChange={(e) => handleChange('notifications_enabled', e.target.checked)}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-gray-700 font-medium">Enable in-app notifications</span>
                </label>
              </div>

              {/* Save Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">
                  {saving ? '💾 Saving...' : '💾 Save Settings'}
                </button>
                <button onClick={() => loadSettings()} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm sm:text-base">
                  ↺ Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cron Setup Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">⚙️ Setup Automated Email Scheduling</h3>
          <p className="text-blue-800 mb-4">
            To enable automatic daily brief emails, set up a cron job to call this endpoint once per hour:
          </p>
          <code className="block bg-blue-100 p-3 rounded text-sm text-blue-900 mb-4 overflow-x-auto">
            {process.env.NEXT_PUBLIC_VERCEL_URL
              ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/cron/daily-brief?secret=[CRON_SECRET]`
              : 'https://your-app.vercel.app/api/cron/daily-brief?secret=[CRON_SECRET]'
            }
          </code>
          <p className="text-sm text-blue-700">
            Use a free service like <strong>EasyCron.com</strong> or <strong>cron-job.org</strong> to schedule this call.
            Remember to set the <code>CRON_SECRET</code> environment variable.
          </p>
        </div>
      </div>
    </div>
  );
}
