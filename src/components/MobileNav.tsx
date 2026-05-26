'use client';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, Folder, CheckCircle2, Users, User } from 'lucide-react';

const MOBILE_ITEMS = [
  { icon: MessageSquare, label: 'Чат', href: '/chat' },
  { icon: Folder, label: 'Проекты', href: '/projects' },
  { icon: CheckCircle2, label: 'Задачи', href: '/tasks' },
  { icon: Users, label: 'Команда', href: '/team' },
  { icon: User, label: 'Профиль', href: '/cabinet' },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-proji-border flex items-center justify-around px-2 pt-2"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
    >
      {MOBILE_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${active ? 'text-proji-primary' : 'text-slate-400'}`}
          >
            <item.icon size={20} />
            <span className="text-[9px] font-bold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
