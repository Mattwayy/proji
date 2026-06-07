'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Search, Circle, CheckCheck, Phone, Video, MoreHorizontal } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

interface Msg { id: string; from: 'me' | 'them'; text: string; time: string; read: boolean; }
interface Chat {
  id: string; name: string; avatar: string; color: string; role: string;
  online: boolean; unread: number; lastMsg: string; lastTime: string; messages: Msg[];
}

const CHATS: Chat[] = [
  {
    id:'c1', name:'Иван Петров', avatar:'ИП', color:'bg-blue-100 text-blue-700', role:'Рук. отдела разработки', online:true, unread:2, lastMsg:'Обновил ТЗ по API v3, проверьте пожалуйста', lastTime:'10:42',
    messages:[
      { id:'m1', from:'them', text:'Добрый день! Я обновил ТЗ по API v3, там новая схема аутентификации OAuth 2.0.', time:'10:30', read:true },
      { id:'m2', from:'me',   text:'Хорошо, посмотрю сегодня. Есть что-то критическое?', time:'10:35', read:true },
      { id:'m3', from:'them', text:'Да, в разделе ошибок надо уточнить коды 4xx. Остальное — ок.', time:'10:38', read:true },
      { id:'m4', from:'them', text:'Обновил ТЗ по API v3, проверьте пожалуйста', time:'10:42', read:false },
    ],
  },
  {
    id:'c2', name:'Мария Смирнова', avatar:'МС', color:'bg-violet-100 text-violet-700', role:'Ведущий дизайнер', online:false, unread:0, lastMsg:'UI-кит готов, передаю разработчикам', lastTime:'вчера',
    messages:[
      { id:'m5', from:'them', text:'UI-кит 2.0 завершён! Добавила тёмную тему и новые компоненты.', time:'вчера 17:00', read:true },
      { id:'m6', from:'me',   text:'Отлично, спасибо! Передай Ивану для интеграции.', time:'вчера 17:15', read:true },
      { id:'m7', from:'them', text:'UI-кит готов, передаю разработчикам', time:'вчера 17:20', read:true },
    ],
  },
  {
    id:'c3', name:'Алексей Козлов', avatar:'АК', color:'bg-emerald-100 text-emerald-700', role:'Маркетолог', online:true, unread:1, lastMsg:'Прошу утвердить бюджет 80 тыс. на июль', lastTime:'09:15',
    messages:[
      { id:'m8',  from:'them', text:'Закончил анализ конкурентов. Отчёт прикреплён в задаче.', time:'09:00', read:true },
      { id:'m9',  from:'me',   text:'Видел, хорошая работа. Что по летней кампании?', time:'09:10', read:true },
      { id:'m10', from:'them', text:'Прошу утвердить бюджет 80 тыс. на июль', time:'09:15', read:false },
    ],
  },
  {
    id:'c4', name:'Елена Новикова', avatar:'ЕН', color:'bg-amber-100 text-amber-700', role:'Аналитик данных', online:true, unread:0, lastMsg:'Финансовый отчёт Q2 готов к проверке', lastTime:'08:55',
    messages:[
      { id:'m11', from:'them', text:'Финансовый отчёт Q2 2026 подготовлен. Все цифры выверены с бухгалтерией.', time:'08:50', read:true },
      { id:'m12', from:'them', text:'Финансовый отчёт Q2 готов к проверке', time:'08:55', read:true },
      { id:'m13', from:'me',   text:'Принял, посмотрю раздел Прогноз Q3', time:'09:05', read:true },
    ],
  },
  {
    id:'c5', name:'Сергей Волков', avatar:'СВ', color:'bg-rose-100 text-rose-700', role:'Разработчик', online:false, unread:0, lastMsg:'OAuth реализован, тесты пройдены', lastTime:'вчера',
    messages:[
      { id:'m14', from:'them', text:'OAuth 2.0 реализован! Refresh token работает корректно.', time:'вчера 17:45', read:true },
      { id:'m15', from:'me',   text:'Отлично. Что с SSO?', time:'вчера 17:50', read:true },
      { id:'m16', from:'them', text:'OAuth реализован, тесты пройдены', time:'вчера 17:55', read:true },
    ],
  },
];

export default function MessagesPage() {
  const [chats, setChats]   = useState<Chat[]>(CHATS);
  const [active, setActive] = useState<string | null>('c1');
  const [input,  setInput]  = useState('');
  const [search, setSearch] = useState('');
  const [mobile, setMobile] = useState<'list'|'chat'>('list');
  const endRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === active) ?? null;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active, chats]);

  const openChat = (id: string) => {
    setActive(id);
    setMobile('chat');
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const send = () => {
    if (!input.trim() || !active) return;
    const msg: Msg = { id: Date.now().toString(), from: 'me', text: input.trim(), time: new Date().toLocaleTimeString('ru', { hour:'2-digit', minute:'2-digit' }), read: false };
    setChats(prev => prev.map(c => c.id === active ? { ...c, messages: [...c.messages, msg], lastMsg: msg.text, lastTime: 'сейчас' } : c));
    setInput('');
  };

  const filtered = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const totalUnread = chats.reduce((s, c) => s + c.unread, 0);

  return (
    <PageWrapper noPadding>
      <div className="flex h-full overflow-hidden">
        {/* Sidebar */}
        <div className={`flex flex-col shrink-0 w-full md:w-72 bg-white border-r border-slate-200 overflow-hidden ${mobile === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <h1 className="text-base font-black text-slate-800 flex-1">Сообщения</h1>
              {totalUnread > 0 && <span className="text-[10px] font-black bg-proji-primary text-white px-2 py-0.5 rounded-full">{totalUnread}</span>}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <Search size={13} className="text-slate-300 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
                className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(c => (
              <button key={c.id} onClick={() => openChat(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${active === c.id ? 'bg-proji-primary/5' : ''}`}>
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${c.color}`}>{c.avatar}</div>
                  {c.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">{c.lastTime}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && <div className="w-4 h-4 bg-proji-primary text-white rounded-full text-[10px] font-black flex items-center justify-center shrink-0">{c.unread}</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {activeChat ? (
          <div className={`flex-1 flex flex-col overflow-hidden bg-[#f5f7fc] ${mobile === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
              <button onClick={() => setMobile('list')} className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                <Search size={14} className="rotate-0" />
              </button>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${activeChat.color}`}>{activeChat.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{activeChat.name}</p>
                <p className="text-[10px] text-slate-400">{activeChat.online ? '● В сети' : 'Оффлайн'} · {activeChat.role}</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><Phone size={14} /></button>
                <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><Video size={14} /></button>
                <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><MoreHorizontal size={14} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeChat.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
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

            {/* Input */}
            <div className="bg-white border-t border-slate-200 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Написать сообщение..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-proji-primary/40 transition-colors"
                />
                <button onClick={send} disabled={!input.trim()}
                  className="p-2.5 bg-proji-primary text-white rounded-2xl hover:bg-proji-primary/90 disabled:opacity-40 transition-all active:scale-95">
                  <Send size={15} />
                </button>
              </div>
            </div>
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
