'use client';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PenTool } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function QuickAddModal() {
  const {
    showQuickAddModal, setShowQuickAddModal,
    quickAddType, setQuickAddType,
    quickAddCustomType, setQuickAddCustomType,
    quickAddText, setQuickAddText,
    allTasks, setAllTasks,
  } = useAppStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showQuickAddModal) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [showQuickAddModal]);

  const save = () => {
    if (!quickAddText.trim()) return;
    const type = quickAddType === 'другое' ? (quickAddCustomType || 'другое') : quickAddType;
    if (type === 'задача') {
      setAllTasks([...allTasks, {
        id: Date.now().toString(),
        title: quickAddText.trim(),
        status: 'pending',
        relatedToType: 'Общий',
      }]);
    }
    setShowQuickAddModal(false);
    setQuickAddText('');
    setQuickAddType('заметка');
    setQuickAddCustomType('');
  };

  const close = () => {
    setShowQuickAddModal(false);
    setQuickAddText('');
    setQuickAddType('заметка');
    setQuickAddCustomType('');
  };

  return (
    <AnimatePresence>
      {showQuickAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <PenTool size={15} className="text-proji-primary" />
                Новая запись
              </h2>
              <button
                onClick={close}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5">
              <textarea
                ref={textareaRef}
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) save(); }}
                placeholder="Что у вас на уме? Пишите здесь..."
                className="w-full h-36 outline-none resize-none text-sm text-slate-800 placeholder:text-slate-400 font-medium leading-relaxed"
              />
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={quickAddType}
                  onChange={(e) => setQuickAddType(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                >
                  <option value="заметка">заметка</option>
                  <option value="задача">задача</option>
                  <option value="проект">проект</option>
                  <option value="документ">документ</option>
                  <option value="другое">другое...</option>
                </select>
                {quickAddType === 'другое' && (
                  <input
                    type="text"
                    value={quickAddCustomType}
                    onChange={(e) => setQuickAddCustomType(e.target.value)}
                    placeholder="Тип..."
                    className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700 outline-none w-28 focus:border-proji-primary transition-colors"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 hidden sm:block">⌘ + Enter</span>
                <button
                  onClick={save}
                  disabled={!quickAddText.trim()}
                  className="bg-proji-primary text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-proji-primary/90 disabled:opacity-40 transition-all"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
