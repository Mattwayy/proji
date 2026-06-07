'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, ThumbsUp, TrendingDown, Zap, Plus, X } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type Severity = 'critical' | 'high' | 'medium';
type Category = 'UX' | 'Процессы' | 'Технологии' | 'Команда' | 'Клиенты';

interface Pain { id: string; title: string; description: string; severity: Severity; category: Category; votes: number; reporter: string; }

const PAINS: Pain[] = [
  { id:'p1', title:'Ручной ввод данных в Excel — 40% рабочего времени', description:'Аналитики тратят почти половину дня на перенос данных между системами вручную. Нет единого источника правды.', severity:'critical', category:'Процессы', votes:18, reporter:'Елена Н.' },
  { id:'p2', title:'Нет мобильного приложения', description:'40% клиентов используют смартфоны для работы. Без мобильного приложения теряем аудиторию и конкурируем только на десктопе.', severity:'critical', category:'UX', votes:24, reporter:'Алексей К.' },
  { id:'p3', title:'Медленная загрузка при >100 задачах в проекте', description:'Время загрузки доски задач превышает 4 секунды при большом объёме данных. Клиенты жалуются на лаги.', severity:'high', category:'Технологии', votes:15, reporter:'Иван П.' },
  { id:'p4', title:'Отсутствие интеграции с 1С', description:'Крупные корпоративные клиенты требуют синхронизацию с 1С. Без этого теряем 4-5 крупных сделок в квартал.', severity:'high', category:'Технологии', votes:12, reporter:'Елена Н.' },
  { id:'p5', title:'Высокий churn после первых 30 дней', description:'25% новых пользователей уходят в первый месяц — не понимают ценность продукта. Онбординг слишком сложный.', severity:'high', category:'UX', votes:20, reporter:'Алексей К.' },
  { id:'p6', title:'Нет системы уведомлений о дедлайнах', description:'Сотрудники пропускают дедлайны, потому что не получают напоминаний. Нужны пуш-уведомления и email-дайджест.', severity:'medium', category:'UX', votes:9, reporter:'Мария С.' },
  { id:'p7', title:'Разрозненные каналы коммуникации', description:'Команда использует Telegram, email и Confluence параллельно. Информация теряется. Нужна единая точка коммуникации.', severity:'medium', category:'Команда', votes:7, reporter:'Иван П.' },
  { id:'p8', title:'Клиенты не видят прогресс по своим запросам', description:'После подачи заявки клиент не знает её статус. Звонят в поддержку чтобы узнать — нагрузка растёт.', severity:'medium', category:'Клиенты', votes:11, reporter:'Алексей К.' },
];

const SEV_CFG: Record<Severity,{label:string;cls:string;dotCls:string}> = {
  critical: { label:'Критично', cls:'bg-red-50 text-red-700 border-red-200',     dotCls:'bg-red-500'   },
  high:     { label:'Высокий',  cls:'bg-amber-50 text-amber-700 border-amber-200',dotCls:'bg-amber-400' },
  medium:   { label:'Средний',  cls:'bg-slate-100 text-slate-600 border-slate-200',dotCls:'bg-slate-400' },
};

const CATS: Category[] = ['UX', 'Процессы', 'Технологии', 'Команда', 'Клиенты'];

export default function PainsPage() {
  const [pains, setPains] = useState<Pain[]>(PAINS);
  const [catFilter, setCatFilter] = useState<Category|'all'>('all');
  const [sevFilter, setSevFilter] = useState<Severity|'all'>('all');

  const filtered = pains
    .filter(p => (catFilter === 'all' || p.category === catFilter) && (sevFilter === 'all' || p.severity === sevFilter))
    .sort((a,b) => {
      const sevOrder = { critical:0, high:1, medium:2 };
      return sevOrder[a.severity] - sevOrder[b.severity] || b.votes - a.votes;
    });

  const vote = (id: string) => setPains(prev => prev.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p));

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <TrendingDown size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Точки боли</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Проблемы клиентов и внутренние блокеры, которые мы устраняем</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['critical','high','medium'] as Severity[]).map(s => (
            <div key={s} className={`rounded-2xl border-2 p-3 text-center cursor-pointer transition-all ${sevFilter===s ? SEV_CFG[s].cls + ' border-current' : 'bg-white border-slate-200'}`}
              onClick={() => setSevFilter(sevFilter===s ? 'all' : s)}>
              <p className={`text-xl font-black ${sevFilter===s ? '' : 'text-slate-800'}`}>{PAINS.filter(p=>p.severity===s).length}</p>
              <p className={`text-[10px] font-semibold ${sevFilter===s ? '' : 'text-slate-400'}`}>{SEV_CFG[s].label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          <button onClick={() => setCatFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${catFilter==='all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500'}`}>
            Все категории
          </button>
          {CATS.map(c => (
            <button key={c} onClick={() => setCatFilter(catFilter===c ? 'all' : c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${catFilter===c ? 'bg-proji-primary text-white border-proji-primary' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((p, i) => {
            const s = SEV_CFG[p.severity];
            return (
              <motion.div key={p.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition-shadow flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dotCls}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-snug mb-1">{p.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-auto">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{p.category}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{p.reporter}</span>
                  <button onClick={() => vote(p.id)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-proji-primary border border-slate-200 hover:border-proji-primary/40 px-2.5 py-1 rounded-lg transition-colors">
                    <ThumbsUp size={11}/> {p.votes}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
