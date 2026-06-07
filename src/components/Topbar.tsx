'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, KeyRound, CreditCard, Wallet, LogOut, Sun, Moon, Monitor,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

import { useAppStore } from '../store/useAppStore';
import { CommandPalette } from './CommandPalette';
import { Tooltip } from './Tooltip';
import type { BusinessDomain, Theme } from '../types';

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
  '/manager': 'Менеджер команды',
  '/agents': 'Агенты',
  '/tariffs': 'Тарифы',
  '/payment': 'Оплата',
  '/cabinet': 'Кабинет',
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileAccount, setShowMobileAccount] = useState(false);

  const {
    currentDomain, setCurrentDomain,
    showDomainDropdown, setShowDomainDropdown,
    setShowDomainWelcome, isProcessing,
    projects,
    theme, setTheme,
    setShowEntityFactory,
  } = useAppStore();

  const isDomainPage = pathname === '/domains' || pathname.startsWith('/domains/');

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
    <>
      <header className="h-12 px-3 md:px-4 flex items-center gap-2 md:gap-3 border-b border-slate-200 bg-white shrink-0 z-[50]">
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
        <div className="flex items-center gap-1.5 text-xs flex-1 min-w-0 overflow-hidden">
          <span className="text-slate-900/30 font-black text-sm select-none shrink-0">/</span>

          {/* Domain */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setShowDomainDropdown(true)}
            onMouseLeave={() => setShowDomainDropdown(false)}
          >
            <Tooltip text="Сменить активный домен" side="bottom">
              <button className="text-slate-800 hover:text-black transition-colors font-semibold max-w-[80px] md:max-w-none truncate">
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
              <span className="text-slate-900/30 font-black text-sm select-none shrink-0">/</span>
              <span className="text-slate-700 font-semibold truncate">{routeLabel}</span>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Search - hidden on mobile to save space */}
          <div className="hidden md:block">
            <CommandPalette />
          </div>

          {/* Mobile profile avatar */}
          <button
            className="md:hidden w-8 h-8 rounded-full bg-proji-primary/10 text-proji-primary flex items-center justify-center text-[10px] font-black hover:bg-proji-primary/20 transition-colors"
            onClick={() => setShowMobileAccount(true)}
            aria-label="Профиль"
          >
            SS
          </button>

          {/* Entity Factory — главная кнопка создания */}
          <Tooltip text="Заметки" side="bottom">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEntityFactory(true)}
              className="w-8 h-8 rounded-lg bg-proji-primary text-white flex items-center justify-center hover:bg-proji-primary/90 transition-colors shadow-sm"
            >
              <Plus size={15} />
            </motion.button>
          </Tooltip>
        </div>
      </header>

      {/* Mobile account bottom sheet */}
      <AnimatePresence>
        {showMobileAccount && (
          <motion.div className="md:hidden fixed inset-0 z-[500]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileAccount(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              <div className="px-5 pb-8 space-y-4">
                {/* User info */}
                <div className="flex items-center gap-4 py-2 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 rounded-full bg-proji-primary/10 flex items-center justify-center text-sm font-black text-proji-primary">
                    SS
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Sund Serik</p>
                    <p className="text-xs text-slate-500">sund.serik@gmail.com</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-1">
                  {[
                    { icon: KeyRound, label: 'Личный кабинет', action: () => { router.push('/cabinet'); setShowMobileAccount(false); } },
                    { icon: CreditCard, label: 'Тарифы', action: () => { router.push('/tariffs'); setShowMobileAccount(false); } },
                    { icon: Wallet, label: 'Оплата', action: () => { router.push('/payment'); setShowMobileAccount(false); } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Icon size={16} className="text-proji-primary shrink-0" />
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} className="shrink-0" />
                    Выйти
                  </button>
                </div>

                {/* Theme picker */}
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 px-1 mb-2">Тема оформления</p>
                  <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          theme === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {t === 'light' ? <Sun size={13} /> : t === 'dark' ? <Moon size={13} /> : <Monitor size={13} />}
                        {t === 'light' ? 'Светлый' : t === 'dark' ? 'Тёмный' : 'Авто'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
