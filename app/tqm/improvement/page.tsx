'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, ThumbsUp, CheckCircle2, Clock, Plus, X } from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';

type ImprovStatus = 'idea' | 'in_progress' | 'done';
interface Improvement { id: string; title: string; author: string; avatar: string; color: string; dept: string; status: ImprovStatus; votes: number; impact: 'high'|'medium'|'low'; description: string; }

const IMPROVEMENTS: Improvement[] = [
  { id:'i1', title:'No-Meeting Wednesday',                    author:'Иван П.',   avatar:'ИП', color:'bg-blue-100 text-blue-700',    dept:'Разработка',  status:'in_progress', votes:12, impact:'high',   description:'Один день без митингов для глубокой работы. Уже согласовано с командой.' },
  { id:'i2', title:'Автоматизация отчётов в 1С',              author:'Елена Н.',  avatar:'ЕН', color:'bg-amber-100 text-amber-700',   dept:'Финансы',     status:'in_progress', votes:9,  impact:'high',   description:'Скрипт выгрузки данных сократит время подготовки отчёта с 3 часов до 15 минут.' },
  { id:'i3', title:'Шаблоны онбординга для новых сотрудников',author:'Анна К.',   avatar:'АК', color:'bg-emerald-100 text-emerald-700',dept:'HR',          status:'done',        votes:7,  impact:'medium', description:'Чеклист и папка документов. Снизили время онбординга с 5 до 3 дней.' },
  { id:'i4', title:'Дашборд качества в реальном времени',     author:'Сергей В.', avatar:'СВ', color:'bg-rose-100 text-rose-700',     dept:'IT',          status:'in_progress', votes:15, impact:'high',   description:'Мониторинг KPI качества онлайн вместо еженедельных ручных отчётов.' },
  { id:'i5', title:'Стандарт code review: макс. 24 часа',     author:'Иван П.',   avatar:'ИП', color:'bg-blue-100 text-blue-700',     dept:'Разработка',  status:'done',        votes:8,  impact:'medium', description:'PR не висят больше суток. Скорость деплоя выросла на 30%.' },
  { id:'i6', title:'Еженедельный NPS-опрос команды',          author:'Мария С.',  avatar:'МС', color:'bg-violet-100 text-violet-700', dept:'HR',          status:'idea',        votes:4,  impact:'medium', description:'Короткий анонимный опрос из 3 вопросов каждую пятницу.' },
  { id:'i7', title:'База знаний в Notion для поддержки',       author:'Алексей К.',avatar:'АК', color:'bg-emerald-100 text-emerald-700',dept:'Поддержка',  status:'idea',        votes:6,  impact:'medium', description:'60% обращений — повторяющиеся вопросы. База знаний снизит нагрузку на 40%.' },
];

const STATUS_CFG: Record<ImprovStatus,{label:string;cls:string}> = {
  idea:        { label:'Идея',        cls:'bg-slate-100 text-slate-500 border-slate-200'       },
  in_progress: { label:'Внедряется',  cls:'bg-blue-50 text-blue-700 border-blue-200'           },
  done:        { label:'Внедрено',    cls:'bg-emerald-50 text-emerald-700 border-emerald-200'  },
};
const IMPACT_CLS: Record<string,string> = {
  high:   'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  low:    'bg-slate-100 text-slate-500 border-slate-200',
};
const IMPACT_LBL: Record<string,string> = { high:'Высокий', medium:'Средний', low:'Низкий' };

export default function ImprovementPage() {
  const [items, setItems] = useState<Improvement[]>(IMPROVEMENTS);
  const [filter, setFilter] = useState<ImprovStatus|'all'>('all');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc]   = useState('');

  const filtered = items.filter(i => filter === 'all' || i.status === filter);
  const vote = (id: string) => setItems(p => p.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i));
  const addIdea = () => {
    if (!newTitle.trim()) return;
    const item: Improvement = { id: Date.now().toString(), title: newTitle.trim(), author: 'Вы', avatar: 'ВЫ', color: 'bg-slate-100 text-slate-600', dept: 'Общий', status: 'idea', votes: 0, impact: 'medium', description: newDesc.trim() };
    setItems(p => [item, ...p]);
    setNewTitle(''); setNewDesc(''); setShowNew(false);
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center justify-between mb-1 pt-1">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">Кайдзен / Улучшения</h1>
          </div>
          <button onClick={() => setShowNew(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-proji-primary text-white rounded-xl text-xs font-bold hover:bg-proji-primary/90 transition-colors">
            <Plus size={13} /> Предложить
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-5">Непрерывное улучшение процессов компании</p>

        {showNew && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Новая идея</p>
              <button onClick={() => setShowNew(false)}><X size={14} className="text-slate-300" /></button>
            </div>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Название улучшения..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-proji-primary/40 transition-colors font-bold" />
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Как это улучшит процессы?" rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 outline-none resize-none leading-relaxed focus:border-proji-primary/40 transition-colors" />
            <button onClick={addIdea} disabled={!newTitle.trim()}
              className="w-full py-2.5 bg-proji-primary text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-proji-primary/90 transition-colors">
              Добавить идею
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-5 flex-wrap">
          {(['all','idea','in_progress','done'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter===s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {s === 'all' ? 'Все' : STATUS_CFG[s].label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.sort((a,b) => b.votes - a.votes).map((item, i) => (
            <motion.div key={item.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
              className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${item.color}`}>{item.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-800 flex-1 leading-snug">{item.title}</p>
                    <div className="flex gap-1 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CFG[item.status].cls}`}>{STATUS_CFG[item.status].label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-2">{item.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{item.dept}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${IMPACT_CLS[item.impact]}`}>Влияние: {IMPACT_LBL[item.impact]}</span>
                    <button onClick={() => vote(item.id)}
                      className="ml-auto flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-proji-primary border border-slate-200 hover:border-proji-primary/40 px-2.5 py-1 rounded-lg transition-colors">
                      <ThumbsUp size={11} /> {item.votes}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
