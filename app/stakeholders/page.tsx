'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Star, TrendingUp, Phone, Mail, ChevronDown, Search } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type Influence = 'high' | 'medium' | 'low';
type Interest  = 'high' | 'medium' | 'low';
type Relation  = 'partner' | 'client' | 'investor' | 'regulator' | 'internal';

interface Stakeholder {
  id: string; name: string; org: string; role: string;
  relation: Relation; influence: Influence; interest: Interest;
  email: string; phone: string; notes: string; lastContact: string;
  avatar: string; color: string;
}

const STAKEHOLDERS: Stakeholder[] = [
  { id:'1', name:'Дмитрий Фролов',   org:'Альфа Групп',             role:'Директор по IT',      relation:'client',    influence:'high',   interest:'high',   email:'d.frolov@alfagroup.ru',   phone:'+7 495 123-45-67', notes:'Ключевой клиент. Готов продлить контракт на 18 мес при добавлении модуля аналитики. Следующий звонок: 12 июня 15:00.', lastContact:'05.06.2026', avatar:'ДФ', color:'bg-blue-100 text-blue-700'   },
  { id:'2', name:'Светлана Орлова',  org:'Фонд «Импульс»',          role:'Партнёр',              relation:'investor',  influence:'high',   interest:'medium', email:'s.orlova@impulse.vc',     phone:'+7 916 234-56-78', notes:'Участвует в раунде A. Ожидает квартальный отчёт по метрикам роста.', lastContact:'01.06.2026', avatar:'СО', color:'bg-violet-100 text-violet-700' },
  { id:'3', name:'Алексей Романов',  org:'МТС Digital',             role:'Директор партнёрств',  relation:'partner',   influence:'high',   interest:'high',   email:'a.romanov@mts.ru',        phone:'+7 926 345-67-89', notes:'Обсуждаем интеграцию с МТС экосистемой. Пилот — Q3 2026.',             lastContact:'04.06.2026', avatar:'АР', color:'bg-red-100 text-red-700'       },
  { id:'4', name:'Ирина Захарова',   org:'ФНС России',              role:'Инспектор',            relation:'regulator', influence:'high',   interest:'low',    email:'i.zakharova@nalog.gov.ru',phone:'+7 495 456-78-90', notes:'Плановая проверка — сентябрь 2026. Подготовить пакет документов НДС.',  lastContact:'20.04.2026', avatar:'ИЗ', color:'bg-slate-100 text-slate-700'   },
  { id:'5', name:'Евгений Белов',    org:'Строй Холдинг',           role:'CFO',                  relation:'client',    influence:'medium', interest:'high',   email:'e.belov@stroy.ru',        phone:'+7 903 567-89-01', notes:'Заинтересован в модуле управления стройпроектами. Демо запланировано.', lastContact:'03.06.2026', avatar:'ЕБ', color:'bg-emerald-100 text-emerald-700'},
  { id:'6', name:'Ольга Никитина',   org:'Команда Proji',           role:'Product Owner',        relation:'internal',  influence:'high',   interest:'high',   email:'o.nikitina@proji.ru',     phone:'+7 999 678-90-12', notes:'Отвечает за приоритеты продукта и коммуникацию с клиентами.',            lastContact:'06.06.2026', avatar:'ОН', color:'bg-amber-100 text-amber-700'   },
  { id:'7', name:'Кирилл Жуков',     org:'ТехноМаркет',             role:'Рук. разработки',      relation:'client',    influence:'medium', interest:'medium', email:'k.zhukov@technomarket.ru',phone:'+7 911 789-01-23', notes:'Использует платформу 3 мес. Есть запросы по кастомизации дашборда.',    lastContact:'02.06.2026', avatar:'КЖ', color:'bg-sky-100 text-sky-700'       },
];

const INFLUENCE_LABEL: Record<Influence,string> = { high:'Высокое', medium:'Среднее', low:'Низкое' };
const INTEREST_LABEL:  Record<Interest, string> = { high:'Высокий', medium:'Средний', low:'Низкий' };
const RELATION_CFG: Record<Relation,{label:string;cls:string}> = {
  partner:   { label:'Партнёр',    cls:'bg-blue-50 text-blue-700 border-blue-200'       },
  client:    { label:'Клиент',     cls:'bg-emerald-50 text-emerald-700 border-emerald-200' },
  investor:  { label:'Инвестор',   cls:'bg-violet-50 text-violet-700 border-violet-200' },
  regulator: { label:'Регулятор',  cls:'bg-slate-100 text-slate-600 border-slate-200'   },
  internal:  { label:'Внутренний', cls:'bg-amber-50 text-amber-700 border-amber-200'    },
};

const QUADRANTS = [
  { inf:'high', int:'high', label:'Управлять вплотную', cls:'border-blue-300 bg-blue-50/40'    },
  { inf:'high', int:'low',  label:'Держать в курсе',    cls:'border-violet-300 bg-violet-50/40' },
  { inf:'low',  int:'high', label:'Информировать',      cls:'border-emerald-300 bg-emerald-50/40'},
  { inf:'low',  int:'low',  label:'Наблюдать',          cls:'border-slate-200 bg-slate-50'       },
];

export default function StakeholdersPage() {
  const [view,   setView]   = useState<'list'|'matrix'>('list');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Relation|'all'>('all');
  const [open,   setOpen]   = useState<string|null>(null);

  const filtered = STAKEHOLDERS.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.org.toLowerCase().includes(q))
      && (filter === 'all' || s.relation === filter);
  });

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center justify-between mb-1 pt-1">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">Стейкхолдеры</h1>
          </div>
          <div className="flex gap-2">
            {(['list','matrix'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${view===v ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {v === 'list' ? 'Список' : 'Матрица'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6">Карта влияния и интересов ключевых сторон</p>

        <div className="flex gap-2 mb-5 flex-wrap items-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-2xl flex-1 min-w-[160px] max-w-xs">
            <Search size={13} className="text-slate-300 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none" />
          </div>
          {(['all','client','partner','investor','regulator','internal'] as const).map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter===r ? 'bg-proji-primary text-white border-proji-primary' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {r === 'all' ? 'Все' : RELATION_CFG[r].label}
            </button>
          ))}
        </div>

        {view === 'list' ? (
          <div className="space-y-3">
            {filtered.map((s, i) => {
              const rel = RELATION_CFG[s.relation];
              const isOpen = open === s.id;
              return (
                <motion.div key={s.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => setOpen(isOpen ? null : s.id)}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${s.color}`}>{s.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-slate-800">{s.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rel.cls}`}>{rel.label}</span>
                      </div>
                      <p className="text-xs text-slate-500">{s.role} · {s.org}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Star size={9} /> {INFLUENCE_LABEL[s.influence]}</span>
                      <span className="flex items-center gap-1"><TrendingUp size={9} /> {INTEREST_LABEL[s.interest]}</span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-300 shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 py-4 space-y-3">
                      <p className="text-sm text-slate-600 leading-relaxed">{s.notes}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 hover:text-proji-primary transition-colors"><Mail size={11} /> {s.email}</a>
                        <span className="flex items-center gap-1.5"><Phone size={11} /> {s.phone}</span>
                        <span className="flex items-center gap-1.5 ml-auto text-slate-400">Контакт: {s.lastContact}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {QUADRANTS.map(q => {
              const items = STAKEHOLDERS.filter(s => s.influence === q.inf && s.interest === q.int);
              return (
                <div key={`${q.inf}-${q.int}`} className={`border-2 rounded-2xl p-4 min-h-[160px] ${q.cls}`}>
                  <p className="text-xs font-black text-slate-700 mb-1 uppercase tracking-wide">{q.label}</p>
                  <p className="text-[10px] text-slate-400 mb-3">Влияние: {INFLUENCE_LABEL[q.inf as Influence]} · Интерес: {INTEREST_LABEL[q.int as Interest]}</p>
                  <div className="space-y-2">
                    {items.length === 0 && <p className="text-xs text-slate-300 italic">Нет стейкхолдеров</p>}
                    {items.map(s => (
                      <div key={s.id} className="flex items-center gap-2 bg-white/70 rounded-xl px-2.5 py-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 ${s.color}`}>{s.avatar}</div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{s.org}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
