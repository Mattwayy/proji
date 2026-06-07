'use client';
import { motion } from 'motion/react';
import { Shield, CheckCircle2, AlertTriangle, TrendingUp, BarChart3, Users, ClipboardCheck, RefreshCw, Smile } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useRouter } from 'next/navigation';

const KPI = [
  { label: 'Индекс качества',   value: '94.2%', change: '+1.8%', up: true,  icon: Shield,        bg: 'bg-blue-50',    ico: 'text-blue-600'   },
  { label: 'Дефекты на 1000',   value: '2.3',   change: '-0.7',  up: true,  icon: AlertTriangle, bg: 'bg-emerald-50', ico: 'text-emerald-600'},
  { label: 'Удовл. клиентов',   value: '88%',   change: '+4%',   up: true,  icon: Smile,         bg: 'bg-violet-50',  ico: 'text-violet-600' },
  { label: 'Выполнение планов', value: '91%',   change: '+2%',   up: true,  icon: CheckCircle2,  bg: 'bg-amber-50',   ico: 'text-amber-600'  },
];

const MODULES = [
  { href: '/tqm/audits',       label: 'Аудиты',          desc: '3 аудита запланировано',    icon: ClipboardCheck, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  { href: '/tqm/dwm',          label: 'DWM-встречи',     desc: 'Ежедневные стендапы',       icon: Users,          color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200'},
  { href: '/tqm/improvement',  label: 'Улучшения',       desc: '7 кайдзен-предложений',     icon: RefreshCw,      color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200'},
  { href: '/tqm/satisfaction',  label: 'Удовлетворённость',desc: 'NPS и опросы клиентов',   icon: Smile,          color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
];

const ISSUES = [
  { title: 'Задержка поставок ОЕМ компонентов', dept: 'Производство', severity: 'high', date: '03.06.2026' },
  { title: 'Ошибки в документации v2.3',         dept: 'Разработка',   severity: 'medium', date: '04.06.2026' },
  { title: 'Несоответствие стандарту ISO 9001',   dept: 'Качество',     severity: 'high', date: '02.06.2026' },
  { title: 'Превышение времени ответа поддержки', dept: 'Поддержка',    severity: 'low',  date: '05.06.2026' },
];

const SEV_CLS: Record<string,string> = {
  high:   'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-slate-100 text-slate-500 border-slate-200',
};
const SEV_LBL: Record<string,string> = { high: 'Критично', medium: 'Важно', low: 'Незначительно' };

const quality = [72, 78, 85, 81, 90, 88, 94];
const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function TQMPage() {
  const router = useRouter();
  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <Shield size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">TQM Dashboard</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Управление качеством — Total Quality Management</p>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {KPI.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.div key={k.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${k.bg}`}>
                  <Icon size={16} className={k.ico} />
                </div>
                <p className="text-2xl font-black text-slate-800">{k.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
                <p className={`text-[10px] font-bold mt-1 ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>{k.change}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Quality chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Индекс качества — неделя</p>
            <div className="flex items-end gap-2 h-24">
              {quality.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-slate-400">{v}%</span>
                  <div className="w-full rounded-t-md bg-proji-primary/80 transition-all" style={{ height: `${(v / 100) * 72}px` }} />
                  <span className="text-[9px] text-slate-400">{dayLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Открытые несоответствия</p>
            <div className="space-y-2">
              {ISSUES.map((iss, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">{iss.title}</p>
                    <p className="text-[10px] text-slate-400">{iss.dept} · {iss.date}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${SEV_CLS[iss.severity]}`}>{SEV_LBL[iss.severity]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MODULES.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.button key={m.href} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 + i*0.05 }}
                onClick={() => router.push(m.href)}
                className={`bg-white border-2 ${m.border} rounded-2xl p-4 text-left hover:shadow-sm transition-shadow active:scale-95`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${m.bg}`}>
                  <Icon size={16} className={m.color} />
                </div>
                <p className={`text-sm font-black ${m.color}`}>{m.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
