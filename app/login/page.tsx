'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Eye, EyeOff, KeyRound, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { IllustrationProduction, IllustrationSales, IllustrationHR } from './illustrations';

const ILLUSTRATIONS = [IllustrationProduction, IllustrationSales, IllustrationHR];

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', lobbyKey: '' });
  const [showPass, setShowPass] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [illustIdx] = useState(() => Math.floor(Math.random() * ILLUSTRATIONS.length));
  const ActiveIllustration = ILLUSTRATIONS[illustIdx];

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
    <div className="min-h-screen flex">
      {/* ─── Left — form panel ─── */}
      <div className="w-full lg:w-[440px] xl:w-[500px] flex flex-col justify-center px-10 xl:px-14 py-12 bg-white relative z-10 shadow-2xl">
        {/* Logo */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <ShieldCheck size={26} className="text-proji-primary" />
            <span className="text-2xl font-black text-proji-primary tracking-tight">proji</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 mt-5">Вход в аккаунт</h1>
          <p className="text-sm text-slate-400 mt-1">Введите учётные данные и ключ лобби</p>
        </div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="space-y-5"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@proji.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:ring-2 focus:ring-proji-primary/10 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Пароль</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:ring-2 focus:ring-proji-primary/10 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Lobby Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={11} />
              Ключ лобби
            </label>
            <div className="relative">
              <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={form.lobbyKey}
                onChange={(e) => setForm((p) => ({ ...p, lobbyKey: e.target.value }))}
                placeholder="PROJI-XXXX-XXXX"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:ring-2 focus:ring-proji-primary/10 focus:bg-white transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
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
            className="w-full py-3 bg-proji-primary text-white rounded-xl text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-1"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Проверка...' : 'Войти'}
          </button>
        </motion.form>

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
      </div>

      {/* ─── Right — decorative panel ─── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-900">
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
        <svg className="absolute top-12 right-12 opacity-[0.09]" width="220" height="220" viewBox="0 0 220 220" fill="none">
          <circle cx="110" cy="110" r="100" stroke="white" strokeWidth="1" />
          <circle cx="110" cy="110" r="76"  stroke="white" strokeWidth="1" />
          <circle cx="110" cy="110" r="52"  stroke="white" strokeWidth="1" />
          <circle cx="110" cy="110" r="28"  stroke="white" strokeWidth="1" />
          <circle cx="110" cy="110" r="8"   stroke="white" strokeWidth="1" />
        </svg>

        {/* Concentric rings — bottom left */}
        <svg className="absolute bottom-16 left-12 opacity-[0.06]" width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="72" stroke="white" strokeWidth="1" />
          <circle cx="80" cy="80" r="50" stroke="white" strokeWidth="1" />
          <circle cx="80" cy="80" r="28" stroke="white" strokeWidth="1" />
        </svg>

        {/* Dot matrix */}
        <svg className="absolute top-1/3 left-1/4 opacity-[0.10]" width="176" height="176" viewBox="0 0 176 176" fill="none">
          {[0,1,2,3,4].map(row =>
            [0,1,2,3,4].map(col => (
              <circle key={`${row}-${col}`} cx={col * 40 + 8} cy={row * 40 + 8} r="2.5" fill="white" />
            ))
          )}
        </svg>

        {/* Diagonal rule lines */}
        <svg className="absolute bottom-1/3 right-16 opacity-[0.05]" width="180" height="180" viewBox="0 0 180 180" fill="none">
          {[0,1,2,3,4,5].map(i => (
            <line key={i} x1={i * 32} y1="0" x2={i * 32 + 180} y2="180" stroke="white" strokeWidth="1" />
          ))}
        </svg>

        {/* Content — random illustration */}
        <div className="relative z-10 w-full flex flex-col justify-start px-12 pt-[102px] pb-12">
          <ActiveIllustration />
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
}
