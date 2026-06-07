'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Workflow, CheckCircle2, Clock, Users, ChevronRight, Play, AlertCircle, ArrowRight, X } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type ProcStatus = 'active' | 'paused' | 'draft';

interface ProcStep {
  id: string;
  title: string;
  role: string;
  duration: string;
  done: boolean;
}

interface Process {
  id: string;
  name: string;
  category: string;
  status: ProcStatus;
  owner: string;
  steps: ProcStep[];
  sla: string;
  runs: number;
  lastRun: string;
}

const PROCESSES: Process[] = [
  {
    id: 'p1',
    name: 'Онбординг нового сотрудника',
    category: 'HR',
    status: 'active',
    owner: 'Анна К.',
    sla: '5 дней',
    runs: 12,
    lastRun: '03.06.2026',
    steps: [
      { id: 's1', title: 'Подписание договора', role: 'HR', duration: '1 день', done: true },
      { id: 's2', title: 'Выдача оборудования', role: 'IT', duration: '0.5 дня', done: true },
      { id: 's3', title: 'Доступы и учётные записи', role: 'IT', duration: '0.5 дня', done: true },
      { id: 's4', title: 'Вводный инструктаж', role: 'HR', duration: '1 день', done: false },
      { id: 's5', title: 'Знакомство с командой', role: 'Руководитель', duration: '0.5 дня', done: false },
    ],
  },
  {
    id: 'p2',
    name: 'Согласование договора',
    category: 'Юридический',
    status: 'active',
    owner: 'Мария С.',
    sla: '3 дня',
    runs: 28,
    lastRun: '05.06.2026',
    steps: [
      { id: 's1', title: 'Получение проекта договора', role: 'Юрист', duration: '1 час', done: true },
      { id: 's2', title: 'Правовая экспертиза', role: 'Юрист', duration: '1 день', done: true },
      { id: 's3', title: 'Согласование с финотделом', role: 'CFO', duration: '0.5 дня', done: false },
      { id: 's4', title: 'Подписание CEO', role: 'CEO', duration: '0.5 дня', done: false },
    ],
  },
  {
    id: 'p3',
    name: 'Запуск рекламной кампании',
    category: 'Маркетинг',
    status: 'active',
    owner: 'Алексей К.',
    sla: '7 дней',
    runs: 6,
    lastRun: '01.06.2026',
    steps: [
      { id: 's1', title: 'Постановка цели и KPI', role: 'CMO', duration: '1 день', done: true },
      { id: 's2', title: 'Разработка креативов', role: 'Дизайнер', duration: '2 дня', done: true },
      { id: 's3', title: 'Согласование бюджета', role: 'CFO', duration: '0.5 дня', done: false },
      { id: 's4', title: 'Настройка кампании', role: 'Маркетолог', duration: '1 день', done: false },
      { id: 's5', title: 'Тест и запуск', role: 'Маркетолог', duration: '0.5 дня', done: false },
      { id: 's6', title: 'Мониторинг и отчёт', role: 'Аналитик', duration: '2 дня', done: false },
    ],
  },
  {
    id: 'p4',
    name: 'Техническое обслуживание оборудования',
    category: 'Оборудование',
    status: 'active',
    owner: 'Сергей В.',
    sla: '2 дня',
    runs: 45,
    lastRun: '04.06.2026',
    steps: [
      { id: 's1', title: 'Регистрация заявки', role: 'Оператор', duration: '1 час', done: true },
      { id: 's2', title: 'Диагностика', role: 'Механик', duration: '0.5 дня', done: true },
      { id: 's3', title: 'Заказ запчастей', role: 'Снабженец', duration: '1 день', done: false },
      { id: 's4', title: 'Ремонт и тестирование', role: 'Механик', duration: '0.5 дня', done: false },
    ],
  },
  {
    id: 'p5',
    name: 'Разработка и релиз фичи',
    category: 'IT',
    status: 'paused',
    owner: 'Иван П.',
    sla: '14 дней',
    runs: 18,
    lastRun: '28.05.2026',
    steps: [
      { id: 's1', title: 'Постановка задачи (ТЗ)', role: 'Product', duration: '2 дня', done: true },
      { id: 's2', title: 'Дизайн-макет', role: 'Дизайнер', duration: '3 дня', done: true },
      { id: 's3', title: 'Разработка', role: 'Разработчик', duration: '5 дней', done: false },
      { id: 's4', title: 'Code Review', role: 'Тимлид', duration: '1 день', done: false },
      { id: 's5', title: 'QA-тестирование', role: 'QA', duration: '2 дня', done: false },
      { id: 's6', title: 'Деплой на прод', role: 'DevOps', duration: '1 день', done: false },
    ],
  },
  {
    id: 'p6',
    name: 'Ежемесячная инвентаризация',
    category: 'Операции',
    status: 'draft',
    owner: 'Елена Н.',
    sla: '3 дня',
    runs: 0,
    lastRun: '—',
    steps: [
      { id: 's1', title: 'Сверка с учётной системой', role: 'Аналитик', duration: '1 день', done: false },
      { id: 's2', title: 'Физическая проверка', role: 'Склад', duration: '1 день', done: false },
      { id: 's3', title: 'Составление акта', role: 'Бухгалтер', duration: '1 день', done: false },
    ],
  },
];

const STATUS_CFG: Record<ProcStatus, { label: string; cls: string }> = {
  active: { label: 'Активен',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paused: { label: 'Приостановлен', cls: 'bg-amber-50 text-amber-700 border-amber-200'    },
  draft:  { label: 'Черновик',    cls: 'bg-slate-100 text-slate-500 border-slate-200'      },
};

const CATS = ['Все', 'HR', 'Юридический', 'Маркетинг', 'Оборудование', 'IT', 'Операции'];

export default function ProcessesPage() {
  const [catFilter, setCatFilter] = useState('Все');
  const [selected, setSelected] = useState<Process | null>(null);

  const filtered = PROCESSES.filter(p => catFilter === 'Все' || p.category === catFilter);

  return (
    <PageWrapper>
      <div className="flex h-full overflow-hidden">
        {/* List */}
        <div className={`flex flex-col ${selected ? 'hidden md:flex md:w-96 shrink-0' : 'flex-1'} overflow-hidden`}>
          <div className="px-4 md:px-8 pb-3 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <Workflow size={17} className="text-proji-primary" />
              <h1 className="text-xl font-black text-slate-900">Процессы</h1>
              <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full ml-auto">
                {PROCESSES.length} процессов
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-4">Бизнес-процессы и регламенты компании</p>

            {/* Category filter */}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {CATS.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    catFilter === c ? 'bg-proji-primary text-white border-proji-primary' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 space-y-3">
            {filtered.map((proc, i) => {
              const s = STATUS_CFG[proc.status];
              const doneSteps = proc.steps.filter(st => st.done).length;
              const pct = Math.round((doneSteps / proc.steps.length) * 100);
              return (
                <motion.div
                  key={proc.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(proc)}
                  className={`bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-all ${
                    selected?.id === proc.id ? 'border-proji-primary/40 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{proc.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-1">{proc.name}</h3>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0 mt-1" />
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>{doneSteps}/{proc.steps.length} шагов</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-proji-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Users size={9} /> {proc.owner}</span>
                    <span className="flex items-center gap-1"><Clock size={9} /> SLA: {proc.sla}</span>
                    <span className="ml-auto flex items-center gap-1"><Play size={9} /> {proc.runs} запусков</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className="flex-1 bg-white border-l border-slate-200 flex flex-col overflow-hidden"
            >
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 shrink-0">
                <button onClick={() => setSelected(null)} className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                  <ChevronRight size={16} className="rotate-180" />
                </button>
                <span className="text-sm font-bold text-slate-700 flex-1">{selected.name}</span>
                <button onClick={() => setSelected(null)} className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Категория',   val: selected.category },
                    { label: 'Владелец',    val: selected.owner    },
                    { label: 'SLA',         val: selected.sla      },
                    { label: 'Запусков',    val: String(selected.runs)  },
                    { label: 'Последний',   val: selected.lastRun  },
                    { label: 'Статус',      val: STATUS_CFG[selected.status].label },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{m.label}</p>
                      <p className="text-sm font-bold text-slate-700">{m.val}</p>
                    </div>
                  ))}
                </div>

                {/* Steps */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Шаги процесса</p>
                  <div className="space-y-2">
                    {selected.steps.map((step, i) => (
                      <div key={step.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        step.done ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-200'
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                          step.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {step.done ? <CheckCircle2 size={12} /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${step.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{step.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] text-slate-400">{step.role}</span>
                            <span className="text-[10px] text-slate-300">·</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={9}/> {step.duration}</span>
                          </div>
                        </div>
                        {i < selected.steps.length - 1 && !step.done && (
                          <ArrowRight size={12} className="text-slate-300 shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-slate-200 shrink-0">
                <button className="w-full py-3 bg-proji-primary text-white rounded-2xl text-sm font-bold hover:bg-proji-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Play size={14} /> Запустить процесс
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selected && (
          <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3 text-slate-200">
            <Workflow size={40} strokeWidth={1.5} />
            <p className="text-sm">Выберите процесс</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
