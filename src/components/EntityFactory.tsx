'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Send, Mic, MicOff, StickyNote, CheckCircle2,
  CalendarClock, GripVertical, ChevronLeft, ChevronRight,
  RotateCcw, RefreshCw, Eye, Trash2, Save, PenLine, Loader2,
  ChevronDown, Pencil, RotateCw,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { mockAiParse } from '../data/entityFactoryMock';
import type { AiFragment, EntityType } from '../data/entityFactoryMock';

/* ─────────── types ─────────── */
type Assignments = Record<string, EntityType | null>;
type Phase = 'idle' | 'loading' | 'active' | 'confirmed';
type MobileTab = 'input' | 'results';

interface ConfirmedItem {
  id: string; text: string; type: EntityType; saved: boolean; rewriting: boolean;
}

const BINS: {
  type: EntityType; label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string; bg: string; border: string; chip: string;
}[] = [
  { type: 'note',  label: 'Заметки', icon: StickyNote,   color: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/50',  chip: 'bg-amber-500/20 text-amber-300'  },
  { type: 'task',  label: 'Задачи',  icon: CheckCircle2, color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/50',   chip: 'bg-blue-500/20 text-blue-300'   },
  { type: 'event', label: 'Ивенты', icon: CalendarClock, color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/50', chip: 'bg-violet-500/20 text-violet-300' },
];

/* ─────────── skeleton ─────────── */
function SkeletonCard({ delay, width }: { delay: number; width: number }) {
  return (
    <div className="px-3 py-3 rounded-xl border"
         style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        animate={{ opacity: [0.25, 0.6, 0.25] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <div className="h-2 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.13)', width: `${width}%` }} />
        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', width: `${Math.round(width * 0.55)}%` }} />
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   EntityFactory
════════════════════════════════════════════════ */
export function EntityFactory() {
  const { showEntityFactory, setShowEntityFactory, setAllTasks } = useAppStore();

  const [phase, setPhase]               = useState<Phase>('idle');
  const [input, setInput]               = useState('');
  const [sentMessage, setSentMessage]   = useState('');
  const [isEditing, setIsEditing]       = useState(false);
  const [listening, setListening]       = useState(false);
  const [fragments, setFragments]       = useState<AiFragment[]>([]);

  const [history, setHistory] = useState<Assignments[]>([{}]);
  const [histIdx, setHistIdx] = useState(0);
  const assignments: Assignments = history[histIdx] ?? {};

  const [dragId, setDragId]   = useState<string | null>(null);
  const [overBin, setOverBin] = useState<EntityType | null>(null);

  const [confirmed, setConfirmed]     = useState<ConfirmedItem[]>([]);
  const [expandedBin, setExpandedBin] = useState<EntityType | null>(null);
  const [refreshing, setRefreshing]   = useState(false);

  /* mobile */
  const [mobileTab, setMobileTab]           = useState<MobileTab>('input');
  const [selectingFragId, setSelectingFragId] = useState<string | null>(null);
  const [isMobile, setIsMobile]             = useState(false);

  const recognitionRef = useRef<any>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  /* detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* reset on open */
  useEffect(() => {
    if (showEntityFactory) {
      setPhase('idle'); setInput(''); setSentMessage('');
      setIsEditing(false); setFragments([]);
      setHistory([{}]); setHistIdx(0);
      setConfirmed([]); setDragId(null);
      setOverBin(null); setExpandedBin(null);
      setMobileTab('input'); setSelectingFragId(null);
    }
  }, [showEntityFactory]);

  /* auto-focus */
  useEffect(() => {
    if (phase === 'idle' || isEditing) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [phase, isEditing]);

  /* ── assignment helpers ── */
  const pushAssignment = (next: Assignments) => {
    const h = history.slice(0, histIdx + 1);
    h.push(next);
    setHistory(h);
    setHistIdx(h.length - 1);
  };
  const assign   = (id: string, type: EntityType) => pushAssignment({ ...assignments, [id]: type });
  const unassign = (id: string) => pushAssignment({ ...assignments, [id]: null });
  const resetAll = () => pushAssignment({});
  const undo = () => { if (histIdx > 0) setHistIdx((i) => i - 1); };
  const redo = () => { if (histIdx < history.length - 1) setHistIdx((i) => i + 1); };

  /* ── voice ── */
  const toggleVoice = () => {
    const SR = typeof window !== 'undefined'
      ? (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
      : null;
    if (!SR) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = 'ru-RU'; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e: any) =>
      setInput(Array.from(e.results as any[]).map((r: any) => r[0].transcript).join(''));
    rec.onend = () => setListening(false);
    rec.start(); recognitionRef.current = rec; setListening(true);
  };

  /* ── send ── */
  const doSend = async (text: string) => {
    setSentMessage(text);
    setInput('');
    setIsEditing(false);
    setFragments([]);
    setHistory([{}]);
    setHistIdx(0);
    setSelectingFragId(null);
    setPhase('loading');
    if (isMobile) setMobileTab('results');

    const res = await mockAiParse(text);
    setFragments(res.fragments);
    setPhase('active');
  };

  const handleSend      = () => { const t = input.trim(); if (t && phase !== 'loading') doSend(t); };
  const handleResend    = () => doSend(sentMessage);
  const handleEdit      = () => { setInput(sentMessage); setIsEditing(true); if (isMobile) setMobileTab('input'); };
  const handleDeleteAll = () => {
    setSentMessage(''); setInput(''); setFragments([]);
    setHistory([{}]); setHistIdx(0);
    setPhase('idle');
    if (isMobile) setMobileTab('input');
  };

  /* ── confirm ── */
  const handleConfirm = () => {
    const items: ConfirmedItem[] = fragments
      .filter((f) => assignments[f.id])
      .map((f) => ({ id: f.id, text: f.text, type: assignments[f.id]!, saved: false, rewriting: false }));
    setConfirmed(items);
    setPhase('confirmed');
    setExpandedBin('task');
    const newTasks = items.filter((i) => i.type === 'task').map((i) => ({
      id: `ef-${Date.now()}-${i.id}`, title: i.text, status: 'pending' as const, relatedToType: 'Общий' as const,
    }));
    if (newTasks.length) setAllTasks((prev) => [...prev, ...newTasks]);
  };

  /* ── confirmed actions ── */
  const saveItem    = (id: string) => setConfirmed((c) => c.map((i) => i.id === id ? { ...i, saved: true } : i));
  const deleteItem  = (id: string) => setConfirmed((c) => c.filter((i) => i.id !== id));
  const rewriteItem = async (id: string) => {
    setConfirmed((c) => c.map((i) => i.id === id ? { ...i, rewriting: true } : i));
    await new Promise((r) => setTimeout(r, 1400));
    setConfirmed((c) => c.map((i) =>
      i.id === id ? { ...i, rewriting: false, text: i.text + ' (переработано AI)' } : i
    ));
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setConfirmed((c) => c.map((i) => ({ ...i, saved: false })));
    setRefreshing(false);
  };

  /* ── desktop drag ── */
  const onDragStart = (e: React.DragEvent, id: string) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; };
  const onDragEnd   = () => { setDragId(null); setOverBin(null); };
  const onDrop      = (e: React.DragEvent, type: EntityType) => {
    e.preventDefault();
    if (dragId) assign(dragId, type);
    setDragId(null); setOverBin(null);
  };

  const assignedCount = fragments.filter((f) => assignments[f.id]).length;
  const showInput     = phase === 'idle' || isEditing;

  if (!showEntityFactory) return null;

  /* ─────────────── RENDER ─────────────── */
  return (
    <div
      className="fixed inset-0 z-[600] flex items-end md:items-center justify-center"
      style={{ background: 'rgba(5,8,18,0.78)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowEntityFactory(false); }}
    >
      <style>{`.ef-scroll::-webkit-scrollbar{display:none}`}</style>

      <motion.div
        initial={isMobile ? { y: '100%' } : { scale: 0.93, opacity: 0, y: 28 }}
        animate={isMobile ? { y: 0 }      : { scale: 1, opacity: 1, y: 0 }}
        exit={isMobile   ? { y: '100%' }  : { scale: 0.93, opacity: 0, y: 28 }}
        transition={isMobile
          ? { type: 'spring', stiffness: 380, damping: 32 }
          : { type: 'spring', stiffness: 360, damping: 32 }
        }
        className="relative flex flex-col overflow-hidden shadow-2xl
                   w-full md:w-[80vw]
                   h-[92svh] md:h-[80vh]
                   rounded-t-3xl md:rounded-3xl"
        style={{
          maxWidth: 1440,
          background: '#0d1017',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── mobile drag handle ── */}
        <div className="md:hidden flex justify-center pt-3 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* ══════ HEADER ══════ */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-3.5 border-b shrink-0"
             style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <StickyNote size={14} className="text-amber-400" />
            </div>
            <span className="text-sm font-bold text-slate-200">Заметки</span>
            {phase === 'active' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold">
                {assignedCount}/{fragments.length} распределено
              </span>
            )}
            {phase === 'confirmed' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
                Подтверждено
              </span>
            )}
          </div>
          <button
            onClick={() => setShowEntityFactory(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ══════ MOBILE TABS ══════ */}
        <div className="md:hidden flex border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {(['input', 'results'] as MobileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2 ${
                mobileTab === tab
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-500 border-transparent'
              }`}
            >
              {tab === 'input' ? 'Сообщение' : 'Результаты'}
              {tab === 'results' && phase === 'active' && fragments.length > 0 && (
                <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                  {fragments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════ BODY ══════ */}
        <div className="flex flex-1 min-h-0">

          {/* ═══ LEFT / INPUT ═══ */}
          <div
            className={`flex flex-col min-h-0 md:border-r transition-all ${
              mobileTab === 'input'
                ? 'flex-1 md:flex-initial md:w-1/2'
                : 'hidden md:flex md:w-1/2'
            }`}
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <AnimatePresence mode="wait">
              {/* INPUT MODE — idle or editing */}
              {showInput ? (
                <motion.div key="input"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  {isEditing && (
                    <div className="px-4 md:px-5 pt-4 pb-0 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70">
                        Редактирование
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-h-0 px-4 md:px-5 pt-4 pb-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Опишите ситуацию, мысль или событие — AI разберёт на задачи, заметки и ивенты..."
                      className="w-full h-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none resize-none leading-relaxed"
                    />
                  </div>
                  <div className="px-4 py-3 border-t flex items-center justify-between shrink-0"
                       style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <button
                      onClick={toggleVoice}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        listening ? 'bg-red-500 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {listening ? <MicOff size={15} /> : <Mic size={15} />}
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={14} />
                      Отправить
                    </button>
                  </div>
                </motion.div>

              ) : (
                /* FIXED MODE — loading / active / confirmed */
                <motion.div key="fixed"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex flex-col flex-1 min-h-0 px-4 md:px-5 py-4 md:py-5"
                >
                  {/* Fixed message card */}
                  <div className="rounded-2xl p-4 mb-4 shrink-0"
                       style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{sentMessage}</p>
                  </div>

                  {phase === 'loading' && (
                    <div className="flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin text-blue-400 shrink-0" />
                      <span className="text-xs text-slate-500">Анализируем текст...</span>
                    </div>
                  )}

                  {(phase === 'active' || phase === 'confirmed') && (
                    <div className="flex flex-col gap-2">
                      <button onClick={handleEdit}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors text-left"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Pencil size={15} className="shrink-0 text-slate-500" />
                        Редактировать
                      </button>
                      <button onClick={handleResend}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors text-left"
                        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <RotateCw size={15} className="shrink-0" />
                        Отправить снова
                      </button>
                      <button onClick={handleDeleteAll}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition-colors text-left"
                        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.14)' }}>
                        <Trash2 size={15} className="shrink-0" />
                        Удалить всё
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ RIGHT / RESULTS ═══ */}
          <div
            className={`flex flex-col min-h-0 ${
              mobileTab === 'results'
                ? 'flex-1 md:flex-initial md:w-1/2'
                : 'hidden md:flex md:w-1/2'
            }`}
          >

            {/* ── ACTIVE / LOADING ── */}
            {(phase === 'active' || phase === 'loading') && (
              <div className="flex flex-col flex-1 min-h-0">

                {/* Header row */}
                <div className="flex items-center px-4 py-2.5 border-b shrink-0"
                     style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <span className="text-[11px] font-semibold text-slate-400 flex-1">
                    {phase === 'loading' ? 'Загружаем...' : `${fragments.length} фрагментов`}
                  </span>
                  {phase === 'active' && isMobile && selectingFragId && (
                    <span className="text-[10px] text-blue-400 font-semibold animate-pulse">
                      выберите папку ↓
                    </span>
                  )}
                  {phase === 'active' && isMobile && !selectingFragId && fragments.length > 0 && (
                    <span className="text-[10px] text-slate-600">нажмите фрагмент</span>
                  )}
                </div>

                {/* Fragments + Desktop Bins */}
                <div className="flex flex-1 min-h-0">

                  {/* Fragments list */}
                  <div className="flex flex-col flex-1 md:flex-[4] min-h-0">
                    <div className="ef-scroll flex-1 overflow-y-auto px-3 py-3 space-y-1.5 min-h-0"
                         style={{ scrollbarWidth: 'none' }}>

                      {/* skeleton */}
                      {phase === 'loading' && (
                        <>{[72, 55, 84, 48, 66, 42].map((w, i) => (
                          <SkeletonCard key={i} delay={i * 0.08} width={w} />
                        ))}</>
                      )}

                      {/* real fragments */}
                      {phase === 'active' && fragments.map((f) => {
                        const bin        = BINS.find((b) => b.type === assignments[f.id]);
                        const isDragging = dragId === f.id;
                        const isSelected = selectingFragId === f.id;

                        return (
                          <motion.div
                            key={f.id}
                            layout
                            /* desktop: drag; mobile: tap */
                            draggable={!isMobile}
                            onDragStart={!isMobile ? (e) => onDragStart(e as any, f.id) : undefined}
                            onDragEnd={!isMobile ? onDragEnd : undefined}
                            onClick={isMobile ? () => setSelectingFragId(isSelected ? null : f.id) : undefined}
                            className={`group flex flex-col px-3 py-2.5 rounded-xl border select-none transition-all ${
                              !isMobile ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer active:scale-[0.98]'
                            } ${
                              isDragging  ? 'opacity-30 scale-95' :
                              isSelected  ? 'border-blue-500/40' :
                              assignments[f.id] ? `${bin!.bg} ${bin!.border}` :
                              'border-white/8 hover:border-white/15'
                            }`}
                            style={
                              !assignments[f.id] && !isDragging && !isSelected
                                ? { background: 'rgba(255,255,255,0.03)' }
                                : isSelected
                                ? { background: 'rgba(59,130,246,0.07)' }
                                : {}
                            }
                          >
                            {/* main row */}
                            <div className="flex items-start gap-2">
                              {!isMobile && (
                                <GripVertical size={12} className="text-slate-600 group-hover:text-slate-500 shrink-0 mt-0.5 transition-colors" />
                              )}
                              <p className="flex-1 text-xs text-slate-300 leading-relaxed">{f.text}</p>
                              {assignments[f.id] && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); unassign(f.id); }}
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 hover:opacity-70 transition-opacity ${bin!.chip}`}
                                >
                                  {bin!.label} ×
                                </button>
                              )}
                            </div>

                            {/* Mobile inline bin picker */}
                            <AnimatePresence>
                              {isMobile && isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t"
                                       style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                    {BINS.map((b) => (
                                      <button
                                        key={b.type}
                                        onClick={(e) => { e.stopPropagation(); assign(f.id, b.type); setSelectingFragId(null); }}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${b.chip} ${
                                          assignments[f.id] === b.type ? 'ring-1 ring-white/20 scale-[1.02]' : ''
                                        }`}
                                      >
                                        <b.icon size={11} />
                                        {b.label}
                                      </button>
                                    ))}
                                    {assignments[f.id] && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); unassign(f.id); setSelectingFragId(null); }}
                                        className="px-3 py-2.5 rounded-xl text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 active:scale-95 transition-all"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop-only bins column (20%) */}
                  <div className="hidden md:flex flex-col border-l min-h-0"
                       style={{ flex: '1', borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="px-2 py-2.5 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Папки</span>
                    </div>
                    <div className="ef-scroll flex-1 flex flex-col gap-1.5 p-2 overflow-y-auto min-h-0"
                         style={{ scrollbarWidth: 'none' }}>
                      {BINS.map(({ type, label, icon: Icon, color, bg, border }) => {
                        const count  = fragments.filter((f) => assignments[f.id] === type).length;
                        const isOver = overBin === type;
                        return (
                          <div
                            key={type}
                            onDragOver={(e) => { e.preventDefault(); setOverBin(type); }}
                            onDragLeave={() => setOverBin(null)}
                            onDrop={(e) => onDrop(e, type)}
                            className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 border-dashed transition-all duration-150 cursor-pointer ${
                              isOver ? `${bg} ${border} scale-[1.04]` : 'border-white/10 hover:border-white/20'
                            }`}
                          >
                            <Icon size={14} className={isOver ? color : 'text-slate-600'} />
                            <span className={`text-[9px] font-bold text-center leading-tight ${isOver ? color : 'text-slate-500'}`}>
                              {label}
                            </span>
                            {count > 0 && (
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                type === 'note'  ? 'bg-amber-500/20 text-amber-400'
                              : type === 'task'  ? 'bg-blue-500/20 text-blue-400'
                              :                   'bg-violet-500/20 text-violet-400'
                              }`}>{count}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Mobile-only bins bar at bottom of results */}
                <div className="md:hidden border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="flex gap-2 px-3 py-3">
                    {BINS.map(({ type, label, icon: Icon, color, bg, border }) => {
                      const count    = fragments.filter((f) => assignments[f.id] === type).length;
                      const canDrop  = selectingFragId !== null;
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            if (selectingFragId) { assign(selectingFragId, type); setSelectingFragId(null); }
                          }}
                          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all active:scale-95 ${
                            canDrop
                              ? `${bg} ${border} shadow-sm`
                              : 'border-white/10'
                          }`}
                        >
                          <Icon size={16} className={canDrop ? color : 'text-slate-600'} />
                          <span className={`text-[10px] font-bold ${canDrop ? color : 'text-slate-500'}`}>{label}</span>
                          {count > 0 && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                              type === 'note'  ? 'bg-amber-500/20 text-amber-400'
                            : type === 'task'  ? 'bg-blue-500/20 text-blue-400'
                            :                   'bg-violet-500/20 text-violet-400'
                            }`}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── CONFIRMED: directory ── */}
            {phase === 'confirmed' && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
                     style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <span className="text-[11px] font-semibold text-slate-400">Директории</span>
                  <button onClick={handleRefresh} disabled={refreshing}
                    className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40">
                    <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Обновление...' : 'Обновить'}
                  </button>
                </div>

                <div className="ef-scroll flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0"
                     style={{ scrollbarWidth: 'none' }}>
                  {BINS.map(({ type, label, icon: Icon, color }) => {
                    const items  = confirmed.filter((i) => i.type === type);
                    const isOpen = expandedBin === type;
                    return (
                      <div key={type} className="rounded-xl border overflow-hidden"
                           style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                        <button
                          onClick={() => setExpandedBin(isOpen ? null : type)}
                          className="w-full flex items-center gap-2 px-3 py-3 hover:bg-white/5 transition-colors"
                        >
                          <Icon size={13} className={color} />
                          <span className={`text-xs font-bold flex-1 text-left ${color}`}>{label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{items.length} шт.</span>
                          <ChevronDown size={12} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              {items.length === 0 ? (
                                <p className="text-[10px] text-slate-600 px-3 pb-3">Нет элементов</p>
                              ) : (
                                <div className="border-t space-y-px" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                  {items.map((item) => (
                                    <div key={item.id} className="flex items-start gap-2 px-3 py-3">
                                      <p className={`flex-1 text-xs leading-relaxed min-w-0 ${item.saved ? 'text-slate-500' : 'text-slate-300'}`}>
                                        {item.rewriting ? (
                                          <span className="flex items-center gap-1.5 text-blue-400">
                                            <Loader2 size={10} className="animate-spin" />
                                            Переписываю...
                                          </span>
                                        ) : (
                                          <>
                                            {item.saved && <span className="text-emerald-400 mr-1.5 text-[10px] font-bold">✓</span>}
                                            {item.text}
                                          </>
                                        )}
                                      </p>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button onClick={() => saveItem(item.id)} title="Сохранить"
                                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                          <Save size={12} />
                                        </button>
                                        <button onClick={() => rewriteItem(item.id)} title="Переписать"
                                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                                          <PenLine size={12} />
                                        </button>
                                        <button onClick={() => deleteItem(item.id)} title="Удалить"
                                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="px-3 pb-3 shrink-0">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Eye size={13} />
                    Посмотреть результат
                  </button>
                </div>
              </div>
            )}

            {/* idle right placeholder */}
            {phase === 'idle' && (
              <div className="flex items-center justify-center flex-1">
                <p className="text-xs text-slate-700 text-center leading-loose">
                  Результаты AI-анализа<br />появятся здесь
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ══════ BOTTOM BAR ══════ */}
        <div className="flex items-center border-t shrink-0 px-4 md:px-5 py-3 gap-2"
             style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>

          {/* undo / redo / reset — desktop only */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            <button onClick={undo} disabled={histIdx === 0} title="Отменить"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/8 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={redo} disabled={histIdx >= history.length - 1} title="Повторить"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/8 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} />
            </button>
            <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <button onClick={resetAll} disabled={assignedCount === 0 && phase !== 'confirmed'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-200 hover:bg-white/8 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
              <RotateCcw size={11} />
              Откатить всё
            </button>
          </div>

          {/* mobile reset */}
          <div className="md:hidden flex-1">
            <button onClick={resetAll} disabled={assignedCount === 0}
              className="flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-300 disabled:opacity-25 transition-colors">
              <RotateCcw size={13} />
              Откатить
            </button>
          </div>

          {/* confirm / back / cancel */}
          <div className="flex items-center gap-2">
            {phase === 'confirmed' ? (
              <button
                onClick={() => { setPhase('active'); setConfirmed([]); if (isMobile) setMobileTab('results'); }}
                className="flex items-center gap-1.5 px-4 py-2.5 md:py-1.5 rounded-xl text-sm md:text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors"
              >
                <ChevronLeft size={13} />
                Назад
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowEntityFactory(false)}
                  className="px-4 py-2.5 md:py-1.5 rounded-xl text-sm md:text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={assignedCount === 0}
                  className="flex items-center gap-1.5 px-5 py-2.5 md:py-1.5 rounded-xl text-sm md:text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Подтвердить
                  <ChevronRight size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
