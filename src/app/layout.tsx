import type { Metadata } from 'next';

import { AppProviders } from '@/providers/app-providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Messaging SaaS',
  description: 'Shared inbox for customer messaging channels.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
