import type { Metadata } from 'next';
import './globals.css';
import './premium-styles.css';

export const metadata: Metadata = {
  title: 'iRecall.ai - Intelligent Memory Assistant',
  description: 'Capture, extract, and intelligently recall everything that matters with AI-powered relationship intelligence.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover',
  themeColor: '#9333ea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
