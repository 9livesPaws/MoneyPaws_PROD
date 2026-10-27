import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, CalendarDays, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  signIn,
  signUp,
  sendResetCode,
  resetPasswordWithCode,
  isAtLeast18,
  checkServer,
  supabaseHost,
  maxBirthdateIso,
  MIN_AGE,
} from '../utils/supabase';

type Mode = 'login' | 'signup' | 'forgot' | 'reset';

interface AuthScreenProps {
  onAuthed: () => void;
}

const inputCls =
  'w-full pl-9 pr-3 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-400';

const Field: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
    {children}
  </div>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthed }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [birthdate, setBirthdate] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    checkServer().then((ok) => alive && setServerOk(ok));
    return () => {
      alive = false;
    };
  }, []);

  const go = (m: Mode) => {
    setMode(m);
    setError('');
    setInfo('');
  };

  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (!validEmail) throw new Error('Enter a valid email address.');

      if (mode === 'login') {
        if (!password) throw new Error('Enter your password.');
        await signIn(email, password);
        onAuthed();
      } else if (mode === 'signup') {
        const name = username.trim();
        if (name.length < 3 || name.length > 24 || !/^[A-Za-z0-9_.]+$/.test(name)) {
          throw new Error('Username: 3-24 letters, numbers, _ or . only.');
        }
        if (!birthdate) throw new Error('Enter your date of birth.');
        if (!isAtLeast18(birthdate)) throw new Error(`You must be at least ${MIN_AGE} years old to use MoneyPaws.`);
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        const { needsEmailConfirm } = await signUp({ username: name, email, password, birthdate });
        if (needsEmailConfirm) {
          setInfo('Account created! Confirm your email, then log in.');
          setMode('login');
        } else {
          onAuthed();
        }
      } else if (mode === 'forgot') {
        await sendResetCode(email);
        setInfo('We sent a code to your email. Enter it below with your new password.');
        setMode('reset');
      } else {
        if (code.trim().length < 6) throw new Error('Enter the code from your email.');
        if (password.length < 8) throw new Error('New password must be at least 8 characters.');
        await resetPasswordWithCode(email, code, password);
        onAuthed();
      }
    });
  };

  const title =
    mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Reset password' : 'New password';

  const pwLabel = mode === 'reset' ? 'New password' : 'Password';

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col p-4">
      <div className="w-full max-w-sm m-auto">
        <div className="text-center mb-3">
          <div className="text-4xl">🐾</div>
          <h1 className="font-fredoka text-2xl font-bold text-white">MoneyPaws</h1>
        </div>

        <form
          onSubmit={submit}
          onFocus={(e) => {
            const el = e.target as HTMLElement;
            // wait for the keyboard, then bring the tapped field into view
            setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
          }}
          className="bg-slate-900/70 border border-cyan-500/30 rounded-2xl p-4 space-y-3"
        >
          {serverOk === false && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px]">
              Cannot reach the server ({supabaseHost || 'not set'}). Check your internet connection. If you are online, the app&apos;s server address may be wrong.
            </div>
          )}
          <div className="flex items-center gap-2">
            {(mode === 'forgot' || mode === 'reset') && (
              <button type="button" onClick={() => go('login')} className="p-1 text-slate-400 hover:text-white cursor-pointer" aria-label="Back">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-fredoka text-lg font-bold text-white">{title}</h2>
          </div>

          {mode === 'signup' && (
            <Field icon={<User className="w-4 h-4" />}>
              <input
                className={inputCls}
                placeholder="Username"
                autoComplete="username"
                maxLength={24}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>
          )}

          <Field icon={<Mail className="w-4 h-4" />}>
            <input
              className={inputCls}
              type="email"
              inputMode="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={mode === 'reset'}
            />
          </Field>

          {mode === 'reset' && (
            <Field icon={<KeyRound className="w-4 h-4" />}>
              <input
                className={`${inputCls} font-mono tracking-widest`}
                inputMode="numeric"
                placeholder="Code from email"
                maxLength={10}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
              />
            </Field>
          )}

          {mode !== 'forgot' && (
            <Field icon={<Lock className="w-4 h-4" />}>
              <input
                className={`${inputCls} pr-10`}
                type={showPw ? 'text' : 'password'}
                placeholder={pwLabel}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Field>
          )}

          {mode === 'signup' && (
            <div>
              <Field icon={<CalendarDays className="w-4 h-4" />}>
                <input
                  className={inputCls}
                  type="date"
                  max={maxBirthdateIso()}
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  aria-label="Date of birth"
                />
              </Field>
              <p className="text-[10px] text-slate-500 mt-1 pl-1">Date of birth. You must be {MIN_AGE}+ to register.</p>
            </div>
          )}

          {mode === 'login' && (
            <button type="button" onClick={() => go('forgot')} className="text-[11px] text-cyan-300 hover:underline cursor-pointer">
              Forgot password?
            </button>
          )}

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {info && !error && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-sm uppercase tracking-wider disabled:opacity-60 cursor-pointer"
          >
            {busy
              ? 'Please wait…'
              : mode === 'login'
              ? 'Log in'
              : mode === 'signup'
              ? 'Create account'
              : mode === 'forgot'
              ? 'Send code'
              : 'Set new password'}
          </button>
        </form>

        {(mode === 'login' || mode === 'signup') && (
          <p className="text-center text-xs text-slate-400 mt-4">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => go(mode === 'login' ? 'signup' : 'login')}
              className="text-cyan-300 font-bold hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'Create account' : 'Log in'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
