'use client';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';

import { useAppStore } from '../store/useAppStore';
import { CommandPalette } from './CommandPalette';
import type { BusinessDomain } from '../types';

const DOMAINS: BusinessDomain[] = ['Общий', 'Финансы', 'Маркетинг', 'Стратегия', 'Операции', 'Юридический', 'Управление', 'Производство', 'Оборудование'];

const PATH_TO_LABEL: Record<string, string> = {
  '/chat': 'Чат', '/analytics': 'Аналитика', '/reports': 'Отчеты',
  '/roadmap': 'Дорожная карта', '/okrs': 'OKRs', '/competitors': 'Конкуренты',
  '/processes': 'Процессы', '/resources': 'Ресурсы', '/logistics': 'Логистика',
  '/campaigns': 'Кампании', '/leads': 'Лиды', '/seo': 'SEO',
  '/messages': 'Сообщения', '/discussions': 'Обсуждения',
  '/team': 'Команда', '/team/profile': 'Профиль',
  '/documents': 'Документы', '/scenarios': 'Сценарии',
  '/board': 'Доска задач', '/tasks': 'Задачи',
  '/pages-list': 'Страницы', '/pages-tree': 'Дерево страниц',
  '/goals-tree': 'Дерево целей', '/stakeholders': 'Стейкхолдеры',
  '/pains': 'Список болей', '/hadi': 'HADI',
  '/gamification': 'Геймификация', '/regulations': 'Регламенты',
  '/tqm': 'TQM', '/tqm/improvement': 'Улучшение', '/tqm/audits': 'Аудиты',
  '/tqm/satisfaction': 'Удовлетворенность', '/tqm/dwm': 'DWM',
  '/agile': 'Agile', '/agile/sprint': 'Sprint Review',
  '/legal/dashboard': 'Юридический дашборд',
  '/management/journal': 'Журнал', '/management/report': 'Отчет',
  '/equipment/journal': 'Журнал', '/equipment/board': 'Доска',
  '/equipment/inspections': 'Проверки', '/equipment/schemes': 'Схемы',
  '/equipment/archive': 'Архив',
  '/projects': 'Проекты', '/projects/manage': 'Управление',
  '/projects/tasks': 'Задачи', '/domains': 'Домены',
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentDomain, setCurrentDomain,
    showDomainDropdown, setShowDomainDropdown,
    setShowDomainWelcome, isProcessing,
    setShowQuickAddModal,
  } = useAppStore();

  const isDomainPage = pathname === '/domains' || pathname.startsWith('/domains/');
  const rawSegment = pathname.split('/').filter(Boolean).pop() ?? '';
  const routeLabel = isDomainPage ? '' : (PATH_TO_LABEL[pathname] ?? (rawSegment ? decodeURIComponent(rawSegment) : ''));

  return (
    <header className="h-12 px-4 flex items-center gap-3 border-b border-slate-200 bg-white shrink-0 z-[50]">
      {/* Logo */}
      <button
        onClick={() => router.push('/domains')}
        className="font-black text-xl text-proji-primary hover:opacity-70 transition-opacity tracking-tight shrink-0"
      >
        proji
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs flex-1 min-w-0">
        <span className="text-slate-900/30 font-black text-sm select-none">/</span>

        {/* Domain */}
        <div
          className="relative"
          onMouseEnter={() => setShowDomainDropdown(true)}
          onMouseLeave={() => setShowDomainDropdown(false)}
        >
          <button className="text-slate-800 hover:text-black transition-colors font-semibold">
            {currentDomain}
          </button>

          <AnimatePresence>
            {showDomainDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-[110]"
              >
                {DOMAINS.map((domain) => (
                  <button
                    key={domain}
                    onClick={() => {
                      setCurrentDomain(domain);
                      setShowDomainDropdown(false);
                      setShowDomainWelcome({ domain, active: true });
                      router.push('/domains/' + encodeURIComponent(domain));
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                      currentDomain === domain
                        ? 'bg-slate-100 font-bold text-slate-800'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    {domain}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {routeLabel && (
          <>
            <span className="text-slate-900/30 font-black text-sm select-none">/</span>
            <span className="text-slate-700 font-semibold">{routeLabel}</span>
          </>
        )}

      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <CommandPalette />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQuickAddModal(true)}
          title="Создать запись"
          className="w-8 h-8 rounded-lg bg-proji-primary text-white flex items-center justify-center hover:bg-proji-primary/90 transition-colors shadow-sm"
        >
          <Plus size={15} />
        </motion.button>
      </div>
    </header>
  );
}
