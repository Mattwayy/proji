import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '../src/components/AppShell';

export const metadata: Metadata = {
  title: 'Proji — Business Execution Platform',
  description: 'AI-powered business management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
