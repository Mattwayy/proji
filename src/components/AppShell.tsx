'use client';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { AIBadge } from './AIBadge';
import { ContextSidebar } from './ContextSidebar';
import { QuickAddModal } from './QuickAddModal';

const AUTH_ROUTES = ['/login'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-proji-bg">
      <Topbar />
      <div className="flex flex-1 overflow-hidden pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-proji-bg">
          {children}
        </main>
      </div>
      <MobileNav />
      <AIBadge />
      <ContextSidebar />
      <QuickAddModal />
    </div>
  );
}
