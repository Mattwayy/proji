'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, X, Calendar, ChevronDown, ChevronUp, MessageSquare, Send, Filter } from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';

type Direction = 'sent' | 'received';
type Channel = 'Чат' | 'Email' | 'Обсуждения';

interface LogEntry {
  id: string;
  date: string; // ISO
  contact: string;
  contactAvatar: string;
  contactColor: string;
  channel: Channel;
  direction: Direction;
  text: string;
}

const SEED: LogEntry[] = [
  { id:'1',  date:'2026-06-11T10:42:00', contact:'Иван Петров',     contactAvatar:'ИП', contactColor:'bg-blue-100 text-blue-700',    channel:'Чат',        direction:'received', text:'Обновил ТЗ по API v3, проверьте пожалуйста' },
  { id:'2',  date:'2026-06-11T10:35:00', contact:'Иван Петров',     contactAvatar:'ИП', contactColor:'bg-blue-100 text-blue-700',    channel:'Чат',        direction:'sent',     text:'Хорошо, посмотрю сегодня. Есть что-то критическое?' },
  { id:'3',  date:'2026-06-11T09:15:00', contact:'Алексей Козлов',  contactAvatar:'АК', contactColor:'bg-emerald-100 text-emerald-700', channel:'Чат',     direction:'received', text:'Прошу утвердить бюджет 80 тыс. на июль' },
  { id:'4',  date:'2026-06-11T09:10:00', contact:'Алексей Козлов',  contactAvatar:'АК', contactColor:'bg-emerald-100 text-emerald-700', channel:'Чат',     direction:'sent',     text:'Видел, хорошая работа. Что по летней кампании?' },
  { id:'5',  date:'2026-06-11T08:55:00', contact:'Елена Новикова',  contactAvatar:'ЕН', contactColor:'bg-amber-100 text-amber-700',   channel:'Чат',        direction:'received', text:'Финансовый отчёт Q2 готов к проверке' },
  { id:'6',  date:'2026-06-11T09:05:00', contact:'Елена Новикова',  contactAvatar:'ЕН', contactColor:'bg-amber-100 text-amber-700',   channel:'Чат',        direction:'sent',     text:'Принял, посмотрю раздел Прогноз Q3' },
  { id:'7',  date:'2026-06-10T17:20:00', contact:'Мария Смирнова',  contactAvatar:'МС', contactColor:'bg-violet-100 text-violet-700', channel:'Чат',        direction:'received', text:'UI-кит готов, передаю разработчикам' },
  { id:'8',  date:'2026-06-10T17:15:00', contact:'Мария Смирнова',  contactAvatar:'МС', contactColor:'bg-violet-100 text-violet-700', channel:'Чат',        direction:'sent',     text:'Отлично, спасибо! Передай Ивану для интеграции.' },
  { id:'9',  date:'2026-06-10T17:55:00', contact:'Сергей Волков',   contactAvatar:'СВ', contactColor:'bg-rose-100 text-rose-700',     channel:'Чат',        direction:'received', text:'OAuth реализован, тесты пройдены' },
  { id:'10', date:'2026-06-10T17:50:00', contact:'Сергей Волков',   contactAvatar:'СВ', contactColor:'bg-rose-100 text-rose-700',     channel:'Чат',        direction:'sent',     text:'Отлично. Что с SSO?' },
  { id:'11', date:'2026-06-10T11:00:00', contact:'Команда',         contactAvatar:'КМ', contactColor:'bg-slate-100 text-slate-600',   channel:'Обсуждения', direction:'sent',     text:'Коллеги, напоминаю: стендап в 10:00 завтра, не опаздываем.' },
  { id:'12', date:'2026-06-09T14:30:00', contact:'Иван Петров',     contactAvatar:'ИП', contactColor:'bg-blue-100 text-blue-700',    channel:'Email',      direction:'sent',     text:'Добрый день, Иван. Высылаю скорректированное ТЗ с учётом замечаний.' },
  { id:'13', date:'2026-06-09T13:10:00', contact:'Алексей Козлов',  contactAvatar:'АК', contactColor:'bg-emerald-100 text-emerald-700', channel:'Email',   direction:'received', text:'Отчёт по конкурентам: ТОП-3 выросли в бюджетах на 15% г/г.' },
  { id:'14', date:'2026-06-08T09:45:00', contact:'Мария Смирнова',  contactAvatar:'МС', contactColor:'bg-violet-100 text-violet-700', channel:'Обсуждения', direction:'received', text:'Скинула макеты в Figma — ссылка в задаче #47.' },
];

const CHANNEL_COLORS: Record<Channel, string> = {
  'Чат':        'bg-blue-100 text-blue-600',
  'Email':      'bg-orange-100 text-orange-600',
  'Обсуждения': 'bg-violet-100 text-violet-600',
};

const CHANNELS: Channel[] = ['Чат', 'Email', 'Обсуждения'];

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Сегодня';
  if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export default function MessagesJournalPage() {
  const [search, setSearch]           = useState('');
  const [dirFilter, setDirFilter]     = useState<Direction | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [collapsed, setCollapsed]     = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    return SEED.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !search || e.text.toLowerCase().includes(q) || e.contact.toLowerCase().includes(q);
      const matchDir     = dirFilter === 'all'     || e.direction === dirFilter;
      const matchCh      = channelFilter === 'all' || e.channel === channelFilter;
      return matchSearch && matchDir && matchCh;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [search, dirFilter, channelFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, LogEntry[]> = {};
    for (const e of filtered) {
      const key = dayKey(e.date);
      (map[key] ??= []).push(e);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const totalSent     = filtered.filter((e) => e.direction === 'sent').length;
  const totalReceived = filtered.filter((e) => e.direction === 'received').length;

  const toggleDay = (key: string) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto w-full px-4 md:px-10 pb-16">

        <div className="flex items-center justify-between mb-2 pt-1">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">Журнал сообщений</h1>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6">Все отправленные и полученные сообщения по дням</p>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Всего записей',  value: filtered.length, icon: MessageSquare, color: 'text-slate-500' },
            { label: 'Отправлено',     value: totalSent,       icon: Send,          color: 'text-proji-primary' },
            { label: 'Получено',       value: totalReceived,   icon: Calendar,      color: 'text-emerald-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <Icon size={15} className={`${color} mb-2`} />
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-44 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl">
            <Search size={13} className="text-slate-300 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по тексту или имени..."
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
            />
            {search && <button onClick={() => setSearch('')}><X size={12} className="text-slate-300" /></button>}
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-300" />
            {(['all', 'sent', 'received'] as const).map((d) => (
              <button key={d} onClick={() => setDirFilter(d)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                  dirFilter === d ? 'bg-proji-primary text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {d === 'all' ? 'Все' : d === 'sent' ? 'Отправленные' : 'Полученные'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', ...CHANNELS] as const).map((ch) => (
              <button key={ch} onClick={() => setChannelFilter(ch as Channel | 'all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                  channelFilter === ch ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {ch === 'all' ? 'Все каналы' : ch}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {grouped.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Ничего не найдено</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {grouped.map(([dayKey, entries]) => {
              const isCollapsed = !!collapsed[dayKey];
              const label = formatDateLabel(entries[0].date);
              return (
                <div key={dayKey} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => toggleDay(dayKey)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400" />
                      <span className="text-sm font-black text-slate-700">{label}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{entries.length}</span>
                    </div>
                    {isCollapsed ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronUp size={14} className="text-slate-400" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {entries.map((e, i) => (
                          <div key={e.id}
                            className={`flex items-start gap-3 px-5 py-3.5 ${i < entries.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${e.direction === 'sent' ? 'bg-proji-primary' : 'bg-emerald-400'}`} />
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${e.contactColor}`}>
                              {e.contactAvatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-700">{e.contact}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CHANNEL_COLORS[e.channel]}`}>{e.channel}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${e.direction === 'sent' ? 'bg-proji-primary/10 text-proji-primary' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {e.direction === 'sent' ? 'Отправлено' : 'Получено'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{e.text}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                              {new Date(e.date).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
