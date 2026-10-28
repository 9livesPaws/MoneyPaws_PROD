import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  signIn,
  signUp,
  sendResetCode,
  resetPasswordWithCode,
  isAtLeast18,
  checkServer,
  supabaseHost,
  AuthError,
  MIN_AGE,
} from '../utils/supabase';

type Mode = 'login' | 'signup' | 'forgot' | 'reset';

interface AuthScreenProps {
  onAuthed: () => void;
}

const inputCls =
  'w-full pl-9 pr-3 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-400';
const selectCls =
  'w-full px-2 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Field: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">{icon}</span>
    {children}
  </div>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthed }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [dobM, setDobM] = useState('');
  const [dobD, setDobD] = useState('');
  const [dobY, setDobY] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState('');
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
    setDetail('');
    setInfo('');
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - MIN_AGE - 1929 }, (_, i) => thisYear - MIN_AGE - i);

  const buildBirthdate = (): string => {
    if (!dobM || !dobD || !dobY) return '';
    const m = Number(dobM);
    const d = Number(dobD);
    const y = Number(dobY);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return 'invalid';
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setDetail('');
    setInfo('');
    setBusy(true);
    try {
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
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        if (password !== password2) throw new Error('The two passwords do not match.');
        const birthdate = buildBirthdate();
        if (!birthdate) throw new Error('Choose your date of birth (month, day and year).');
        if (birthdate === 'invalid') throw new Error('That date of birth does not exist. Check the day and month.');
        if (!isAtLeast18(birthdate)) throw new Error(`You must be at least ${MIN_AGE} years old to use MoneyPaws.`);
        const { needsEmailConfirm } = await signUp({ username: name, email, password, birthdate });
        if (needsEmailConfirm) {
          setInfo('Account created! Open the confirmation email we sent, then log in.');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      if (err instanceof AuthError && err.detail) setDetail(err.detail);
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Reset password' : 'New password';

  const pwType = showPw ? 'text' : 'password';
  const ShowBtn = (
    <button
      type="button"
      onClick={() => setShowPw((v) => !v)}
      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold text-cyan-300 bg-slate-800 cursor-pointer"
      aria-label={showPw ? 'Hide password' : 'Show password'}
    >
      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      {showPw ? 'Hide' : 'Show'}
    </button>
  );

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
            setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
          }}
          className="bg-slate-900/70 border border-cyan-500/30 rounded-2xl p-4 space-y-3"
        >
          {serverOk === false && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px]">
              Cannot reach the server ({supabaseHost || 'not set'}). Check your internet connection.
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
                className={`${inputCls} pr-20`}
                type={pwType}
                placeholder={mode === 'reset' ? 'New password' : 'Password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {ShowBtn}
            </Field>
          )}

          {mode === 'signup' && (
            <Field icon={<Lock className="w-4 h-4" />}>
              <input
                className={inputCls}
                type={pwType}
                placeholder="Confirm password"
                autoComplete="new-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </Field>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Date of birth <span className="text-amber-300 font-normal">(you must be {MIN_AGE}+)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select className={selectCls} value={dobM} onChange={(e) => setDobM(e.target.value)} aria-label="Birth month">
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select className={selectCls} value={dobD} onChange={(e) => setDobD(e.target.value)} aria-label="Birth day">
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select className={selectCls} value={dobY} onChange={(e) => setDobY(e.target.value)} aria-label="Birth year">
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
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
              <div>
                <span>{error}</span>
                {detail && <div className="mt-1 text-[10px] text-rose-400/70 break-words">Details: {detail}</div>}
              </div>
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
        {mode === 'signup' && (
          <p className="text-center text-[10px] text-slate-500 mt-2">
            By creating an account you confirm you are {MIN_AGE} or older.
          </p>
        )}
      </div>
    </div>
  );
};
