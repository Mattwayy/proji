'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, Clock, X, ChevronDown } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useAppStore } from '../../src/store/useAppStore';
import type { Task } from '../../src/types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'В работе',
  completed: 'Завершено',
  cancelled: 'Отменено',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-proji-amber/10 text-proji-amber',
  completed: 'bg-proji-success/10 text-proji-success',
  cancelled: 'bg-red-100 text-red-500',
};

export default function TasksPage() {
  const { allTasks, setAllTasks } = useAppStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filtered = allTasks.filter((t) => filter === 'all' || t.status === filter);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      status: 'pending',
      relatedToType: 'Общий',
    };
    setAllTasks((prev) => [task, ...prev]);
    setNewTaskTitle('');
  };

  const toggleStatus = (id: string) => {
    setAllTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t)
    );
  };

  const deleteTask = (id: string) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const pending = allTasks.filter((t) => t.status === 'pending').length;
  const completed = allTasks.filter((t) => t.status === 'completed').length;

  return (
    <PageWrapper>
      <div className="px-4 md:px-12 pb-12 max-w-5xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
          {[
            { label: 'Всего', value: allTasks.length, color: 'text-proji-dark' },
            { label: 'В работе', value: pending, color: 'text-proji-amber' },
            { label: 'Завершено', value: completed, color: 'text-proji-success' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-proji-border p-3 md:p-4">
              <p className="text-[10px] md:text-xs font-bold text-proji-secondary uppercase tracking-wide mb-1 truncate">{s.label}</p>
              <p className={`text-2xl md:text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Add task */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Добавить задачу..."
            className="flex-1 min-w-0 px-4 py-3 rounded-2xl border border-proji-border bg-white text-sm text-proji-dark placeholder:text-proji-secondary focus:outline-none focus:border-proji-primary transition-colors"
          />
          <button
            onClick={addTask}
            disabled={!newTaskTitle.trim()}
            className="px-4 md:px-5 py-3 bg-proji-primary text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-proji-primary/90 disabled:opacity-40 transition-all shrink-0"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-proji-primary text-white' : 'bg-white border border-proji-border text-proji-secondary hover:text-proji-primary'}`}
            >
              {f === 'all' ? 'Все' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {filtered.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 md:gap-3 bg-white border border-proji-border rounded-2xl px-3 md:px-4 py-3 md:py-3.5 group"
              >
                <button
                  onClick={() => toggleStatus(task.id)}
                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-proji-success border-proji-success text-white'
                      : 'border-slate-300 hover:border-proji-primary'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle2 size={12} />}
                </button>

                <span className={`flex-1 min-w-0 text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-proji-secondary' : 'text-proji-dark'}`}>
                  {task.title}
                </span>

                {task.relatedToType && (
                  <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                    {task.relatedToType}
                  </span>
                )}

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${STATUS_COLORS[task.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {STATUS_LABELS[task.status] ?? task.status}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="shrink-0 md:opacity-0 md:group-hover:opacity-100 p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-proji-secondary text-sm">
              <Clock size={32} className="mx-auto mb-3 opacity-30" />
              <p>Нет задач</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
