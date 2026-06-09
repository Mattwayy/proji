'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, CheckCircle2, Clock, X, Tag, Calendar, User,
  ChevronRight, Square, CheckSquare, AlertCircle, ArrowUp, Minus,
} from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useAppStore } from '../../src/store/useAppStore';
import { TaskCreateForm } from '../../src/components/TaskCreateForm';
import type { Task } from '../../src/types';
import type { TaskFormData } from '../../src/components/TaskCreateForm';

// ── helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_META = {
  high:   { label: 'Высокий', cls: 'bg-red-50 text-red-500 border-red-200',    icon: ArrowUp },
  medium: { label: 'Средний', cls: 'bg-amber-50 text-amber-500 border-amber-200', icon: Minus },
  low:    { label: 'Низкий',  cls: 'bg-slate-100 text-slate-400 border-slate-200', icon: ArrowUp },
};

const STATUS_META = {
  pending:   { label: 'В работе',  cls: 'bg-blue-50 text-blue-500' },
  completed: { label: 'Готово',    cls: 'bg-emerald-50 text-emerald-600' },
  cancelled: { label: 'Отменено', cls: 'bg-red-50 text-red-400' },
};

function fmtDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = d < today;
  const label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  return { label, isOverdue };
}

function checklistProgress(list: { text: string; done: boolean }[]) {
  if (!list.length) return null;
  const done = list.filter((i) => i.done).length;
  return { done, total: list.length };
}

// ── sub-components ────────────────────────────────────────────────────────────

function PriorityIcon({ priority }: { priority: Task['priority'] }) {
  const { icon: Icon, cls } = PRIORITY_META[priority];
  if (priority === 'low') return <Minus size={11} className="text-slate-400" />;
  return <Icon size={11} className={priority === 'high' ? 'text-red-500' : 'text-amber-500'} />;
}

function TaskCard({
  task,
  onSelect,
  onToggle,
  onDelete,
}: {
  task: Task;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const date = fmtDate(task.dueDate);
  const progress = checklistProgress(task.checklist);
  const pm = PRIORITY_META[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className={`group flex items-start gap-3 bg-white border rounded-2xl px-4 py-3.5 cursor-pointer hover:shadow-sm transition-all ${task.status === 'completed' ? 'opacity-60' : 'border-slate-200'}`}
      onClick={onSelect}
    >
      {/* checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.status === 'completed'
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 hover:border-proji-primary'
        }`}
      >
        {task.status === 'completed' && <CheckCircle2 size={12} />}
      </button>

      {/* main content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
        )}

        {/* meta row */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* priority badge */}
          <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${pm.cls}`}>
            <PriorityIcon priority={task.priority} />
            {pm.label}
          </span>

          {/* due date */}
          {date && (
            <span className={`flex items-center gap-1 text-[10px] font-semibold ${date.isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
              <Calendar size={10} />
              {date.label}
              {date.isOverdue && <AlertCircle size={10} />}
            </span>
          )}

          {/* assignee */}
          {task.assignee && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <User size={10} /> {task.assignee}
            </span>
          )}

          {/* checklist progress */}
          {progress && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <CheckSquare size={10} />
              {progress.done}/{progress.total}
            </span>
          )}

          {/* relatedTo */}
          {task.relatedToName && (
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
              {task.relatedToName}
            </span>
          )}

          {/* tags */}
          {task.tags?.map((tag) => (
            <span key={tag} className="text-[10px] text-proji-primary/70 bg-proji-primary/5 px-1.5 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="shrink-0 md:opacity-0 md:group-hover:opacity-100 p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all mt-0.5"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function TaskDetail({
  task,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onUpdate: (patch: Partial<Task>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    dueDate: task.dueDate ?? '',
    assignee: task.assignee ?? '',
    checklist: task.checklist.map((i) => i.text),
  });

  const handleSave = (data: TaskFormData) => {
    onUpdate({
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
      assignee: data.assignee || undefined,
      checklist: data.checklist.map((text) => ({ text, done: task.checklist.find((i) => i.text === text)?.done ?? false })),
    });
    setEditing(false);
  };

  const toggleCheckItem = (idx: number) => {
    const updated = task.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
    onUpdate({ checklist: updated });
  };

  const date = fmtDate(task.dueDate);
  const pm = PRIORITY_META[task.priority];
  const sm = STATUS_META[task.status];

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="fixed md:relative inset-0 md:inset-auto md:w-96 md:shrink-0 bg-white border-l border-slate-200 flex flex-col md:h-full shadow-xl z-[200] md:z-auto"
    >
      {/* header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 shrink-0">
        <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Задача</span>
        <div className="ml-auto flex items-center gap-1">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 text-xs font-bold text-proji-primary border border-proji-primary/30 rounded-lg hover:bg-proji-primary/5 transition-colors"
            >
              Редактировать
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {editing ? (
          <div className="p-5">
            <TaskCreateForm
              initialData={formData}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              submitLabel="Сохранить"
            />
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-5">
            {/* title + status toggle */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => onUpdate({ status: task.status === 'completed' ? 'pending' : 'completed' })}
                className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-proji-primary'
                }`}
              >
                {task.status === 'completed' && <CheckCircle2 size={12} />}
              </button>
              <h2 className={`text-base font-black text-slate-800 leading-snug ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h2>
            </div>

            {task.description && (
              <p className="text-sm text-slate-500 leading-relaxed">{task.description}</p>
            )}

            {/* meta */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-24 text-xs text-slate-400">Приоритет</span>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border ${pm.cls}`}>
                  <PriorityIcon priority={task.priority} /> {pm.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-24 text-xs text-slate-400">Статус</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${sm.cls}`}>{sm.label}</span>
              </div>
              {date && (
                <div className="flex items-center gap-2">
                  <span className="w-24 text-xs text-slate-400">Срок</span>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${date.isOverdue ? 'text-red-500' : 'text-slate-600'}`}>
                    <Calendar size={12} /> {date.label}
                    {date.isOverdue && <AlertCircle size={12} />}
                  </span>
                </div>
              )}
              {task.assignee && (
                <div className="flex items-center gap-2">
                  <span className="w-24 text-xs text-slate-400">Назначено</span>
                  <span className="flex items-center gap-1 text-xs text-slate-600"><User size={12} /> {task.assignee}</span>
                </div>
              )}
              {task.relatedToName && (
                <div className="flex items-center gap-2">
                  <span className="w-24 text-xs text-slate-400">Связано с</span>
                  <span className="text-xs text-slate-600">{task.relatedToType}: {task.relatedToName}</span>
                </div>
              )}
            </div>

            {/* checklist */}
            {task.checklist.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Чек-лист</span>
                  <span className="text-xs text-slate-400">
                    {task.checklist.filter((i) => i.done).length}/{task.checklist.length}
                  </span>
                </div>
                {/* progress bar */}
                <div className="h-1 bg-slate-100 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${(task.checklist.filter((i) => i.done).length / task.checklist.length) * 100}%` }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {task.checklist.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleCheckItem(idx)}
                      className="flex items-center gap-2.5 text-sm text-left group/item"
                    >
                      {item.done
                        ? <CheckSquare size={15} className="text-emerald-500 shrink-0" />
                        : <Square size={15} className="text-slate-300 group-hover/item:text-slate-400 shrink-0 transition-colors" />
                      }
                      <span className={item.done ? 'line-through text-slate-400' : 'text-slate-600'}>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs text-proji-primary/80 bg-proji-primary/5 px-2 py-0.5 rounded-lg">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="px-5 py-3 border-t border-slate-100 shrink-0 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          {new Date(task.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <button
          onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
        >
          <X size={12} /> Удалить
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Filter = 'all' | 'pending' | 'completed';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export default function TasksPage() {
  const { allTasks, setAllTasks } = useAppStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() =>
    allTasks.filter((t) => {
      if (filter !== 'all' && t.status !== filter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      return true;
    }),
    [allTasks, filter, priorityFilter],
  );

  const counts = useMemo(() => ({
    all: allTasks.length,
    pending: allTasks.filter((t) => t.status === 'pending').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
    overdue: allTasks.filter((t) => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date(new Date().toDateString());
    }).length,
  }), [allTasks]);

  const addTask = (data: TaskFormData) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      status: 'pending',
      priority: data.priority,
      dueDate: data.dueDate || undefined,
      assignee: data.assignee || undefined,
      checklist: data.checklist.map((text) => ({ text, done: false })),
      relatedToType: 'Общий',
      tags: [],
      createdAt: Date.now(),
    };
    setAllTasks((prev) => [task, ...prev]);
    setShowCreate(false);
  };

  const toggleStatus = (id: string) => {
    setAllTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t,
      ),
    );
    if (selectedTask?.id === id)
      setSelectedTask((t) => t ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t);
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    setAllTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...patch } : t));
    setSelectedTask((t) => t?.id === id ? { ...t, ...patch } : t);
  };

  const deleteTask = (id: string) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  return (
    <PageWrapper>
      <div className="flex h-full overflow-hidden">
        {/* ── Left: list ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-2 px-4 md:px-8 pt-4 md:pt-6 shrink-0">
            {[
              { label: 'Всего', value: counts.all, color: 'text-slate-700' },
              { label: 'В работе', value: counts.pending, color: 'text-blue-500' },
              { label: 'Готово', value: counts.completed, color: 'text-emerald-500' },
              { label: 'Просрочено', value: counts.overdue, color: 'text-red-500' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-3 md:p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1 truncate">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 md:px-8 pt-4 pb-3 shrink-0">
            {/* Status filters */}
            <div className="flex gap-1">
              {(['all', 'pending', 'completed'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-proji-primary text-white' : 'bg-white border border-slate-200 text-slate-500 hover:text-proji-primary'}`}
                >
                  {f === 'all' ? 'Все' : f === 'pending' ? 'В работе' : 'Готово'}
                </button>
              ))}
            </div>

            {/* Priority filters */}
            <div className="flex gap-1 ml-2">
              {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                    priorityFilter === p
                      ? p === 'all' ? 'bg-slate-800 text-white border-slate-800'
                        : p === 'high' ? 'bg-red-500 text-white border-red-500'
                        : p === 'medium' ? 'bg-amber-400 text-white border-amber-400'
                        : 'bg-slate-300 text-white border-slate-300'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {p === 'all' ? 'Любой' : p === 'high' ? 'Высокий' : p === 'medium' ? 'Средний' : 'Низкий'}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setShowCreate(true); setSelectedTask(null); }}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-proji-primary text-white rounded-xl text-xs font-bold hover:bg-proji-primary/90 transition-all shrink-0"
            >
              <Plus size={14} /> Новая задача
            </button>
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
            <div className="flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {filtered.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelect={() => { setSelectedTask(task); setShowCreate(false); }}
                    onToggle={() => toggleStatus(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <Clock size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Нет задач</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: detail / create panel ── */}
        <AnimatePresence>
          {showCreate && !selectedTask && (
            <motion.div
              key="create"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed md:relative inset-0 md:inset-auto md:w-96 md:shrink-0 bg-white border-l border-slate-200 flex flex-col md:h-full shadow-xl z-[200] md:z-auto"
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 shrink-0">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Новая задача</span>
                <button onClick={() => setShowCreate(false)} className="ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <TaskCreateForm
                  onSave={addTask}
                  onCancel={() => setShowCreate(false)}
                  submitLabel="Создать задачу"
                />
              </div>
            </motion.div>
          )}

          {selectedTask && (
            <TaskDetail
              key={selectedTask.id}
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdate={(patch) => updateTask(selectedTask.id, patch)}
              onDelete={() => deleteTask(selectedTask.id)}
            />
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
