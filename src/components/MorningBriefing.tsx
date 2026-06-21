'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, X, AlertTriangle, Target, BookOpen, Clock, Sparkles, TrendingUp, Rocket, Users2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const AUTH_ROUTES = ['/login'];

const DAILY_QUOTE = 'Шаг за шагом к великим победам. Действуйте!';

const OKR_MOCK = [
  { id: 'okr1', title: 'Запуск нового продукта', progress: 65, meta: 'Выручка $1M', color: 'bg-proji-primary', icon: Rocket },
  { id: 'okr2', title: 'Найм Core-команды', progress: 80, meta: '5 специалистов', color: 'bg-emerald-500', icon: Users2 },
];

function formatToday() {
  return new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function MorningBriefing() {
  const router = useRouter();
  const pathname = usePathname();
  const { allTasks, projects } = useAppStore();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) return;
    if (shown) return;
    setOpen(true);
    setShown(true);
  }, [pathname, shown]);

  const dismiss = () => {
    setOpen(false);
  };

  const { overdue, priorities } = useMemo(() => {
    const now = new Date();
    const pending = allTasks.filter((t) => t.status === 'pending');
    const overdue = pending.filter((t) => t.dueDate && new Date(t.dueDate) < now);
    const rank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const priorities = [...pending]
      .sort((a, b) => (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3))
      .slice(0, 3);
    return { overdue, priorities };
  }, [allTasks]);

  const overdueProjects = useMemo(
    () => projects.filter((p) => p.status === 'In Progress' && new Date(p.deadline) < new Date()),
    [projects]
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={dismiss}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-2xl bg-proji-primary/10 text-proji-primary flex items-center justify-center">
                  <Sun size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Сводка дня</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Доброе утро! Сегодня {formatToday()}.</p>
                </div>
              </div>
              <button onClick={dismiss} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Intro + quote */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Я подготовил ежедневную аналитическую сводку по вашим проектам. Рассмотрите обновления и приоритеты на сегодня.
                </p>
                <p className="text-sm text-proji-primary font-semibold italic mt-2">«{DAILY_QUOTE}»</p>
              </div>

              {/* AI usage / detail bars */}
              <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                    <Sparkles size={11} /> Запросы ИИ
                  </div>
                  <p className="text-sm font-black text-slate-800 mb-1.5">0 / 1000</p>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-proji-primary rounded-full" style={{ width: '2%' }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 justify-end">
                    <TrendingUp size={11} /> Детализация компании
                  </div>
                  <p className="text-sm font-black text-slate-800 mb-1.5 text-right">85%</p>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>

              {/* OKR progress */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
                  <TrendingUp size={12} /> Прогресс квартальных целей (OKR)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OKR_MOCK.map((okr) => (
                    <div key={okr.id} className="bg-white border border-slate-100 rounded-2xl px-4 py-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-slate-800">{okr.title}</p>
                        <span className="text-[11px] font-black text-proji-primary bg-proji-primary/10 px-2 py-0.5 rounded-full shrink-0 ml-2">{okr.progress}%</span>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">{okr.meta}</p>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${okr.color} rounded-full`} style={{ width: `${okr.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
                  <AlertTriangle size={12} /> Важные обновления
                </p>
                {overdue.length === 0 && overdueProjects.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Срывов сроков нет — всё под контролем.</p>
                ) : (
                  <div className="space-y-2">
                    {overdueProjects.map((p) => (
                      <div key={p.id} className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-slate-800">Проект: {p.name}</p>
                          <span className="text-[10px] font-black uppercase tracking-wide text-red-500 bg-white px-2 py-0.5 rounded-full border border-red-200">Дедлайн просрочен</span>
                        </div>
                        <p className="text-xs text-red-500 font-medium">Срок сдачи {p.deadline}. Требуется пересмотр плана.</p>
                      </div>
                    ))}
                    {overdue.map((t) => (
                      <div key={t.id} className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-slate-800">Задача: {t.title}</p>
                          <span className="text-[10px] font-black uppercase tracking-wide text-amber-600 bg-white px-2 py-0.5 rounded-full border border-amber-200">Просрочено</span>
                        </div>
                        <p className="text-xs text-amber-600 font-medium">Срок был {t.dueDate}. Требуется проверка статуса.</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
                  <Target size={12} /> Топ приоритеты на сегодня
                </p>
                {priorities.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Нет активных задач — отличный повод спланировать новые.</p>
                ) : (
                  <div className="space-y-2">
                    {priorities.map((t) => (
                      <div key={t.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{t.title}</p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">{t.relatedToName || t.relatedToType || 'Общее'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-3 text-[10px] font-bold text-slate-400">
                          {t.dueDate && (<><Clock size={11} /><span>{t.dueDate}</span></>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-5 border-t border-slate-100">
              <button
                onClick={() => { dismiss(); router.push('/management/journal'); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                <BookOpen size={14} /> Открыть журнал
              </button>
              <button
                onClick={dismiss}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-proji-primary text-white text-sm font-bold rounded-xl hover:bg-proji-primary/90 transition-colors"
              >
                Понятно, к работе 🚀
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
