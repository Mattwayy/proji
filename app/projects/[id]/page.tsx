'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Folder, BarChart3, CheckCircle2, FileText, Calendar, Users, ChevronDown, Trophy, X, Send } from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';
import { useAppStore } from '../../../src/store/useAppStore';
import { useModalClose } from '../../../src/hooks/useModalClose';
import type { Project } from '../../../src/types';
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT, STATUS_OPTIONS } from '../../../src/utils/projectStatus';

type ProjectTaskStatus = 'new' | 'accepted' | 'review' | 'declined' | 'completed';
interface ProjectTask { id: string; status: ProjectTaskStatus }

const TASKS_KEY = (id: string) => `proji_ptasks_${id}`;

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { projects, setProjects } = useAppStore();
  const project = projects.find((p) => p.id === id);

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [completionPrompt, setCompletionPrompt] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const [requireNote, setRequireNote] = useState(false);
  const dismissedCompletion = useRef(false);

  const patchProject = (patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  useEffect(() => {
    if (!project || typeof window === 'undefined') return;
    let tasks: ProjectTask[] = [];
    try { tasks = JSON.parse(localStorage.getItem(TASKS_KEY(id)) || '[]'); } catch {}
    if (!tasks.length) return;

    const inWork = tasks.some((t) => t.status === 'accepted' || t.status === 'review');
    if (inWork && project.status === 'Planning') {
      patchProject({ status: 'In Progress' });
    }

    const allDone = tasks.every((t) => t.status === 'completed' || t.status === 'declined') && tasks.some((t) => t.status === 'completed');
    if (allDone && project.status !== 'Completed' && !dismissedCompletion.current) {
      setCompletionPrompt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, project?.status]);

  useModalClose(() => setStatusMenuOpen(false), statusMenuOpen);
  useModalClose(() => closeCompletionPrompt(), completionPrompt);

  const closeCompletionPrompt = () => {
    dismissedCompletion.current = true;
    setCompletionPrompt(false);
  };

  const confirmCompletion = () => {
    if (requireNote && !completionNote.trim()) return;
    patchProject({ status: 'Completed', completionNote: completionNote.trim() || undefined, requireReportToComplete: requireNote });
    setCompletionPrompt(false);
    setCompletionNote('');
  };

  if (!project) {
    return (
      <PageWrapper>
        <div className="p-12 text-center">
          <p className="text-slate-400 mb-4">Проект не найден</p>
          <button onClick={() => router.push('/projects')} className="text-proji-primary text-sm font-bold hover:underline">
            ← К проектам
          </button>
        </div>
      </PageWrapper>
    );
  }

  const sections = [
    { label: 'Задачи',   href: `/projects/${id}/tasks`,   icon: CheckCircle2, desc: `${project.tasks?.length ?? 0} задач` },
    { label: 'Отчеты',   href: `/projects/${id}/reports`, icon: BarChart3,    desc: 'Ежедневный отчёт' },
    { label: 'Документы', href: `/projects/${id}/docs`,   icon: FileText,     desc: `${project.reports?.length ?? 0} файлов` },
  ];

  const info = [
    { label: 'Старт',   value: project.startDate || '—',  href: `/projects/${id}/reports`, icon: <Calendar size={14} className="text-proji-primary" /> },
    { label: 'Дедлайн', value: project.deadline || 'Не задан', href: `/projects/${id}/reports`, icon: <Calendar size={14} className="text-orange-400" /> },
    { label: 'Команда', value: project.team?.length ? `${project.team.length} чел.` : '—', href: `/projects/${id}/team`, icon: <Users size={14} className="text-purple-400" /> },
  ];

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto w-full px-4 md:px-10 pb-16">

        {/* Back */}
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-6 mt-1"
        >
          <ChevronLeft size={14} /> Все проекты
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="p-3 rounded-2xl bg-proji-primary/10 shrink-0">
            <Folder size={22} className="text-proji-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900">{project.name}</h1>

              {/* Status badge — clickable, color-coded */}
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen((v) => !v)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80 ${STATUS_COLORS[project.status] ?? 'bg-slate-100 text-slate-500'}`}
                >
                  {STATUS_LABELS[project.status] ?? project.status}
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {statusMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 top-full left-0 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-lg p-1.5 min-w-[170px]"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { patchProject({ status: opt }); setStatusMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[opt]}`} />
                          {STATUS_LABELS[opt]}
                          {project.status === opt && <CheckCircle2 size={12} className="ml-auto text-proji-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Goal achieved — independent of status */}
              <button
                onClick={() => patchProject({ goalAchieved: !project.goalAchieved })}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80 ${
                  project.goalAchieved ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Trophy size={11} />
                {project.goalAchieved ? 'Цель достигнута' : 'Цель не достигнута'}
              </button>
            </div>
            {project.description && (
              <p className="text-sm text-slate-500 mt-1">{project.description}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Прогресс</span>
            <span className="font-bold text-slate-800">{project.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-proji-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Section cards (navigation) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {sections.map(({ label, href, icon: Icon, desc }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex flex-col gap-3 bg-white border border-slate-100 rounded-2xl p-5 hover:border-proji-primary/30 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-proji-primary/10 flex items-center justify-center">
                <Icon size={18} className="text-proji-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 group-hover:text-proji-primary transition-colors">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Info grid — clickable, each leads to a project-scoped page */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {info.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="bg-white rounded-2xl border border-slate-100 p-4 text-left hover:border-proji-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                {item.icon}{item.label}
              </div>
              <p className="text-base font-black text-slate-800">{item.value}</p>
            </button>
          ))}
        </div>

      </div>

      {/* Completion confirmation dialog */}
      <AnimatePresence>
        {completionPrompt && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeCompletionPrompt}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6"
            >
              <button onClick={closeCompletionPrompt}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                <X size={15} />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={18} className="text-green-500" />
                <h3 className="text-base font-black text-slate-900">Все задачи выполнены</h3>
              </div>
              <p className="text-sm text-slate-500 mb-5">Завершить проект «{project.name}»?</p>

              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                placeholder="Комментарий / отчёт о завершении (необязательно)..."
                rows={3}
                className="w-full text-sm text-slate-800 placeholder:text-slate-300 outline-none resize-none border border-slate-200 rounded-2xl px-4 py-3 leading-relaxed focus:border-proji-primary transition-colors mb-3"
              />
              <label className="flex items-center gap-2 cursor-pointer mb-5">
                <input type="checkbox" checked={requireNote} onChange={(e) => setRequireNote(e.target.checked)}
                  className="accent-proji-primary w-4 h-4" />
                <span className="text-xs font-semibold text-slate-600">Сделать комментарий обязательным условием завершения</span>
              </label>

              <div className="flex gap-2">
                <button onClick={closeCompletionPrompt}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                  Не завершать
                </button>
                <button onClick={confirmCompletion} disabled={requireNote && !completionNote.trim()}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-40 transition-all">
                  <Send size={14} /> Завершить проект
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
