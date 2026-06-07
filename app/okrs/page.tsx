'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp, CheckCircle2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

interface KR {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  done: boolean;
}

interface Objective {
  id: string;
  title: string;
  owner: string;
  quarter: string;
  keyResults: KR[];
}

const OBJECTIVES: Objective[] = [
  {
    id: 'o1', title: 'Увеличить долю рынка в сегменте МСБ', owner: 'CEO', quarter: 'Q2 2026',
    keyResults: [
      { id: 'kr1', title: 'Привлечь 200 новых платящих клиентов', current: 147, target: 200, unit: 'клиентов', done: false },
      { id: 'kr2', title: 'Снизить churn rate до 3%', current: 3.8, target: 3, unit: '%', done: false },
      { id: 'kr3', title: 'Выйти в 2 новых региона РФ', current: 1, target: 2, unit: 'регион', done: false },
    ],
  },
  {
    id: 'o2', title: 'Достичь NPS > 70', owner: 'CPO', quarter: 'Q2 2026',
    keyResults: [
      { id: 'kr4', title: 'NPS по итогам опроса июня', current: 67, target: 70, unit: 'баллов', done: false },
      { id: 'kr5', title: 'Время ответа поддержки < 2 ч', current: 1.8, target: 2, unit: 'часов', done: true },
      { id: 'kr6', title: 'Решить 95% тикетов за 24 ч', current: 91, target: 95, unit: '%', done: false },
    ],
  },
  {
    id: 'o3', title: 'Обеспечить надёжность платформы 99.9%', owner: 'CTO', quarter: 'Q2 2026',
    keyResults: [
      { id: 'kr7', title: 'Uptime сервисов ≥ 99.9%', current: 99.7, target: 99.9, unit: '%', done: false },
      { id: 'kr8', title: 'Время деплоя < 5 минут', current: 4.2, target: 5, unit: 'мин', done: true },
      { id: 'kr9', title: 'Покрытие тестами > 80%', current: 74, target: 80, unit: '%', done: false },
    ],
  },
  {
    id: 'o4', title: 'Запустить новый продуктовый модуль', owner: 'CPO', quarter: 'Q3 2026',
    keyResults: [
      { id: 'kr10', title: 'ТЗ согласовано со стейкхолдерами', current: 100, target: 100, unit: '%', done: true },
      { id: 'kr11', title: 'Дизайн-прототип утверждён', current: 100, target: 100, unit: '%', done: true },
      { id: 'kr12', title: 'Разработка завершена на 50% к концу Q2', current: 35, target: 50, unit: '%', done: false },
    ],
  },
  {
    id: 'o5', title: 'Вырасти по выручке на 40% г/г', owner: 'CFO', quarter: 'Q2 2026',
    keyResults: [
      { id: 'kr13', title: 'ARR ≥ 18 млн ₽', current: 14.2, target: 18, unit: 'млн ₽', done: false },
      { id: 'kr14', title: 'Средний чек вырасти с 8 до 11 тыс. ₽', current: 9.4, target: 11, unit: 'тыс. ₽', done: false },
      { id: 'kr15', title: 'Запустить 3 тарифных плана', current: 3, target: 3, unit: 'плана', done: true },
    ],
  },
];

function Progress({ kr }: { kr: KR }) {
  const pct = Math.min(100, Math.round((kr.current / kr.target) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className={`text-xs ${kr.done ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{kr.title}</p>
        <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap ml-2">
          {kr.current} / {kr.target} {kr.unit}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-blue-500' : 'bg-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function OKRsPage() {
  const [expanded, setExpanded] = useState<string | null>('o1');
  const [qFilter, setQFilter]   = useState<string>('Все');

  const quarters = ['Все', 'Q2 2026', 'Q3 2026'];
  const filtered  = OBJECTIVES.filter(o => qFilter === 'Все' || o.quarter === qFilter);

  const totalKRs = OBJECTIVES.flatMap(o => o.keyResults);
  const doneKRs  = totalKRs.filter(kr => kr.done);
  const avgPct   = Math.round(totalKRs.reduce((acc, kr) => acc + Math.min(100, (kr.current / kr.target) * 100), 0) / totalKRs.length);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-1 pt-1">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">OKR</h1>
          </div>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
            Общий прогресс {avgPct}%
          </span>
        </div>
        <p className="text-sm text-slate-400 mb-6">Цели и ключевые результаты компании</p>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-proji-primary">{OBJECTIVES.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Целей</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-emerald-600">{doneKRs.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">KR выполнено</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-amber-500">{totalKRs.length - doneKRs.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">В прогрессе</p>
          </div>
        </div>

        {/* Quarter filter */}
        <div className="flex gap-2 mb-5">
          {quarters.map(q => (
            <button key={q} onClick={() => setQFilter(q)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${qFilter === q ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {q}
            </button>
          ))}
        </div>

        {/* Objectives */}
        <div className="space-y-3">
          {filtered.map((obj, i) => {
            const isOpen = expanded === obj.id;
            const krDone  = obj.keyResults.filter(kr => kr.done).length;
            const objPct  = Math.round(obj.keyResults.reduce((acc, kr) => acc + Math.min(100, (kr.current / kr.target) * 100), 0) / obj.keyResults.length);
            return (
              <motion.div key={obj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3 p-4 cursor-pointer select-none" onClick={() => setExpanded(isOpen ? null : obj.id)}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${objPct >= 100 ? 'bg-emerald-100' : objPct >= 70 ? 'bg-blue-100' : 'bg-amber-100'}`}>
                    {objPct >= 100
                      ? <CheckCircle2 size={15} className="text-emerald-600" />
                      : objPct >= 70
                      ? <TrendingUp size={15} className="text-blue-600" />
                      : <AlertCircle size={15} className="text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 leading-snug mb-1">{obj.title}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>{obj.owner}</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-full">{obj.quarter}</span>
                      <span className="ml-auto">{krDone}/{obj.keyResults.length} KR</span>
                    </div>
                    {/* mini progress */}
                    <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${objPct >= 100 ? 'bg-emerald-500' : objPct >= 70 ? 'bg-blue-500' : 'bg-amber-400'}`} style={{ width: `${objPct}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm font-black shrink-0 ml-1 ${objPct >= 100 ? 'text-emerald-600' : objPct >= 70 ? 'text-blue-600' : 'text-amber-500'}`}>{objPct}%</span>
                  {isOpen ? <ChevronDown size={14} className="text-slate-300 shrink-0" /> : <ChevronRight size={14} className="text-slate-300 shrink-0" />}
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
                    {obj.keyResults.map(kr => <Progress key={kr.id} kr={kr} />)}
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
