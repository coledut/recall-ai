import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import { MainNav } from '@/components/main-nav';
import { ServiceWorkerInit } from '@/components/service-worker-init';
import { PostHogProvider } from '@/lib/posthog-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recall AI',
  description: 'Never forget what matters',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <AuthProvider>
            <ServiceWorkerInit />
            <MainNav />
            {children}
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
