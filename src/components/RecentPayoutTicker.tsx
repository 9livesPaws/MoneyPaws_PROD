import React, { useState, useEffect } from 'react';
import { CheckCircle2, DollarSign } from 'lucide-react';

interface PayoutEvent {
  user: string;
  amount: string;
  method: string;
  purpose: string;
  timeAgo: string;
}

const SAMPLE_PAYOUTS: PayoutEvent[] = [
  { user: 'Miguel R.', amount: '$5.00', method: 'GCash', purpose: 'Iced Coffee & Bread', timeAgo: '2m ago' },
  { user: 'Aisha K.', amount: '$10.00', method: 'PayPal', purpose: 'Mobile Data Load', timeAgo: '4m ago' },
  { user: 'John D.', amount: '$5.00', method: 'Binance USDT', purpose: 'Bus Fare Top-up', timeAgo: '7m ago' },
  { user: 'Elena V.', amount: '$15.00', method: 'Maya', purpose: 'School Lunch Snacks', timeAgo: '9m ago' },
  { user: 'Kenji S.', amount: '$5.00', method: 'Amazon Gift Card', purpose: 'E-book purchase', timeAgo: '12m ago' },
  { user: 'Maria T.', amount: '$8.50', method: 'GCash', purpose: 'Electricity Micro-bill', timeAgo: '15m ago' },
];

export const RecentPayoutTicker: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SAMPLE_PAYOUTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = SAMPLE_PAYOUTS[index];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-slate-300 gap-2 overflow-hidden shadow-inner">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <div className="truncate flex items-center gap-1">
          <span className="text-slate-400 text-[11px]">Paid:</span>
          <span className="font-semibold text-slate-200">{current.user}</span>
          <span className="text-emerald-400 font-bold font-mono">{current.amount}</span>
          <span className="text-slate-400 text-[11px]">via {current.method}</span>
          <span className="hidden sm:inline-block text-amber-300/80 text-[10px] bg-amber-500/10 px-1 rounded border border-amber-500/20">
            {current.purpose}
          </span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1 text-[10px] text-slate-500">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>{current.timeAgo}</span>
      </div>
    </div>
  );
};
