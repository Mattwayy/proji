'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Flag, CheckCircle2, Clock, AlertCircle, ChevronRight, Zap, Target, Layers } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type Phase = 'completed' | 'active' | 'planned' | 'blocked';

interface RoadmapItem {
  id: string;
  phase: string;
  quarter: string;
  title: string;
  description: string;
  status: Phase;
  progress: number;
  tags: string[];
  owner: string;
}

const ITEMS: RoadmapItem[] = [
  {
    id: '1', phase: 'Q1 2026', quarter: 'Q1 2026',
    title: 'Запуск MVP платформы',
    description: 'Базовая функциональность: проекты, задачи, командное пространство, авторизация.',
    status: 'completed', progress: 100,
    tags: ['Продукт', 'Разработка'],
    owner: 'Иван П.',
  },
  {
    id: '2', phase: 'Q1 2026', quarter: 'Q1 2026',
    title: 'Интеграция AI-ассистента',
    description: 'Подключение Gemini API, контекстные подсказки, автогенерация задач из текста.',
    status: 'completed', progress: 100,
    tags: ['AI', 'Разработка'],
    owner: 'Сергей В.',
  },
  {
    id: '3', phase: 'Q2 2026', quarter: 'Q2 2026',
    title: 'Модуль отчётности для руководителей',
    description: 'Входящие отчёты, статусы задач, ивенты от сотрудников, фильтрация и архив.',
    status: 'completed', progress: 100,
    tags: ['Управление', 'Менеджмент'],
    owner: 'Елена Н.',
  },
  {
    id: '4', phase: 'Q2 2026', quarter: 'Q2 2026',
    title: 'UI-кит 2.0 — тёмная тема',
    description: 'Обновлённая дизайн-система: тёмная тема, новые компоненты, цветовые токены.',
    status: 'active', progress: 68,
    tags: ['Дизайн', 'UX'],
    owner: 'Мария С.',
  },
  {
    id: '5', phase: 'Q2 2026', quarter: 'Q2 2026',
    title: 'Мобильное приложение (PWA)',
    description: 'Progressive Web App с офлайн-режимом, пуш-уведомлениями и нативными жестами.',
    status: 'active', progress: 35,
    tags: ['Мобайл', 'Разработка'],
    owner: 'Иван П.',
  },
  {
    id: '6', phase: 'Q3 2026', quarter: 'Q3 2026',
    title: 'API v3 — публичный доступ',
    description: 'REST + GraphQL, OAuth 2.0, документация, Sandbox-среда для партнёров.',
    status: 'planned', progress: 0,
    tags: ['API', 'Партнёры'],
    owner: 'Сергей В.',
  },
  {
    id: '7', phase: 'Q3 2026', quarter: 'Q3 2026',
    title: 'Модуль аналитики и BI',
    description: 'Дашборды в реальном времени, экспорт отчётов, кастомные KPI, воронки.',
    status: 'planned', progress: 0,
    tags: ['Аналитика', 'BI'],
    owner: 'Елена Н.',
  },
  {
    id: '8', phase: 'Q3 2026', quarter: 'Q3 2026',
    title: 'SSO с корпоративным AD',
    description: 'Единый вход через Active Directory, LDAP, SAML 2.0.',
    status: 'blocked', progress: 10,
    tags: ['Безопасность', 'IT'],
    owner: 'Сергей В.',
  },
  {
    id: '9', phase: 'Q4 2026', quarter: 'Q4 2026',
    title: 'Маркетплейс интеграций',
    description: 'Подключение Bitrix24, AmoCRM, 1С, Slack, Telegram Bot API.',
    status: 'planned', progress: 0,
    tags: ['Интеграции', 'Экосистема'],
    owner: 'Алексей К.',
  },
  {
    id: '10', phase: 'Q4 2026', quarter: 'Q4 2026',
    title: 'Тарифные планы и биллинг',
    description: 'Оплата через ЮКасса, триал 14 дней, корпоративные лицензии, счета.',
    status: 'planned', progress: 0,
    tags: ['Монетизация', 'Финансы'],
    owner: 'Елена Н.',
  },
];

const STATUS_CFG: Record<Phase, { label: string; icon: React.ComponentType<any>; cls: string; dot: string }> = {
  completed: { label: 'Готово',    icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  active:    { label: 'В работе',  icon: Zap,          cls: 'bg-blue-50 text-blue-700 border-blue-200',           dot: 'bg-blue-500'   },
  planned:   { label: 'Запланировано', icon: Clock,    cls: 'bg-slate-100 text-slate-500 border-slate-200',       dot: 'bg-slate-300'  },
  blocked:   { label: 'Заблокировано', icon: AlertCircle, cls: 'bg-red-50 text-red-600 border-red-200',           dot: 'bg-red-500'    },
};

const QUARTERS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
const ALL_TAGS = ['Все', 'Продукт', 'Разработка', 'AI', 'Дизайн', 'Аналитика', 'Безопасность'];

export default function RoadmapPage() {
  const [filter, setFilter] = useState<Phase | 'all'>('all');
  const [tagFilter, setTagFilter] = useState('Все');

  const filtered = ITEMS.filter(i =>
    (filter === 'all' || i.status === filter) &&
    (tagFilter === 'Все' || i.tags.includes(tagFilter))
  );

  const stats = {
    total:     ITEMS.length,
    completed: ITEMS.filter(i => i.status === 'completed').length,
    active:    ITEMS.filter(i => i.status === 'active').length,
    planned:   ITEMS.filter(i => i.status === 'planned').length,
  };

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 pt-1">
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">Дорожная карта</h1>
          </div>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
            {stats.completed}/{stats.total} готово
          </span>
        </div>
        <p className="text-sm text-slate-400 mb-6">Стратегический план развития продукта на 2026 год</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Готово',       val: stats.completed, cls: 'text-emerald-600' },
            { label: 'В работе',     val: stats.active,    cls: 'text-blue-600'    },
            { label: 'Запланировано',val: stats.planned,   cls: 'text-slate-500'   },
            { label: 'Всего',        val: stats.total,     cls: 'text-slate-800'   },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
              <p className={`text-2xl font-black ${s.cls}`}>{s.val}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'completed', 'active', 'planned', 'blocked'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filter === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>
              {s === 'all' ? 'Все' : STATUS_CFG[s].label}
            </button>
          ))}
          <div className="w-px bg-slate-200 mx-1 self-stretch" />
          {ALL_TAGS.map(t => (
            <button key={t} onClick={() => setTagFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                tagFilter === t ? 'bg-proji-primary text-white border-proji-primary' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-10">
          {QUARTERS.map(q => {
            const qItems = filtered.filter(i => i.quarter === q);
            if (qItems.length === 0) return null;
            return (
              <div key={q}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-proji-primary" />
                    <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{q}</h2>
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] text-slate-400 font-semibold">{qItems.length} задач</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {qItems.map((item, idx) => {
                    const s = STATUS_CFG[item.status];
                    const Icon = s.icon;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-bold text-slate-800 leading-snug flex-1">{item.title}</h3>
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${s.cls}`}>
                            <Icon size={9} /> {s.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">{item.description}</p>

                        {/* Progress */}
                        {item.status !== 'planned' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-400">Прогресс</span>
                              <span className="text-[10px] font-bold text-slate-600">{item.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${item.status === 'blocked' ? 'bg-red-400' : item.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {item.tags.map(t => (
                            <span key={t} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                          <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
                            <Layers size={9} /> {item.owner}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
