import React, { useState } from 'react';
import { X, Copy, Check, Users, Share2, Sparkles, Gift } from 'lucide-react';
import { sound } from '../utils/sound';
import { fireRewardConfetti } from '../utils/confetti';
import { formatPhp } from '../utils/storage';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  referralCount: number;
  referralEarningsPhp: number;
  onSimulateReferral: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  referralCode,
  referralCount,
  referralEarningsPhp,
  onSimulateReferral,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `https://moneypaws.app/?ref=${referralCode}`;

  const handleCopyLink = () => {
    sound.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    sound.playClick();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'MoneyPaws - Earn Daily Passive Income',
          text: `Join me on MoneyPaws! Earn daily income for morning coffee & small expenses through walking, mining, and mini-games. Use code: ${referralCode}`,
          url: shareUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSimulate = () => {
    sound.playFanfare();
    fireRewardConfetti(0.4);
    onSimulateReferral();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-white">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-2 text-2xl shadow-lg shadow-cyan-500/30">
            🐾
          </div>
          <h3 className="font-fredoka text-xl font-bold text-white">Invite Friends & Earn</h3>
          <p className="text-xs text-slate-300 mt-1">
            Get <strong className="text-emerald-400">₱1.00</strong> per friend invited + <strong className="text-cyan-300">10% lifetime</strong> passive commission!
          </p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Invited Friends</span>
            <span className="text-lg font-bold font-mono text-cyan-300">{referralCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Commission Earned</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {formatPhp(referralEarningsPhp)}
            </span>
          </div>
        </div>

        {/* Code & Share Box */}
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col gap-2">
          <span className="text-[10px] text-cyan-300 uppercase font-bold tracking-wider">
            Your Invite Code
          </span>
          <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
            <span className="font-mono text-base font-extrabold text-white tracking-wider">
              {referralCode}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleNativeShare}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Invite Link</span>
          </button>

          {/* Simulation button */}
          <button
            onClick={handleSimulate}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Gift className="w-4 h-4 text-emerald-400" />
            <span>Simulate Friend Joining (+₱1.00 Bonus)</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-400">
          Commission is credited automatically every time your referred friends mine or convert walking steps!
        </p>
      </div>
    </div>
  );
};
