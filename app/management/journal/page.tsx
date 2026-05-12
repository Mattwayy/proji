'use client';
import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { BookOpen, Clock, Trash2 } from 'lucide-react';

type Note = { text: string; date: string };

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    try {
      setNotes(JSON.parse(localStorage.getItem('proji_journal_notes') || '[]'));
    } catch {}
  }, []);

  const deleteNote = (i: number) => {
    const updated = notes.filter((_, idx) => idx !== i);
    setNotes(updated);
    localStorage.setItem('proji_journal_notes', JSON.stringify(updated));
  };

  return (
    <PageWrapper>
      <div className="p-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-proji-primary/10 flex items-center justify-center">
            <BookOpen size={16} className="text-proji-primary" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">Управленческий Журнал</h1>
            <p className="text-xs text-slate-400">Личные заметки и записи</p>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <BookOpen size={32} className="mb-3 opacity-30" />
            <p className="text-sm">Заметок пока нет</p>
            <p className="text-xs mt-1">Нажмите ⌘K и выберите «Создать страницу»</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notes.map((note, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 group">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap flex-1">{note.text}</p>
                  <button
                    onClick={() => deleteNote(i)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  <Clock size={11} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400">
                    {new Date(note.date).toLocaleString('ru', {
                      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
