import React, { useState } from 'react';
import { X, Award, Flame, Wallet, Users, Mail, Copy, Check, TrendingUp, BarChart2, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { sound } from '../utils/sound';
import { formatPhp } from '../utils/storage';
import { SUPPORT_EMAIL } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  balancePhp: number;
  totalEarnedPhp: number;
  consecutiveDays: number;
  referralCode: string;
  onOpenSupport: () => void;
}

// Generate realistic 7-day and 30-day daily earnings history
const LAST_7_DAYS_EARNINGS = [
  { day: 'Mon', date: 'Oct 19', earnings: 0.85, streak: 1 },
  { day: 'Tue', date: 'Oct 20', earnings: 1.20, streak: 1 },
  { day: 'Wed', date: 'Oct 21', earnings: 0.95, streak: 1 },
  { day: 'Thu', date: 'Oct 22', earnings: 1.40, streak: 1 },
  { day: 'Fri', date: 'Oct 23', earnings: 1.85, streak: 1 },
  { day: 'Sat', date: 'Oct 24', earnings: 2.10, streak: 1 },
  { day: 'Sun', date: 'Oct 25', earnings: 0.65, streak: 1 },
];

const LAST_30_DAYS_EARNINGS = Array.from({ length: 30 }, (_, i) => {
  const dayNum = i + 1;
  const earnings = Number((0.4 + Math.sin(i * 0.5) * 0.35 + (i > 20 ? 0.8 : 0.2)).toFixed(2));
  return {
    day: `D${dayNum}`,
    date: `Day ${dayNum}`,
    earnings: Math.max(0.2, earnings),
    streak: i >= 30 - 7 ? 1 : (i % 3 === 0 ? 0 : 1),
  };
});

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  balancePhp,
  totalEarnedPhp,
  consecutiveDays,
  referralCode,
  onOpenSupport,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'bar' | 'calendar'>('chart');
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    sound.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const chartData = timeframe === '7d' ? LAST_7_DAYS_EARNINGS : LAST_30_DAYS_EARNINGS;

  // Monthly Calendar parameters (e.g. October, 31 days)
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentDay = 25;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-2xl">
              🐾
            </div>
          </div>
          <div>
            <h3 className="font-fredoka text-lg font-bold text-white">{userName}</h3>
            <span className="text-[11px] text-cyan-300 font-mono">Android Member</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">Active Earner</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Balance</span>
            <span className="text-xs font-bold text-cyan-300 font-mono">
              {formatPhp(balancePhp)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Streak</span>
            <span className="text-xs font-bold text-orange-400 font-mono flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 fill-orange-400" />
              {consecutiveDays}d
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Paid</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {formatPhp(totalEarnedPhp)}
            </span>
          </div>
        </div>

        {/* Analytics Tabs (Line Chart, Streak Bar Chart, Calendar View) */}
        <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-1 text-[11px] font-bold">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('chart');
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'chart'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Earnings</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('bar');
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'bar'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Streaks</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('calendar');
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>

        {/* TAB 1: RECHARTS LINE CHART (7-Day / 30-Day Daily Earnings) */}
        {activeTab === 'chart' && (
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-200">
                Daily Earnings Trend ({timeframe === '7d' ? 'Last 7 Days' : 'Last 30 Days'})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    setTimeframe('7d');
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                    timeframe === '7d' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setTimeframe('30d');
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                    timeframe === '30d' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>

            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#06b6d4', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                    formatter={(value: any) => [`₱${Number(value || 0).toFixed(2)}`, 'Earned']}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 3 }}
                    activeDot={{ r: 5, fill: '#38bdf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: RECHARTS BAR CHART (30-Day Check-in Streak Activity) */}
        {activeTab === 'bar' && (
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-200">
                30-Day Streak Consistency
              </span>
              <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 fill-orange-400" />
                {consecutiveDays} Consecutive Days
              </span>
            </div>

            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LAST_30_DAYS_EARNINGS} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={8} interval={4} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => (v === 1 ? 'Active' : '')} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#f59e0b', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any) => [val === 1 ? 'Streak Checked ✅' : 'Inactive', 'Status']}
                  />
                  <Bar dataKey="streak" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM CSS GRID MONTHLY CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">October 2026</span>
              <span className="text-[10px] text-cyan-300 font-mono">
                {consecutiveDays} Days Checked In
              </span>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 font-bold">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* 31-Day Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Empty offset for Wednesday 1st */}
              <div className="h-7" />
              <div className="h-7" />
              <div className="h-7" />

              {currentMonthDays.map((d) => {
                const isToday = d === currentDay;
                const isStreakActive = d <= currentDay && d >= currentDay - consecutiveDays + 1;

                return (
                  <div
                    key={d}
                    className={`h-7 rounded-lg flex flex-col items-center justify-center font-mono text-[11px] transition-all relative ${
                      isToday
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30 ring-2 ring-cyan-300'
                        : isStreakActive
                        ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold'
                        : 'text-slate-500 bg-slate-900/50'
                    }`}
                  >
                    <span>{d}</span>
                    {isStreakActive && !isToday && (
                      <span className="w-1 h-1 rounded-full bg-cyan-400 absolute bottom-1" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-1">
              Glowing cyan days indicate active daily streak check-ins!
            </p>
          </div>
        )}

        {/* Referral Card */}
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Your Referral Code</span>
            <span className="font-mono font-bold text-sm text-cyan-300">{referralCode}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Support email contact */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px]">Need help or payout info?</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
              onOpenSupport();
            }}
            className="text-cyan-400 hover:text-cyan-300 font-bold underline text-xs cursor-pointer"
          >
            Open Help
          </button>
        </div>
      </div>
    </div>
  );
};
