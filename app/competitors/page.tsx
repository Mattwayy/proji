'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Target, TrendingUp, Globe, Shield, AlertTriangle, ChevronDown } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type Threat = 'high' | 'medium' | 'low';

interface Competitor {
  id: string; name: string; site: string; marketShare: number; threat: Threat;
  strengths: string[]; weaknesses: string[]; price: string; target: string; notes: string;
}

const COMPETITORS: Competitor[] = [
  {
    id:'c1', name:'Битрикс24',       site:'bitrix24.ru',    marketShare:38, threat:'high',
    strengths:['Огромная база (12М пользователей)','Глубокая интеграция с 1С','Широкий функционал (CRM + задачи + сайты)'],
    weaknesses:['Перегруженный интерфейс','Высокая стоимость Enterprise','Слабый мобайл'],
    price:'От 2 590 ₽/мес', target:'Крупный бизнес, 1С-аудитория',
    notes:'Основной конкурент. Наше преимущество — простота интерфейса и современный AI-стек.',
  },
  {
    id:'c2', name:'Amo CRM',         site:'amocrm.ru',      marketShare:22, threat:'medium',
    strengths:['Лидер CRM для продаж','Отличный UX','Сильный маркетинг'],
    weaknesses:['Только CRM, нет управления проектами','Нет AI-функций','Ограниченная аналитика'],
    price:'От 999 ₽/мес', target:'Отделы продаж МСБ',
    notes:'Слабо пересекаемся — они CRM, мы операционное управление.',
  },
  {
    id:'c3', name:'Kaiten',          site:'kaiten.io',       marketShare:8,  threat:'high',
    strengths:['Современный дизайн','Kanban + OKR','Быстрый онбординг'],
    weaknesses:['Малая известность','Нет интеграций с 1С','Слабая аналитика'],
    price:'От 390 ₽/мес', target:'IT-команды, стартапы',
    notes:'Ближайший прямой конкурент по сегменту. Растут быстро — следим внимательно.',
  },
  {
    id:'c4', name:'Pyrus',           site:'pyrus.com',       marketShare:6,  threat:'medium',
    strengths:['Сильный workflow-движок','Корпоративные клиенты','Соответствие 152-ФЗ'],
    weaknesses:['Устаревший интерфейс','Высокая цена внедрения','Нет AI'],
    price:'От 5 000 ₽/мес', target:'Корпоративный сектор, госструктуры',
    notes:'Целевая аудитория частично пересекается в Enterprise-сегменте.',
  },
  {
    id:'c5', name:'Notion (RU)',      site:'notion.so',       marketShare:5,  threat:'low',
    strengths:['Гибкость базы знаний','Международный бренд','Отличный дизайн'],
    weaknesses:['Нет российских серверов (проблемы с 152-ФЗ)','Нет CRM','Слабая работа с задачами'],
    price:'$10/мес',         target:'Стартапы, личная продуктивность',
    notes:'Слабый конкурент в B2B из-за требований хранения данных в РФ.',
  },
];

const THREAT_CFG: Record<Threat,{label:string;cls:string;dot:string}> = {
  high:   { label:'Высокий', cls:'bg-red-50 text-red-700 border-red-200',     dot:'bg-red-500'   },
  medium: { label:'Средний', cls:'bg-amber-50 text-amber-700 border-amber-200',dot:'bg-amber-400' },
  low:    { label:'Низкий',  cls:'bg-slate-100 text-slate-500 border-slate-200',dot:'bg-slate-300'},
};

export default function CompetitorsPage() {
  const [open, setOpen] = useState<string|null>('c1');
  const [filter, setFilter] = useState<Threat|'all'>('all');

  const filtered = COMPETITORS.filter(c => filter === 'all' || c.threat === filter);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <BarChart3 size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Конкуренты</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Анализ конкурентной среды и позиционирование</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['high','medium','low'] as Threat[]).map(t => {
            const cfg = THREAT_CFG[t];
            return (
              <div key={t} className={`bg-white rounded-2xl border border-slate-200 p-4 text-center cursor-pointer hover:shadow-sm transition-shadow ${filter===t ? 'border-proji-primary/40' : ''}`}
                onClick={() => setFilter(filter===t ? 'all' : t)}>
                <p className="text-2xl font-black text-slate-800">{COMPETITORS.filter(c=>c.threat===t).length}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${cfg.cls.split(' ')[1]}`}>Угроза: {cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Market share bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Доля рынка (оценочно)</p>
          <div className="space-y-2">
            {COMPETITORS.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-24 shrink-0 truncate">{c.name}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${c.marketShare}%` }} transition={{ duration:0.6 }}
                    className="h-full bg-proji-primary rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 w-8 text-right shrink-0">{c.marketShare}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor cards */}
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const t = THREAT_CFG[c.threat];
            const isOpen = open === c.id;
            return (
              <motion.div key={c.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="p-4 cursor-pointer flex items-start gap-3" onClick={() => setOpen(isOpen ? null : c.id)}>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${t.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-black text-slate-800">{c.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.cls}`}>Угроза: {t.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Globe size={9}/> {c.site}</span>
                      <span className="flex items-center gap-1"><TrendingUp size={9}/> {c.marketShare}% рынка</span>
                      <span>{c.price}</span>
                    </div>
                  </div>
                  <ChevronDown size={14} className={`text-slate-300 shrink-0 transition-transform ${isOpen ? 'rotate-180':''}`} />
                </div>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wide mb-2">Сильные стороны</p>
                      {c.strengths.map(s => <p key={s} className="text-xs text-slate-600 flex items-start gap-1.5 mb-1"><span className="text-emerald-400 shrink-0">✓</span> {s}</p>)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-wide mb-2">Слабые стороны</p>
                      {c.weaknesses.map(w => <p key={w} className="text-xs text-slate-600 flex items-start gap-1.5 mb-1"><span className="text-red-400 shrink-0">✗</span> {w}</p>)}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Наш вывод</p>
                      <p className="text-xs text-slate-600 italic">{c.notes}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Целевой сегмент: {c.target}</p>
                    </div>
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
