'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid, Mail, HardDrive, FileText, Calendar, Users2,
  BarChart3, Share2, Database, Settings,
} from 'lucide-react';
import { useModalClose } from '../hooks/useModalClose';
import { Tooltip } from './Tooltip';

interface LauncherItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string | null;
  bg: string;
  color: string;
}

const ITEMS: LauncherItem[] = [
  { label: 'Сообщения',   icon: Mail,       href: '/messages',  bg: 'bg-blue-50',   color: 'text-blue-500' },
  { label: 'Облако',      icon: HardDrive,  href: null,         bg: 'bg-emerald-50', color: 'text-emerald-500' },
  { label: 'Документы',   icon: FileText,   href: '/documents', bg: 'bg-indigo-50',  color: 'text-indigo-500' },
  { label: 'Календарь',   icon: Calendar,   href: null,         bg: 'bg-amber-50',   color: 'text-amber-500' },
  { label: 'Команда',     icon: Users2,     href: '/team',      bg: 'bg-violet-50',  color: 'text-violet-500' },
  { label: 'Аналитика',   icon: BarChart3,  href: '/analytics', bg: 'bg-rose-50',    color: 'text-rose-500' },
  { label: 'Процессы',    icon: Share2,     href: '/processes', bg: 'bg-sky-50',     color: 'text-sky-500' },
  { label: 'База данных', icon: Database,   href: null,         bg: 'bg-orange-50',  color: 'text-orange-500' },
  { label: 'Настройки',   icon: Settings,   href: '/cabinet',   bg: 'bg-slate-100',  color: 'text-slate-500' },
];

export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useModalClose(() => setOpen(false), open);

  const go = (item: LauncherItem) => {
    if (!item.href) return;
    router.push(item.href);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Tooltip text="Глобальное меню" side="bottom">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Глобальное меню"
          aria-haspopup="true"
          aria-expanded={open}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
            open ? 'bg-slate-100 border-slate-300 text-slate-700' : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <LayoutGrid size={15} aria-hidden="true" />
        </button>
      </Tooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Глобальное меню"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="absolute top-full right-0 mt-2 w-[300px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-[110]"
          >
            <div className="grid grid-cols-3 gap-2">
              {ITEMS.map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={() => go(item)}
                  disabled={!item.href}
                  aria-label={item.href ? item.label : `${item.label} — скоро будет доступно`}
                  className={`flex flex-col items-center gap-2.5 px-2 py-4 rounded-2xl text-center transition-colors ${
                    item.href ? 'hover:bg-slate-50' : 'opacity-40 cursor-not-allowed'
                  }`}
                  title={item.href ? undefined : 'Скоро будет доступно'}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${item.bg}`}>
                    <item.icon size={18} aria-hidden="true" className={item.color} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
