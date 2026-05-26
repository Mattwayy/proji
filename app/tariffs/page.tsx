'use client';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Minus, Users, Zap, LayoutGrid, Star, Building2, Globe, Sparkles, ShieldCheck } from 'lucide-react';

// ─── Tiers ────────────────────────────────────────────────────────────────────

const TIERS = [
  { id: 'free',       name: 'Free',                 price: 0,        icon: Sparkles,    color: 'slate',  highlight: false },
  { id: 'basic',      name: 'Basic',                price: 5000,     icon: Zap,         color: 'blue',   highlight: false },
  { id: 'pro',        name: 'Pro',                  price: 10000,    icon: ShieldCheck, color: 'violet', highlight: true  },
  { id: 'coord',      name: 'Coordinator',          price: 20000,    icon: LayoutGrid,  color: 'teal',   highlight: false },
  { id: 'manager',    name: 'Manager',              price: 50000,    icon: Users,       color: 'amber',  highlight: false },
  { id: 'director',   name: 'Director',             price: 100000,   icon: Star,        color: 'rose',   highlight: false },
  { id: 'enterprise', name: 'Enterprise Owner',     price: 500000,   icon: Building2,   color: 'indigo', highlight: false },
  { id: 'strategic',  name: 'Strategic AI Partner', price: 1000000,  icon: Globe,       color: 'yellow', highlight: false },
] as const;

type TierId = typeof TIERS[number]['id'];

// ─── Comparison data ──────────────────────────────────────────────────────────

type CellVal = string;
type Row = { label: string; vals: CellVal[] };
type Section = { title: string; rows: Row[] };

const SECTIONS: Section[] = [
  {
    title: 'Лимиты',
    rows: [
      { label: 'AI-запросы / мес',               vals: ['10',     '100',    '300',     '800',    '2 000',   '5 000',   '20 000',   'по договору'] },
      { label: 'AI-действия / мес',              vals: ['5',      '50',     '150',     '400',    '1 000',   '3 000',   '10 000',   'по договору'] },
      { label: 'Активные цели / обязательства',  vals: ['3',      '10',     '30',      '75',     '200',     '500',     '2 000',    'по договору'] },
      { label: 'Активные задачи',                vals: ['20',     '100',    '300',     '1 000',  '3 000',   '10 000',  '50 000',   'по договору'] },
      { label: 'Папки / пространства',           vals: ['1',      '3',      '10',      '25',     '75',      '200',     '500',      'по договору'] },
      { label: 'Документы в базе знаний',        vals: ['10',     '50',     '200',     '500',    '2 000',   '10 000',  '50 000',   'по договору'] },
      { label: 'Договоры / этапы сделок в мес',  vals: ['—',      '5',      '20',      '50',     '150',     '500',     '2 000',    'по договору'] },
      { label: 'Гостевые ссылки на этапы',       vals: ['—',      '10',     '50',      '150',    '500',     '2 000',   '10 000',   'по договору'] },
      { label: 'WhatsApp-уведомления / мес',     vals: ['—',      '20',     '100',     '300',    '1 000',   '3 000',   '10 000',   'по договору'] },
      { label: 'Финансовые триггеры / мес',      vals: ['—',      '—',      '20',      '100',    '500',     '2 000',   '10 000',   'по договору'] },
      { label: 'История исполнения',             vals: ['7 дней', '30 дней','90 дней', '1 год',  '3 года',  '5 лет',   '10 лет',   'по договору'] },
      { label: 'Команды / компании',             vals: ['1',      '1',      '1',       '1',      'до 3',    'до 5',    'до 20',    'по договору'] },
    ],
  },
  {
    title: 'Функции',
    rows: [
      { label: 'SMART-цели и уточнение',          vals: ['✓',        '✓',       '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'OKR / KPI по целям',              vals: ['Просмотр', '✓',       '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Task Health: качество задач',     vals: ['Базово',   '✓',       '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'ICE-приоритизация задач',         vals: ['—',        'Базово',  '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Kanban и статусы исполнения',     vals: ['✓',        '✓',       '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Weekly Review по целям',          vals: ['—',        '—',       '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Evidence: доказательства',        vals: ['Просмотр', '✓',       '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Acceptance Flow: приёмка',        vals: ['—',        'Базово',  '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Obligation OS',                   vals: ['—',        '—',       'Базово', '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Contract-to-Tasks',               vals: ['—',        '—',       '—',      'Базово', '✓',       '✓',       '✓',        '✓']         },
      { label: 'Quality-to-Payment',              vals: ['—',        '—',       '—',      '—',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Spend Control',                   vals: ['—',        '—',       '—',      '—',      'Базово',  '✓',       '✓',        '✓']         },
      { label: 'WhatsApp-ссылки директору',       vals: ['—',        '—',       'Базово', '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Гостевой доступ к этапам',        vals: ['—',        '—',       'Базово', '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Финансовые триггеры оплаты',      vals: ['—',        '—',       '—',      'Базово', '✓',       '✓',       '✓',        '✓']         },
      { label: 'Sharia Risk Flags',               vals: ['—',        '—',       '—',      '—',      'Базово',  '✓',       '✓',        '✓']         },
      { label: 'Matching исполнителей',           vals: ['—',        '—',       '—',      '—',      '—',       'Пилот',   '✓',        '✓']         },
      { label: 'Safe Deal / BaaS',                vals: ['—',        '—',       '—',      '—',      '—',       'Пилот',   'Партнёр',  'Партнёр']   },
      { label: 'API и интеграции',                vals: ['—',        '—',       '—',      'Базово', '✓',       '✓',       '✓',        '✓']         },
      { label: 'Кастомные AI-агенты',             vals: ['—',        '—',       '—',      '—',      'Базово',  '✓',       '✓',        '✓']         },
      { label: 'Benchmark-отчёты',                vals: ['—',        '—',       '—',      '—',      '—',       '—',       'Пилот',    '✓']         },
      { label: 'Выделенное сопровождение',        vals: ['—',        '—',       '—',      '—',      '—',       '✓',       '✓',        '✓']         },
    ],
  },
  {
    title: 'Пакеты решений',
    rows: [
      { label: 'Goals Execution',                 vals: ['Просмотр', 'Базово',  '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Team Coordination',               vals: ['Просмотр', 'Базово',  '✓',      '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Obligation OS (пакет)',            vals: ['—',        '—',       'Базово', '✓',      '✓',       '✓',       '✓',        '✓']         },
      { label: 'Contract Execution',              vals: ['—',        '—',       '—',      'Базово', '✓',       '✓',       '✓',        '✓']         },
      { label: 'Quality-to-Payment (пакет)',       vals: ['—',        '—',       '—',      '—',      'Базово',  '✓',       '✓',        '✓']         },
      { label: 'Spend Control (пакет)',            vals: ['—',        '—',       '—',      '—',      'Базово',  '✓',       '✓',        '✓']         },
      { label: 'Work-to-Cash',                    vals: ['—',        '—',       '—',      '—',      'Базово',  '✓',       '✓',        '✓']         },
      { label: 'Sharia-aware workflows',          vals: ['—',        '—',       '—',      '—',      'Риск-флаги','✓',    '✓',        '✓']         },
      { label: 'Safe Deal (пакет)',                vals: ['—',        '—',       '—',      '—',      '—',       'Пилот',   'Партнёр',  'Партнёр']   },
      { label: 'Marketplace / Matching',          vals: ['—',        '—',       '—',      '—',      '—',       'Пилот',   '✓',        '✓']         },
    ],
  },
];

// ─── Color map ────────────────────────────────────────────────────────────────

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string; btn: string }> = {
  slate:  { bg: 'bg-white',         border: 'border-slate-200',  text: 'text-slate-600',  badge: 'bg-slate-100 text-slate-600',   btn: 'bg-slate-800 text-white hover:bg-slate-700' },
  blue:   { bg: 'bg-blue-50',       border: 'border-blue-200',   text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700',     btn: 'bg-blue-600 text-white hover:bg-blue-700' },
  violet: { bg: 'bg-violet-50',     border: 'border-violet-300', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', btn: 'bg-violet-600 text-white hover:bg-violet-700' },
  teal:   { bg: 'bg-teal-50',       border: 'border-teal-200',   text: 'text-teal-600',   badge: 'bg-teal-100 text-teal-700',     btn: 'bg-teal-600 text-white hover:bg-teal-700' },
  amber:  { bg: 'bg-amber-50',      border: 'border-amber-200',  text: 'text-amber-600',  badge: 'bg-amber-100 text-amber-700',   btn: 'bg-amber-600 text-white hover:bg-amber-700' },
  rose:   { bg: 'bg-rose-50',       border: 'border-rose-200',   text: 'text-rose-600',   badge: 'bg-rose-100 text-rose-700',     btn: 'bg-rose-600 text-white hover:bg-rose-700' },
  indigo: { bg: 'bg-indigo-50',     border: 'border-indigo-200', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-600 text-white hover:bg-indigo-700' },
  yellow: { bg: 'bg-yellow-50',     border: 'border-yellow-300', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700', btn: 'bg-yellow-500 text-white hover:bg-yellow-600' },
};

// ─── Cell renderer ────────────────────────────────────────────────────────────

const BADGE_LABELS = ['Базово', 'Просмотр', 'Пилот', 'Партнёр', 'Риск-флаги'];

function Cell({ val, color }: { val: string; color: string }) {
  const c = COLOR[color];
  if (val === '✓') return <Check size={15} className={`mx-auto ${c.text}`} />;
  if (val === '—') return <Minus size={13} className="mx-auto text-slate-300" />;
  if (BADGE_LABELS.includes(val)) return (
    <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold ${c.badge}`}>{val}</span>
  );
  return <span className="text-[11px] text-slate-600 font-medium">{val}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TariffsPage() {
  const [users, setUsers] = useState(10);

  return (
    <div className="flex flex-col h-full bg-[#f5f7fc] overflow-y-auto">
      <div className="max-w-[1400px] mx-auto w-full px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Proji · Тарифная матрица</p>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Тарифные планы</h1>
          <p className="text-sm text-slate-500 mt-2">Цена за 1 пользователя / месяц · Расчёт с первого пользователя</p>

          {/* Users calculator */}
          <div className="inline-flex items-center gap-3 mt-5 bg-white border border-slate-200 rounded-2xl px-5 py-2.5 shadow-sm">
            <span className="text-xs font-bold text-slate-500">Пользователей:</span>
            <button onClick={() => setUsers(u => Math.max(1, u - 1))} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors">−</button>
            <span className="text-lg font-black text-slate-800 w-8 text-center">{users}</span>
            <button onClick={() => setUsers(u => u + 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors">+</button>
          </div>
        </div>

        {/* Full comparison table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">

              {/* Plan headers */}
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white w-52 min-w-[13rem] border-b border-slate-100 px-4 py-0" />
                  {TIERS.map((tier, i) => {
                    const Icon = tier.icon;
                    const c = COLOR[tier.color];
                    const total = tier.price === 0 ? null : tier.price * users;
                    return (
                      <th key={tier.id} className={`border-b border-slate-100 px-3 py-5 text-center align-top ${tier.highlight ? 'bg-violet-50/60' : ''}`}>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex flex-col items-center gap-1"
                        >
                          {tier.highlight && (
                            <span className="bg-violet-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1">
                              Популярный
                            </span>
                          )}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.bg}`}>
                            <Icon size={16} className={c.text} />
                          </div>
                          <p className={`text-xs font-black ${c.text} mt-1`}>{tier.name}</p>
                          <p className="text-base font-black text-slate-800">
                            {tier.price === 0 ? 'Бесплатно' : `${tier.price.toLocaleString('ru-RU')} ₸`}
                          </p>
                          {tier.price > 0 && (
                            <p className="text-[9px] text-slate-400">/ польз. / мес</p>
                          )}
                          {total !== null && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {users} чел. → <span className="font-bold text-slate-700">{total.toLocaleString('ru-RU')} ₸</span>
                            </p>
                          )}
                          <button
                            disabled={tier.price === 0}
                            className={`mt-2 w-full px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                              tier.price === 0
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : c.btn
                            }`}
                          >
                            {tier.price === 0 ? 'Текущий план' : 'Выбрать'}
                          </button>
                        </motion.div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Sections */}
              <tbody>
                {SECTIONS.map((section) => (
                  <React.Fragment key={section.title}>
                    {/* Section header */}
                    <tr>
                      <td colSpan={9} className="bg-slate-50 border-y border-slate-100 px-4 py-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{section.title}</span>
                      </td>
                    </tr>

                    {/* Feature rows */}
                    {section.rows.map((row, ri) => (
                      <tr key={`${section.title}-${ri}`} className="group hover:bg-slate-50/70 transition-colors">
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/70 border-b border-slate-50 px-4 py-2.5 transition-colors">
                          <span className="text-[11px] text-slate-600 font-medium leading-snug">{row.label}</span>
                        </td>
                        {row.vals.map((val, ci) => {
                          const tier = TIERS[ci];
                          return (
                            <td
                              key={ci}
                              className={`border-b border-slate-50 px-3 py-2.5 text-center ${tier.highlight ? 'bg-violet-50/30 group-hover:bg-violet-50/60' : ''}`}
                            >
                              <Cell val={val} color={tier.color} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { q: 'Правило расчёта', a: 'Цена считается с 1-го пользователя: тариф × число пользователей. Нет минимального порога.' },
            { q: 'Финтех и Safe Deal', a: 'Финтех-функции доступны через партнёра начиная с тарифа Director. Отдельный договор для Strategic AI Partner.' },
            { q: 'Enterprise и стратегия', a: 'Для тарифов Enterprise Owner и Strategic AI Partner — индивидуальные условия, SLA и выделенный менеджер.' },
          ].map(item => (
            <div key={item.q} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-800 mb-1">{item.q}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
