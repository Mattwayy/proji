'use client';
import { motion } from 'motion/react';
import { Users, BarChart3, Calendar, Briefcase, AlertCircle } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

interface Resource { name:string; avatar:string; color:string; role:string; utilization:number; projects:string[]; nextFree:string; load:'overloaded'|'busy'|'available'; }

const RESOURCES: Resource[] = [
  { name:'Иван Петров',    avatar:'ИП', color:'bg-blue-100 text-blue-700',    role:'Рук. разработки',   utilization:95, projects:['API v3','MVP PWA','SSO'],           nextFree:'01.08.2026', load:'overloaded' },
  { name:'Мария Смирнова', avatar:'МС', color:'bg-violet-100 text-violet-700', role:'Ведущий дизайнер',  utilization:80, projects:['UI-кит 2.0','Онбординг'],           nextFree:'15.07.2026', load:'busy'       },
  { name:'Алексей Козлов', avatar:'АК', color:'bg-emerald-100 text-emerald-700',role:'Маркетолог',       utilization:70, projects:['Летняя кампания','SEO','Аналитика'], nextFree:'01.07.2026', load:'busy'       },
  { name:'Елена Новикова',  avatar:'ЕН', color:'bg-amber-100 text-amber-700',  role:'Аналитик данных',   utilization:60, projects:['Отчёт Q2','KPI Dashboard'],          nextFree:'20.06.2026', load:'available'  },
  { name:'Сергей Волков',   avatar:'СВ', color:'bg-rose-100 text-rose-700',    role:'Разработчик',       utilization:88, projects:['OAuth','API v3','Bugfix sprint'],     nextFree:'10.07.2026', load:'busy'       },
];

const LOAD_CFG: Record<Resource['load'],{label:string;bar:string;cls:string}> = {
  overloaded: { label:'Перегружен', bar:'bg-red-500',    cls:'text-red-600' },
  busy:       { label:'Занят',      bar:'bg-amber-400',  cls:'text-amber-600' },
  available:  { label:'Доступен',   bar:'bg-emerald-500',cls:'text-emerald-600' },
};

const totalUtil = Math.round(RESOURCES.reduce((s,r) => s + r.utilization, 0) / RESOURCES.length);
const overloaded = RESOURCES.filter(r => r.load === 'overloaded').length;
const available  = RESOURCES.filter(r => r.load === 'available').length;

export default function ResourcesPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <Users size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Ресурсы</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Загрузка команды и планирование мощностей</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <BarChart3 size={20} className="text-proji-primary shrink-0" />
            <div><p className="text-2xl font-black text-slate-800">{totalUtil}%</p><p className="text-[10px] text-slate-400">Средняя загрузка</p></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <div><p className="text-2xl font-black text-red-500">{overloaded}</p><p className="text-[10px] text-slate-400">Перегружено</p></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <Users size={20} className="text-emerald-500 shrink-0" />
            <div><p className="text-2xl font-black text-emerald-600">{available}</p><p className="text-[10px] text-slate-400">Доступны</p></div>
          </div>
        </div>

        <div className="space-y-3">
          {RESOURCES.sort((a,b) => b.utilization - a.utilization).map((r, i) => {
            const cfg = LOAD_CFG[r.load];
            return (
              <motion.div key={r.name} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${r.color}`}>{r.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-black text-slate-800">{r.name}</p>
                      <span className={`text-[10px] font-bold ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{r.role}</p>

                    {/* Utilization bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                        <span>Загрузка</span>
                        <span className="font-bold">{r.utilization}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width:0 }} animate={{ width:`${r.utilization}%` }} transition={{ duration:0.6, delay: i*0.06 + 0.1 }}
                          className={`h-full rounded-full ${cfg.bar}`} />
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Briefcase size={11} className="text-slate-400 shrink-0" />
                      {r.projects.map(p => (
                        <span key={p} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={9}/> Свободен: {r.nextFree}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
