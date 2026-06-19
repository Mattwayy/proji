'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, X, AlertTriangle, ArrowRight, Target, BookOpen, Clock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const STORAGE_KEY = 'proji_briefing_last_shown';
const AUTH_ROUTES = ['/login'];

function formatToday() {
  return new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function MorningBriefing() {
  const router = useRouter();
  const pathname = usePathname();
  const { allTasks, projects } = useAppStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) return;
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (lastShown !== today) setOpen(true);
  }, [pathname]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toDateString());
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
                  <h2 className="text-lg font-black text-slate-900">Утренний брифинг</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Доброе утро! Сегодня {formatToday()}.</p>
                </div>
              </div>
              <button onClick={dismiss} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
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
                Понятно, к работе <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
