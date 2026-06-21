'use client';
import { useState, useRef, useEffect } from 'react';
import { useModalClose } from '../hooks/useModalClose';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Loader2, History, Zap, ChevronRight, MessageCircle, MoreVertical, ThumbsUp, ThumbsDown, Copy, Trash2, Plus, BookMarked, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../store/useAppStore';
import { usePathname } from 'next/navigation';

const DEFAULT_ACTIONS = ['Что мне делать дальше?', 'Покажи краткую сводку', 'Найди риски на этой странице'];

const PATH_ACTIONS: Record<string, string[]> = {
  '/board': ['Найти заторы', 'Прогноз спринта', 'Оптимизировать процесс'],
  '/documents': ['Анализ рисков', 'Дай рекомендации', 'Сделай резюме'],
  '/analytics': ['Глубокий разбор данных', 'Прогноз на Q3', 'Экспортировать отчёт'],
  '/chat': ['Как начать работу с Proji?', 'Как создать и настроить проект?', 'Как работает AI консультант?'],
  '/projects': ['Статус всех проектов', 'Где риски?', 'Ближайшие дедлайны'],
  '/team': ['Загрузка команды', 'KPI сотрудников', 'Кто перегружен?'],
  '/messages': ['Срочные сообщения', 'Резюме переписки', 'Составь ответ'],
  '/processes': ['Узкие места процесса', 'Оптимизировать шаги', 'Сравнить с эталоном'],
};

const PATH_SECTION_LABEL: Record<string, string> = {
  '/chat': 'Вопросы по сервису',
};

function formatTime(ts: Date | string) {
  return new Date(ts).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

interface CtxMsg { id: string; role: 'user' | 'model'; text: string; timestamp: Date; reaction?: 'like' | 'dislike' | null }
interface CtxChat { id: string; title: string; messages: CtxMsg[]; updatedAt: string; savedToKB: boolean }

const CHATS_KEY = 'proji_ctx_chats';

function loadCtxChats(): CtxChat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function ContextSidebar() {
  const pathname = usePathname();
  const {
    isAiPanelOpen, setIsAiPanelOpen,
    currentDomain, isProcessing, setIsProcessing,
    chatHistory,
  } = useAppStore();

  const [messages, setMessages] = useState<CtxMsg[]>([]);
  const [input, setInput] = useState('');
  const [tab, setTab] = useState<'chat' | 'history'>('chat');
  const [thought, setThought] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [chats, setChats] = useState<CtxChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [savedToKB, setSavedToKB] = useState(false);

  useModalClose(() => setIsAiPanelOpen(false), isAiPanelOpen);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setChats(loadCtxChats()); }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thought]);

  const actions = (PATH_ACTIONS[pathname] ?? DEFAULT_ACTIONS).slice(0, 3);

  const persistChats = (next: CtxChat[]) => {
    setChats(next);
    if (typeof window !== 'undefined') localStorage.setItem(CHATS_KEY, JSON.stringify(next));
  };

  // Upsert the active chat into the saved chats list whenever the conversation changes.
  const syncChat = (msgs: CtxMsg[], kb: boolean, id: string) => {
    const firstUser = msgs.find((m) => m.role === 'user');
    const title = firstUser ? firstUser.text.slice(0, 48) : 'Новый диалог';
    setChats((prev) => {
      const exists = prev.some((c) => c.id === id);
      const next = exists
        ? prev.map((c) => c.id === id ? { ...c, messages: msgs, title, updatedAt: new Date().toISOString(), savedToKB: kb } : c)
        : [...prev, { id, title, messages: msgs, updatedAt: new Date().toISOString(), savedToKB: kb }];
      if (typeof window !== 'undefined') localStorage.setItem(CHATS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const newChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setSavedToKB(false);
    setTab('chat');
  };

  const loadChat = (chat: CtxChat) => {
    setMessages(chat.messages);
    setActiveChatId(chat.id);
    setSavedToKB(chat.savedToKB);
    setTab('chat');
  };

  const deleteChat = (id: string) => {
    persistChats(chats.filter((c) => c.id !== id));
    if (activeChatId === id) newChat();
  };

  const toggleKB = () => {
    const next = !savedToKB;
    setSavedToKB(next);
    if (activeChatId) syncChat(messages, next, activeChatId);
  };

  const setReaction = (id: string, reaction: 'like' | 'dislike') => {
    setMessages((p) => p.map((m) => m.id === id ? { ...m, reaction: m.reaction === reaction ? null : reaction } : m));
  };
  const deleteMessage = (id: string) => { setMessages((p) => p.filter((m) => m.id !== id)); setOpenMenuId(null); };
  const copyMessage = (text: string) => { navigator.clipboard?.writeText(text); setOpenMenuId(null); };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isProcessing) return;
    const chatId = activeChatId ?? Date.now().toString();
    if (!activeChatId) setActiveChatId(chatId);
    setInput('');
    const userMsg: CtxMsg = { id: Date.now().toString(), role: 'user', text: msg, timestamp: new Date() };
    const afterUser = [...messages, userMsg];
    setMessages(afterUser);
    syncChat(afterUser, savedToKB, chatId);
    setIsProcessing(true);
    setThought('Анализирую...');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-10).map((m) => ({ role: m.role === 'model' ? 'assistant' : m.role, text: m.text })),
          domain: currentDomain,
        }),
      });
      const data = await res.json();
      const aiMsg: CtxMsg = { id: (Date.now() + 1).toString(), role: 'model', text: data.text ?? 'Ошибка', timestamp: new Date() };
      const afterAi = [...afterUser, aiMsg];
      setMessages(afterAi);
      syncChat(afterAi, savedToKB, chatId);
    } catch {
      const aiMsg: CtxMsg = { id: (Date.now() + 1).toString(), role: 'model', text: 'Ошибка соединения.', timestamp: new Date() };
      const afterAi = [...afterUser, aiMsg];
      setMessages(afterAi);
      syncChat(afterAi, savedToKB, chatId);
    } finally {
      setIsProcessing(false);
      setThought('');
    }
  };

  return (
    <AnimatePresence>
      {isAiPanelOpen && (
        <>
        {/* Backdrop on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="sm:hidden fixed inset-0 bg-black/30 z-[149]"
          onClick={() => setIsAiPanelOpen(false)}
        />

        <motion.aside
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 sm:top-0 right-0 h-[97dvh] sm:h-full w-full sm:w-80 bg-white sm:border-l border-slate-200 rounded-t-3xl sm:rounded-none shadow-2xl z-[150] flex flex-col"
        >
          {/* Mobile drag indicator */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-proji-primary/10 flex items-center justify-center">
                <Sparkles size={14} className="text-proji-primary" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Proji AI</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">{currentDomain}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={newChat} title="Новый чат" aria-label="Новый чат" className="p-1.5 rounded-lg text-slate-400 hover:text-proji-primary hover:bg-proji-primary/5 transition-colors">
                <Plus size={16} aria-hidden="true" />
              </button>
              <button onClick={() => setIsAiPanelOpen(false)} aria-label="Закрыть панель Proji AI" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Save to knowledge base flag */}
          <button
            onClick={toggleKB}
            title="Сохранять этот диалог в базе знаний"
            role="switch"
            aria-checked={savedToKB}
            className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span className={`w-8 h-[18px] rounded-full relative transition-colors ${savedToKB ? 'bg-proji-primary' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all flex items-center justify-center ${savedToKB ? 'left-[18px]' : 'left-0.5'}`}>
                {savedToKB && <Check size={9} aria-hidden="true" className="text-proji-primary" />}
              </span>
            </span>
            <BookMarked size={12} aria-hidden="true" className={savedToKB ? 'text-proji-primary' : 'text-slate-400'} />
            Сохранить диалог в базе знаний
          </button>

          {/* Tabs */}
          <div className="flex border-b border-slate-100" role="tablist">
            {(['chat', 'history'] as const).map((t) => {
              const Icon = t === 'chat' ? MessageCircle : History;
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${tab === t ? 'text-proji-primary border-b-2 border-proji-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Icon size={12} aria-hidden="true" />
                  {t === 'chat' ? 'Чат' : 'История'}
                </button>
              );
            })}
          </div>

          {/* Chat tab */}
          {tab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {/* Quick actions / FAQ */}
                {actions.length > 0 && messages.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {PATH_SECTION_LABEL[pathname] ?? 'Быстрые действия'}
                    </p>
                    {actions.map((a) => (
                      <button
                        key={a}
                        onClick={() => {
                          setInput(a);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-proji-primary/5 hover:text-proji-primary text-slate-600 text-xs font-semibold transition-all group text-left"
                      >
                        <span>{a}</span>
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {messages.length === 0 && actions.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Zap size={24} className="text-slate-200 mb-2" />
                    <p className="text-xs text-slate-400">Задайте вопрос по текущей странице</p>
                  </div>
                )}

                {/* Messages */}
                {messages.map((m) => (
                  <div key={m.id} className={`flex group ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-proji-primary text-white rounded-tr-sm'
                          : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-sm'
                      }`}>
                        {m.role === 'model' ? (
                          <div className="prose prose-xs max-w-none prose-p:text-slate-700 prose-headings:text-slate-800">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                          </div>
                        ) : m.text}
                      </div>

                      <div className={`flex items-center gap-1.5 mt-1 px-1 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[9px] text-slate-400 select-none">{formatTime(m.timestamp)}</span>

                        {m.role === 'model' && (
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => setReaction(m.id, 'like')}
                              aria-label="Хороший ответ"
                              aria-pressed={m.reaction === 'like'}
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${m.reaction === 'like' ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'}`}
                            >
                              <ThumbsUp size={9} aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => setReaction(m.id, 'dislike')}
                              aria-label="Плохой ответ"
                              aria-pressed={m.reaction === 'dislike'}
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${m.reaction === 'dislike' ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                            >
                              <ThumbsDown size={9} aria-hidden="true" />
                            </button>
                          </div>
                        )}

                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                            aria-label="Меню сообщения"
                            aria-haspopup="true"
                            aria-expanded={openMenuId === m.id}
                            className="w-4 h-4 rounded flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-700 hover:bg-slate-100 transition-all"
                          >
                            <MoreVertical size={10} aria-hidden="true" />
                          </button>
                          <AnimatePresence>
                            {openMenuId === m.id && (
                              <motion.div
                                role="menu"
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                className={`absolute z-30 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl py-1 ${m.role === 'user' ? 'right-0' : 'left-0'}`}
                              >
                                <button role="menuitem" onClick={() => copyMessage(m.text)} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 transition-colors">
                                  <Copy size={10} aria-hidden="true" /> Копировать
                                </button>
                                <button role="menuitem" onClick={() => deleteMessage(m.id)} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 size={10} aria-hidden="true" /> Удалить
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isProcessing && thought && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-2">
                      <Loader2 size={11} className="text-proji-primary animate-spin" />
                      <span className="text-[11px] text-slate-400">{thought}</span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-100">
                <div className="relative rounded-2xl p-[1.5px] overflow-hidden ctx-input-glow">
                  <div className="flex items-end gap-2 rounded-2xl bg-white px-2 py-1.5">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                      placeholder="написать вопрос..."
                      aria-label="Сообщение для AI ассистента"
                      rows={1}
                      className="flex-1 min-w-0 resize-none bg-transparent px-1.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      style={{ minHeight: 32 }}
                    />
                    <button
                      onClick={() => send()}
                      disabled={!input.trim() || isProcessing}
                      aria-label="Отправить сообщение"
                      className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all"
                    >
                      {isProcessing ? <Loader2 size={13} aria-hidden="true" className="animate-spin" /> : <Send size={13} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              </div>

              <style jsx>{`
                .ctx-input-glow {
                  background: linear-gradient(90deg, #3b82f6, #14b8a6, #6366f1, #3b82f6);
                  background-size: 300% 100%;
                  animation: ctx-glow-move 5s linear infinite;
                }
                @keyframes ctx-glow-move {
                  to { background-position: -300% 0; }
                }
              `}</style>
            </>
          )}

          {/* History tab */}
          {tab === 'history' && (
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Диалоги панели</p>
                  <button onClick={newChat} className="flex items-center gap-1 text-[10px] font-bold text-proji-primary hover:underline">
                    <Plus size={11} /> Новый
                  </button>
                </div>
                {chats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <History size={20} className="text-slate-200 mb-2" />
                    <p className="text-xs text-slate-400">Пока нет сохранённых диалогов</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chats.slice().sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).map((chat) => (
                      <div
                        key={chat.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Открыть диалог: ${chat.title || 'Сессия'}`}
                        className={`group relative w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          activeChatId === chat.id ? 'bg-proji-primary/5 border-proji-primary/20' : 'bg-slate-50 border-transparent hover:bg-proji-primary/5 hover:border-proji-primary/20'
                        }`}
                        onClick={() => loadChat(chat)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadChat(chat); } }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[9px] text-slate-400 uppercase tracking-wide">{new Date(chat.updatedAt).toLocaleDateString('ru')} · {formatTime(chat.updatedAt)}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            {chat.savedToKB && <span title="В базе знаний"><BookMarked size={10} aria-hidden="true" className="text-proji-primary" /></span>}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                              aria-label="Удалить диалог"
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={11} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">{chat.title || 'Сессия'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Из основного чата</p>
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <p className="text-xs text-slate-400">История пуста</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.slice().reverse().map((session) => {
                      const first = session.messages.find((m) => m.role === 'user');
                      return (
                        <button
                          key={session.id}
                          onClick={() => { setMessages(session.messages.map((m) => ({ id: m.id, role: m.role, text: m.text, timestamp: m.timestamp, reaction: m.reaction }))); setActiveChatId(null); setSavedToKB(false); setTab('chat'); }}
                          className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-proji-primary/5 hover:border-proji-primary/20 border border-transparent transition-all"
                        >
                          <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-1">{session.domain} · {new Date(session.date).toLocaleDateString('ru')}</p>
                          <p className="text-xs font-semibold text-slate-700 truncate">{first?.text ?? 'Сессия'}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
