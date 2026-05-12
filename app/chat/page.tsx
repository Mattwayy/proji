'use client';
import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../../src/store/useAppStore';

const QUICK_PROMPTS = [
  'Проанализируй текущее состояние бизнеса',
  'Составь план на следующий квартал',
  'Найди узкие места в процессах',
  'Сформируй отчет по KPI',
];

export default function ChatPage() {
  const {
    allMessages, setAllMessages,
    inputText, setInputText,
    isProcessing, setIsProcessing,
    currentThought, setCurrentThought,
    currentDomain,
    setChatHistory, chatHistory,
  } = useAppStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, currentThought]);

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
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {allMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-8 text-center"
          >
            <div>
              <div className="w-16 h-16 rounded-3xl bg-proji-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-proji-primary" size={28} />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-proji-dark mb-2">Proji AI</h2>
              <p className="text-proji-secondary text-sm max-w-xs">
                Ваш AI-консультант по управлению бизнесом. Задайте вопрос или выберите одно из предложений.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-4 rounded-2xl border border-proji-border bg-white hover:border-proji-primary/30 hover:bg-proji-primary/5 transition-all group"
                >
                  <span className="text-sm font-medium text-proji-dark group-hover:text-proji-primary">{prompt}</span>
                  <ChevronRight size={14} className="text-proji-secondary mt-1 group-hover:text-proji-primary" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {allMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-xl bg-proji-primary/10 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <Sparkles size={13} className="text-proji-primary" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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

      {/* Input */}
      <div className="px-4 md:px-8 py-4 border-t border-proji-border bg-proji-bg">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
            rows={1}
            className="flex-1 min-w-0 resize-none rounded-2xl border border-proji-border bg-white px-4 py-3 text-sm text-proji-dark placeholder:text-proji-secondary focus:outline-none focus:border-proji-primary transition-colors"
            style={{ minHeight: 48 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || isProcessing}
            className="flex-shrink-0 w-11 h-11 rounded-2xl bg-proji-primary text-white flex items-center justify-center hover:bg-proji-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
