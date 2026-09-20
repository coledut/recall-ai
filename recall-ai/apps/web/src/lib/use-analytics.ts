import { useEffect } from 'react';
import posthog from 'posthog-js';

export const useAnalytics = () => {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture(eventName, properties);
    }
  };

  const identifyUser = (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.identify(userId, properties);
    }
  };

  const reset = () => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.reset();
    }
  };

  return { trackEvent, identifyUser, reset };
};

// Predefined events for consistency
export const analyticsEvents = {
  // Auth
  signUpStarted: 'Sign Up Started',
  signUpCompleted: 'Sign Up Completed',
  signInCompleted: 'Sign In Completed',
  signOutCompleted: 'Sign Out Completed',

  // Capture
  captureQuickText: 'Capture Quick Text',
  captureVoice: 'Capture Voice',
  captureFile: 'Capture File',
  captureEmail: 'Capture Email',
  captureCalendar: 'Capture Calendar',

  // Memory Actions
  memoryCompleted: 'Memory Completed',
  memorySnoozed: 'Memory Snoozed',
  memoryDismissed: 'Memory Dismissed',

  // Queries
  askRecallQuery: 'Ask Recall Query',

  // Settings
  notificationPreferenceUpdated: 'Notification Preference Updated',
  pushSubscribed: 'Push Notifications Subscribed',

  // Integration
  gmailConnected: 'Gmail Connected',
  gmailDisconnected: 'Gmail Disconnected',
  calendarConnected: 'Calendar Connected',
  calendarDisconnected: 'Calendar Disconnected',

  // Navigation
  pageViewed: 'Page Viewed',
  featureViewed: 'Feature Viewed',
};
