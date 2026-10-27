import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle, Clock, Copy, ExternalLink, StickyNote } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireRewardConfetti } from '../../utils/confetti';
import { formatPhp, formatPaws } from '../../utils/storage';
import { SUPPORT_EMAIL } from '../../types';
import { submitCashOutRequest } from '../../utils/supabase';

interface CashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  balancePhp: number;
  targetThresholdPhp: number;
  onWithdraw: (amountPhp: number, method: string, account: string) => void;
  userName?: string;
  userEmail?: string;
}

interface PayoutMethod {
  id: string;
  name: string;
  icon: string;
  accountPlaceholder: string;
  kind: 'mobile' | 'email' | 'note';
}

// 1 PawCoin = ₱0.001  (₱10 = 10,000 PawCoins)
const PAWS_PER_PHP = 1000;
const CASHOUT_TIERS_PHP = [10, 20, 50, 100, 500, 1000];

export const ONE_REFERRAL_CODE = 'V98HAR';
const ONE_URL = 'https://uno.global';

const PAYOUT_METHODS: PayoutMethod[] = [
  { id: 'gcash', name: 'GCash', icon: '📱', accountPlaceholder: '09XX XXX XXXX (11 digits)', kind: 'mobile' },
  { id: 'maya', name: 'Maya', icon: '💳', accountPlaceholder: '09XX XXX XXXX (11 digits)', kind: 'mobile' },
  { id: 'paypal', name: 'PayPal', icon: '🌐', accountPlaceholder: 'your-email@example.com', kind: 'email' },
  { id: 'one', name: 'ONE', icon: '🟣', accountPlaceholder: '', kind: 'note' },
];

function validateAccount(method: PayoutMethod, raw: string): string | null {
  const v = raw.trim();
  if (!v) return 'Please enter your account number or email';
  if (method.kind === 'mobile') {
    const digits = v.replace(/[\s-]/g, '');
    if (!/^(09\d{9}|\+639\d{9}|639\d{9})$/.test(digits)) {
      return `Enter a valid ${method.name} mobile number (e.g. 09171234567)`;
    }
  }
  if (method.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return 'Enter a valid PayPal email address';
  }
  return null;
}

export const CashOutModal: React.FC<CashOutModalProps> = ({
  isOpen,
  onClose,
  balancePhp,
  targetThresholdPhp,
  onWithdraw,
  userName = '',
  userEmail = '',
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>(PAYOUT_METHODS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [requestedAmount, setRequestedAmount] = useState(CASHOUT_TIERS_PHP[0]);
  const [codeCopied, setCodeCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastTxId, setLastTxId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const hasEnough = balancePhp >= requestedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedMethod.kind === 'note') return;

    const accountError = validateAccount(selectedMethod, accountNumber);
    if (accountError) {
      setErrorMsg(accountError);
      sound.playClick();
      return;
    }

    if (!hasEnough) {
      setErrorMsg(`Not enough PawCoins. You have ${formatPaws(Math.round(balancePhp * PAWS_PER_PHP))}, this tier needs ${formatPaws(requestedAmount * PAWS_PER_PHP)}.`);
      sound.playClick();
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    try {
      const txId = await submitCashOutRequest({
        method: selectedMethod.name,
        account: accountNumber.trim(),
        amountPhp: requestedAmount,
        pawcoins: requestedAmount * PAWS_PER_PHP,
        userName,
        userEmail,
      });
      sound.playFanfare();
      fireRewardConfetti(0.4);
      setLastTxId(txId);
      setIsSuccess(true);
      onWithdraw(requestedAmount, selectedMethod.name, accountNumber.trim());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not submit your request.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(ONE_REFERRAL_CODE);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const isNote = selectedMethod.kind === 'note';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-950/60 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">💸</span>
            <h3 className="font-fredoka text-lg font-bold text-white">Cash Out Rewards</h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {isSuccess ? (
            <div className="text-center py-6 flex flex-col items-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
              <h4 className="font-fredoka text-xl font-bold text-white">Withdrawal Submitted!</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">
                Your request of <strong className="text-emerald-400 font-mono text-sm">{formatPhp(requestedAmount)}</strong> via {selectedMethod.name} has been queued.
              </p>

              <div className="my-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left w-full text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Reference ID:</span>
                  <span className="font-mono text-cyan-300 font-bold">{lastTxId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payout Method:</span>
                  <span className="text-white font-medium">{selectedMethod.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Destination:</span>
                  <span className="font-mono text-white truncate max-w-[150px]">{accountNumber}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fee:</span>
                  <span className="text-emerald-400 font-bold">₱0.00 (Zero Fee)</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Est. Time:</span>
                  <span className="text-cyan-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Within 12-24 hours
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Inquiries? Contact support at <br />
                <span className="text-cyan-300 font-mono">{SUPPORT_EMAIL}</span>
              </p>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsSuccess(false);
                  onClose();
                }}
                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Balance Summary Card */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-cyan-300 uppercase font-bold tracking-wider">
                    Available Balance
                  </span>
                  <div className="font-mono text-xl font-extrabold text-cyan-400">
                    {formatPhp(balancePhp)}
                  </div>
                  <div className="font-mono text-[11px] text-cyan-200/80">
                    {formatPaws(Math.round(balancePhp * PAWS_PER_PHP))} PawCoins
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Lowest Tier</span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {formatPhp(CASHOUT_TIERS_PHP[0])}
                  </span>
                </div>
              </div>

              {/* Method Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Select Payout Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYOUT_METHODS.map((method) => {
                    const isSelected = selectedMethod.id === method.id;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedMethod(method);
                          setErrorMsg('');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-500/20 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xl">{method.icon}</span>
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate">{method.name}</span>
                          <span className="text-[9px] text-slate-400 block">
                            {method.kind === 'note' ? 'See note' : `Min: ${formatPhp(CASHOUT_TIERS_PHP[0])}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isNote ? (
                /* ONE: shown as a note, no payout yet */
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-400/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300">
                    <StickyNote className="w-4 h-4" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">Note: ONE</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    No ONE account yet? Register at{' '}
                    <a href={ONE_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-300 font-semibold underline inline-flex items-center gap-0.5">
                      uno.global <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and use referral code:
                  </p>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-950 border border-amber-400/50 cursor-pointer"
                  >
                    <span className="font-mono text-base font-extrabold text-amber-300 tracking-widest">{ONE_REFERRAL_CODE}</span>
                    <span className="text-[11px] text-slate-300 flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" /> {codeCopied ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                  <p className="text-[11px] text-slate-400">ONE cash out is not available yet. Choose GCash, Maya or PayPal to withdraw now.</p>
                </div>
              ) : (
                <>
                  {/* Account Number Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {selectedMethod.name} {selectedMethod.kind === 'email' ? 'Email' : 'Mobile No.'}
                    </label>
                    <input
                      type={selectedMethod.kind === 'email' ? 'email' : 'tel'}
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={selectedMethod.accountPlaceholder}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  {/* Tier Selection (PawCoins) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Cash Out Tier</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CASHOUT_TIERS_PHP.map((amt) => {
                        const isSelected = requestedAmount === amt;
                        const affordable = balancePhp >= amt;
                        return (
                          <button
                            type="button"
                            key={amt}
                            onClick={() => {
                              sound.playClick();
                              setRequestedAmount(amt);
                              setErrorMsg('');
                            }}
                            className={`py-2 px-2 rounded-xl border transition-all cursor-pointer text-left ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                                : affordable
                                ? 'bg-slate-950 border-slate-700 text-slate-200 hover:border-cyan-500/60'
                                : 'bg-slate-950 border-slate-800 text-slate-500'
                            }`}
                          >
                            <span className="block text-xs font-mono font-extrabold">{formatPhp(amt).replace('.00', '')} Tier</span>
                            <span className={`block text-[10px] font-mono ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
                              {formatPaws(amt * PAWS_PER_PHP)} PawCoins
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isNote || submitting}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                  isNote
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : hasEnough
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-cyan-500/30 active:scale-98 cursor-pointer'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer'
                }`}
              >
                <span>{isNote ? 'ONE not available yet' : submitting ? 'Submitting…' : `Confirm ${formatPhp(requestedAmount)} Cash Out`}</span>
                {!isNote && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero processing fee • Requests are reviewed before payout</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
