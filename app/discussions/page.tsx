'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ThumbsUp, ChevronDown, Plus, X, Send, Tag } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

interface Comment { id: string; author: string; avatar: string; color: string; text: string; time: string; likes: number; }
interface Thread {
  id: string; title: string; author: string; avatar: string; color: string;
  category: string; body: string; time: string; likes: number; pinned: boolean;
  comments: Comment[];
}

const THREADS: Thread[] = [
  {
    id:'t1', title:'Нужна ли нам Dark Mode уже в Q2?', author:'Мария С.', avatar:'МС', color:'bg-violet-100 text-violet-700',
    category:'Продукт', body:'UI-кит 2.0 готов, тёмная тема компонентов сделана. Предлагаю включить её в релиз Q2, а не откладывать на Q3. Это повысит NPS у IT-аудитории. Что думаете?', time:'05.06.2026 · 14:30', likes:8, pinned:true,
    comments:[
      { id:'c1', author:'Иван П.', avatar:'ИП', color:'bg-blue-100 text-blue-700', text:'Поддерживаю! У нас уже готова инфраструктура для theme switching. Займёт 2-3 дня.', time:'05.06 15:00', likes:4 },
      { id:'c2', author:'Алексей К.', avatar:'АК', color:'bg-emerald-100 text-emerald-700', text:'С точки зрения маркетинга — хорошая идея. Dark Mode сейчас активно продвигается конкурентами.', time:'05.06 15:40', likes:2 },
    ],
  },
  {
    id:'t2', title:'Итоги ретроспективы Sprint 4', author:'Иван П.', avatar:'ИП', color:'bg-blue-100 text-blue-700',
    category:'Agile', body:'Прошла ретро. Хорошее: +30% скорость деплоя, наладили code review. Плохое: слишком много встреч, теряем фокус. Предлагаю ввести No-Meeting Wednesday.', time:'04.06.2026 · 11:15', likes:12, pinned:true,
    comments:[
      { id:'c3', author:'Сергей В.', avatar:'СВ', color:'bg-rose-100 text-rose-700', text:'No-Meeting Wednesday — отличная идея. Это нам очень нужно для глубокой работы.', time:'04.06 11:45', likes:7 },
      { id:'c4', author:'Елена Н.', avatar:'ЕН', color:'bg-amber-100 text-amber-700', text:'Согласна. Можно ещё ограничить встречи до 30 минут по умолчанию.', time:'04.06 12:00', likes:5 },
    ],
  },
  {
    id:'t3', title:'Интеграция с 1С — нужна ли?', author:'Елена Н.', avatar:'ЕН', color:'bg-amber-100 text-amber-700',
    category:'Разработка', body:'Несколько клиентов запрашивают интеграцию с 1С. Оцениваю это в 3-4 недели разработки. Стоит ли включать в бэклог Q3? Прошу всех высказаться, особенно продажи.', time:'03.06.2026 · 16:00', likes:5, pinned:false,
    comments:[
      { id:'c5', author:'Алексей К.', avatar:'АК', color:'bg-emerald-100 text-emerald-700', text:'Из моих переговоров — 4 из 10 корпоративных клиентов используют 1С. Это важно.', time:'03.06 16:30', likes:3 },
    ],
  },
  {
    id:'t4', title:'Как улучшить онбординг новых пользователей?', author:'Алексей К.', avatar:'АК', color:'bg-emerald-100 text-emerald-700',
    category:'UX', body:'По данным аналитики, 40% новых пользователей не завершают первую настройку проекта. Предлагаю добавить интерактивный тур и шаблоны для быстрого старта.', time:'02.06.2026 · 10:00', likes:9, pinned:false,
    comments:[
      { id:'c6', author:'Мария С.', avatar:'МС', color:'bg-violet-100 text-violet-700', text:'Уже нарисовала mockup онбординг-флоу — покажу на ближайшей встрече!', time:'02.06 11:00', likes:6 },
      { id:'c7', author:'Иван П.', avatar:'ИП', color:'bg-blue-100 text-blue-700', text:'Шаблоны — хорошая идея. Можно взять лучшие проекты из базы и предлагать их как старт.', time:'02.06 11:30', likes:4 },
    ],
  },
];

const CATS = ['Все', 'Продукт', 'Agile', 'Разработка', 'UX', 'Маркетинг'];

export default function DiscussionsPage() {
  const [threads, setThreads]   = useState<Thread[]>(THREADS);
  const [cat, setCat]           = useState('Все');
  const [expanded, setExpanded] = useState<string | null>('t1');
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showNew, setShowNew]   = useState(false);
  const [newTitle, setNewTitle]  = useState('');
  const [newBody,  setNewBody]   = useState('');
  const [newCat,   setNewCat]   = useState('Продукт');

  const filtered = threads.filter(t => cat === 'Все' || t.category === cat)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const like = (id: string) => setThreads(p => p.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t));
  const likeComment = (tid: string, cid: string) =>
    setThreads(p => p.map(t => t.id === tid ? { ...t, comments: t.comments.map(c => c.id === cid ? { ...c, likes: c.likes + 1 } : c) } : t));

  const addComment = (tid: string) => {
    const text = (newComment[tid] ?? '').trim();
    if (!text) return;
    const c: Comment = { id: Date.now().toString(), author: 'Вы', avatar: 'ВЫ', color: 'bg-slate-100 text-slate-600', text, time: 'только что', likes: 0 };
    setThreads(p => p.map(t => t.id === tid ? { ...t, comments: [...t.comments, c] } : t));
    setNewComment(prev => ({ ...prev, [tid]: '' }));
  };

  const createThread = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const t: Thread = {
      id: Date.now().toString(), title: newTitle.trim(), author: 'Вы', avatar: 'ВЫ', color: 'bg-slate-100 text-slate-600',
      category: newCat, body: newBody.trim(), time: 'только что', likes: 0, pinned: false, comments: [],
    };
    setThreads(p => [t, ...p]);
    setNewTitle(''); setNewBody(''); setShowNew(false);
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-1 pt-1">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">Обсуждения</h1>
          </div>
          <button onClick={() => setShowNew(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-proji-primary text-white rounded-xl text-xs font-bold hover:bg-proji-primary/90 transition-colors">
            <Plus size={13} /> Новое
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-5">Командные обсуждения и идеи</p>

        {/* New thread form */}
        <AnimatePresence>
          {showNew && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              className="overflow-hidden mb-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Новое обсуждение</p>
                  <button onClick={() => setShowNew(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={14} /></button>
                </div>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Заголовок..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-proji-primary/40 transition-colors font-bold" />
                <div className="flex gap-2 flex-wrap">
                  {CATS.slice(1).map(c => (
                    <button key={c} onClick={() => setNewCat(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${newCat===c ? 'bg-proji-primary text-white border-proji-primary' : 'bg-white border-slate-200 text-slate-500'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Опишите идею или вопрос..." rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 outline-none resize-none leading-relaxed focus:border-proji-primary/40 transition-colors" />
                <button onClick={createThread} disabled={!newTitle.trim() || !newBody.trim()}
                  className="w-full py-3 bg-proji-primary text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-proji-primary/90 transition-colors">
                  Опубликовать
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-5">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${cat===c ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Threads */}
        <div className="space-y-3">
          {filtered.map((t, i) => {
            const isOpen = expanded === t.id;
            return (
              <motion.div key={t.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className={`bg-white border rounded-2xl overflow-hidden hover:shadow-sm transition-shadow ${t.pinned ? 'border-proji-primary/30' : 'border-slate-200'}`}>
                <div className="p-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : t.id)}>
                  {t.pinned && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-proji-primary bg-proji-primary/10 px-2 py-0.5 rounded-full mb-2">📌 Закреплено</span>}
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${t.color}`}>{t.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><Tag size={8} /> {t.category}</span>
                        <span className="text-[10px] text-slate-400">{t.author} · {t.time}</span>
                      </div>
                      <h3 className="text-sm font-black text-slate-800 leading-snug">{t.title}</h3>
                      {!isOpen && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.body}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400"><MessageSquare size={10} /> {t.comments.length}</span>
                      <ChevronDown size={13} className={`text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{t.body}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => like(t.id)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-proji-primary transition-colors">
                        <ThumbsUp size={12} /> {t.likes}
                      </button>
                    </div>
                    {t.comments.length > 0 && (
                      <div className="space-y-2 border-t border-slate-50 pt-3">
                        {t.comments.map(c => (
                          <div key={c.id} className="flex items-start gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${c.color}`}>{c.avatar}</div>
                            <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold text-slate-700">{c.author}</span>
                                <span className="text-[10px] text-slate-400">{c.time}</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
                              <button onClick={() => likeComment(t.id, c.id)} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-proji-primary transition-colors mt-1">
                                <ThumbsUp size={9} /> {c.likes}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Add comment */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        value={newComment[t.id] ?? ''}
                        onChange={e => setNewComment(p => ({ ...p, [t.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addComment(t.id)}
                        placeholder="Написать комментарий..."
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-300 outline-none focus:border-proji-primary/40 transition-colors"
                      />
                      <button onClick={() => addComment(t.id)} disabled={!(newComment[t.id] ?? '').trim()}
                        className="p-2 bg-proji-primary text-white rounded-xl hover:bg-proji-primary/90 disabled:opacity-40 transition-all active:scale-95">
                        <Send size={12} />
                      </button>
                    </div>
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
