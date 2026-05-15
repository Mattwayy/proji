'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, FileText, BookOpen, StickyNote } from 'lucide-react';

import { useAppStore } from '../store/useAppStore';
import { CommandPalette } from './CommandPalette';
import { Tooltip } from './Tooltip';
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
  '/notes': 'Заметки',
  '/agents': 'Агенты',
  '/tariffs': 'Тарифы',
  '/payment': 'Оплата',
  '/scenarios': 'Prompts Library',
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const {
    currentDomain, setCurrentDomain,
    showDomainDropdown, setShowDomainDropdown,
    setShowDomainWelcome, isProcessing,
    setShowQuickAddModal, setQuickAddType,
    setShowTaskCreateModal, projects,
  } = useAppStore();

  useEffect(() => {
    if (!showAddMenu) return;
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setShowAddMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAddMenu]);

  const isDomainPage = pathname === '/domains' || pathname.startsWith('/domains/');

  // Resolve label for project sub-routes: /projects/[id], /projects/[id]/tasks, etc.
  const PROJECT_SUB: Record<string, string> = { tasks: 'Задачи', reports: 'Отчеты', docs: 'Документы' };
  const projectRouteLabel = (() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] !== 'projects' || segments.length < 2) return null;
    const projectId = segments[1];
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;
    const sub = segments[2] ? PROJECT_SUB[segments[2]] : null;
    return sub ? `${project.name} / ${sub}` : project.name;
  })();

  const rawSegment = pathname.split('/').filter(Boolean).pop() ?? '';
  const routeLabel = isDomainPage ? '' : (projectRouteLabel ?? PATH_TO_LABEL[pathname] ?? (rawSegment ? decodeURIComponent(rawSegment) : ''));

  return (
    <header className="h-12 px-4 flex items-center gap-3 border-b border-slate-200 bg-white shrink-0 z-[50]">
      {/* Logo */}
      <Tooltip text="Выбор рабочего домена" side="bottom">
      <button
        onClick={() => router.push('/domains')}
        className="font-black text-xl text-proji-primary hover:opacity-70 transition-opacity tracking-tight shrink-0"
      >
        proji
      </button>
      </Tooltip>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs flex-1 min-w-0">
        <span className="text-slate-900/30 font-black text-sm select-none">/</span>

        {/* Domain */}
        <div
          className="relative"
          onMouseEnter={() => setShowDomainDropdown(true)}
          onMouseLeave={() => setShowDomainDropdown(false)}
        >
          <Tooltip text="Сменить активный домен" side="bottom">
          <button className="text-slate-800 hover:text-black transition-colors font-semibold">
            {currentDomain}
          </button>
          </Tooltip>

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
        <div ref={addMenuRef} className="relative">
          <Tooltip text="Создать задачу, заметку или документ" side="bottom">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddMenu((v) => !v)}
              className="w-8 h-8 rounded-lg bg-proji-primary text-white flex items-center justify-center hover:bg-proji-primary/90 transition-colors shadow-sm"
            >
              <Plus size={15} />
            </motion.button>
          </Tooltip>

          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-[200]"
              >
                {[
                  { label: 'Задача', icon: CheckCircle2, action: () => { setShowTaskCreateModal(true); setShowAddMenu(false); } },
                  { label: 'Заметка', icon: StickyNote, action: () => { setQuickAddType('заметка'); setShowQuickAddModal(true); setShowAddMenu(false); } },
                  { label: 'Документ', icon: FileText, action: () => { setQuickAddType('документ'); setShowQuickAddModal(true); setShowAddMenu(false); } },
                  { label: 'Библиотека промтов', icon: BookOpen, action: () => { router.push('/scenarios'); setShowAddMenu(false); } },
                ].map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                  >
                    <Icon size={15} className="text-proji-primary shrink-0" />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
