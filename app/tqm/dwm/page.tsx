'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, CheckCircle2, Clock, AlertCircle, Calendar, ChevronDown } from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';

type Level = 'daily' | 'weekly' | 'monthly';
interface Meeting { id: string; level: Level; title: string; date: string; dept: string; participants: number; items: { text: string; status: 'ok'|'issue'|'pending' }[]; }

const MEETINGS: Meeting[] = [
  {
    id:'d1', level:'daily', title:'Ежедневный стендап — Разработка', date:'06.06.2026 · 09:00', dept:'Разработка', participants:5,
    items:[
      { text:'Деплой API v3 запланирован на 08:00', status:'ok'      },
      { text:'Сервер APP-03 — ремонт идёт по плану', status:'pending' },
      { text:'PR #48 ожидает code review',           status:'issue'   },
    ],
  },
  {
    id:'d2', level:'daily', title:'Ежедневный стендап — Маркетинг', date:'06.06.2026 · 09:30', dept:'Маркетинг', participants:3,
    items:[
      { text:'Летняя кампания: бюджет утверждён', status:'ok'     },
      { text:'Creatives для Telegram Ads готовы',  status:'ok'     },
      { text:'Аналитика за прошлую неделю: CTR -2%', status:'issue' },
    ],
  },
  {
    id:'w1', level:'weekly', title:'Еженедельный обзор — Продукт', date:'03.06.2026 · 14:00', dept:'Продукт', participants:8,
    items:[
      { text:'Sprint 4 закрыт на 92%',               status:'ok'      },
      { text:'UI-кит 2.0 передан разработчикам',     status:'ok'      },
      { text:'Задержка: PWA-модуль сдвигается на Q3',status:'issue'   },
      { text:'Приоритеты Sprint 5 согласованы',      status:'pending' },
    ],
  },
  {
    id:'w2', level:'weekly', title:'Операционный обзор', date:'02.06.2026 · 16:00', dept:'Операции', participants:6,
    items:[
      { text:'KPI команды: 91% выполнение',       status:'ok'    },
      { text:'2 опоздания зафиксированы в HR',     status:'issue' },
      { text:'Инвентаризация серверной запланирована', status:'pending' },
    ],
  },
  {
    id:'m1', level:'monthly', title:'Ежемесячный бизнес-обзор', date:'01.06.2026 · 10:00', dept:'Топ-менеджмент', participants:12,
    items:[
      { text:'Выручка Q2: +18% к плану',        status:'ok'    },
      { text:'NPS вырос с 63 до 67',             status:'ok'    },
      { text:'Бюджет маркетинга превышен на 10%',status:'issue' },
      { text:'Стратегия H2 2026 утверждена',     status:'ok'    },
    ],
  },
];

const LEVEL_CFG: Record<Level,{label:string;cls:string;accentCls:string}> = {
  daily:   { label:'Ежедневный', cls:'bg-blue-50 text-blue-700 border-blue-200',     accentCls:'bg-blue-500'   },
  weekly:  { label:'Еженедельный',cls:'bg-violet-50 text-violet-700 border-violet-200',accentCls:'bg-violet-500' },
  monthly: { label:'Ежемесячный', cls:'bg-amber-50 text-amber-700 border-amber-200',  accentCls:'bg-amber-500'  },
};

const ITEM_ICO: Record<string,{ icon: React.ComponentType<any>; cls: string }> = {
  ok:      { icon: CheckCircle2, cls: 'text-emerald-500' },
  issue:   { icon: AlertCircle,  cls: 'text-red-400'     },
  pending: { icon: Clock,        cls: 'text-amber-400'   },
};

export default function DWMPage() {
  const [filter, setFilter] = useState<Level|'all'>('all');
  const [open,   setOpen]   = useState<string|null>('d1');
  const filtered = MEETINGS.filter(m => filter === 'all' || m.level === filter);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <Users size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">DWM-встречи</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Daily / Weekly / Monthly — управленческий ритм компании</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['daily','weekly','monthly'] as Level[]).map(l => {
            const cfg = LEVEL_CFG[l];
            const count = MEETINGS.filter(m => m.level === l).length;
            return (
              <button key={l} onClick={() => setFilter(filter === l ? 'all' : l)}
                className={`rounded-2xl border-2 p-3 text-center transition-all ${filter === l ? cfg.cls + ' border-current' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                <p className={`text-xl font-black ${filter === l ? '' : 'text-slate-800'}`}>{count}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${filter === l ? '' : 'text-slate-400'}`}>{cfg.label}</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filtered.map((m, i) => {
            const cfg = LEVEL_CFG[m.level];
            const isOpen = open === m.id;
            return (
              <motion.div key={m.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3 p-4 cursor-pointer select-none" onClick={() => setOpen(isOpen ? null : m.id)}>
                  <div className={`w-2 self-stretch rounded-full shrink-0 ${cfg.accentCls}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
                      <span className="text-[10px] text-slate-400">{m.dept}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{m.title}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar size={9}/> {m.date}</span>
                      <span className="flex items-center gap-1"><Users size={9}/> {m.participants} уч.</span>
                    </div>
                  </div>
                  <ChevronDown size={14} className={`text-slate-300 shrink-0 transition-transform ${isOpen ? 'rotate-180':''}`} />
                </div>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-2">
                    {m.items.map((item, j) => {
                      const { icon: Icon, cls } = ITEM_ICO[item.status];
                      return (
                        <div key={j} className="flex items-start gap-2.5">
                          <Icon size={13} className={`${cls} shrink-0 mt-0.5`} />
                          <p className="text-xs text-slate-600">{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
