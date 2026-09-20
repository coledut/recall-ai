// Analytics tracking for marketing & product insights

export interface Event {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

class Analytics {
  private events: Event[] = [];

  track(event: Event) {
    event.timestamp = event.timestamp || new Date();
    this.events.push(event);
    this.send(event);
  }

  private send(event: Event) {
    if (typeof window === 'undefined') return;

    // Send to analytics service (Mixpanel, Segment, etc)
    if (window.gtag) {
      window.gtag('event', event.name, event.properties);
    }

    // Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event.name, event.properties);
    }
  }

  // User events
  signupStarted() {
    this.track({ name: 'signup_started' });
  }

  signupCompleted(plan: string) {
    this.track({ name: 'signup_completed', properties: { plan } });
  }

  loginCompleted() {
    this.track({ name: 'login_completed' });
  }

  // Feature events
  captureCreated(source: string) {
    this.track({ name: 'capture_created', properties: { source } });
  }

  memoryExtracted(type: string) {
    this.track({ name: 'memory_extracted', properties: { type } });
  }

  emailSent() {
    this.track({ name: 'email_sent' });
  }

  // Engagement events
  pageViewed(page: string) {
    this.track({ name: 'page_viewed', properties: { page } });
  }

  buttonClicked(button: string, location: string) {
    this.track({ name: 'button_clicked', properties: { button, location } });
  }

  featureUsed(feature: string) {
    this.track({ name: 'feature_used', properties: { feature } });
  }

  // Conversion events
  upgradeToPro() {
    this.track({ name: 'upgrade_to_pro' });
  }

  enterprireInquiry() {
    this.track({ name: 'enterprise_inquiry' });
  }

  newsletterSubscribed() {
    this.track({ name: 'newsletter_subscribed' });
  }
}

export const analytics = new Analytics();

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
