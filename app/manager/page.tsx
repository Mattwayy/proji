'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, AlertTriangle, StickyNote, Archive,
  FileSpreadsheet, FileText, ChevronLeft, X, Plus,
  CheckCheck, XCircle, AlertCircle, BookmarkPlus,
  Trash2, Layers, Send, ChevronDown,
} from 'lucide-react';
import {
  EMPLOYEES, INBOX_ITEMS,
  type InboxItem, type InboxFile, type InboxStatus, type InboxPriority,
} from '../../src/data/managerData';

/* ─── types ─── */
type Dir    = 'tasks' | 'events' | 'notes' | 'archive';
type SortBy = 'date' | 'employee' | 'project';

/* ─── static config ─── */
const DIRS: { id: Dir; label: string; icon: React.ReactNode; color: string; ring: string; bg: string }[] = [
  { id: 'tasks',   label: 'Задачи',  icon: <CheckCircle2 size={15} />,  color: 'text-blue-600',   ring: 'border-blue-200',   bg: 'bg-blue-50'   },
  { id: 'events',  label: 'Ивенты',  icon: <AlertTriangle size={15} />, color: 'text-amber-600',  ring: 'border-amber-200',  bg: 'bg-amber-50'  },
  { id: 'notes',   label: 'Заметки', icon: <StickyNote size={15} />,    color: 'text-violet-600', ring: 'border-violet-200', bg: 'bg-violet-50' },
  { id: 'archive', label: 'Архив',   icon: <Archive size={15} />,       color: 'text-slate-400',  ring: 'border-slate-200',  bg: 'bg-slate-50'  },
];

const STATUS_LABEL: Record<InboxStatus, string> = {
  new:           'Новое',
  accepted:      'Принято',
  rejected:      'Отклонено',
  needs_changes: 'Поправки',
  archived:      'Архив',
};
const STATUS_CLS: Record<InboxStatus, string> = {
  new:           'bg-sky-50 text-sky-700 border-sky-200',
  accepted:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:      'bg-red-50 text-red-700 border-red-200',
  needs_changes: 'bg-amber-50 text-amber-700 border-amber-200',
  archived:      'bg-slate-100 text-slate-500 border-slate-200',
};
const PRIO_DOT: Record<InboxPriority, string> = {
  high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-slate-300',
};
const PRIO_LABEL: Record<InboxPriority, string> = {
  high: 'Высокий', medium: 'Средний', low: 'Низкий',
};

/* ─── helpers ─── */
const empById = (id: string) => EMPLOYEES.find(e => e.id === id) ?? EMPLOYEES[0];
const fmtDt   = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtD    = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

/* ─── save to notes localStorage (same key as /notes page) ─── */
function pushNote(title: string, body: string) {
  try {
    const key = 'proji_notes';
    const list = JSON.parse(localStorage.getItem(key) ?? '[]');
    list.unshift({ id: crypto.randomUUID(), title, body, color: 'yellow', createdAt: Date.now(), updatedAt: Date.now() });
    localStorage.setItem(key, JSON.stringify(list));
  } catch { /* ssr guard */ }
}

/* ═══════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
export default function ManagerPage() {
  const [items,      setItems]      = useState<InboxItem[]>(INBOX_ITEMS);
  const [dir,        setDir]        = useState<Dir>('tasks');
  const [selId,      setSelId]      = useState<string | null>(null);
  const [mobile,     setMobile]     = useState<'list' | 'detail'>('list');
  const [sortBy,     setSortBy]     = useState<SortBy>('date');
  const [filterEmp,  setFilterEmp]  = useState('all');
  const [showSort,   setShowSort]   = useState(false);

  /* multi-select for entity builder */
  const [picking,    setPicking]    = useState(false);
  const [picks,      setPicks]      = useState<Set<string>>(new Set());

  /* task-from-event modal */
  const [evModal,    setEvModal]    = useState(false);
  const [evSrcId,    setEvSrcId]    = useState<string | null>(null);
  const [evTitle,    setEvTitle]    = useState('');
  const [evBody,     setEvBody]     = useState('');
  const [evAssign,   setEvAssign]   = useState('self');
  const [evPrio,     setEvPrio]     = useState<InboxPriority>('high');
  const [evDeadline, setEvDeadline] = useState('');

  /* entity-builder modal */
  const [ebOpen,     setEbOpen]     = useState(false);
  const [ebType,     setEbType]     = useState<'task' | 'note' | 'event'>('note');
  const [ebTitle,    setEbTitle]    = useState('');
  const [ebBody,     setEbBody]     = useState('');
  const [ebAssign,   setEbAssign]   = useState('self');
  const [ebPrio,     setEbPrio]     = useState<InboxPriority>('medium');

  /* ── load items from localStorage on mount ── */
  useEffect(() => {
    try {
      const saved: InboxItem[] = JSON.parse(localStorage.getItem('proji_manager_inbox') ?? '[]');
      if (saved.length > 0) {
        setItems(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const incoming = saved.filter(i => !existingIds.has(i.id));
          return incoming.length > 0 ? [...incoming, ...prev] : prev;
        });
      }
    } catch { /* ssr guard */ }
  }, []);

  /* ── derived ── */
  const selItem = selId ? items.find(i => i.id === selId) ?? null : null;

  const counts = useMemo<Record<Dir, number>>(() => ({
    tasks:   items.filter(i => i.type === 'task'  && i.status !== 'archived').length,
    events:  items.filter(i => i.type === 'event' && i.status !== 'archived').length,
    notes:   items.filter(i => i.type === 'note'  && i.status !== 'archived').length,
    archive: items.filter(i => i.status === 'archived').length,
  }), [items]);

  const list = useMemo(() => {
    let rows = items.filter(i => {
      if (dir === 'archive') return i.status === 'archived';
      const t = dir === 'tasks' ? 'task' : dir === 'events' ? 'event' : 'note';
      return i.type === t && i.status !== 'archived';
    });
    if (filterEmp !== 'all') rows = rows.filter(i => i.fromId === filterEmp);
    rows = [...rows].sort((a, b) => {
      if (sortBy === 'date')     return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
      if (sortBy === 'employee') return empById(a.fromId).name.localeCompare(empById(b.fromId).name, 'ru');
      if (sortBy === 'project')  return (a.project ?? '').localeCompare(b.project ?? '', 'ru');
      return 0;
    });
    return rows;
  }, [items, dir, filterEmp, sortBy]);

  /* ── mutations ── */
  const setStatus = (id: string, s: InboxStatus) => {
    setItems(p => p.map(i => i.id === id ? { ...i, status: s } : i));
    if (s === 'archived') closeDetail();
  };
  const remove   = (id: string) => { setItems(p => p.filter(i => i.id !== id)); closeDetail(); };
  const closeDetail = () => { setSelId(null); setMobile('list'); };

  const changeDir = (d: Dir) => {
    setDir(d); setSelId(null); setMobile('list');
    setPicking(false); setPicks(new Set());
  };

  const openItem = (item: InboxItem) => {
    if (picking) {
      setPicks(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; });
    } else {
      setSelId(item.id); setMobile('detail');
    }
  };

  /* save event/note → notes page */
  const saveToNotes = (item: InboxItem) => {
    pushNote(item.title, item.body);
    setStatus(item.id, 'archived');
  };

  /* open event → task modal */
  const openEvModal = (item: InboxItem) => {
    setEvSrcId(item.id);
    setEvTitle(`Устранить: ${item.title}`);
    setEvBody(item.body);
    setEvAssign('self'); setEvPrio('high'); setEvDeadline('');
    setEvModal(true);
  };
  const submitEvModal = () => {
    if (!evTitle.trim()) return;
    if (evSrcId) setStatus(evSrcId, 'archived');
    setEvModal(false); closeDetail();
  };

  /* open entity builder */
  const openEB = () => {
    const src = items.filter(i => picks.has(i.id));
    setEbTitle(src.map(i => i.title).join(' / '));
    setEbBody(src.map(i => `## ${i.title}\n\n${i.body}`).join('\n\n---\n\n'));
    setEbType('note'); setEbAssign('self'); setEbPrio('medium');
    setEbOpen(true);
  };
  const submitEB = () => {
    if (!ebTitle.trim()) return;
    if (ebType === 'note') pushNote(ebTitle, ebBody);
    setItems(p => p.map(i => picks.has(i.id) ? { ...i, status: 'archived' } : i));
    setPicks(new Set()); setPicking(false);
    setEbOpen(false); closeDetail();
  };

  const dirCfg = DIRS.find(d => d.id === dir)!;

  /* ═════════════════════════════ RENDER ═════════════════════════════ */
  return (
    <div className="flex h-full overflow-hidden bg-[#f5f7fc]">

      {/* ══ LEFT DIRECTORY NAV (desktop) ══ */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 bg-white border-r border-slate-200">
        <div className="px-4 pt-5 pb-4 border-b border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Менеджер</p>
          <h1 className="text-base font-black text-slate-800 mt-0.5">Входящие</h1>
        </div>

        {/* directories */}
        <nav className="px-2 pt-3 space-y-0.5">
          {DIRS.map(d => (
            <button
              key={d.id}
              onClick={() => changeDir(d.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                dir === d.id
                  ? `${d.bg} ${d.ring} ${d.color}`
                  : 'border-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={dir === d.id ? d.color : 'text-slate-400'}>{d.icon}</span>
              <span className="flex-1 text-left">{d.label}</span>
              {counts[d.id] > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${dir === d.id ? 'bg-white/60' : 'bg-slate-100'}`}>
                  {counts[d.id]}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* employee filter */}
        <div className="mt-auto px-3 pb-4 border-t border-slate-100 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">Сотрудник</p>
          <div className="space-y-0.5">
            {[{ id: 'all', label: 'Все' }, ...EMPLOYEES.map(e => ({ id: e.id, label: e.name.split(' ')[0] + ' ' + e.name.split(' ')[1]?.[0] + '.' }))].map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilterEmp(opt.id)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  filterEmp === opt.id ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* mobile dir tabs */}
        <div className="md:hidden flex gap-1 px-3 pt-3 pb-2 bg-white border-b border-slate-200 overflow-x-auto shrink-0">
          {DIRS.map(d => (
            <button
              key={d.id}
              onClick={() => changeDir(d.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                dir === d.id ? `${d.bg} ${d.ring} ${d.color}` : 'border-transparent text-slate-400'
              }`}
            >
              {d.icon} {d.label} {counts[d.id] > 0 && counts[d.id]}
            </button>
          ))}
        </div>

        {/* list + detail row */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── list column ── */}
          <div className={`flex flex-col overflow-hidden ${mobile === 'detail' ? 'hidden md:flex' : 'flex'} ${selItem ? 'w-full md:w-80 lg:w-96 md:flex-none' : 'flex-1'}`}>

            {/* list header */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`font-black text-sm flex-1 ${dirCfg.color}`}>{dirCfg.label}</span>

                {/* sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSort(v => !v)}
                    className="flex items-center gap-1 text-xs text-slate-500 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {sortBy === 'date' ? 'По дате' : sortBy === 'employee' ? 'По сотруднику' : 'По проекту'}
                    <ChevronDown size={11} className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showSort && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-9 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[140px]"
                      >
                        {(['date', 'employee', 'project'] as SortBy[]).map(s => (
                          <button key={s} onClick={() => { setSortBy(s); setShowSort(false); }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors ${sortBy === s ? 'text-slate-800 font-bold bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                            {s === 'date' ? 'По дате' : s === 'employee' ? 'По сотруднику' : 'По проекту'}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* select mode */}
                {dir !== 'archive' && (
                  picking ? (
                    <button onClick={() => { setPicking(false); setPicks(new Set()); }}
                      className="text-xs text-slate-500 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      Отмена
                    </button>
                  ) : (
                    <button onClick={() => setPicking(true)}
                      className="flex items-center gap-1 text-xs text-slate-500 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <Layers size={11} /> Выбрать
                    </button>
                  )
                )}
              </div>
            </div>

            {/* cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2 py-16">
                  <Archive size={36} strokeWidth={1.5} />
                  <p className="text-sm">Пусто</p>
                </div>
              ) : list.map(item => {
                const e = empById(item.fromId);
                const isActive  = selId === item.id;
                const isChecked = picks.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => openItem(item)}
                    className={`cursor-pointer flex items-start gap-3 p-3.5 rounded-2xl border transition-all select-none ${
                      isActive   ? 'bg-blue-50 border-blue-200 shadow-sm' :
                      isChecked  ? 'bg-violet-50 border-violet-300' :
                      'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* checkbox */}
                    {picking && (
                      <div className={`w-4 h-4 rounded-md border-2 shrink-0 mt-1 flex items-center justify-center ${
                        isChecked ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
                      }`}>
                        {isChecked && <CheckCheck size={9} className="text-white" />}
                      </div>
                    )}
                    {/* priority dot */}
                    {!picking && item.priority && (
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${PRIO_DOT[item.priority]}`} />
                    )}
                    {/* avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${e.bgClass} ${e.colorClass}`}>
                      {e.initials}
                    </div>
                    {/* text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${STATUS_CLS[item.status]}`}>
                          {STATUS_LABEL[item.status]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-1">{e.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.body}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {item.project && <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{item.project}</span>}
                        {item.files?.length ? <span className="text-[10px] text-slate-400 flex items-center gap-1"><FileSpreadsheet size={9} /> {item.files.length} файл{item.files.length > 1 ? 'а' : ''}</span> : null}
                        <span className="text-[10px] text-slate-300 ml-auto">{fmtD(item.sentAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* select bar */}
            <AnimatePresence>
              {picking && picks.size > 0 && (
                <motion.div
                  initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
                  className="bg-slate-800 text-white px-4 py-3 flex items-center gap-3 shrink-0"
                >
                  <span className="text-sm font-bold flex-1">Выбрано: {picks.size}</span>
                  <button onClick={openEB}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                    <Layers size={13} /> Создать сущность
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── detail panel ── */}
          <AnimatePresence>
            {selItem && (
              <motion.div
                key={selItem.id}
                initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                className={`bg-white border-l border-slate-200 flex flex-col overflow-hidden ${
                  mobile === 'detail'
                    ? 'fixed inset-0 z-[200] md:relative md:inset-auto md:flex-1'
                    : 'flex-1'
                }`}
              >
                {/* detail header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 shrink-0">
                  <button onClick={closeDetail} className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs font-bold text-slate-500 flex-1">Детали</span>
                  <button onClick={closeDetail} className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {/* detail body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {/* type + status + priority */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {selItem.type === 'task'  && <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200"><CheckCircle2 size={12} /> Задача</span>}
                    {selItem.type === 'event' && <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"><AlertTriangle size={12} /> Инцидент</span>}
                    {selItem.type === 'note'  && <span className="flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200"><StickyNote size={12} /> Заметка</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CLS[selItem.status]}`}>{STATUS_LABEL[selItem.status]}</span>
                    {selItem.priority && <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><div className={`w-2 h-2 rounded-full ${PRIO_DOT[selItem.priority]}`} />{PRIO_LABEL[selItem.priority]}</span>}
                  </div>

                  <h2 className="text-base font-black text-slate-800 leading-snug">{selItem.title}</h2>

                  {/* from */}
                  {(() => { const e = empById(selItem.fromId); return (
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${e.bgClass} ${e.colorClass}`}>{e.initials}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700">{e.name}</p>
                        <p className="text-[10px] text-slate-400">{e.role} · {fmtDt(selItem.sentAt)}</p>
                      </div>
                      {selItem.project && <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full whitespace-nowrap">{selItem.project}</span>}
                    </div>
                  ); })()}

                  {/* body */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selItem.body}</p>
                  </div>

                  {/* files */}
                  {selItem.files && selItem.files.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Вложения</p>
                      <div className="space-y-2">
                        {selItem.files.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                            {f.type === 'excel' ? <FileSpreadsheet size={13} className="text-emerald-600 shrink-0" /> : <FileText size={13} className="text-blue-600 shrink-0" />}
                            <span className="text-xs text-slate-600 truncate flex-1">{f.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{f.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* actions footer */}
                <div className="px-5 py-4 border-t border-slate-200 shrink-0 space-y-2">

                  {/* TASK */}
                  {selItem.type === 'task' && selItem.status !== 'archived' && <>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setStatus(selItem.id, 'accepted')} disabled={selItem.status === 'accepted'}
                        className={`flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${selItem.status === 'accepted' ? 'opacity-50 ' : ''}bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100`}>
                        <CheckCheck size={13} /> Принять
                      </button>
                      <button onClick={() => setStatus(selItem.id, 'needs_changes')} disabled={selItem.status === 'needs_changes'}
                        className={`flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${selItem.status === 'needs_changes' ? 'opacity-50 ' : ''}bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100`}>
                        <AlertCircle size={13} /> Поправки
                      </button>
                      <button onClick={() => setStatus(selItem.id, 'rejected')} disabled={selItem.status === 'rejected'}
                        className={`flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${selItem.status === 'rejected' ? 'opacity-50 ' : ''}bg-red-50 border-red-200 text-red-600 hover:bg-red-100`}>
                        <XCircle size={13} /> Отклонить
                      </button>
                    </div>
                    {['accepted','rejected','needs_changes'].includes(selItem.status) && (
                      <button onClick={() => setStatus(selItem.id, 'archived')}
                        className="w-full py-2 text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl hover:border-slate-300 hover:text-slate-600 transition-colors">
                        Отправить в архив
                      </button>
                    )}
                  </>}

                  {/* EVENT */}
                  {selItem.type === 'event' && selItem.status !== 'archived' && (
                    <div className="flex gap-2">
                      <button onClick={() => saveToNotes(selItem)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors active:scale-95">
                        <BookmarkPlus size={13} /> В заметки
                      </button>
                      <button onClick={() => openEvModal(selItem)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors active:scale-95">
                        <CheckCircle2 size={13} /> В задачу
                      </button>
                      <button onClick={() => setStatus(selItem.id, 'archived')} title="В архив"
                        className="w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                        <Archive size={13} />
                      </button>
                    </div>
                  )}

                  {/* NOTE */}
                  {selItem.type === 'note' && selItem.status !== 'archived' && (
                    <div className="flex gap-2">
                      <button onClick={() => saveToNotes(selItem)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors active:scale-95">
                        <BookmarkPlus size={13} /> Сохранить в заметки
                      </button>
                      <button onClick={() => remove(selItem.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors active:scale-95">
                        <Trash2 size={13} /> Удалить
                      </button>
                    </div>
                  )}

                  {/* ARCHIVED */}
                  {selItem.status === 'archived' && (
                    <div className="text-center py-1">
                      <p className="text-xs text-slate-400 mb-2">Элемент в архиве</p>
                      <button onClick={() => remove(selItem.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                        Удалить навсегда
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* empty detail placeholder (desktop) */}
          {!selItem && (
            <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3 text-slate-200">
              <Archive size={40} strokeWidth={1.5} />
              <p className="text-sm">Выберите элемент</p>
            </div>
          )}
        </div>
      </div>

      {/* ══ EVENT → TASK MODAL ══ */}
      <AnimatePresence>
        {evModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[400] bg-black/30 backdrop-blur-sm" onClick={() => setEvModal(false)} />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="fixed inset-0 z-[401] flex items-end md:items-center justify-center p-0 md:p-6"
              onClick={e => e.stopPropagation()}>
              <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl">
                <div className="md:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Создать задачу из инцидента</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Назначить исполнителя и поставить задачу</p>
                  </div>
                  <button onClick={() => setEvModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><X size={14} /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Название</label>
                    <input value={evTitle} onChange={e => setEvTitle(e.target.value)}
                      className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-400 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Описание</label>
                    <textarea value={evBody} onChange={e => setEvBody(e.target.value)} rows={3}
                      className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-400 resize-none leading-relaxed transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Исполнитель</label>
                    <select value={evAssign} onChange={e => setEvAssign(e.target.value)}
                      className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-blue-400 transition-colors">
                      <option value="self">Себе (руководитель)</option>
                      {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Приоритет</label>
                      <div className="flex gap-1.5 mt-1.5">
                        {(['low','medium','high'] as InboxPriority[]).map(p => (
                          <button key={p} onClick={() => setEvPrio(p)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                              evPrio === p
                                ? p === 'high' ? 'bg-red-50 border-red-300 text-red-700' : p === 'medium' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-100 border-slate-300 text-slate-600'
                                : 'border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}>
                            {PRIO_LABEL[p].slice(0,5)}.
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Дедлайн <span className="normal-case font-normal text-slate-400">опц.</span></label>
                      <input type="date" value={evDeadline} onChange={e => setEvDeadline(e.target.value)}
                        className="mt-1.5 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-400 transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                  <button onClick={() => setEvModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Отмена</button>
                  <button onClick={submitEvModal} disabled={!evTitle.trim()}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-30 transition-colors">
                    <Send size={12} /> Создать и назначить
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ ENTITY BUILDER MODAL ══ */}
      <AnimatePresence>
        {ebOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[400] bg-black/30 backdrop-blur-sm" onClick={() => setEbOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="fixed inset-0 z-[401] flex items-end md:items-center justify-center p-0 md:p-6"
              onClick={e => e.stopPropagation()}>
              <div className="bg-white w-full md:max-w-xl rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col">
                <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Создать сущность</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">На основе {picks.size} элем.</p>
                  </div>
                  <button onClick={() => setEbOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><X size={14} /></button>
                </div>
                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                  {/* type toggle */}
                  <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                    {(['task','note','event'] as const).map(t => (
                      <button key={t} onClick={() => setEbType(t)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${ebType === t ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                        {t === 'task' && <><CheckCircle2 size={12} className="text-blue-500" /> Задача</>}
                        {t === 'note' && <><StickyNote size={12} className="text-violet-500" /> Заметка</>}
                        {t === 'event' && <><AlertTriangle size={12} className="text-amber-500" /> Ивент</>}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Название</label>
                    <input value={ebTitle} onChange={e => setEbTitle(e.target.value)}
                      className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-400 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Содержание</label>
                    <textarea value={ebBody} onChange={e => setEbBody(e.target.value)} rows={6}
                      className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-400 resize-none leading-relaxed transition-colors" />
                  </div>
                  {ebType === 'task' && <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Исполнитель</label>
                      <select value={ebAssign} onChange={e => setEbAssign(e.target.value)}
                        className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-blue-400 transition-colors">
                        <option value="self">Себе (руководитель)</option>
                        {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Приоритет</label>
                      <div className="flex gap-2 mt-1.5">
                        {(['low','medium','high'] as InboxPriority[]).map(p => (
                          <button key={p} onClick={() => setEbPrio(p)}
                            className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                              ebPrio === p
                                ? p === 'high' ? 'bg-red-50 border-red-300 text-red-700' : p === 'medium' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-100 border-slate-300 text-slate-600'
                                : 'border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}>
                            {PRIO_LABEL[p]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>}
                </div>
                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 shrink-0">
                  <button onClick={() => setEbOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Отмена</button>
                  <button onClick={submitEB} disabled={!ebTitle.trim()}
                    className="flex items-center gap-1.5 px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 disabled:opacity-30 transition-colors">
                    <Plus size={13} /> Создать
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
