'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Eye, EyeOff, KeyRound, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', lobbyKey: '' });
  const [showPass, setShowPass] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <ShieldCheck size={28} className="text-proji-primary" />
            <span className="text-3xl font-black text-proji-primary tracking-tight">proji</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">Вход в лобби управленца</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <h1 className="text-xl font-black text-slate-800">Добро пожаловать</h1>
            <p className="text-sm text-slate-400 mt-1">Введите ваши учётные данные и ключ лобби</p>
          </div>

          <form onSubmit={submit} className="px-8 py-6 space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="admin@proji.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Пароль</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:bg-white transition-all"
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
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
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
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:bg-white transition-all font-mono"
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
              className="w-full py-3 bg-proji-primary text-white rounded-xl text-sm font-bold hover:bg-proji-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Проверка...' : 'Войти в лобби'}
            </button>
          </form>

          {/* Hints */}
          <div className="px-8 pb-6 space-y-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Тестовые данные · Управленец
              </p>
              <p className="text-xs text-slate-500 font-mono">admin@proji.com / proji2024</p>
              <p className="text-xs text-slate-500 font-mono">Ключ: PROJI-2024-ALPHA</p>
            </div>
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-1.5">
                Тестовые данные · Сотрудник
              </p>
              <p className="text-xs text-slate-500 font-mono">employer@proji.com / employer2024</p>
              <p className="text-xs text-slate-500 font-mono">Ключ: PROJI-EMP-2024</p>
              <p className="text-xs text-slate-500 font-mono">Ключ Маркетинга: MKT-I9J0K1L2</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
