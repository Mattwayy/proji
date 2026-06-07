'use client';
import { motion } from 'motion/react';
import { Trophy, Star, Zap, Users, Crown, Lock, CheckCircle2 } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

const LEADERBOARD = [
  { rank:1, name:'Иван Петров',    avatar:'ИП', color:'bg-blue-100 text-blue-700',    points:2840, badges:8,  medal:'🥇' },
  { rank:2, name:'Мария Смирнова', avatar:'МС', color:'bg-violet-100 text-violet-700', points:2210, badges:6,  medal:'🥈' },
  { rank:3, name:'Алексей Козлов', avatar:'АК', color:'bg-emerald-100 text-emerald-700',points:1980, badges:5, medal:'🥉' },
  { rank:4, name:'Елена Новикова',  avatar:'ЕН', color:'bg-amber-100 text-amber-700',  points:1650, badges:4,  medal:null },
  { rank:5, name:'Сергей Волков',   avatar:'СВ', color:'bg-rose-100 text-rose-700',    points:1420, badges:3,  medal:null },
];

const MY_STATS = { points:1980, rank:3, badges:5, streak:12, tasksThisWeek:14 };

const ACHIEVEMENTS = [
  { id:'a1', icon:'🚀', name:'Первый старт',        desc:'Создал первый проект',              unlocked:true,  points:50  },
  { id:'a2', icon:'⚡', name:'Скорострел',           desc:'Закрыл 10 задач за день',           unlocked:true,  points:100 },
  { id:'a3', icon:'🔥', name:'На страже',            desc:'12 дней подряд без пропусков',      unlocked:true,  points:150 },
  { id:'a4', icon:'🤝', name:'Командный игрок',      desc:'Назначил 20 задач коллегам',        unlocked:true,  points:120 },
  { id:'a5', icon:'📊', name:'Аналитик',             desc:'Создал 5 отчётов',                  unlocked:true,  points:80  },
  { id:'a6', icon:'🏆', name:'MVP недели',           desc:'Лучший результат за 7 дней',        unlocked:false, points:200 },
  { id:'a7', icon:'💡', name:'Инноватор',            desc:'Предложил 3 улучшения (приняты)',   unlocked:false, points:180 },
  { id:'a8', icon:'👑', name:'Легенда',              desc:'Набери 5000 очков',                 unlocked:false, points:500 },
];

export default function GamificationPage() {
  const unlocked = ACHIEVEMENTS.filter(a => a.unlocked).length;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <Trophy size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Геймификация</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Достижения, рейтинги и награды команды</p>

        {/* My stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label:'Мои очки',    value:MY_STATS.points.toLocaleString('ru'), icon:Star,    cls:'text-amber-500' },
            { label:'Место',       value:`#${MY_STATS.rank}`,                  icon:Crown,   cls:'text-violet-500'},
            { label:'Серия',       value:`${MY_STATS.streak} дн.`,             icon:Zap,     cls:'text-blue-500'  },
            { label:'Достижений',  value:`${unlocked}/${ACHIEVEMENTS.length}`, icon:Trophy,  cls:'text-emerald-500'},
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
                <Icon size={16} className={`${s.cls} mx-auto mb-1`} />
                <p className="text-xl font-black text-slate-800">{s.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Топ команды</p>
            <div className="space-y-2">
              {LEADERBOARD.map((p, i) => (
                <motion.div key={p.rank} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }}
                  className={`bg-white border rounded-2xl px-4 py-3 flex items-center gap-3 ${p.rank === MY_STATS.rank ? 'border-proji-primary/40 shadow-sm' : 'border-slate-200'}`}>
                  <span className="text-lg w-6 text-center shrink-0">{p.medal ?? `${p.rank}`}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${p.color}`}>{p.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.badges} значков</p>
                  </div>
                  <p className="text-sm font-black text-slate-700">{p.points.toLocaleString('ru')} <span className="text-[10px] font-normal text-slate-400">pts</span></p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Достижения</p>
            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i*0.04 }}
                  className={`rounded-2xl border p-3 transition-all ${a.unlocked ? 'bg-white border-slate-200 hover:shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xl">{a.unlocked ? a.icon : '🔒'}</span>
                    <span className="text-[10px] font-bold text-amber-500">+{a.points} pts</span>
                  </div>
                  <p className={`text-xs font-bold leading-tight ${a.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>{a.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{a.desc}</p>
                  {a.unlocked && <CheckCircle2 size={11} className="text-emerald-500 mt-1.5" />}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
