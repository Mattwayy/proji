'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from 'next-auth/react';
import { Globe, Coins, Target, Workflow, Activity, Scale, Users, Factory, Settings } from 'lucide-react';
import { useAppStore } from '../../src/store/useAppStore';
import { DomainAccessModal } from '../../src/components/DomainAccessModal';
import type { BusinessDomain } from '../../src/types';

const DOMAINS: {
  name: BusinessDomain;
  why: string;
  description: string;
  functions: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { name: 'Общий',       why: 'Единый центр управления',    description: 'Обеспечивает интеграцию всех доменов и общую координацию процессов в реальном времени.',           functions: ['Командный центр', 'Глобальный поиск', 'Общие отчеты'],       icon: Globe },
  { name: 'Финансы',     why: 'Финансовая прозрачность',    description: 'Инструменты управления денежными потоками, финансового планирования и аналитики.',                  functions: ['Бюджетирование', 'Учет активов', 'Прогноз окупаемости'],     icon: Coins },
  { name: 'Маркетинг',   why: 'Эволюция роста',             description: 'Масштабирование влияния бренда через анализ данных и управление кампаниями.',                       functions: ['SEO Мониторинг', 'Лидогенерация', 'Управление воронкой'],    icon: Target },
  { name: 'Стратегия',   why: 'Визионерское планирование',  description: 'Трансформация целей в реальные дорожные карты развития.',                                           functions: ['OKR Система', 'Анализ рынка', 'Roadmap'],                    icon: Workflow },
  { name: 'Операции',    why: 'Процессное совершенство',    description: 'Оптимизация внутренних потоков и безупречная логистика.',                                           functions: ['Ресурсная карта', 'Логистика', 'Качество'],                  icon: Activity },
  { name: 'Юридический', why: 'Правовая крепость',          description: 'Полный контроль над контрактами и интеллектуальной собственностью.',                                functions: ['Реестр договоров', 'Защита IP', 'Комплаенс'],                icon: Scale },
  { name: 'Управление',  why: 'Культура лидерства',         description: 'Развитие человеческого капитала и управление командой.',                                            functions: ['Командный пульс', 'Мотивация', 'Трекинг навыков'],           icon: Users },
  { name: 'Производство',why: 'Индустриальная мощь',        description: 'Бескомпромиссный контроль качества и эффективность линий.',                                         functions: ['TQM Dashboards', 'Стандарты', 'Supply Chain'],               icon: Factory },
  { name: 'Оборудование',why: 'Техническое превосходство',  description: 'Предиктивное обслуживание и точный учет активов.',                                                  functions: ['Журнал ремонтов', 'Учет запчастей', 'Схемы'],               icon: Settings },
];

export default function DomainsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { setCurrentDomain, setShowDomainWelcome } = useAppStore();
  const [modalDomain, setModalDomain] = useState<BusinessDomain | null>(null);

  const role = (session?.user as any)?.role as 'manager' | 'employer' | undefined;
  const allowedDomains: string[] = (session?.user as any)?.allowedDomains ?? [];
  const isManager = role === 'manager';

  const isDomainAllowed = (name: string) => {
    if (isManager) return true;
    return allowedDomains.includes('all') || allowedDomains.includes(name);
  };

  const handleConfirm = () => {
    if (!modalDomain) return;
    setCurrentDomain(modalDomain);
    setShowDomainWelcome({ domain: modalDomain, active: true });
    setModalDomain(null);
    router.push(`/domains/${encodeURIComponent(modalDomain)}`);
  };

  return (
    <>
      <div className="min-h-screen px-4 md:px-12 py-12 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 py-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              Архитектура управления
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-blue-600/60">Бизнес домены</p>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mt-4">
              Функциональное разделение для достижения максимальной эффективности в каждой области развития.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {DOMAINS.map((d, i) => {
              const allowed = isDomainAllowed(d.name);
              return (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: allowed ? -6 : -2 }}
                  onClick={() => setModalDomain(d.name)}
                  className={`group relative bg-white/80 backdrop-blur-md border p-8 rounded-[2.5rem] shadow-sm transition-all cursor-pointer overflow-hidden ${
                    allowed
                      ? 'border-slate-200/60 hover:shadow-xl'
                      : 'border-slate-200/40 opacity-60'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-400/10 transition-all duration-500 rounded-[2.5rem]" />

                  {/* Lock badge for employer on restricted domains */}
                  {!allowed && !isManager && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-[10px]">🔒</span>
                    </div>
                  )}

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-2xl transition-colors ${allowed ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-slate-100'}`}>
                        <d.icon size={22} className={allowed ? 'text-blue-600' : 'text-slate-400'} />
                      </div>
                      <span className="text-[9px] uppercase tracking-widest font-black text-blue-400/60 pt-1">{d.why}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 mb-1">{d.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{d.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {d.functions.map((fn) => (
                        <span key={fn} className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg transition-colors ${
                          allowed
                            ? 'bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {fn}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Domain Access Modal */}
      <AnimatePresence>
        {modalDomain && (
          <DomainAccessModal
            domain={modalDomain}
            isManager={isManager}
            isAllowed={isDomainAllowed(modalDomain)}
            onConfirm={handleConfirm}
            onClose={() => setModalDomain(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
