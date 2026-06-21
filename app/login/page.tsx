'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, KeyRound, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import {
  IllustrationQuickCreate, IllustrationContextHelp, IllustrationProduction,
  IllustrationSales, IllustrationHR, IllustrationAIConsultant,
} from './illustrations';

const ILLUSTRATIONS = [
  IllustrationAIConsultant, IllustrationQuickCreate, IllustrationContextHelp,
  IllustrationProduction, IllustrationSales, IllustrationHR,
];
const SLIDE_INTERVAL = 6000;

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', lobbyKey: '' });
  const [showPass, setShowPass] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const ActiveIllustration = ILLUSTRATIONS[slideIdx];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((i) => (i + 1) % ILLUSTRATIONS.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/domains');
  }, [status, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      lobbyKey: form.lobbyKey,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.replace('/domains');
    } else {
      setError('Неверный email, пароль или ключ лобби');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={24} className="animate-spin text-proji-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white relative overflow-hidden">
      {/* ─── Form panel ─── */}
      <div className="relative z-10 w-full lg:w-[460px] xl:w-[500px] flex items-center bg-white px-8 sm:px-12 xl:px-16 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="w-full"
        >
          {/* Logo */}
          <div className="mb-7">
            <span className="text-2xl font-black text-slate-900 tracking-tight">PROJI</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-1.5">Добро пожаловать</h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-7">
            Войдите в систему для доступа к вашему рабочему пространству.
          </p>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-slate-600">Email или логин</label>
              <div className="relative">
                <Mail size={15} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="name@company.com"
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-proji-primary focus:ring-2 focus:ring-proji-primary/10 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-bold text-slate-600">Пароль</label>
                <button type="button" className="text-xs font-bold text-proji-primary hover:underline">Забыли пароль?</button>
              </div>
              <div className="relative">
                <Lock size={15} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-proji-primary focus:ring-2 focus:ring-proji-primary/10 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                  aria-pressed={showPass}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Lobby Key */}
            <div className="space-y-1.5">
              <label htmlFor="login-lobby-key" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <KeyRound size={11} aria-hidden="true" />
                Ключ лобби
              </label>
              <div className="relative">
                <KeyRound size={15} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  id="login-lobby-key"
                  type={showKey ? 'text' : 'password'}
                  required
                  value={form.lobbyKey}
                  onChange={(e) => setForm((p) => ({ ...p, lobbyKey: e.target.value }))}
                  placeholder="PROJI-XXXX-XXXX"
                  autoComplete="off"
                  className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-proji-primary focus:ring-2 focus:ring-proji-primary/10 focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? 'Скрыть ключ лобби' : 'Показать ключ лобби'}
                  aria-pressed={showKey}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showKey ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !form.email || !form.password || !form.lobbyKey}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/25 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Проверка...' : 'Войти в систему'}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-300">Или</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-[#dadce0] rounded-xl text-sm font-medium text-[#3c4043] opacity-70 cursor-not-allowed hover:shadow-sm transition-shadow"
            title="Скоро будет доступно"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
            <span>Войти через Google</span>
          </button>

          {/* Test credentials */}
          <div className="mt-6 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Тестовый доступ</p>
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@proji.com', password: 'proji2024', lobbyKey: 'PROJI-2024-ALPHA' })}
              className="w-full text-left bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Управленец <span className="normal-case font-normal text-slate-400">(нажмите для заполнения)</span>
              </p>
              <p className="text-xs text-slate-500 font-mono">admin@proji.com / proji2024</p>
              <p className="text-xs text-slate-500 font-mono">Ключ: PROJI-2024-ALPHA</p>
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'employer@proji.com', password: 'employer2024', lobbyKey: 'PROJI-EMP-2024' })}
              className="w-full text-left bg-blue-50/60 border border-blue-100 rounded-xl p-3 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-1">
                Сотрудник <span className="normal-case font-normal text-slate-400">(нажмите для заполнения)</span>
              </p>
              <p className="text-xs text-slate-500 font-mono">employer@proji.com / employer2024</p>
              <p className="text-xs text-slate-500 font-mono">Ключ: PROJI-EMP-2024</p>
              <p className="text-xs text-slate-500 font-mono">Ключ Маркетинга: MKT-I9J0K1L2</p>
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── Right — decorative panel ─── */}
      <div className="hidden lg:flex lg:flex-col flex-1 relative overflow-hidden bg-slate-900">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-[-100px] right-[-60px] w-[480px] h-[480px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-[-80px] left-[-60px] w-[380px] h-[380px] rounded-full bg-slate-600/25 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-blue-400/10 blur-[60px]" />

        {/* Concentric rings — top right */}
        <svg aria-hidden="true" className="absolute top-12 right-12 opacity-[0.09]" width="220" height="220" viewBox="0 0 220 220" fill="none">
          <circle cx="110" cy="110" r="100" stroke="white" strokeWidth="1" />
          <circle cx="110" cy="110" r="76"  stroke="white" strokeWidth="1" />
          <circle cx="110" cy="110" r="52"  stroke="white" strokeWidth="1" />
          <circle cx="110" cy="110" r="28"  stroke="white" strokeWidth="1" />
          <circle cx="110" cy="110" r="8"   stroke="white" strokeWidth="1" />
        </svg>

        {/* Concentric rings — bottom left */}
        <svg aria-hidden="true" className="absolute bottom-16 left-12 opacity-[0.06]" width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="72" stroke="white" strokeWidth="1" />
          <circle cx="80" cy="80" r="50" stroke="white" strokeWidth="1" />
          <circle cx="80" cy="80" r="28" stroke="white" strokeWidth="1" />
        </svg>

        {/* Dot matrix */}
        <svg aria-hidden="true" className="absolute top-1/3 left-1/4 opacity-[0.10]" width="176" height="176" viewBox="0 0 176 176" fill="none">
          {[0,1,2,3,4].map(row =>
            [0,1,2,3,4].map(col => (
              <circle key={`${row}-${col}`} cx={col * 40 + 8} cy={row * 40 + 8} r="2.5" fill="white" />
            ))
          )}
        </svg>

        {/* Diagonal rule lines */}
        <svg aria-hidden="true" className="absolute bottom-1/3 right-16 opacity-[0.05]" width="180" height="180" viewBox="0 0 180 180" fill="none">
          {[0,1,2,3,4,5].map(i => (
            <line key={i} x1={i * 32} y1="0" x2={i * 32 + 180} y2="180" stroke="white" strokeWidth="1" />
          ))}
        </svg>

        {/* Content — auto-rotating slider */}
        <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-12 pt-12 pb-20 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIdx}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full flex flex-col items-center justify-center scale-[0.85] xl:scale-100 origin-center"
            >
              <ActiveIllustration />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slider dots — pinned to bottom, always visible/clickable regardless of illustration height */}
        <div
          className="absolute bottom-7 left-0 right-0 z-20 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Слайды иллюстраций"
        >
          {ILLUSTRATIONS.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={slideIdx === i}
              aria-label={`Слайд ${i + 1} из ${ILLUSTRATIONS.length}`}
              onClick={() => setSlideIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                slideIdx === i ? 'w-7 bg-gradient-to-r from-indigo-400 to-violet-400' : 'w-2 bg-white/25 hover:bg-white/45'
              }`}
            />
          ))}
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
}
