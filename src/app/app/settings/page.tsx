'use client';

import { useState, useEffect } from 'react';
import { Mail, Moon, Bell, Save, RotateCcw, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PremiumNav from '@/app/components/PremiumNav';

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
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <PremiumNav currentPage="settings" />
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <PremiumNav currentPage="settings" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 reveal-up">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Preferences</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Customize how you receive updates and notifications</p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-3 sm:p-4 bg-green-100 border-2 border-green-400 rounded-lg text-green-800 flex items-center gap-2 text-xs sm:text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            {message}
          </div>
        )}

        {settings && (
          <div className="card-premium bg-white rounded-lg sm:rounded-xl border-2 border-purple-200 p-4 sm:p-6 space-y-6 sm:space-y-8 reveal-up">
            {/* Daily Brief */}
            <div className="border-b border-purple-200 pb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                Daily Brief Email
              </h3>

              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings.email_daily_brief}
                  onChange={(e) => handleChange('email_daily_brief', e.target.checked)}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 font-medium">Send daily brief email</span>
              </label>

              {settings.email_daily_brief && (
                <div className="ml-8 space-y-4 bg-purple-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Send at (UTC)</label>
                    <input
                      type="time"
                      value={settings.daily_brief_time}
                      onChange={(e) => handleChange('daily_brief_time', e.target.value)}
                      className="input-premium w-full text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      value={settings.daily_brief_frequency}
                      onChange={(e) => handleChange('daily_brief_frequency', e.target.value)}
                      className="input-premium w-full text-xs sm:text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays only</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Quiet Hours */}
            <div className="border-b border-purple-200 pb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-600" />
                Quiet Hours
              </h3>

              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings.quiet_hours_enabled}
                  onChange={(e) => handleChange('quiet_hours_enabled', e.target.checked)}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 font-medium">Don't send emails during quiet hours</span>
              </label>

              {settings.quiet_hours_enabled && (
                <div className="ml-8 space-y-3 bg-purple-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Start time (UTC)</label>
                      <input
                        type="time"
                        value={settings.quiet_hours_start}
                        onChange={(e) => handleChange('quiet_hours_start', e.target.value)}
                        className="input-premium w-full text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">End time (UTC)</label>
                      <input
                        type="time"
                        value={settings.quiet_hours_end}
                        onChange={(e) => handleChange('quiet_hours_end', e.target.value)}
                        className="input-premium w-full text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="pb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notifications
              </h3>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => handleChange('notifications_enabled', e.target.checked)}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 font-medium">Enable in-app notifications</span>
              </label>
            </div>

            {/* Save Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-purple-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-premium px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover-lift disabled:opacity-50 flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={() => loadSettings()}
                className="btn-premium px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-smooth flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
