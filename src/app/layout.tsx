import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recall AI - Memory Assistant',
  description: 'Capture, organize, and recall everything that matters.',
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
