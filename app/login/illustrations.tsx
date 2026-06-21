'use client';
import { FileText, CheckSquare, FolderKanban, TrendingUp, Sparkles, MessageCircle, Send } from 'lucide-react';

const animStyle = `
  @keyframes rm-right   { 0% { left:-40%; } 100% { left:130%; } }
  @keyframes dash-merge { 0% { stroke-dashoffset:70; } 100% { stroke-dashoffset:0; } }
`;

const card = 'flex-1 min-w-0 bg-white/[0.07] rounded-xl p-[12px]';

function Connector({ delay }: { delay: string }) {
  return (
    <div
      className="relative h-[2px] w-[36px] mx-1 flex-shrink-0 overflow-hidden"
      style={{ background: 'rgba(59,130,246,0.15)' }}
    >
      <div
        className="absolute top-[-4px] bottom-[-4px] w-[40%]"
        style={{
          background: 'linear-gradient(90deg,transparent,#60a5fa,transparent)',
          animation: 'rm-right 1.8s linear infinite',
          animationDelay: delay,
        }}
      />
    </div>
  );
}

function BezierMerge({ filterId }: { filterId: string }) {
  return (
    <svg width="48" height="172" viewBox="0 0 48 172" fill="none" className="flex-shrink-0">
      <defs>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M0,38 C34,38 34,86 48,86"  stroke="rgba(59,130,246,0.15)" strokeWidth="2" fill="none" />
      <path d="M0,134 C34,134 34,86 48,86" stroke="rgba(59,130,246,0.15)" strokeWidth="2" fill="none" />
      <path d="M0,38 C34,38 34,86 48,86"  stroke="#60a5fa" strokeWidth="1.5" fill="none"
            strokeDasharray="10 48" filter={`url(#${filterId})`}
            style={{ animation: 'dash-merge 1.8s linear infinite', animationDelay: '0.8s' }} />
      <path d="M0,134 C34,134 34,86 48,86" stroke="#60a5fa" strokeWidth="1.5" fill="none"
            strokeDasharray="10 48" filter={`url(#${filterId})`}
            style={{ animation: 'dash-merge 1.8s linear infinite', animationDelay: '0.8s' }} />
    </svg>
  );
}

/* ═══════════════════════════════════════
   D — Быстрое создание
═══════════════════════════════════════ */
export function IllustrationQuickCreate() {
  return (
    <div className="flex flex-col items-center gap-7 w-full text-center">
      <div>
        <h2 className="text-[2rem] font-black text-white leading-tight">Быстрое создание</h2>
        <p className="text-[1rem] font-semibold text-slate-400 mt-2 max-w-sm mx-auto">
          Добавляйте новые задачи, документы и проекты в одно нажатие через глобальное меню.
        </p>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="relative bg-white rounded-[28px] shadow-2xl p-5 pt-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-500 text-[10px] font-black">P</span>
              </div>
              <div className="h-2.5 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="h-16 bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex flex-col justify-between">
              <FileText size={14} className="text-violet-400" />
              <div className="h-1.5 w-3/4 bg-slate-200 rounded-full" />
            </div>
            <div className="h-16 bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex flex-col justify-between">
              <CheckSquare size={14} className="text-emerald-400" />
              <div className="h-1.5 w-2/3 bg-slate-200 rounded-full" />
            </div>
          </div>
          <div className="h-16 bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
              <FolderKanban size={16} className="text-indigo-500" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-1.5 w-3/4 bg-slate-200 rounded-full" />
              <div className="h-1.5 w-1/2 bg-slate-100 rounded-full" />
            </div>
          </div>

          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="text-white text-xl font-black leading-none">+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   E — Контекстная помощь
═══════════════════════════════════════ */
export function IllustrationContextHelp() {
  return (
    <div className="flex flex-col items-center gap-7 w-full text-center">
      <div>
        <h2 className="text-[2rem] font-black text-white leading-tight">Контекстная помощь</h2>
        <p className="text-[1rem] font-semibold text-slate-400 mt-2 max-w-sm mx-auto">
          Получайте интеллектуальную аналитику и данные для любой страницы в один клик.
        </p>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="relative bg-white rounded-[28px] shadow-2xl p-6 pt-8 min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Аналитика страницы</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <svg className="absolute left-6 top-14 w-28 h-16" viewBox="0 0 110 64" fill="none">
            <path d="M4 56 L60 14 L104 4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
            <path d="M88 4 L104 4 L104 20" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="104" cy="4" r="3" fill="#6366f1" />
          </svg>
          <div className="flex justify-end mb-4">
            <span className="text-lg font-black text-indigo-500">+24%</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles size={11} className="text-amber-400 shrink-0" />
              <div className="h-2 w-24 bg-slate-100 rounded-full" />
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full" />
            <div className="h-2.5 w-3/4 bg-slate-100 rounded-full" />
          </div>

          <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 text-xs font-black border border-indigo-400 rounded-full w-4 h-4 flex items-center justify-center">i</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   A — Производство
═══════════════════════════════════════ */
export function IllustrationProduction() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <style>{animStyle}</style>

      <h2 className="text-[2rem] font-black text-white leading-tight">
        Управляйте производством и запасами
      </h2>
      <p className="text-[1rem] font-semibold text-slate-500">
        От заказа до отгрузки — всё под контролем.
      </p>

      <div className="flex items-center w-full">

        <div className="flex flex-col gap-4 flex-1 min-w-0">

          {/* Path A: Заказ → Производство */}
          <div className="flex items-center">
            <div className={`${card} border border-blue-500/25`}>
              <p className="text-xs font-bold text-slate-300 mb-2 text-center">Заказ</p>
              <div className="space-y-[6px]">
                {([['#3b82f6', 90], ['#8b5cf6', 62], ['#f59e0b', 35]] as [string, number][]).map(([c, w], i) => (
                  <div key={i} className="flex items-center gap-[5px]">
                    <div className="w-[7px] h-[7px] rounded-sm flex-shrink-0" style={{ background: c + '99' }} />
                    <div className="flex-1 h-[5px] bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w}%`, background: c + '80' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Connector delay="0s" />
            <div className={`${card} border border-violet-500/25`}>
              <p className="text-xs font-bold text-slate-300 mb-2 text-center">Производство</p>
              <div className="space-y-[6px]">
                {([[95, '#34d399'], [78, '#60a5fa'], [44, '#f59e0b']] as [number, string][]).map(([w, c], i) => (
                  <div key={i} className="flex items-center gap-[4px]">
                    <div className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: c + 'cc' }} />
                    <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: `${w}%`, background: c + 'cc' }} />
                    </div>
                    <span className="text-[7px] text-slate-500 font-mono w-[16px] text-right flex-shrink-0">{w}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Path B: Сырьё → Контроль */}
          <div className="flex items-center">
            <div className={`${card} border border-blue-400/20`}>
              <p className="text-xs font-bold text-slate-300 mb-2 text-center">Сырьё</p>
              <div className="flex items-end justify-center gap-[5px]" style={{ height: '28px' }}>
                {([[85, '#3b82f6'], [58, '#8b5cf6'], [38, '#f59e0b'], [96, '#10b981']] as [number, string][]).map(([h, c], i) => (
                  <div key={i} className="w-[11px] rounded-sm flex-shrink-0"
                       style={{ height: `${h}%`, background: c + '80' }} />
                ))}
              </div>
            </div>
            <Connector delay="0.4s" />
            <div className={`${card} border border-amber-500/20`}>
              <p className="text-xs font-bold text-slate-300 mb-2 text-center">Контроль</p>
              <div className="space-y-[6px]">
                {([['#34d399', true, '100%'], ['#34d399', true, '80%'], ['#f87171', false, '30%']] as [string, boolean, string][]).map(([c, ok, w], i) => (
                  <div key={i} className="flex items-center gap-[5px]">
                    <div className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                         style={{ background: ok ? c + 'cc' : c + '40' }} />
                    <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: w, background: c + (ok ? '45' : '25') }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <BezierMerge filterId="glow-prod" />

        <div className="flex items-center flex-1 min-w-0">
          <div className={`${card} border border-slate-400/20`}>
            <p className="text-xs font-bold text-slate-300 mb-2 text-center">Отгрузка</p>
            <div className="space-y-[6px]">
              {([['#3b82f6'], ['#10b981'], ['#f59e0b']] as [string][]).map(([c], i) => (
                <div key={i} className="flex items-center gap-[5px]">
                  <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: c + 'cc' }} />
                  <div className="flex-1 h-[5px] rounded-full" style={{ background: c + '25' }} />
                </div>
              ))}
            </div>
          </div>
          <Connector delay="1.3s" />
          <div className={`${card} border border-emerald-500/30`}>
            <p className="text-xs font-bold text-emerald-400 mb-1.5 text-center">Поставка</p>
            <div className="text-center mb-1.5">
              <span className="text-[1.2rem] font-black text-emerald-400 leading-none">96%</span>
              <p className="text-[8px] text-slate-500 mt-0.5">в срок</p>
            </div>
            <div className="flex items-end justify-center gap-[3px]" style={{ height: '16px' }}>
              {[50, 60, 55, 72, 80, 88, 96].map((h, i) => (
                <div key={i} className="w-[6px] rounded-sm flex-shrink-0"
                     style={{ height: `${h}%`, background: i === 6 ? '#10b981' : `rgba(16,185,129,${0.18 + i * 0.1})` }} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   B — Воронка продаж
═══════════════════════════════════════ */
export function IllustrationSales() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <style>{animStyle}</style>

      <h2 className="text-[2rem] font-black text-white leading-tight">
        Управляйте продажами и клиентами
      </h2>
      <p className="text-[1rem] font-semibold text-slate-500">
        От первого контакта до закрытой сделки.
      </p>

      <div className="flex items-center w-full">

        <div className="flex flex-col gap-4 flex-1 min-w-0">

          {/* Path A: Лиды → Предложения */}
          <div className="flex items-center">
            <div className={`${card} border border-blue-500/25`}>
              <p className="text-xs font-bold text-slate-300 mb-1.5 text-center">Лиды</p>
              <div className="text-center mb-1.5">
                <span className="text-base font-black text-blue-400 leading-none">1 200</span>
              </div>
              <div className="h-[6px] bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400/70 rounded-full w-full" />
              </div>
            </div>
            <Connector delay="0s" />
            <div className={`${card} border border-violet-500/25`}>
              <p className="text-xs font-bold text-slate-300 mb-1.5 text-center">Предложения</p>
              <div className="text-center mb-1.5">
                <span className="text-base font-black text-violet-400 leading-none">72</span>
              </div>
              <div className="h-[6px] bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-400/70 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          {/* Path B: Контакты → Встречи */}
          <div className="flex items-center">
            <div className={`${card} border border-sky-400/20`}>
              <p className="text-xs font-bold text-slate-300 mb-1.5 text-center">Контакты</p>
              <div className="text-center mb-1.5">
                <span className="text-base font-black text-sky-400 leading-none">720</span>
              </div>
              <div className="h-[6px] bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400/70 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <Connector delay="0.4s" />
            <div className={`${card} border border-amber-500/20`}>
              <p className="text-xs font-bold text-slate-300 mb-1.5 text-center">Встречи</p>
              <div className="text-center mb-1.5">
                <span className="text-base font-black text-amber-400 leading-none">190</span>
              </div>
              <div className="h-[6px] bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400/70 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>

        <BezierMerge filterId="glow-sales" />

        <div className="flex items-center flex-1 min-w-0">
          <div className={`${card} border border-slate-400/20`}>
            <p className="text-xs font-bold text-slate-300 mb-2 text-center">Переговоры</p>
            <div className="space-y-[6px]">
              {([['#3b82f6', true], ['#10b981', true], ['#f59e0b', false], ['#f87171', false]] as [string, boolean][]).map(([c, active], i) => (
                <div key={i} className="flex items-center gap-[5px]">
                  <div className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                       style={{ background: active ? c + 'cc' : 'rgba(255,255,255,0.12)' }} />
                  <div className="flex-1 h-[5px] rounded-full"
                       style={{ background: active ? c + '30' : 'rgba(255,255,255,0.08)' }} />
                </div>
              ))}
            </div>
          </div>
          <Connector delay="1.3s" />
          <div className={`${card} border border-emerald-500/30`}>
            <p className="text-xs font-bold text-emerald-400 mb-1 text-center">Сделки</p>
            <div className="text-center mb-1">
              <span className="text-[1.2rem] font-black text-emerald-400 leading-none">28</span>
              <p className="text-[8px] text-slate-500 mt-0.5">закрыто</p>
            </div>
            <div className="h-[5px] bg-emerald-400/15 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400/80 rounded-full" style={{ width: '82%' }} />
            </div>
            <p className="text-[8px] text-emerald-400/70 text-center mt-1.5 font-bold">+₽2.4М выручка</p>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   C — HR / Команда
═══════════════════════════════════════ */
export function IllustrationHR() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <style>{animStyle}</style>

      <h2 className="text-[2rem] font-black text-white leading-tight">
        Управляйте талантами и командой
      </h2>
      <p className="text-[1rem] font-semibold text-slate-500">
        Найм, адаптация и развитие — в одном месте.
      </p>

      <div className="flex items-center w-full">

        <div className="flex flex-col gap-4 flex-1 min-w-0">

          {/* Path A: Вакансии → Кандидаты */}
          <div className="flex items-center">
            <div className={`${card} border border-blue-500/25`}>
              <p className="text-xs font-bold text-slate-300 mb-2 text-center">Вакансии</p>
              <div className="space-y-[6px]">
                {([['#3b82f6', 70], ['#8b5cf6', 45], ['#f59e0b', 88]] as [string, number][]).map(([c, w], i) => (
                  <div key={i} className="flex items-center gap-[5px]">
                    <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: c + 'cc' }} />
                    <div className="flex-1 h-[5px] bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w}%`, background: c + '70' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Connector delay="0s" />
            <div className={`${card} border border-violet-500/25`}>
              <p className="text-xs font-bold text-slate-300 mb-2 text-center">Кандидаты</p>
              <div className="space-y-[6px]">
                {([[90, '#818cf8'], [50, '#a78bfa'], [20, '#34d399']] as [number, string][]).map(([w, c], i) => (
                  <div key={i} className="h-[6px] bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${w}%`, background: c }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Path B: Интервью → Оффер */}
          <div className="flex items-center">
            <div className={`${card} border border-blue-400/20`}>
              <p className="text-xs font-bold text-slate-300 mb-2 text-center">Интервью</p>
              <div className="flex justify-center gap-[6px]">
                {([['А', '#3b82f6'], ['В', '#8b5cf6'], ['М', '#10b981']] as [string, string][]).map(([l, c], i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                         style={{ background: c }}>{l}</div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900" />
                  </div>
                ))}
              </div>
            </div>
            <Connector delay="0.4s" />
            <div className={`${card} border border-amber-500/20`}>
              <p className="text-xs font-bold text-slate-300 mb-2 text-center">Оффер</p>
              <div className="space-y-[6px]">
                {([['#34d399', '100%'], ['#34d399', '75%'], ['#f59e0b', '30%']] as [string, string][]).map(([c, w], i) => (
                  <div key={i} className="flex items-center gap-[5px]">
                    <div className="w-[8px] h-[8px] rounded-sm flex-shrink-0"
                         style={{ background: i < 2 ? c + 'cc' : 'rgba(255,255,255,0.1)', border: i < 2 ? 'none' : '1px solid rgba(255,255,255,0.15)' }} />
                    <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: w, background: c + '70' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <BezierMerge filterId="glow-hr" />

        <div className="flex items-center flex-1 min-w-0">
          <div className={`${card} border border-slate-400/20`}>
            <p className="text-xs font-bold text-slate-300 mb-2 text-center">Онбординг</p>
            <div className="space-y-[6px]">
              {[true, true, true, false].map((done, i) => (
                <div key={i} className="flex items-center gap-[5px]">
                  <div className={`w-[8px] h-[8px] rounded-sm flex-shrink-0 border ${done ? 'bg-emerald-400/80 border-emerald-400/50' : 'border-slate-500/50'}`} />
                  <div className={`flex-1 h-[5px] rounded-full ${done ? 'bg-slate-400/30' : 'bg-slate-600/40'}`} />
                </div>
              ))}
            </div>
          </div>
          <Connector delay="1.3s" />
          <div className={`${card} border border-emerald-500/30`}>
            <p className="text-xs font-bold text-emerald-400 mb-1.5 text-center">Команда</p>
            <div className="text-center mb-2">
              <span className="text-[1.2rem] font-black text-emerald-400 leading-none">+72</span>
              <p className="text-[8px] text-slate-500 mt-0.5">eNPS индекс</p>
            </div>
            <div className="flex justify-center gap-[4px]">
              {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'].map((c, i) => (
                <div key={i} className="w-[15px] h-[15px] rounded-full flex-shrink-0"
                     style={{ background: c + 'dd' }} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   F — Умный ИИ-Консультант
═══════════════════════════════════════ */
export function IllustrationAIConsultant() {
  const typingStyle = `
    @keyframes ai-blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
  `;
  return (
    <div className="flex flex-col items-center gap-7 w-full text-center">
      <style>{typingStyle}</style>
      <div>
        <h2 className="text-[2rem] font-black text-white leading-tight">Умный ИИ-Консультант</h2>
        <p className="text-[1rem] font-semibold text-slate-400 mt-2 max-w-sm mx-auto">
          Ваш личный ассистент всегда готов ответить на вопросы, опираясь на внутренние данные системы.
        </p>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="relative bg-white rounded-[28px] shadow-2xl p-5 pt-4 min-h-[220px] flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
              <Sparkles size={12} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="text-xs font-bold text-slate-800 leading-tight">PROGPT</p>
              <p className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Онлайн
              </p>
            </div>
          </div>

          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-slate-100 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[75%]">
              <p className="text-[11px] text-slate-600 text-left">Какой статус по проекту «Запуск»?</p>
            </div>
          </div>

          {/* AI answer */}
          <div className="flex justify-start">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%] text-left space-y-1.5">
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Проект выполнен на <span className="font-bold text-indigo-600">68%</span>, 3 задачи просрочены.
              </p>
              <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
          </div>

          {/* Typing indicator */}
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400"
                  style={{ animation: 'ai-blink 1.2s infinite', animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          {/* Floating notification bubble */}
          <div className="absolute -top-4 -right-4 w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <MessageCircle size={18} className="text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>

          {/* Input row */}
          <div className="mt-auto flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-2">
            <div className="h-1.5 flex-1 bg-slate-200 rounded-full" />
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
              <Send size={10} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
