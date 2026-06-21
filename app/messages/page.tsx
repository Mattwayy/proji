'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Search, Circle, CheckCheck, Phone, Video, MoreHorizontal,
  Hash, Sparkles, X, SlidersHorizontal, ListFilter, Mic, Plus, BookMarked,
  Check, History, MessageSquareText, Trash2, ArrowLeft,
} from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useModalClose } from '../../src/hooks/useModalClose';

type ChatKind = 'person' | 'thread' | 'bot';
type Tab = 'all' | 'people' | 'threads';
type SortMode = 'time' | 'unread';

interface Msg { id: string; from: 'me' | 'them'; text: string; time: string; read: boolean; }
interface Chat {
  id: string; kind: ChatKind; name: string; avatar: string; color: string; role: string;
  online: boolean; unread: number; lastMsg: string; lastTime: string; lastTs: number; messages: Msg[];
}

const CHATS: Chat[] = [
  {
    id: 'th1', kind: 'thread', name: 'Ошибка в биллинге (CRITICAL)', avatar: '#', color: 'bg-slate-900 text-white', role: 'Тред · инцидент', online: true, unread: 12, lastMsg: 'Созданный тред (инцидент)', lastTime: '20:16', lastTs: Date.now() - 1000 * 60 * 30,
    messages: [
      { id: 'tm1', from: 'them', text: 'Создан критический инцидент: ошибка списания в биллинге.', time: '20:00', read: true },
      { id: 'tm2', from: 'them', text: 'Подключаюсь, смотрю логи платежного шлюза.', time: '20:10', read: false },
    ],
  },
  {
    id: 'th2', kind: 'thread', name: 'Релиз 2.0 Обсуждение', avatar: '#', color: 'bg-slate-900 text-white', role: 'Тред проекта', online: true, unread: 3, lastMsg: 'Тред проекта', lastTime: '17:30', lastTs: Date.now() - 1000 * 60 * 60 * 3,
    messages: [
      { id: 'tm3', from: 'them', text: 'Финальный чеклист релиза 2.0 прикреплён.', time: '17:00', read: true },
      { id: 'tm4', from: 'them', text: 'Стейджинг прогнан, ждём QA.', time: '17:30', read: false },
    ],
  },
  {
    id: 'bot1', kind: 'bot', name: 'Proji Бот (Автоответы)', avatar: '⚡', color: 'bg-proji-primary/15 text-proji-primary', role: 'Системные уведомления', online: true, unread: 5, lastMsg: 'Системные уведомления', lastTime: '16:56', lastTs: Date.now() - 1000 * 60 * 60 * 5,
    messages: [
      { id: 'bm1', from: 'them', text: 'Доброе утро! У вас 3 новые задачи в проекте "Релиз 2.0".', time: '09:00', read: true },
      { id: 'bm2', from: 'me', text: 'Покажи задачи', time: '09:05', read: true },
      { id: 'bm3', from: 'them', text: '1. Обновить дизайн дашборда\n2. Провести ревью кода авторизации\n3. Настроить CI/CD для staging', time: '09:06', read: true },
    ],
  },
  {
    id: 'c1', kind: 'person', name: 'Мария Петрова', avatar: 'М', color: 'bg-blue-100 text-blue-700', role: 'Product Manager · сотрудник', online: true, unread: 2, lastMsg: 'Обновила бэклог на следующий спринт', lastTime: '15:40', lastTs: Date.now() - 1000 * 60 * 90,
    messages: [
      { id: 'm1', from: 'them', text: 'Обновила бэклог на следующий спринт, гляньте приоритеты.', time: '15:40', read: false },
    ],
  },
  {
    id: 'c2', kind: 'person', name: 'Иван Петров', avatar: 'ИП', color: 'bg-violet-100 text-violet-700', role: 'Рук. отдела разработки', online: true, unread: 0, lastMsg: 'Обновил ТЗ по API v3, проверьте пожалуйста', lastTime: '10:42', lastTs: Date.now() - 1000 * 60 * 60 * 6,
    messages: [
      { id: 'm2', from: 'them', text: 'Добрый день! Я обновил ТЗ по API v3, там новая схема аутентификации OAuth 2.0.', time: '10:30', read: true },
      { id: 'm3', from: 'me', text: 'Хорошо, посмотрю сегодня. Есть что-то критическое?', time: '10:35', read: true },
      { id: 'm4', from: 'them', text: 'Обновил ТЗ по API v3, проверьте пожалуйста', time: '10:42', read: true },
    ],
  },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'people', label: 'Люди' },
  { id: 'threads', label: 'Треды' },
];

const SORTS: { id: SortMode; label: string }[] = [
  { id: 'time', label: 'По срокам' },
  { id: 'unread', label: 'По количеству' },
];

const AI_PREF_KEY = 'proji_ai_suggestions_enabled';
const CHATS_KEY = 'proji_messages_chats';
const SUGGESTIONS = ['Больше деталей', 'Выставить задачу', 'Предложить по контексту'];

interface AiSession { id: string; chatId: string; title: string; summary: string; updatedAt: string; savedToKB: boolean }
const AI_SESSIONS_KEY = 'proji_progpt_sessions';

function loadAiSessions(): AiSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AI_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>(CHATS);
  const [active, setActive] = useState<string | null>('bot1');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [sortMode, setSortMode] = useState<SortMode>('time');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobile, setMobile] = useState<'list' | 'chat'>('list');
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiSuggestionsOn, setAiSuggestionsOn] = useState(true);
  const [aiDrawerTab, setAiDrawerTab] = useState<'suggestions' | 'history'>('suggestions');
  const [aiSessions, setAiSessions] = useState<AiSession[]>([]);
  const [aiSavedToKB, setAiSavedToKB] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(CHATS_KEY);
      if (saved) setChats(JSON.parse(saved));
      const pref = localStorage.getItem(AI_PREF_KEY);
      if (pref !== null) setAiSuggestionsOn(pref === '1');
    } catch {}
    setAiSessions(loadAiSessions());
  }, []);

  const persistAiSessions = (next: AiSession[]) => {
    setAiSessions(next);
    if (typeof window !== 'undefined') localStorage.setItem(AI_SESSIONS_KEY, JSON.stringify(next));
  };

  const saveAiSnapshot = (kb: boolean) => {
    if (!activeChat) return;
    const summary = activeChat.messages.at(-1)?.text ?? 'Сообщений пока нет.';
    const session: AiSession = {
      id: Date.now().toString(),
      chatId: activeChat.id,
      title: activeChat.name,
      summary,
      updatedAt: new Date().toISOString(),
      savedToKB: kb,
    };
    persistAiSessions([session, ...aiSessions]);
  };

  const toggleAiKB = () => {
    const next = !aiSavedToKB;
    setAiSavedToKB(next);
    saveAiSnapshot(next);
  };

  const deleteAiSession = (id: string) => persistAiSessions(aiSessions.filter((s) => s.id !== id));

  const persist = (next: Chat[]) => {
    setChats(next);
    if (typeof window !== 'undefined') localStorage.setItem(CHATS_KEY, JSON.stringify(next));
  };

  const toggleAiSuggestions = () => {
    const next = !aiSuggestionsOn;
    setAiSuggestionsOn(next);
    if (typeof window !== 'undefined') localStorage.setItem(AI_PREF_KEY, next ? '1' : '0');
  };

  const activeChat = chats.find((c) => c.id === active) ?? null;

  useModalClose(() => setSortOpen(false), sortOpen);
  useModalClose(() => setAiDrawerOpen(false), aiDrawerOpen);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active, chats]);

  const openChat = (id: string) => {
    setActive(id);
    setMobile('chat');
    setAiSavedToKB(false);
    persist(chats.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = () => {
    if (!input.trim() || !active) return;
    const msg: Msg = { id: Date.now().toString(), from: 'me', text: input.trim(), time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }), read: false };
    persist(chats.map((c) => (c.id === active ? { ...c, messages: [...c.messages, msg], lastMsg: msg.text, lastTime: 'сейчас', lastTs: Date.now() } : c)));
    setInput('');
  };

  const sendSuggestion = (text: string) => {
    setInput(text);
  };

  const filtered = useMemo(() => {
    let list = chats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (tab === 'people') list = list.filter((c) => c.kind === 'person');
    if (tab === 'threads') list = list.filter((c) => c.kind === 'thread');
    // tab === 'all' includes person + thread + bot
    list = [...list].sort((a, b) => (sortMode === 'unread' ? b.unread - a.unread : b.lastTs - a.lastTs));
    return list;
  }, [chats, search, tab, sortMode]);

  const totalUnread = chats.reduce((s, c) => s + c.unread, 0);

  return (
    <PageWrapper noPadding>
      <div className="flex h-full overflow-hidden">
        {/* Sidebar */}
        <div className={`flex flex-col shrink-0 w-full md:w-80 bg-white border-r border-slate-200 overflow-hidden ${mobile === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <h1 className="text-base font-black text-slate-800 flex-1">Сообщения</h1>
              {totalUnread > 0 && <span className="text-[10px] font-black bg-proji-primary text-white px-2 py-0.5 rounded-full">{totalUnread}</span>}
              <div className="relative">
                <button onClick={() => setSortOpen((v) => !v)}
                  aria-label="Сортировка" aria-haspopup="true" aria-expanded={sortOpen}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <SlidersHorizontal size={15} aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 top-full right-0 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-lg p-1.5 min-w-[170px]"
                    >
                      <p className="px-3 pt-1.5 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-300">Сортировка</p>
                      {SORTS.map((s) => (
                        <button key={s.id} onClick={() => { setSortMode(s.id); setSortOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left">
                          <ListFilter size={12} className="text-slate-300" />
                          {s.label}
                          {sortMode === s.id && <CheckCheck size={12} className="ml-auto text-proji-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl mb-3">
              <Search size={13} className="text-slate-300 shrink-0" aria-hidden="true" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..." aria-label="Поиск по сообщениям"
                className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent outline-none" />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} role="tab" aria-selected={tab === t.id}
                  className={`flex-1 text-[11px] font-black uppercase tracking-wide py-1.5 rounded-lg transition-colors ${
                    tab === t.id ? 'bg-white text-proji-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => openChat(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${active === c.id ? 'bg-proji-primary/5' : ''}`}>
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${c.color}`}>
                    {c.kind === 'thread' ? <Hash size={14} /> : c.avatar}
                  </div>
                  {c.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.kind === 'thread' ? `# ${c.name}` : c.name}</p>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">{c.lastTime}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.role}</p>
                </div>
                {c.unread > 0 && <div className="w-4 h-4 bg-proji-primary text-white rounded-full text-[10px] font-black flex items-center justify-center shrink-0">{c.unread}</div>}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-slate-300 text-center py-12">Ничего не найдено</p>
            )}
          </div>
        </div>

        {/* Chat area */}
        {activeChat ? (
          <div className={`flex-1 flex flex-col overflow-hidden bg-[#f5f7fc] relative ${mobile === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
              <button onClick={() => setMobile('list')} aria-label="Назад к списку чатов" className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              <div aria-hidden="true" className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${activeChat.color}`}>
                {activeChat.kind === 'thread' ? <Hash size={14} /> : activeChat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{activeChat.kind === 'thread' ? `# ${activeChat.name}` : activeChat.name}</p>
                <p className="text-[10px] text-slate-400">{activeChat.online ? '● В сети' : 'Оффлайн'} · {activeChat.role}</p>
              </div>
              <div className="flex items-center gap-1">
                {activeChat.kind === 'person' && (
                  <>
                    <button aria-label="Позвонить" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><Phone size={14} aria-hidden="true" /></button>
                    <button aria-label="Видеозвонок" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><Video size={14} aria-hidden="true" /></button>
                  </>
                )}
                <button aria-label="Дополнительные действия" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><MoreHorizontal size={14} aria-hidden="true" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeChat.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.from === 'me'
                      ? 'bg-proji-primary text-white rounded-br-md'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md'
                  }`}>
                    <p>{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.from === 'me' ? 'text-white/60' : 'text-slate-400'}`}>
                      <span className="text-[10px]">{msg.time}</span>
                      {msg.from === 'me' && <CheckCheck size={11} className={msg.read ? 'text-white' : 'text-white/50'} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* AI suggestion chips (toggleable) */}
            {aiSuggestionsOn && (
              <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto shrink-0">
                {SUGGESTIONS.map((s, i) => {
                  const isContextual = i === SUGGESTIONS.length - 1;
                  return (
                    <button
                      key={s}
                      onClick={() => sendSuggestion(s)}
                      className={`shrink-0 flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                        isContextual
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 hover:opacity-90'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-proji-primary/40 hover:bg-slate-50'
                      }`}
                    >
                      {isContextual && <Sparkles size={13} aria-hidden="true" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Input row — text input + AI button side by side */}
            <div className="bg-white border-t border-slate-200 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Написать сообщение..."
                  aria-label="Сообщение"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-proji-primary/40 transition-colors"
                />
                <button aria-label="Голосовой ввод" className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-100 transition-colors shrink-0">
                  <Mic size={15} aria-hidden="true" />
                </button>
                <button onClick={() => setAiDrawerOpen(true)} aria-label="Открыть PROGPT" aria-haspopup="true" aria-expanded={aiDrawerOpen}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shrink-0">
                  <Sparkles size={14} aria-hidden="true" />
                  <span className="text-xs font-black hidden sm:inline">PROGPT</span>
                </button>
                <button onClick={send} disabled={!input.trim()} aria-label="Отправить сообщение"
                  className="p-2.5 bg-proji-primary text-white rounded-2xl hover:bg-proji-primary/90 disabled:opacity-40 transition-all active:scale-95 shrink-0">
                  <Send size={15} aria-hidden="true" />
                </button>
              </div>
              <button onClick={toggleAiSuggestions} role="switch" aria-checked={aiSuggestionsOn}
                className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                <span className={`w-7 h-4 rounded-full transition-colors relative ${aiSuggestionsOn ? 'bg-proji-primary' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${aiSuggestionsOn ? 'left-3.5' : 'left-0.5'}`} />
                </span>
                ИИ-подсказки {aiSuggestionsOn ? 'включены' : 'выключены'}
              </button>
            </div>

            {/* AI side drawer */}
            <AnimatePresence>
              {aiDrawerOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setAiDrawerOpen(false)}
                    className="absolute inset-0 bg-black/20 z-30"
                  />
                  <motion.div
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                    className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col"
                  >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-proji-primary" aria-hidden="true" />
                        <p className="text-sm font-black text-slate-900">PROGPT по контексту чата</p>
                      </div>
                      <button onClick={() => setAiDrawerOpen(false)} aria-label="Закрыть панель PROGPT" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                        <X size={15} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Drawer tabs */}
                    <div className="flex border-b border-slate-100 shrink-0" role="tablist">
                      {([
                        { id: 'suggestions' as const, label: 'Подсказки', icon: MessageSquareText },
                        { id: 'history' as const, label: 'История', icon: History },
                      ]).map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setAiDrawerTab(id)} role="tab" aria-selected={aiDrawerTab === id}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                            aiDrawerTab === id ? 'text-proji-primary border-b-2 border-proji-primary' : 'text-slate-400 hover:text-slate-600'
                          }`}>
                          <Icon size={12} aria-hidden="true" /> {label}
                        </button>
                      ))}
                    </div>

                    {/* Save to knowledge base flag */}
                    <button onClick={toggleAiKB} role="switch" aria-checked={aiSavedToKB} aria-label="Сохранять этот диалог в базе знаний"
                      className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors shrink-0">
                      <span className={`w-8 h-[18px] rounded-full relative transition-colors ${aiSavedToKB ? 'bg-proji-primary' : 'bg-slate-200'}`}>
                        <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all flex items-center justify-center ${aiSavedToKB ? 'left-[18px]' : 'left-0.5'}`}>
                          {aiSavedToKB && <Check size={9} className="text-proji-primary" aria-hidden="true" />}
                        </span>
                      </span>
                      <BookMarked size={12} className={aiSavedToKB ? 'text-proji-primary' : 'text-slate-400'} aria-hidden="true" />
                      Сохранить диалог в базе знаний
                    </button>

                    {aiDrawerTab === 'suggestions' ? (
                      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                        <p className="text-xs text-slate-400">Краткое резюме переписки с {activeChat.name}:</p>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-600 leading-relaxed">
                          {activeChat.messages.at(-1)?.text ?? 'Сообщений пока нет.'}
                        </div>
                        <div className="flex flex-col gap-2">
                          {SUGGESTIONS.map((s) => (
                            <button key={s} onClick={() => { sendSuggestion(s); setAiDrawerOpen(false); }}
                              className="text-left px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-proji-primary/40 hover:bg-proji-primary/5 transition-colors">
                              {s}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => saveAiSnapshot(aiSavedToKB)}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-dashed border-slate-300 text-xs font-bold text-slate-400 hover:border-proji-primary/40 hover:text-proji-primary transition-colors">
                          <Plus size={12} aria-hidden="true" /> Сохранить снимок диалога в историю
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto px-5 py-4">
                        {aiSessions.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-32 text-center">
                            <History size={22} className="text-slate-200 mb-2" aria-hidden="true" />
                            <p className="text-xs text-slate-400">История пуста</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {aiSessions.map((s) => (
                              <div key={s.id} className="group relative p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-proji-primary/20 transition-all">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[9px] text-slate-400 uppercase tracking-wide">{new Date(s.updatedAt).toLocaleDateString('ru')} · {s.title}</p>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {s.savedToKB && <span title="В базе знаний"><BookMarked size={10} className="text-proji-primary" aria-hidden="true" /></span>}
                                    <button onClick={() => deleteAiSession(s.id)} aria-label="Удалить сессию"
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                      <Trash2 size={11} aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">{s.summary}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3 text-slate-200">
            <Circle size={40} strokeWidth={1.5} />
            <p className="text-sm">Выберите чат</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
