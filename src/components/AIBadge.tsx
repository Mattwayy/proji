'use client';
import { motion } from 'motion/react';
import { Sparkles, Mic } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function AIBadge() {
  const { isAiPanelOpen, setIsAiPanelOpen, isProcessing } = useAppStore();

  return (
    <motion.button
      onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
      aria-label={isAiPanelOpen ? 'Закрыть PROGPT' : 'Спросить PROGPT'}
      aria-expanded={isAiPanelOpen}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[200] flex items-center gap-2.5 pl-4 pr-2 py-2 rounded-full shadow-xl transition-colors ${
        isAiPanelOpen
          ? 'bg-proji-primary text-white'
          : 'bg-slate-900 text-white hover:bg-slate-800'
      }`}
    >
      <motion.div
        animate={isProcessing ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        <Sparkles size={14} aria-hidden="true" />
      </motion.div>
      <span className="text-xs font-black uppercase tracking-wide">Спросить PROGPT</span>
      {isProcessing && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      )}
      <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
        <Mic size={13} aria-hidden="true" />
      </span>
    </motion.button>
  );
}
