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
  Settings, Moon, Sun, Monitor, KeyRound, LogOut, Bot, CreditCard, Wallet, Plus, Wand2,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Tooltip } from './Tooltip';
import { useAppStore } from '../store/useAppStore';
import type { BusinessDomain, Theme } from '../types';

const ROUTE_MAP: Record<string, string> = {
  'Чат': '/chat',
  'Все сценарии': '/scenarios',
  'Prompts Library': '/scenarios',
  'Agile': '/agile',
  'Sprint Review': '/agile/sprint',
  'Агенты': '/agents',
  'Тарифы': '/tariffs',
  'Оплата': '/payment',
  'Сообщения': '/messages',
  'Обсуждения': '/discussions',
  'Проекты': '/projects',
  'Дерево целей': '/goals-tree',
  'Управление проектом': '/projects/manage',
  'Задачи проекта': '/projects/tasks',
  'Доска задач': '/board',
  'Задачи': '/tasks',
  'Отчеты': '/reports',
  'Команда': '/team',
  'Вся команда': '/team',
  'Менеджер': '/manager',
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
  'Заметки': '/notes',
};

const ITEM_TIPS: Record<string, string> = {
  'AI Tools':     'Чат, агенты и промты',
  'Сообщения':    'Переписка и уведомления',
  'Проекты':      'Проекты и дерево целей',
  'Задачи':       'Канбан и список задач',
  'Команда':      'Участники и роли',
  'Документы':    'Файлы и регламенты',
  'Отчеты':       'Аналитика и отчёты',
  'Заметки':      'Личные заметки',
  'Юридический':  'Юридический дашборд',
  'Стратегия':    'OKR и боли',
  'TQM':          'Управление качеством',
  'Завод':        'Проверки и схемы ТП',
  'Оборудование': 'Журнал ремонтов',
  'Дневник':      'Журнал и отчёты',
  'Страницы':     'База знаний',
};

const DETAIL_TIPS: Record<string, string> = {
  'Чат':                        'Диалог с AI в реальном времени',
  'Агенты':                     'Специализированные AI-агенты',
  'Prompts Library':            'Готовые промты по сферам',
  'Тарифы':                     'Планы и разблокировка агентов',
  'Оплата':                     'Управление подпиской',
  'Все сценарии':               'Все AI-сценарии',
  'Agile':                      'Спринты и бэклог',
  'Sprint Review':              'Ретроспектива спринта',
  'Сообщения':                  'Личные и групповые чаты',
  'Обсуждения':                 'Треды и дискуссии',
  'Проекты':                    'Все проекты компании',
  'Дерево целей':               'Цели и ключевые результаты',
  'Создать новый':              'Запустить новый проект',
  'Доска задач':                'Канбан-доска',
  'Отчеты':                     'Аналитика и отчёты проекта',
  'Команда':                    'Профили и структура',
  'Менеджер':                   'Входящие отчёты и задачи от команды',
  'Карта стейкхолдеров':        'Заинтересованные стороны',
  'Документы':                  'Файлы и документация',
  'Регламенты':                 'Инструкции и стандарты',
  'Страницы':                   'База знаний',
  'Дерево страниц':             'Структура страниц',
  'Заметки':                    'Личные заметки',
  'Юридический Дашборд':        'Аналитика юротдела',
  'Список болей':               'Боли и HADI-гипотезы',
  'HADI Циклы':                 'Гипотезы → Данные → Инсайты',
  'TQM Dashboard':              'Дашборд качества',
  'TQM DWM Chart':              'День / неделя / месяц',
  'Непрерывное улучшение':      'Kaizen-инициативы',
  'Аудиты качества':            'Планирование аудитов',
  'Удовлетворенность клиентов': 'NPS и фидбек',
  'Журнал проверок':            'История проверок',
  'Схемы ТП':                   'Технологические схемы',
  'Журнал оборудования':        'Учёт техники',
  'Доска оборудования':         'Статус оборудования',
  'Архив ремонтов':             'История ремонтов',
  'Управленческий Журнал':      'Управленческие записи',
  'Управленческий Отчет':       'Отчёт для руководства',
};

type NavDetail = { label: string; icon: React.ComponentType<any>; isAction?: boolean };
type NavItem = { icon: React.ComponentType<any>; label: string; href: string; details: NavDetail[] };

// Always visible
const BASE_ITEMS: NavItem[] = [
  { icon: Bot, label: 'AI Tools', href: '/chat', details: [
    { label: 'Чат', icon: Sparkles },
    { label: 'Агенты', icon: Bot },
    { label: 'Prompts Library', icon: CheckCircle2 },
    { label: 'Agile', icon: Workflow },
    { label: 'Sprint Review', icon: Search },
  ]},
  { icon: Mail, label: 'Сообщения', href: '/messages', details: [
    { label: 'Сообщения', icon: Mail },
    { label: 'Обсуждения', icon: MessageSquare },
  ]},
  { icon: Folder, label: 'Проекты', href: '/projects', details: [
    { label: 'Создать новый', icon: Plus, isAction: true },
    { label: 'Отчеты', icon: BarChart3 },
  ]},
  { icon: Users, label: 'Команда', href: '/team', details: [
    { label: 'Команда', icon: Users },
    { label: 'Менеджер', icon: Briefcase },
    { label: 'Карта стейкхолдеров', icon: Users },
  ]},
  { icon: BarChart3, label: 'Отчеты', href: '/reports', details: [
    { label: 'Отчеты', icon: BarChart3 },
  ]},
  { icon: FileText, label: 'Документы', href: '/documents', details: [
    { label: 'Документы', icon: Archive },
    { label: 'Регламенты', icon: BookOpen },
  ]},
  { icon: History, label: 'Заметки', href: '/notes', details: [
    { label: 'Заметки', icon: History },
  ]},
];

// Domain-specific extras — only shown when that domain is active
const DOMAIN_SPECIFIC: Record<string, NavItem[]> = {
  'Юридический': [
    { icon: Briefcase, label: 'Юридический', href: '/legal/dashboard', details: [
      { label: 'Юридический Дашборд', icon: Scale },
    ]},
  ],
  'Стратегия': [
    { icon: Target, label: 'Стратегия', href: '/pains', details: [
      { label: 'Список болей', icon: Activity },
      { label: 'Карта стейкхолдеров', icon: Users },
      { label: 'HADI Циклы', icon: RotateCcw },
    ]},
    { icon: Layout, label: 'Страницы', href: '/pages-list', details: [
      { label: 'Страницы', icon: Layout },
      { label: 'Дерево страниц', icon: LayoutDashboard },
    ]},
  ],
  'Производство': [
    { icon: Shield, label: 'TQM', href: '/tqm', details: [
      { label: 'TQM Dashboard', icon: Shield },
      { label: 'TQM DWM Chart', icon: BarChart3 },
      { label: 'Непрерывное улучшение', icon: RefreshCw },
      { label: 'Аудиты качества', icon: ClipboardCheck },
      { label: 'Удовлетворенность клиентов', icon: Smile },
    ]},
    { icon: Factory, label: 'Завод', href: '/equipment/inspections', details: [
      { label: 'Журнал проверок', icon: ClipboardCheck },
      { label: 'Схемы ТП', icon: Workflow },
      { label: 'Регламенты', icon: BookOpen },
    ]},
  ],
  'Оборудование': [
    { icon: Settings2, label: 'Оборудование', href: '/equipment/journal', details: [
      { label: 'Журнал оборудования', icon: Settings2 },
      { label: 'Доска оборудования', icon: LayoutDashboard },
      { label: 'Архив ремонтов', icon: Archive },
    ]},
    { icon: Shield, label: 'TQM', href: '/tqm', details: [
      { label: 'TQM Dashboard', icon: Shield },
      { label: 'Аудиты качества', icon: ClipboardCheck },
    ]},
  ],
  'Управление': [
    { icon: History, label: 'Дневник', href: '/management/journal', details: [
      { label: 'Управленческий Журнал', icon: History },
      { label: 'Управленческий Отчет', icon: FileText },
    ]},
  ],
};

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  const {
    currentDomain, isSidebarExpanded, setIsSidebarExpanded,
    showAccountMenu, setShowAccountMenu, theme, setTheme,
    setShowQuickAddModal, setQuickAddType, projects,
    setShowEntityFactory,
  } = useAppStore();

  // tri-state: null = auto (follow active route), string = explicitly open, 'closed' = explicitly closed
  const [panelOverride, setPanelOverride] = useState<string | null | 'closed'>(null);

  useEffect(() => {
    if (!showAccountMenu) return;
    const close = () => setShowAccountMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showAccountMenu, setShowAccountMenu]);

  const domainExtras = DOMAIN_SPECIFIC[currentDomain as keyof typeof DOMAIN_SPECIFIC] ?? [];
  const sideItems = [...BASE_ITEMS, ...domainExtras];

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

  const navigate = (d: NavDetail) => {
    if (d.isAction) {
      setQuickAddType('проект');
      setShowQuickAddModal(true);
      return;
    }
    // В домене «Управление» «Отчёты» ведут на входящие менеджера, а не на форму сотрудника
    if (d.label === 'Отчеты' && currentDomain === 'Управление') {
      router.push('/manager');
      return;
    }
    const href = ROUTE_MAP[d.label];
    if (href) router.push(href);
  };

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.details.length === 1) {
      navigate(item.details[0]);
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

      {/* AI Factory button */}
      <Tooltip text="Фабрика сущностей — AI разбор текста" side="right">
        <button
          onClick={() => setShowEntityFactory(true)}
          className={`mb-1 shrink-0 flex items-center gap-2.5 rounded-xl transition-all bg-violet-50 hover:bg-violet-100 text-violet-600 font-bold ${
            isSidebarExpanded
              ? 'w-full px-3 py-2 text-sm justify-start'
              : 'w-9 h-9 justify-center'
          }`}
        >
          <Wand2 size={16} className="shrink-0" />
          {isSidebarExpanded && <span className="whitespace-nowrap">AI Фабрика</span>}
        </button>
      </Tooltip>

      {/* Nav items */}
      <div className={`flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden scrollbar-hide flex-1 w-full proji-scrollbar ${isSidebarExpanded ? '' : 'items-center'}`}>
        {sideItems.map((item) => (
          <div key={item.label} className="flex flex-col w-full">
            <Tooltip text={ITEM_TIPS[item.label] ?? ''} side="right" className="w-full">
            <button
              onClick={(e) => handleItemClick(e, item)}
              className={`w-full transition-all duration-200 flex items-center ${
                isSidebarExpanded ? 'px-3 py-2.5 gap-3 text-sm font-semibold justify-start' : 'p-3 justify-center'
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
            </Tooltip>

            {/* Inline dropdown (expanded) */}
            <AnimatePresence>
              {isSidebarExpanded && openPanel === item.label && item.details.length > 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col overflow-hidden"
                >
                  {item.label === 'Проекты' ? (
                    <>
                      {/* Dynamic project list */}
                      {projects.map((p) => (
                        <Tooltip key={p.id} text={p.description || p.name} side="right">
                          <button
                            onClick={() => router.push(`/projects/${p.id}`)}
                            className={`w-full flex items-center gap-3 text-[12px] font-medium py-2 pl-10 pr-3 transition-all text-left ${
                              pathname === `/projects/${p.id}` ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                          >
                            <Folder size={12} className="shrink-0" />
                            <span className="truncate">{p.name}</span>
                          </button>
                        </Tooltip>
                      ))}

                      {/* Создать новый — last */}
                      <Tooltip text="Запустить новый проект" side="right">
                        <button
                          onClick={() => { setQuickAddType('проект'); setShowQuickAddModal(true); }}
                          className="w-full flex items-center gap-3 text-[12px] font-medium py-2 pl-10 pr-3 transition-all text-left text-proji-primary hover:bg-proji-primary/10 font-semibold"
                        >
                          <Plus size={12} className="shrink-0" />
                          Создать новый
                        </button>
                      </Tooltip>
                    </>
                  ) : (
                    item.details.map((d) => (
                      <Tooltip key={d.label} text={DETAIL_TIPS[d.label] ?? ''} side="right">
                      <button
                        onClick={() => navigate(d)}
                        className={`w-full flex items-center gap-3 text-[12px] font-medium py-2 pl-10 pr-3 transition-all text-left ${
                          d.isAction
                            ? 'text-proji-primary hover:bg-proji-primary/10 font-semibold'
                            : ROUTE_MAP[d.label] === pathname
                              ? 'bg-slate-200 text-slate-900 font-semibold'
                              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                      >
                        <d.icon size={12} className="shrink-0" />
                        {d.label}
                      </button>
                      </Tooltip>
                    ))
                  )}
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
                    onClick={() => { router.push('/tariffs'); setShowAccountMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors"
                  >
                    <CreditCard size={14} /> Тарифы
                  </button>
                  <button
                    onClick={() => { router.push('/payment'); setShowAccountMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors"
                  >
                    <Wallet size={14} /> Оплата
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
