'use client';
import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { AIBadge } from './AIBadge';
import { ContextSidebar } from './ContextSidebar';
import { QuickAddModal } from './QuickAddModal';
import { TaskCreateModal } from './TaskCreateModal';
import { useAppStore } from '../store/useAppStore';

const AUTH_ROUTES = ['/login'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const initProjects = useAppStore((s) => s.initProjects);

  useEffect(() => { initProjects(); }, [initProjects]);

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-proji-bg">
      <Topbar />
      <div className="flex flex-1 overflow-hidden md:pb-0" style={{ paddingBottom: 'max(64px, calc(52px + env(safe-area-inset-bottom, 12px)))' } as CSSProperties}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-proji-bg">
          {children}
        </main>
      </div>
      <MobileNav />
      <AIBadge />
      <ContextSidebar />
      <QuickAddModal />
      <TaskCreateModal />
    </div>
  );
}
