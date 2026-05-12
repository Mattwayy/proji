'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Mail, Folder, Target, Users, FileText, Layout,
  Settings2, Factory, Shield, Briefcase, History, BarChart3,
  RefreshCw, ClipboardCheck, Smile, Workflow, Search, MessageSquare,
  CheckCircle2, Archive, BookOpen, User, RotateCcw, Activity,
  Scale, Sparkles, ChevronDown, ChevronRight, ChevronLeft,
  Settings, Moon, Sun, Monitor, KeyRound, LogOut,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useAppStore } from '../store/useAppStore';
import type { BusinessDomain, Theme } from '../types';

const ROUTE_MAP: Record<string, string> = {
  'Чат': '/chat',
  'Все сценарии': '/scenarios',
  'Agile': '/agile',
  'Sprint Review': '/agile/sprint',
  'Сообщения': '/messages',
  'Обсуждения': '/discussions',
  'Проекты': '/projects',
  'Дерево целей': '/goals-tree',
  'Управление проектом': '/projects/manage',
  'Задачи проекта': '/projects/tasks',
  'Доска задач': '/board',
  'Задачи': '/tasks',
  'Команда': '/team',
  'Карта стейкхолдеров': '/stakeholders',
  'Профиль сотрудника': '/team/profile',
  'Документы': '/documents',
  'Регламенты': '/regulations',
  'Страницы': '/pages-list',
  'Дерево страниц': '/pages-tree',
  'Журнал оборудования': '/equipment/journal',
  'Доска оборудования': '/equipment/board',
  'Архив ремонтов': '/equipment/archive',
  'Журнал проверок': '/equipment/inspections',
  'Схемы ТП': '/equipment/schemes',
  'TQM Dashboard': '/tqm',
  'TQM DWM Chart': '/tqm/dwm',
  'Непрерывное улучшение': '/tqm/improvement',
  'Аудиты качества': '/tqm/audits',
  'Удовлетворенность клиентов': '/tqm/satisfaction',
  'Список болей': '/pains',
  'HADI Циклы': '/hadi',
  'Юридический Дашборд': '/legal/dashboard',
  'Управленческий Журнал': '/management/journal',
  'Управленческий Отчет': '/management/report',
};

type NavDetail = { label: string; icon: React.ComponentType<any> };
type NavItem = { icon: React.ComponentType<any>; label: string; href: string; details: NavDetail[] };

const BASE_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Чат', href: '/chat', details: [
    { label: 'Чат', icon: Sparkles },
    { label: 'Все сценарии', icon: CheckCircle2 },
    { label: 'Agile', icon: Workflow },
    { label: 'Sprint Review', icon: Search },
  ]},
  { icon: Mail, label: 'Сообщения', href: '/messages', details: [
    { label: 'Сообщения', icon: Mail },
    { label: 'Обсуждения', icon: MessageSquare },
  ]},
  { icon: Folder, label: 'Проекты', href: '/projects', details: [
    { label: 'Проекты', icon: Folder },
    { label: 'Дерево целей', icon: Target },
  ]},
  { icon: Target, label: 'Задачи', href: '/tasks', details: [
    { label: 'Доска задач', icon: LayoutDashboard },
    { label: 'Задачи', icon: CheckCircle2 },
  ]},
  { icon: Users, label: 'Команда', href: '/team', details: [
    { label: 'Команда', icon: Users },
    { label: 'Карта стейкхолдеров', icon: Users },
  ]},
  { icon: FileText, label: 'Документы', href: '/documents', details: [
    { label: 'Документы', icon: Archive },
    { label: 'Регламенты', icon: BookOpen },
  ]},
  { icon: Layout, label: 'Страницы', href: '/pages-list', details: [
    { label: 'Страницы', icon: Layout },
    { label: 'Дерево страниц', icon: LayoutDashboard },
  ]},
];

const DOMAIN_EXTRAS: Record<string, NavItem> = {
  'Оборудование': { icon: Settings2, label: 'Оборудование', href: '/equipment/journal', details: [
    { label: 'Журнал оборудования', icon: Settings2 },
    { label: 'Доска оборудования', icon: LayoutDashboard },
    { label: 'Архив ремонтов', icon: Archive },
  ]},
  'Производство': { icon: Factory, label: 'Завод', href: '/equipment/inspections', details: [
    { label: 'Журнал проверок', icon: ClipboardCheck },
    { label: 'Схемы ТП', icon: Workflow },
    { label: 'Регламенты', icon: BookOpen },
  ]},
};

const DEFAULT_EXTRA: NavItem[] = [
  { icon: Shield, label: 'TQM', href: '/tqm', details: [
    { label: 'TQM Dashboard', icon: Shield },
    { label: 'TQM DWM Chart', icon: BarChart3 },
    { label: 'Непрерывное улучшение', icon: RefreshCw },
    { label: 'Аудиты качества', icon: ClipboardCheck },
    { label: 'Удовлетворенность клиентов', icon: Smile },
  ]},
  { icon: Target, label: 'Стратегия', href: '/pains', details: [
    { label: 'Список болей', icon: Activity },
    { label: 'Карта стейкхолдеров', icon: Users },
    { label: 'HADI Циклы', icon: RotateCcw },
  ]},
  { icon: Briefcase, label: 'Юридический', href: '/legal/dashboard', details: [
    { label: 'Юридический Дашборд', icon: Scale },
  ]},
  { icon: History, label: 'Дневник', href: '/management/journal', details: [
    { label: 'Управленческий Журнал', icon: History },
    { label: 'Управленческий Отчет', icon: FileText },
  ]},
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  const {
    currentDomain, isSidebarExpanded, setIsSidebarExpanded,
    showAccountMenu, setShowAccountMenu, theme, setTheme,
  } = useAppStore();

  // tri-state: null = auto (follow active route), string = explicitly open, 'closed' = explicitly closed
  const [panelOverride, setPanelOverride] = useState<string | null | 'closed'>(null);

  const domainExtra = DOMAIN_EXTRAS[currentDomain];
  const extras = domainExtra ? [domainExtra] : DEFAULT_EXTRA;
  const sideItems = [...BASE_ITEMS, ...extras];

  // Derive which parent item owns the current route
  const activeParentLabel = sideItems.find(
    (item) =>
      item.details.some((d) => ROUTE_MAP[d.label] === pathname) ||
      pathname === item.href ||
      pathname.startsWith(item.href + '/')
  )?.label ?? null;

  // Reset override on navigation so new route auto-opens its group
  useEffect(() => { setPanelOverride(null); }, [pathname]);

  const openPanel = isSidebarExpanded
    ? (panelOverride === 'closed' ? null : panelOverride ?? activeParentLabel)
    : null;

  const navigate = (label: string) => {
    const href = ROUTE_MAP[label];
    if (href) router.push(href);
  };

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.details.length === 1) {
      navigate(item.details[0].label);
    } else if (isSidebarExpanded) {
      e.stopPropagation();
      setPanelOverride(openPanel === item.label ? 'closed' : item.label);
    } else {
      e.stopPropagation();
      setIsSidebarExpanded(true);
      setPanelOverride(item.label);
    }
  };

  const isActive = (item: NavItem) => openPanel === item.label || (openPanel === null && item.label === activeParentLabel);

  return (
    <aside
      ref={sidebarRef}
      className={`hidden md:flex flex-col py-2 z-[40] shrink-0 transition-all duration-300 bg-[#edf0f7] border-r border-[#d5dae8] ${
        isSidebarExpanded ? 'w-56 items-stretch px-2' : 'w-14 items-center'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsSidebarExpanded((v) => !v); }}
        className={`mb-1 shrink-0 flex items-center justify-center w-9 h-9 text-slate-400 hover:text-slate-700 transition-all ${isSidebarExpanded ? 'self-end' : ''}`}
        title={isSidebarExpanded ? 'Свернуть' : 'Развернуть'}
      >
        {isSidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Nav items */}
      <div className={`flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden scrollbar-hide flex-1 w-full proji-scrollbar ${isSidebarExpanded ? '' : 'items-center'}`}>
        {sideItems.map((item) => (
          <div key={item.label} className="flex flex-col w-full">
            <button
              onClick={(e) => handleItemClick(e, item)}
              className={`transition-all duration-200 flex items-center ${
                isSidebarExpanded ? 'w-full px-3 py-2.5 gap-3 text-sm font-semibold justify-start' : 'p-3 justify-center'
              } ${
                isActive(item)
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {isSidebarExpanded && <span className="whitespace-nowrap flex-1">{item.label}</span>}
              {isSidebarExpanded && item.details.length > 1 && (
                <ChevronDown size={13} className={`transition-transform duration-200 ${openPanel === item.label ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Inline dropdown (expanded) */}
            <AnimatePresence>
              {isSidebarExpanded && openPanel === item.label && item.details.length > 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col overflow-hidden"
                >
                  {item.details.map((d) => (
                    <button
                      key={d.label}
                      onClick={() => navigate(d.label)}
                      className={`flex items-center gap-3 text-[12px] font-medium py-2 pl-10 pr-3 transition-all text-left ${
                        ROUTE_MAP[d.label] === pathname
                          ? 'bg-slate-200 text-slate-900 font-semibold'
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <d.icon size={12} className="shrink-0" />
                      {d.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ))}
      </div>

      {/* Account section */}
      <div className={`mt-auto flex flex-col gap-0 border-t border-[#d5dae8] pt-1 ${isSidebarExpanded ? 'w-full' : ''}`}>
        <div className="relative">
          <div
            onClick={(e) => { e.stopPropagation(); setShowAccountMenu(!showAccountMenu); }}
            className={`flex items-center gap-3 cursor-pointer p-2 transition-all group ${isSidebarExpanded ? 'w-full px-3 hover:bg-slate-50' : 'justify-center hover:bg-slate-50'}`}
          >
            <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-200 text-slate-700">
              SS
            </div>
            {isSidebarExpanded && (
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-800">Sund Serik</span>
                <span className="text-[10px] text-slate-500 truncate w-32">sund.serik@gmail.com</span>
              </div>
            )}
          </div>
          <AnimatePresence>
            {showAccountMenu && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute left-full bottom-0 ml-4 min-w-[200px] bg-proji-bg border border-proji-border rounded-2xl shadow-2xl p-4 z-[110]"
              >
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-proji-secondary mb-3 border-b border-proji-border pb-2">Аккаунт SS</p>
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-2 mb-2 bg-proji-sidebar rounded-xl border border-proji-border">
                    <p className="text-sm font-bold text-proji-dark">Sund Serik</p>
                    <p className="text-[10px] text-proji-secondary">sund.serik@gmail.com</p>
                  </div>
                  <button
                    onClick={() => { router.push('/cabinet'); setShowAccountMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors"
                  >
                    <KeyRound size={14} /> Личный кабинет
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors">
                    <Settings size={14} /> Настройки
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={14} /> Выйти
                  </button>
                  <div className="h-px bg-proji-border my-2" />
                  <p className="text-[8px] uppercase font-bold tracking-widest text-proji-secondary px-3 mb-1">Режим</p>
                  {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${theme === t ? 'bg-proji-dark text-white' : 'text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark'}`}
                    >
                      {t === 'light' ? <Sun size={12} /> : t === 'dark' ? <Moon size={12} /> : <Monitor size={12} />}
                      {t === 'light' ? 'Светлый' : t === 'dark' ? 'Тёмный' : 'Системный'}
                    </button>
                  ))}
                </div>
                <div className="absolute left-[-6px] bottom-5 w-3 h-3 bg-proji-bg border-b border-l border-proji-border rotate-45 rounded-sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
