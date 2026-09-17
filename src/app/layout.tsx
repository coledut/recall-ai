import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
