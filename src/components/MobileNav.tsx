'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Folder, CheckCircle2, Grid3x3, X } from 'lucide-react';
import { BASE_ITEMS, DOMAIN_SPECIFIC, ROUTE_MAP, ITEM_TIPS, type NavItem } from './Sidebar';
import { useAppStore } from '../store/useAppStore';

// Pinned quick-access items — the rest of the nav lives behind "Ещё"
const PRIMARY_ITEMS = [
  { icon: MessageSquare, label: 'Чат', href: '/chat' },
  { icon: Folder, label: 'Проекты', href: '/projects' },
  { icon: CheckCircle2, label: 'Задачи', href: '/tasks' },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentDomain } = useAppStore();
  const [showMore, setShowMore] = useState(false);

  const domainExtras = DOMAIN_SPECIFIC[currentDomain as keyof typeof DOMAIN_SPECIFIC] ?? [];
  const allItems: NavItem[] = [...BASE_ITEMS, ...domainExtras];

  const go = (href: string) => {
    router.push(href);
    setShowMore(false);
  };

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-proji-border flex items-center justify-around px-2 pt-2"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
      >
        {PRIMARY_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <button
              key={item.href}
              onClick={() => go(item.href)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${active ? 'text-proji-primary' : 'text-slate-400'}`}
            >
              <item.icon size={20} />
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setShowMore(true)}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${showMore ? 'text-proji-primary' : 'text-slate-400'}`}
        >
          <Grid3x3 size={20} />
          <span className="text-[9px] font-bold">Ещё</span>
        </button>
      </nav>

      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="md:hidden fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="md:hidden fixed left-0 right-0 bottom-0 z-[120] bg-white rounded-t-[28px] shadow-2xl max-h-[75vh] overflow-y-auto"
              style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}
            >
              <div className="sticky top-0 bg-white flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
                <p className="text-sm font-black text-slate-900">Все разделы</p>
                <button onClick={() => setShowMore(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>
              <div className="px-3 py-3 flex flex-col gap-4">
                {allItems.map((item) => (
                  <div key={item.label}>
                    <p className="px-2 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {item.label}{ITEM_TIPS[item.label] ? ` · ${ITEM_TIPS[item.label]}` : ''}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {item.details.filter((d) => !d.isAction).map((d) => {
                        const href = ROUTE_MAP[d.label];
                        const active = href === pathname;
                        return (
                          <button
                            key={d.label}
                            onClick={() => href && go(href)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                              active ? 'bg-proji-primary/10 text-proji-primary' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <d.icon size={15} className="shrink-0" />
                            <span className="text-xs font-bold truncate">{d.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
