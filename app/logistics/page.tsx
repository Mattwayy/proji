'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Truck, Package, MapPin, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type ShipStatus = 'transit' | 'delivered' | 'delayed' | 'pending';
interface Shipment { id: string; route: string; from: string; to: string; carrier: string; weight: string; status: ShipStatus; eta: string; tracking: string; }

const SHIPMENTS: Shipment[] = [
  { id:'SH-2406-001', route:'Москва → Санкт-Петербург', from:'Москва',         to:'Санкт-Петербург', carrier:'СДЭК',       weight:'142 кг',  status:'transit',   eta:'07.06.2026', tracking:'CDEK-784521' },
  { id:'SH-2406-002', route:'Екатеринбург → Москва',    from:'Екатеринбург',   to:'Москва',          carrier:'Деловые линии',weight:'88 кг',  status:'delivered', eta:'05.06.2026', tracking:'DL-228341'   },
  { id:'SH-2406-003', route:'Казань → Уфа',             from:'Казань',         to:'Уфа',             carrier:'ПЭК',        weight:'215 кг',  status:'delayed',   eta:'06.06.2026', tracking:'PEK-113902'  },
  { id:'SH-2406-004', route:'Москва → Краснодар',       from:'Москва',         to:'Краснодар',       carrier:'СДЭК',       weight:'54 кг',   status:'pending',   eta:'10.06.2026', tracking:'—'           },
  { id:'SH-2406-005', route:'Новосибирск → Омск',       from:'Новосибирск',    to:'Омск',            carrier:'ГлавДоставка',weight:'320 кг', status:'transit',   eta:'08.06.2026', tracking:'GD-445078'   },
  { id:'SH-2406-006', route:'Ростов → Волгоград',       from:'Ростов-на-Дону', to:'Волгоград',       carrier:'Деловые линии',weight:'67 кг', status:'delivered', eta:'04.06.2026', tracking:'DL-229012'   },
];

const STATUS_CFG: Record<ShipStatus,{label:string;cls:string;icon:React.ComponentType<any>}> = {
  transit:   { label:'В пути',    cls:'bg-blue-50 text-blue-700 border-blue-200',     icon:Truck        },
  delivered: { label:'Доставлено',cls:'bg-emerald-50 text-emerald-700 border-emerald-200', icon:CheckCircle2 },
  delayed:   { label:'Задержка',  cls:'bg-red-50 text-red-700 border-red-200',        icon:AlertTriangle },
  pending:   { label:'Ожидание',  cls:'bg-amber-50 text-amber-600 border-amber-200',  icon:Clock        },
};

export default function LogisticsPage() {
  const [filter, setFilter] = useState<ShipStatus|'all'>('all');
  const filtered = SHIPMENTS.filter(s => filter === 'all' || s.status === filter);

  const stats = {
    transit:   SHIPMENTS.filter(s => s.status === 'transit').length,
    delivered: SHIPMENTS.filter(s => s.status === 'delivered').length,
    delayed:   SHIPMENTS.filter(s => s.status === 'delayed').length,
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-2 mb-1 pt-1">
          <Truck size={18} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Логистика</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Отслеживание поставок и грузов</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <Truck size={20} className="text-blue-500 shrink-0" />
            <div><p className="text-2xl font-black text-blue-600">{stats.transit}</p><p className="text-[10px] text-slate-400">В пути</p></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            <div><p className="text-2xl font-black text-emerald-600">{stats.delivered}</p><p className="text-[10px] text-slate-400">Доставлено</p></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0" />
            <div><p className="text-2xl font-black text-red-500">{stats.delayed}</p><p className="text-[10px] text-slate-400">Задержек</p></div>
          </div>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {(['all','transit','delivered','delayed','pending'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter===s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {s === 'all' ? 'Все' : STATUS_CFG[s].label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((s, i) => {
            const cfg = STATUS_CFG[s.status];
            const Icon = cfg.icon;
            return (
              <motion.div key={s.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.cls.split(' ')[0]}`}>
                    <Icon size={16} className={cfg.cls.split(' ')[1]} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-black text-slate-800 flex-1">{s.id}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{s.route}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Package size={9}/> {s.weight}</span>
                      <span className="flex items-center gap-1"><Truck size={9}/> {s.carrier}</span>
                      <span className="flex items-center gap-1"><Clock size={9}/> ETA: {s.eta}</span>
                      {s.tracking !== '—' && <span className="text-slate-300">#{s.tracking}</span>}
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
