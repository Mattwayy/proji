'use client';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useAppStore } from '../src/store/useAppStore';

function ThemeApplier({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeApplier>{children}</ThemeApplier>
    </SessionProvider>
  );
}
