'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Loader2, Sparkles, Wand2, ChevronRight, Info, CircleCheck, Mic, MoreVertical, ThumbsUp, ThumbsDown, Copy, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { useAppStore } from '../../src/store/useAppStore';

function formatTime(ts: Date | string) {
  const d = new Date(ts);
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

const SCENARIO_PROMPTS = [
  'Собрать сводку',
  'Найти то, что мешает',
  'Подготовить презентацию',
  'Ускорить работу',
  'Написать бизнес-план',
  'Проверить дела',
];

export default function ChatPage() {
  const {
    allMessages, setAllMessages,
    inputText, setInputText,
    isProcessing, setIsProcessing,
    currentThought, setCurrentThought,
    currentDomain,
    setChatHistory,
    isAiPanelOpen, setIsAiPanelOpen,
  } = useAppStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const setReaction = (id: string, reaction: 'like' | 'dislike') => {
    setAllMessages((prev) => prev.map((m) => m.id === id ? { ...m, reaction: m.reaction === reaction ? null : reaction } : m));
  };

  const deleteMessage = (id: string) => {
    setAllMessages((prev) => prev.filter((m) => m.id !== id));
    setOpenMenuId(null);
  };

  const copyMessage = (text: string) => {
    navigator.clipboard?.writeText(text);
    setOpenMenuId(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, currentThought]);

  useEffect(() => {
    const pending = localStorage.getItem('proji_pending_prompt');
    if (pending) {
      setInputText(pending);
      localStorage.removeItem('proji_pending_prompt');
      textareaRef.current?.focus();
    }
  }, [setInputText]);

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text ?? inputText).trim();
    if (!messageText || isProcessing) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: messageText, timestamp: new Date() };
    setAllMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);
    setCurrentThought('Анализирую запрос...');

    try {
      const history = allMessages.slice(-20).map((m) => ({ role: m.role === 'model' ? 'assistant' : m.role, text: m.text }));
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, history, domain: currentDomain }),
      });
      const data = await res.json();
      const aiText = data.text ?? data.error ?? 'Ошибка получения ответа';

      const aiMsg = { id: (Date.now() + 1).toString(), role: 'model' as const, text: aiText, timestamp: new Date() };
      setAllMessages((prev) => [...prev, aiMsg]);
      setChatHistory((prev) => {
        const today = new Date().toDateString();
        const existing = prev.find((s) => new Date(s.date).toDateString() === today && s.domain === currentDomain);
        if (existing) {
          return prev.map((s) => s.id === existing.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s);
        }
        return [...prev, { id: Date.now().toString(), date: new Date(), domain: currentDomain, messages: [userMsg, aiMsg] }];
      });
    } catch {
      setAllMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'model' as const, text: 'Произошла ошибка. Проверьте подключение.', timestamp: new Date() }]);
    } finally {
      setIsProcessing(false);
      setCurrentThought('');
    }
  }, [inputText, isProcessing, allMessages, currentDomain, setAllMessages, setInputText, setIsProcessing, setCurrentThought, setChatHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Info / FAQ button */}
      <button
        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-proji-primary hover:border-proji-primary/40 flex items-center justify-center transition-colors shadow-sm"
        title="Вопросы по сервису"
        aria-label="Вопросы по сервису"
        aria-expanded={isAiPanelOpen}
      >
        <Info size={14} aria-hidden="true" />
      </button>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {allMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-full gap-8 text-center pt-8 pb-4"
          >
            {/* Hero title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  Развивайте и управляйте
                  <br />своей компанией через ИИ
                </span>
              </h1>
              <p className="text-proji-secondary text-sm max-w-xs mx-auto leading-relaxed">
                Начните с выбора действия, нужного домена или конкретной функции.
              </p>
            </div>

            {/* Popular scenarios */}
            <div className="w-full max-w-lg space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary">
                Популярные сценарии
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SCENARIO_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-3 py-2.5 rounded-xl border border-proji-border bg-white hover:border-proji-primary/30 hover:bg-proji-primary/5 transition-all text-sm text-proji-dark hover:text-proji-primary font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenarios library link */}
            <Link
              href="/scenarios"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-proji-border bg-white hover:border-proji-primary/30 hover:bg-proji-primary/5 transition-all text-sm text-proji-dark hover:text-proji-primary"
            >
              <CircleCheck size={15} className="text-proji-primary" />
              <span>Перейти в библиотеку сценариев</span>
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {allMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-xl bg-proji-primary/10 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <Sparkles size={13} className="text-proji-primary" />
                </div>
              )}
              <div className={`max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-proji-primary text-white rounded-tr-sm'
                      : 'bg-white border border-proji-border text-proji-dark rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'model' ? (
                    <div className="prose prose-sm max-w-none prose-headings:text-proji-dark prose-p:text-proji-dark prose-li:text-proji-dark prose-strong:text-proji-dark">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>

                {/* Meta row: timestamp, reactions, menu */}
                <div className={`flex items-center gap-2 mt-1 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[10px] text-proji-secondary/70 select-none">{formatTime(msg.timestamp)}</span>

                  {msg.role === 'model' && (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setReaction(msg.id, 'like')}
                        title="Хороший ответ"
                        aria-label="Хороший ответ"
                        aria-pressed={msg.reaction === 'like'}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${msg.reaction === 'like' ? 'text-emerald-500 bg-emerald-50' : 'text-proji-secondary/40 hover:text-emerald-500 hover:bg-emerald-50'}`}
                      >
                        <ThumbsUp size={11} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setReaction(msg.id, 'dislike')}
                        title="Плохой ответ"
                        aria-label="Плохой ответ"
                        aria-pressed={msg.reaction === 'dislike'}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${msg.reaction === 'dislike' ? 'text-red-500 bg-red-50' : 'text-proji-secondary/40 hover:text-red-500 hover:bg-red-50'}`}
                      >
                        <ThumbsDown size={11} aria-hidden="true" />
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                      className="w-5 h-5 rounded-md flex items-center justify-center text-proji-secondary/40 opacity-0 group-hover:opacity-100 hover:text-proji-dark hover:bg-slate-100 transition-all"
                      title="Меню сообщения"
                      aria-label="Меню сообщения"
                      aria-haspopup="true"
                      aria-expanded={openMenuId === msg.id}
                    >
                      <MoreVertical size={12} aria-hidden="true" />
                    </button>

                    <AnimatePresence>
                      {openMenuId === msg.id && (
                        <motion.div
                          role="menu"
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          className={`absolute z-30 top-full mt-1 w-40 bg-white border border-proji-border rounded-xl shadow-xl py-1 ${msg.role === 'user' ? 'right-0' : 'left-0'}`}
                        >
                          <button
                            role="menuitem"
                            onClick={() => copyMessage(msg.text)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-proji-dark hover:bg-slate-50 transition-colors"
                          >
                            <Copy size={12} aria-hidden="true" /> Копировать
                          </button>
                          <button
                            role="menuitem"
                            onClick={() => deleteMessage(msg.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={12} aria-hidden="true" /> Удалить
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && currentThought && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="w-7 h-7 rounded-xl bg-proji-primary/10 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
              <Sparkles size={13} className="text-proji-primary" />
            </div>
            <div className="bg-white border border-proji-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="text-proji-primary animate-spin" />
              <span className="text-xs text-proji-secondary">{currentThought}</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 md:px-8 py-4 border-t border-proji-border bg-proji-bg">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-full p-[1.5px] overflow-hidden shadow-sm ai-input-glow">
            <div className="flex items-center gap-2.5 rounded-full bg-white pl-2 pr-2.5 py-2">
              <button
                type="button"
                className="flex-shrink-0 w-8 h-8 rounded-full text-proji-secondary/50 flex items-center justify-center hover:bg-slate-100 hover:text-proji-primary transition-colors"
                title="Подсказать с ИИ"
                aria-label="Подсказать с ИИ"
              >
                <Wand2 size={14} aria-hidden="true" />
              </button>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Задайте вопрос (AI Ассистент)..."
                aria-label="Сообщение для AI ассистента"
                rows={1}
                className="flex-1 min-w-0 resize-none bg-transparent text-sm text-proji-dark placeholder:text-proji-secondary focus:outline-none py-1"
                style={{ minHeight: 24 }}
              />
              <button
                type="button"
                className="flex-shrink-0 w-9 h-9 rounded-full text-proji-secondary/60 flex items-center justify-center hover:bg-slate-100 transition-colors"
                title="Голосовой ввод"
                aria-label="Голосовой ввод"
              >
                <Mic size={15} aria-hidden="true" />
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!inputText.trim() || isProcessing}
                aria-label="Отправить сообщение"
                className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 text-white flex items-center justify-center disabled:opacity-40 transition-all hover:opacity-90"
              >
                {isProcessing ? <Loader2 size={15} aria-hidden="true" className="animate-spin" /> : <ArrowUp size={15} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ai-input-glow::before {
          content: '';
          position: absolute;
          inset: -40%;
          background: conic-gradient(from 0deg, #3b82f6, #14b8a6, #6366f1, #3b82f6);
          animation: ai-glow-spin 4s linear infinite;
        }
        @keyframes ai-glow-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
