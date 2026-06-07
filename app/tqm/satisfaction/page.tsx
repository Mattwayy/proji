'use client';
import { motion } from 'motion/react';
import { Smile, Star, TrendingUp, TrendingDown, Users, MessageSquare } from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';

const NPS_HISTORY = [
  { month:'Янв', score:58 }, { month:'Фев', score:61 }, { month:'Мар', score:63 },
  { month:'Апр', score:60 }, { month:'Май', score:65 }, { month:'Июн', score:67 },
];

const SEGMENTS = [
  { label:'Промоутеры (9-10)', count:42, pct:52, cls:'bg-emerald-500' },
  { label:'Нейтральные (7-8)', count:24, pct:30, cls:'bg-amber-400'   },
  { label:'Критики (0-6)',     count:15, pct:18, cls:'bg-red-400'      },
];

const REVIEWS = [
  { name:'Дмитрий Ф.',  org:'Альфа Групп',  score:10, text:'Отличный продукт! Значительно упростил управление проектами. Команда в восторге.',                  date:'04.06.2026', avatar:'ДФ', color:'bg-blue-100 text-blue-700'   },
  { name:'Евгений Б.',  org:'Строй Холдинг', score:8,  text:'Удобный интерфейс, быстро разобрались. Хотим кастомные дашборды — очень ждём эту функцию.',        date:'02.06.2026', avatar:'ЕБ', color:'bg-emerald-100 text-emerald-700'},
  { name:'Кирилл Ж.',   org:'ТехноМаркет',   score:9,  text:'Поддержка отвечает быстро. Интеграция с нашим CRM прошла гладко. Рекомендую.',                      date:'01.06.2026', avatar:'КЖ', color:'bg-sky-100 text-sky-700'       },
  { name:'Анонимно',    org:'—',              score:6,  text:'Иногда лагает при загрузке больших файлов. Производительность нужно улучшить.',                     date:'30.05.2026', avatar:'АН', color:'bg-slate-100 text-slate-600'   },
  { name:'Светлана П.', org:'МедСтар',        score:10, text:'Перешли с Excel — разница огромная. Теперь все задачи в одном месте. Спасибо команде!',            date:'29.05.2026', avatar:'СП', color:'bg-rose-100 text-rose-700'    },
];

const max = Math.max(...NPS_HISTORY.map(n => n.score));

export default function SatisfactionPage() {
  const currentNPS = NPS_HISTORY[NPS_HISTORY.length - 1].score;
  const prevNPS    = NPS_HISTORY[NPS_HISTORY.length - 2].score;
  const delta      = currentNPS - prevNPS;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <Smile size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Удовлетворённость клиентов</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">NPS, отзывы и сегментация клиентов</p>

        {/* NPS hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border-2 border-proji-primary/20 rounded-2xl p-5 col-span-1 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Текущий NPS</p>
            <p className="text-6xl font-black text-proji-primary">{currentNPS}</p>
            <div className={`flex items-center gap-1 mt-2 text-sm font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {delta >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {delta >= 0 ? '+' : ''}{delta} к прошлому месяцу
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Динамика NPS</p>
            <div className="flex items-end gap-3 h-20">
              {NPS_HISTORY.map((n, i) => (
                <div key={n.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-slate-400">{n.score}</span>
                  <div className="w-full rounded-t-lg transition-all"
                    style={{ height: `${(n.score / 80) * 56}px`, background: i === NPS_HISTORY.length - 1 ? 'var(--color-proji-primary, #4f46e5)' : '#e2e8f0' }} />
                  <span className="text-[9px] text-slate-400">{n.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Segments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Сегментация ответов (81 ответ)</p>
          <div className="space-y-3">
            {SEGMENTS.map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">{s.label}</span>
                  <span className="text-xs font-black text-slate-700">{s.count} чел. · {s.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${s.pct}%` }} transition={{ duration:0.6, delay:0.1 }}
                    className={`h-full rounded-full ${s.cls}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Последние отзывы</p>
        <div className="space-y-3">
          {REVIEWS.map((r, i) => (
            <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
              className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${r.color}`}>{r.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-700">{r.name}</p>
                    {r.org !== '—' && <span className="text-[10px] text-slate-400">{r.org}</span>}
                    <div className="ml-auto flex items-center gap-0.5">
                      {[...Array(10)].map((_, j) => (
                        <div key={j} className={`w-2 h-2 rounded-full ${j < r.score ? 'bg-proji-primary' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{r.text}</p>
                  <p className="text-[10px] text-slate-300 mt-1.5">{r.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
