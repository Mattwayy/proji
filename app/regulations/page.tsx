'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Shield, CheckCircle2, Clock, AlertTriangle, Download } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type RegStatus = 'actual' | 'review' | 'outdated';
type RegCategory = 'HR' | 'Юридический' | 'IT' | 'Финансы' | 'Безопасность' | 'Операции';

interface Regulation { id:string; title:string; category:RegCategory; status:RegStatus; version:string; date:string; owner:string; pages:number; }

const REGULATIONS: Regulation[] = [
  { id:'r1', title:'Правила внутреннего трудового распорядка',   category:'HR',          status:'actual',   version:'3.2', date:'01.03.2026', owner:'Анна К.',     pages:24 },
  { id:'r2', title:'Политика информационной безопасности',        category:'IT',          status:'actual',   version:'2.1', date:'15.01.2026', owner:'Сергей В.',   pages:32 },
  { id:'r3', title:'Регламент обработки персональных данных',     category:'Юридический', status:'actual',   version:'1.4', date:'10.02.2026', owner:'Мария С.',    pages:18 },
  { id:'r4', title:'Положение о премировании',                   category:'Финансы',     status:'review',   version:'2.0', date:'20.04.2026', owner:'Елена Н.',    pages:12 },
  { id:'r5', title:'Инструкция по охране труда',                 category:'Безопасность',status:'actual',   version:'4.0', date:'01.12.2025', owner:'Иван П.',     pages:41 },
  { id:'r6', title:'Регламент командировок и командировочных',   category:'Финансы',     status:'outdated', version:'1.1', date:'15.06.2024', owner:'Елена Н.',    pages:8  },
  { id:'r7', title:'Политика использования корпоративных устройств',category:'IT',       status:'review',   version:'1.3', date:'01.05.2026', owner:'Сергей В.',   pages:15 },
  { id:'r8', title:'Стандарт качества обслуживания клиентов',    category:'Операции',    status:'actual',   version:'2.3', date:'10.01.2026', owner:'Алексей К.',  pages:20 },
];

const STATUS_CFG: Record<RegStatus,{label:string;cls:string;icon:React.ComponentType<any>}> = {
  actual:   { label:'Актуален',      cls:'bg-emerald-50 text-emerald-700 border-emerald-200', icon:CheckCircle2  },
  review:   { label:'На пересмотре', cls:'bg-amber-50 text-amber-700 border-amber-200',       icon:Clock         },
  outdated: { label:'Устарел',       cls:'bg-red-50 text-red-600 border-red-200',             icon:AlertTriangle },
};

const CAT_ICON: Record<RegCategory, string> = { HR:'👥', Юридический:'⚖️', IT:'💻', Финансы:'💰', Безопасность:'🛡️', Операции:'⚙️' };

const CATS: RegCategory[] = ['HR', 'Юридический', 'IT', 'Финансы', 'Безопасность', 'Операции'];

export default function RegulationsPage() {
  const [catFilter, setCatFilter] = useState<RegCategory|'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RegStatus|'all'>('all');

  const filtered = REGULATIONS.filter(r =>
    (catFilter === 'all' || r.category === catFilter) &&
    (statusFilter === 'all' || r.status === statusFilter)
  );

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <Shield size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Регламенты</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Корпоративные документы, политики и инструкции</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['actual','review','outdated'] as RegStatus[]).map(s => {
            const cfg = STATUS_CFG[s];
            const Icon = cfg.icon;
            return (
              <div key={s} className={`bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow ${statusFilter===s ? 'border-proji-primary/40' : ''}`}
                onClick={() => setStatusFilter(statusFilter===s ? 'all' : s)}>
                <Icon size={18} className={cfg.cls.split(' ')[1]} />
                <div>
                  <p className="text-xl font-black text-slate-800">{REGULATIONS.filter(r=>r.status===s).length}</p>
                  <p className="text-[10px] text-slate-400">{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          <button onClick={() => setCatFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${catFilter==='all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            Все
          </button>
          {CATS.map(c => (
            <button key={c} onClick={() => setCatFilter(catFilter===c ? 'all' : c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${catFilter===c ? 'bg-proji-primary text-white border-proji-primary' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {CAT_ICON[c]} {c}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((r, i) => {
            const s = STATUS_CFG[r.status];
            const SIcon = s.icon;
            return (
              <motion.div key={r.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:shadow-sm transition-shadow">
                <FileText size={16} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{r.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                    <span>{CAT_ICON[r.category]} {r.category}</span>
                    <span>v{r.version} · {r.date}</span>
                    <span>{r.owner}</span>
                    <span>{r.pages} стр.</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 flex items-center gap-1 ${s.cls}`}>
                  <SIcon size={9} /> {s.label}
                </span>
                <button className="p-2 rounded-xl text-slate-300 hover:text-proji-primary hover:bg-proji-primary/5 transition-colors shrink-0">
                  <Download size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
