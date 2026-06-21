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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1000] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-proji-primary focus:text-white focus:text-sm focus:font-bold"
        >
          Перейти к содержимому
        </a>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
