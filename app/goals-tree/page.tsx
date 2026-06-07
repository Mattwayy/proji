'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, ChevronRight, ChevronDown, CheckCircle2, TrendingUp } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

interface Goal { id:string; title:string; owner:string; progress:number; level:0|1|2; children?:Goal[]; }

const TREE: Goal = {
  id:'g0', level:0, title:'Стать лидером рынка B2B SaaS в РФ к 2027 году', owner:'CEO', progress:58,
  children:[
    {
      id:'g1', level:1, title:'Достичь ARR 50 млн ₽', owner:'CFO', progress:52,
      children:[
        { id:'g1a', level:2, title:'Вырасти до 500 платящих клиентов', owner:'Продажи', progress:59 },
        { id:'g1b', level:2, title:'Запустить Enterprise-тариф', owner:'Product', progress:40 },
        { id:'g1c', level:2, title:'Снизить CAC до 15 тыс. ₽', owner:'Маркетинг', progress:65 },
      ],
    },
    {
      id:'g2', level:1, title:'Выйти на NPS > 80', owner:'CPO', progress:60,
      children:[
        { id:'g2a', level:2, title:'Запустить мобильное приложение', owner:'Разработка', progress:35 },
        { id:'g2b', level:2, title:'Сократить время ответа поддержки до 1 ч', owner:'Сервис', progress:75 },
        { id:'g2c', level:2, title:'Запустить базу знаний самообслуживания', owner:'HR', progress:80 },
      ],
    },
    {
      id:'g3', level:1, title:'Обеспечить технологическое лидерство', owner:'CTO', progress:62,
      children:[
        { id:'g3a', level:2, title:'Выпустить публичный API v3', owner:'Разработка', progress:20 },
        { id:'g3b', level:2, title:'Запустить AI-рекомендации', owner:'Data', progress:45 },
        { id:'g3c', level:2, title:'Uptime платформы 99.99%', owner:'DevOps', progress:88 },
      ],
    },
  ],
};

const LEVEL_CLS = [
  'bg-proji-primary text-white border-proji-primary',
  'bg-blue-50 text-blue-800 border-blue-300',
  'bg-white text-slate-700 border-slate-200',
];

function GoalCard({ goal, defaultOpen = false }: { goal: Goal; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!goal.children?.length;
  const lsCls = LEVEL_CLS[goal.level];
  const pctColor = goal.progress >= 80 ? 'bg-emerald-500' : goal.progress >= 50 ? 'bg-blue-500' : 'bg-amber-400';

  return (
    <div>
      <div className={`border-2 rounded-2xl p-4 ${lsCls} ${hasChildren ? 'cursor-pointer' : ''} hover:shadow-sm transition-shadow`}
        onClick={() => hasChildren && setOpen(v => !v)}>
        <div className="flex items-start gap-3">
          <Target size={15} className={goal.level === 0 ? 'text-white shrink-0 mt-0.5' : 'text-proji-primary shrink-0 mt-0.5'} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-black leading-snug mb-1 ${goal.level === 0 ? 'text-white' : 'text-slate-800'}`}>{goal.title}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-semibold ${goal.level === 0 ? 'text-white/70' : 'text-slate-400'}`}>{goal.owner}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${goal.level === 0 ? 'bg-white/20' : 'bg-slate-100'}`}>
                <div className={`h-full rounded-full ${goal.level === 0 ? 'bg-white' : pctColor}`} style={{ width:`${goal.progress}%` }} />
              </div>
              <span className={`text-[10px] font-black shrink-0 ${goal.level === 0 ? 'text-white' : goal.progress >= 80 ? 'text-emerald-600' : goal.progress >= 50 ? 'text-blue-600' : 'text-amber-500'}`}>{goal.progress}%</span>
            </div>
          </div>
          {hasChildren && (
            <div className={`shrink-0 ${goal.level === 0 ? 'text-white' : 'text-slate-400'}`}>
              {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </div>
          )}
        </div>
      </div>
      {hasChildren && open && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-slate-200 pl-4">
          {goal.children!.map((child, i) => (
            <motion.div key={child.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.05 }}>
              <GoalCard goal={child} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GoalsTreePage() {
  const allGoals = [TREE, ...(TREE.children ?? []), ...(TREE.children?.flatMap(c => c.children ?? []) ?? [])];
  const avg = Math.round(allGoals.reduce((s,g) => s + g.progress, 0) / allGoals.length);
  const done = allGoals.filter(g => g.progress >= 80).length;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <Target size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Дерево целей</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Иерархия стратегических, тактических и операционных целей</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-proji-primary">{avg}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Средний прогресс</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-emerald-600">{done}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Почти достигнуто</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-slate-700">{allGoals.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Всего целей</p>
          </div>
        </div>

        <GoalCard goal={TREE} defaultOpen />
      </div>
    </PageWrapper>
  );
}
