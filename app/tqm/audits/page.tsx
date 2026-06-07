'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, CheckCircle2, Clock, AlertTriangle, ChevronRight, Calendar } from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';

type AuditStatus = 'completed' | 'planned' | 'in_progress' | 'overdue';
interface AuditItem { id: string; title: string; auditor: string; dept: string; date: string; status: AuditStatus; score?: number; findings: number; }

const AUDITS: AuditItem[] = [
  { id:'a1', title:'Аудит ИСО 9001 — производство',    auditor:'Елена Н.',    dept:'Производство', date:'10.05.2026', status:'completed',  score:92, findings:3 },
  { id:'a2', title:'Внутренний аудит процессов HR',     auditor:'Анна К.',     dept:'HR',           date:'20.05.2026', status:'completed',  score:87, findings:5 },
  { id:'a3', title:'Аудит ИТ-безопасности',            auditor:'Сергей В.',   dept:'IT',           date:'02.06.2026', status:'in_progress',score:undefined, findings:0 },
  { id:'a4', title:'Аудит финансовой отчётности Q2',   auditor:'Елена Н.',    dept:'Финансы',      date:'15.06.2026', status:'planned',    findings:0 },
  { id:'a5', title:'Аудит цепочки поставок',           auditor:'Иван П.',     dept:'Логистика',    date:'25.06.2026', status:'planned',    findings:0 },
  { id:'a6', title:'Аудит качества клиентского сервиса',auditor:'Мария С.',   dept:'Сервис',       date:'28.05.2026', status:'overdue',    findings:2 },
];

const STATUS_CFG: Record<AuditStatus,{label:string;cls:string;icon:React.ComponentType<any>}> = {
  completed:   { label:'Завершён',    cls:'bg-emerald-50 text-emerald-700 border-emerald-200', icon:CheckCircle2  },
  in_progress: { label:'В процессе', cls:'bg-blue-50 text-blue-700 border-blue-200',          icon:ClipboardCheck },
  planned:     { label:'Запланирован',cls:'bg-slate-100 text-slate-500 border-slate-200',     icon:Calendar       },
  overdue:     { label:'Просрочен',  cls:'bg-red-50 text-red-700 border-red-200',             icon:AlertTriangle  },
};

export default function AuditsPage() {
  const [filter, setFilter] = useState<AuditStatus|'all'>('all');
  const filtered = AUDITS.filter(a => filter === 'all' || a.status === filter);
  const completed = AUDITS.filter(a => a.status === 'completed');
  const avgScore = Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <ClipboardCheck size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Аудиты качества</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Планирование и результаты аудитов</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-slate-800">{AUDITS.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Всего</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-emerald-600">{completed.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Завершено</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-blue-600">{avgScore}%</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Средний балл</p>
          </div>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {(['all','completed','in_progress','planned','overdue'] as const).map(s => {
            const label = s === 'all' ? 'Все' : STATUS_CFG[s].label;
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter===s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {label}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filtered.map((a, i) => {
            const s = STATUS_CFG[a.status];
            const SIcon = s.icon;
            return (
              <motion.div key={a.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.cls.split(' ').slice(0,1).join(' ')}`}>
                    <SIcon size={15} className={s.cls.split(' ').slice(1,2).join(' ')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-800 flex-1">{a.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                      <span>{a.auditor}</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-full">{a.dept}</span>
                      <span className="flex items-center gap-1"><Calendar size={9}/> {a.date}</span>
                      {a.score !== undefined && <span className="ml-auto font-bold text-slate-600">Балл: {a.score}%</span>}
                      {a.findings > 0 && <span className="text-amber-600 font-semibold">{a.findings} несоответствий</span>}
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
