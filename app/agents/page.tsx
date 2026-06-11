'use client';
import { useState } from 'react';
import { useModalClose } from '../../src/hooks/useModalClose';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, Lock, Sparkles, Brain, Scale, BarChart3, TrendingUp,
  CheckCircle2, X, Zap, Shield, Clock,
} from 'lucide-react';

type Tier = 'base' | 'advanced' | 'pro' | 'max';

const TIERS: { id: Tier; name: string; price: string; color: string; accent: string }[] = [
  { id: 'base',     name: 'Base',     price: 'Бесплатно', color: 'bg-slate-50 border-slate-200',   accent: 'text-slate-600' },
  { id: 'advanced', name: 'Advanced', price: '€20 / мес', color: 'bg-blue-50 border-blue-200',     accent: 'text-blue-600' },
  { id: 'pro',      name: 'Pro',      price: '€30 / мес', color: 'bg-violet-50 border-violet-200', accent: 'text-violet-600' },
  { id: 'max',      name: 'Max',      price: '€50 / мес', color: 'bg-amber-50 border-amber-200',   accent: 'text-amber-600' },
];

type Agent = {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgGradient: string;
  tier: Tier;
  locked: boolean;
  soon?: boolean;
  features: string[];
};

const AGENTS: Agent[] = [
  {
    id: 'basic',
    name: 'Базовый помощник',
    tagline: 'Универсальный AI для ежедневных задач',
    icon: Bot,
    iconColor: 'text-slate-600',
    bgGradient: 'from-slate-100 to-slate-200',
    tier: 'base',
    locked: false,
    features: [
      'Ответы на общие вопросы',
      'Составление писем и документов',
      'Анализ простых задач',
      'Суммаризация текстов',
      'Работа с заметками',
    ],
  },
  {
    id: 'analyst',
    name: 'Аналитик Данных',
    tagline: 'Глубокий анализ и бизнес-инсайты',
    icon: BarChart3,
    iconColor: 'text-blue-600',
    bgGradient: 'from-blue-100 to-blue-200',
    tier: 'advanced',
    locked: true,
    features: [
      'Анализ финансовых отчётов',
      'Построение прогнозов и трендов',
      'Интерпретация KPI и метрик',
      'Визуализация данных',
      'Сравнительный бенчмаркинг',
      'Выявление аномалий',
      'Автоматические дашборды',
    ],
  },
  {
    id: 'strategist',
    name: 'Стратег',
    tagline: 'Планирование и OKR на новом уровне',
    icon: Brain,
    iconColor: 'text-violet-600',
    bgGradient: 'from-violet-100 to-violet-200',
    tier: 'pro',
    locked: true,
    features: [
      'Генерация стратегических OKR',
      'SWOT и PESTEL анализ',
      'Построение дорожных карт',
      'Сценарное планирование',
      'Анализ конкурентной среды',
      'Приоритизация инициатив',
      'Каскадирование целей по командам',
      'Стратегические ретроспективы',
    ],
  },
  {
    id: 'legal',
    name: 'Юридический советник',
    tagline: 'Контракты, комплаенс и правовые риски',
    icon: Scale,
    iconColor: 'text-amber-600',
    bgGradient: 'from-amber-100 to-amber-200',
    tier: 'max',
    locked: true,
    features: [
      'Проверка и составление договоров',
      'Выявление правовых рисков',
      'Комплаенс-анализ',
      'Защита интеллектуальной собственности',
      'Шаблоны юридических документов',
      'Мониторинг законодательства',
      'Корпоративное право',
      'Досудебное урегулирование споров',
      'NDA и конфиденциальность',
    ],
  },
  {
    id: 'finance',
    name: 'Финансовый эксперт',
    tagline: 'Бюджетирование, прогнозы и P&L',
    icon: TrendingUp,
    iconColor: 'text-emerald-600',
    bgGradient: 'from-emerald-100 to-emerald-200',
    tier: 'pro',
    locked: true,
    features: [
      'Финансовое моделирование',
      'Анализ P&L и Cash Flow',
      'Бюджетирование по подразделениям',
      'Оценка инвестиционных проектов',
      'Прогнозирование выручки',
      'Управление дебиторской задолженностью',
      'Оптимизация налоговой нагрузки',
      'Сценарии стресс-тестирования',
    ],
  },
  {
    id: 'soon',
    name: 'Скоро появится',
    tagline: 'Новый агент в разработке',
    icon: Clock,
    iconColor: 'text-slate-400',
    bgGradient: 'from-slate-100 to-slate-150',
    tier: 'max',
    locked: true,
    soon: true,
    features: [
      'Функционал в разработке',
      'Следите за обновлениями',
      'Уведомим при запуске',
    ],
  },
];

function TierBadge({ tier }: { tier: Tier }) {
  const map: Record<Tier, string> = {
    base:     'bg-slate-100 text-slate-500',
    advanced: 'bg-blue-100 text-blue-600',
    pro:      'bg-violet-100 text-violet-600',
    max:      'bg-amber-100 text-amber-600',
  };
  const labels: Record<Tier, string> = { base: 'Base', advanced: 'Advanced', pro: 'Pro', max: 'Max' };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${map[tier]}`}>
      {labels[tier]}
    </span>
  );
}

export default function AgentsPage() {
  const router = useRouter();
  const [pricingModal, setPricingModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  useModalClose(() => setPricingModal(false), pricingModal);

  const handleCardClick = (agent: Agent) => {
    if (agent.soon) return;
    if (!agent.locked) {
      router.push('/chat');
    } else {
      setPricingModal(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fc] overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-5 shrink-0">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">AI Tools · Агенты</p>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Агенты-помощники для решения задач
        </h1>
        <p className="text-sm text-slate-500 mt-1">Выберите специализированного AI-агента под вашу задачу</p>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {AGENTS.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => handleCardClick(agent)}
                style={{ height: 'clamp(320px, 70vh, 70vh)' }}
                className={`relative flex flex-col rounded-3xl border shadow-sm transition-all overflow-hidden
                  ${agent.soon
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                    : agent.locked
                      ? 'bg-white border-slate-200 cursor-pointer hover:shadow-lg hover:-translate-y-1'
                      : 'bg-white border-slate-200 cursor-pointer hover:shadow-xl hover:-translate-y-2'
                  }`}
              >
                {agent.soon ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm font-bold text-slate-400">Скоро появится</p>
                  </div>
                ) : (<>
                  {/* Image area — 20% height */}
                  <div className={`shrink-0 bg-gradient-to-br ${agent.bgGradient} flex items-center justify-center`} style={{ height: '20%' }}>
                    <Icon size={48} className={agent.iconColor} strokeWidth={1.5} />
                  </div>

                  {/* Name + tagline */}
                  <div className="px-5 pt-4 pb-3 shrink-0 border-b border-slate-100" style={{ height: '18%' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <TierBadge tier={agent.tier} />
                      {agent.locked && <Lock size={11} className="text-slate-400" />}
                    </div>
                    <h3 className="text-base font-black text-slate-800 leading-tight">{agent.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{agent.tagline}</p>
                  </div>

                  {/* Features list */}
                  <div className="flex-1 min-h-0 overflow-hidden px-5 py-4 flex flex-col gap-2.5">
                    {agent.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-blue-100 text-blue-600">
                          <CheckCircle2 size={10} />
                        </span>
                        <span className="text-[12px] text-slate-600 leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA bottom */}
                  <div className="px-5 pb-5 shrink-0">
                    <div className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-colors ${
                      agent.locked
                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}>
                      {agent.locked ? 'Разблокировать' : 'Открыть чат →'}
                    </div>
                  </div>
                </>)}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pricing Modal */}
      <AnimatePresence>
        {pricingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPricingModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Выберите тариф</h2>
                  <p className="text-sm text-slate-500 mt-1">Разблокируйте мощных AI-агентов</p>
                </div>
                <button onClick={() => setPricingModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {TIERS.map((tier) => (
                  <motion.div
                    key={tier.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${tier.color} ${
                      selectedTier === tier.id ? 'ring-2 ring-offset-2 ring-slate-800' : ''
                    }`}
                  >
                    {tier.id === 'base' && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest bg-slate-800 text-white px-2 py-0.5 rounded-full">
                        Текущий
                      </span>
                    )}
                    <p className={`text-base font-black ${tier.accent} mb-1`}>{tier.name}</p>
                    <p className="text-lg font-black text-slate-800">{tier.price}</p>
                    <div className="mt-4 space-y-1.5 text-[11px] text-slate-600">
                      {tier.id === 'base' && <>
                        <p>· Базовый помощник</p>
                        <p>· 50 запросов/день</p>
                        <p>· Стандартная скорость</p>
                      </>}
                      {tier.id === 'advanced' && <>
                        <p>· Аналитик данных</p>
                        <p>· 500 запросов/день</p>
                        <p>· Приоритетная очередь</p>
                        <p>· Экспорт отчётов</p>
                      </>}
                      {tier.id === 'pro' && <>
                        <p>· Стратег + Финансист</p>
                        <p>· Безлимитные запросы</p>
                        <p>· GPT-4o / Gemini Ultra</p>
                        <p>· API доступ</p>
                        <p>· Командный режим</p>
                      </>}
                      {tier.id === 'max' && <>
                        <p>· Все агенты</p>
                        <p>· Юридический советник</p>
                        <p>· Безлимит + выделенные мощности</p>
                        <p>· White-label</p>
                        <p>· SLA 99.9%</p>
                        <p>· Персональный менеджер</p>
                      </>}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="px-8 pb-8 flex items-center gap-3">
                <button
                  disabled={!selectedTier || selectedTier === 'base'}
                  className="flex-1 py-3 bg-slate-800 text-white text-sm font-bold rounded-2xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedTier && selectedTier !== 'base' ? `Перейти к оплате → ${TIERS.find(t => t.id === selectedTier)?.price}` : 'Выберите тариф'}
                </button>
                <button onClick={() => setPricingModal(false)} className="px-5 py-3 text-sm text-slate-500 font-medium hover:text-slate-800 transition-colors">
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
