'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Lightbulb, FlaskConical, BarChart2, CheckSquare, Plus, ChevronRight } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type HADIPhase = 'hypothesis' | 'action' | 'data' | 'insights';

interface HADICycle {
  id: string; title: string; owner: string; phase: HADIPhase; started: string;
  hypothesis: string; action: string; metrics: string[]; dataResult: string; insight: string;
}

const PHASES: { id: HADIPhase; label: string; icon: React.ComponentType<any>; cls: string }[] = [
  { id:'hypothesis', label:'Гипотеза',   icon:Lightbulb,    cls:'bg-amber-50 text-amber-600 border-amber-200'    },
  { id:'action',     label:'Действие',   icon:FlaskConical,  cls:'bg-blue-50 text-blue-600 border-blue-200'       },
  { id:'data',       label:'Данные',     icon:BarChart2,     cls:'bg-violet-50 text-violet-600 border-violet-200' },
  { id:'insights',   label:'Выводы',     icon:CheckSquare,   cls:'bg-emerald-50 text-emerald-600 border-emerald-200' },
];

const CYCLES: HADICycle[] = [
  {
    id:'h1', title:'Упрощение онбординга повысит конверсию', owner:'Алексей К.', phase:'insights', started:'01.05.2026',
    hypothesis:'Если упростить первый шаг регистрации с 5 полей до 2, конверсия в первую задачу вырастет на 20%.',
    action:'Убрали поля "Должность" и "Телефон" из формы регистрации. Тест длился 3 недели.',
    metrics:['Конверсия регистрация → задача','Время до первого действия','Bounce rate на шаге 1'],
    dataResult:'Конверсия выросла с 41% до 58% (+17%). Время до первого действия сократилось с 8 мин до 3 мин.',
    insight:'Гипотеза подтверждена. Упрощение формы даёт значительный эффект. Внедрить в прод, убрать телефон навсегда.',
  },
  {
    id:'h2', title:'Email-напоминания снизят churn в первые 30 дней', owner:'Иван П.', phase:'data', started:'15.05.2026',
    hypothesis:'Серия из 3 персонализированных email-напоминаний в первые 30 дней снизит churn на 30%.',
    action:'Запустили A/B тест: группа A получает 3 письма (день 3, 10, 25), группа B — ничего. Размер выборки: 200 пользователей.',
    metrics:['Churn rate 30 дней','Open rate писем','Переходы на платформу из письма'],
    dataResult:'Тест идёт 2-я неделя. Open rate: 34%. CTR: 12%. Churn группы A: 15%, группы B: 22% (предварительно).',
    insight:'',
  },
  {
    id:'h3', title:'Тёмная тема увеличит время сессии', owner:'Мария С.', phase:'action', started:'01.06.2026',
    hypothesis:'Пользователи с тёмной темой будут проводить на 15% больше времени в приложении.',
    action:'Релиз тёмной темы в beta для 10% пользователей. Сбор метрик через Amplitude в течение 2 недель.',
    metrics:['Avg session duration','DAU/MAU ratio','Feature adoption rate'],
    dataResult:'',
    insight:'',
  },
  {
    id:'h4', title:'Шаблоны проектов ускорят первый запуск', owner:'Мария С.', phase:'hypothesis', started:'05.06.2026',
    hypothesis:'Предложение 5 готовых шаблонов при создании первого проекта сократит time-to-value с 3 дней до 1 дня.',
    action:'',
    metrics:['Time to first completed task','% пользователей выбравших шаблон','NPS after 7 days'],
    dataResult:'',
    insight:'',
  },
  {
    id:'h5', title:'Публичные OKR повышают вовлечённость команды', owner:'Елена Н.', phase:'insights', started:'01.04.2026',
    hypothesis:'Публичное отображение OKR всей компании повысит вовлечённость сотрудников на 25%.',
    action:'3 месяца публично обновляли OKR на корпоративном дашборде и ежемесячных встречах.',
    metrics:['eNPS сотрудников','% выполненных задач','Участие в ретроспективах'],
    dataResult:'eNPS вырос с 42 до 61. Участие в ретроспективах: 70% → 89%.',
    insight:'Прозрачность целей работает. Сотрудники понимают приоритеты и принимают решения самостоятельно. Продолжить практику.',
  },
];

const PHASE_IDX: Record<HADIPhase, number> = { hypothesis:0, action:1, data:2, insights:3 };

export default function HADIPage() {
  const [filter, setFilter] = useState<HADIPhase|'all'>('all');
  const [open, setOpen] = useState<string|null>('h1');
  const filtered = CYCLES.filter(c => filter === 'all' || c.phase === filter);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <FlaskConical size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">HADI-циклы</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Hypothesis → Action → Data → Insights</p>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {PHASES.map(p => {
            const count = CYCLES.filter(c => c.phase === p.id).length;
            const Icon = p.icon;
            return (
              <button key={p.id} onClick={() => setFilter(filter===p.id ? 'all' : p.id)}
                className={`rounded-2xl border-2 p-3 text-center transition-all ${filter===p.id ? p.cls + ' border-current' : 'bg-white border-slate-200'}`}>
                <Icon size={16} className={`mx-auto mb-1 ${filter===p.id ? '' : 'text-slate-400'}`} />
                <p className={`text-lg font-black ${filter===p.id ? '' : 'text-slate-800'}`}>{count}</p>
                <p className={`text-[9px] font-semibold ${filter===p.id ? '' : 'text-slate-400'}`}>{p.label}</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filtered.map((cycle, i) => {
            const isOpen = open === cycle.id;
            const phaseIdx = PHASE_IDX[cycle.phase];
            return (
              <motion.div key={cycle.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="p-4 cursor-pointer" onClick={() => setOpen(isOpen ? null : cycle.id)}>
                  <div className="flex items-center gap-2 mb-2">
                    {PHASES.map((p, pi) => {
                      const Icon = p.icon;
                      const active = pi <= phaseIdx;
                      return (
                        <div key={p.id} className="flex items-center gap-1">
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold ${active ? p.cls : 'bg-slate-50 text-slate-300 border-slate-200'}`}>
                            <Icon size={8}/> {p.label}
                          </div>
                          {pi < 3 && <ChevronRight size={9} className={active && pi < phaseIdx ? 'text-slate-400' : 'text-slate-200'} />}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{cycle.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cycle.owner} · начат {cycle.started}</p>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 p-4 space-y-3">
                    {[
                      { label:'Гипотеза', icon:Lightbulb, text:cycle.hypothesis, cls:'text-amber-600' },
                      { label:'Действие', icon:FlaskConical, text:cycle.action, cls:'text-blue-600' },
                      { label:'Метрики', icon:BarChart2, text:cycle.metrics.join(' · '), cls:'text-violet-600' },
                      { label:'Данные', icon:BarChart2, text:cycle.dataResult, cls:'text-violet-600' },
                      { label:'Выводы', icon:CheckSquare, text:cycle.insight, cls:'text-emerald-600' },
                    ].filter(s => s.text).map(s => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="flex items-start gap-2.5">
                          <Icon size={13} className={`${s.cls} shrink-0 mt-0.5`} />
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{s.label}</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{s.text}</p>
                          </div>
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
