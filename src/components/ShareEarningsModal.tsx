import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Share2, Download, Copy, Check, Sparkles, MessageCircle, Send, Twitter, Smartphone, Image as ImageIcon } from 'lucide-react';
import { sound } from '../utils/sound';
import { fireRewardConfetti } from '../utils/confetti';
import { formatPhp } from '../utils/storage';

interface ShareEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  totalEarnedPhp: number;
  balancePhp: number;
  stepsToday: number;
  tapMineCount: number;
  consecutiveDays: number;
  referralCode: string;
}

export const ShareEarningsModal: React.FC<ShareEarningsModalProps> = ({
  isOpen,
  onClose,
  userName,
  totalEarnedPhp,
  balancePhp,
  stepsToday,
  tapMineCount,
  consecutiveDays,
  referralCode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareUrl = `https://moneypaws.app/?ref=${referralCode}`;

  const shareText = `🐾 I've already earned ${formatPhp(
    totalEarnedPhp
  )} in daily passive income on MoneyPaws! ☕\n\nI earn every day by walking, cloud mining, and playing mini-games to pay for coffee and small expenses. Join me with code [${referralCode}] to get a welcome cash bonus!\n\n👉 Join here: ${shareUrl}\n#MoneyPaws #PassiveIncome #DailyRewards #GCash`;

  // Draw high-resolution share card on canvas
  const drawShareCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient (Deep cyber cyan / navy)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#040b14');
    bgGrad.addColorStop(0.5, '#082333');
    bgGrad.addColorStop(1, '#03080e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Cyan radial ambient glow
    const radial = ctx.createRadialGradient(width / 2, height * 0.42, 20, width / 2, height * 0.42, 380);
    radial.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    radial.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Glowing Outer Frame Border
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#06b6d4';
    ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
    ctx.shadowBlur = 20;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.shadowBlur = 0; // Reset

    // Brand Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px "Fredoka", sans-serif';
    ctx.fillText('🐾 MoneyPaws', width / 2, 95);

    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DAILY PASSIVE INCOME & MICRO-REWARDS', width / 2, 125);

    // User Avatar Badge
    ctx.beginPath();
    ctx.arc(width / 2, 195, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.font = '36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🐾', width / 2, 208);

    // Username
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(userName, width / 2, 260);

    // Total Earnings Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(100, 290, width - 200, 180, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TOTAL PASSIVE INCOME EARNED', width / 2, 335);

    // Luminous Currency
    ctx.font = 'black 68px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
    ctx.shadowBlur = 18;
    ctx.fillText(formatPhp(totalEarnedPhp), width / 2, 415);
    ctx.shadowBlur = 0; // Reset

    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('✅ Verified Micro-Earnings', width / 2, 448);

    // 3 Metrics Row
    const statsY = 515;
    const statBoxWidth = 170;
    const statBoxHeight = 85;

    // Stat 1: Steps
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(110, statsY, statBoxWidth, statBoxHeight, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Steps Today', 195, statsY + 30);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${stepsToday.toLocaleString()}`, 195, statsY + 62);

    // Stat 2: Miner Taps
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(315, statsY, statBoxWidth, statBoxHeight, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Miner Taps', 400, statsY + 30);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${tapMineCount.toLocaleString()}`, 400, statsY + 62);

    // Stat 3: Streak Days
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(520, statsY, statBoxWidth, statBoxHeight, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Daily Streak', 605, statsY + 30);
    ctx.fillStyle = '#fb923c';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${consecutiveDays} Days 🔥`, 605, statsY + 62);

    // Referral Code Pill
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(140, 630, width - 280, 60, 30);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Use Invite Code: ${referralCode}`, width / 2, 668);

    // Bottom Mission Tagline
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Paying for daily coffee, snacks & mobile load • Free on Android', width / 2, 735);
  }, [userName, totalEarnedPhp, stepsToday, tapMineCount, consecutiveDays, referralCode]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawShareCard, 100);
    }
  }, [isOpen, drawShareCard]);

  if (!isOpen) return null;

  // Handle Download Image
  const handleDownloadImage = () => {
    sound.playCoin();
    fireRewardConfetti(0.4);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `MoneyPaws-Earnings-${userName}.png`;
    link.href = imageUri;
    link.click();
  };

  // Handle Copy Text Block
  const handleCopyText = () => {
    sound.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Native Web Share
  const handleNativeShare = async () => {
    sound.playClick();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        const canvas = canvasRef.current;
        if (canvas && navigator.canShare) {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], 'moneypaws-earnings.png', { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: 'MoneyPaws - Daily Passive Income',
                  text: shareText,
                  files: [file],
                });
                return;
              }
            }
            await navigator.share({
              title: 'MoneyPaws - Daily Passive Income',
              text: shareText,
              url: shareUrl,
            });
          });
        } else {
          await navigator.share({
            title: 'MoneyPaws - Daily Passive Income',
            text: shareText,
            url: shareUrl,
          });
        }
      } catch {
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  // Quick Direct Social Share Links
  const shareWhatsApp = () => {
    sound.playClick();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareTelegram = () => {
    sound.playClick();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareTwitter = () => {
    sound.playClick();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-950 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white max-h-[92vh] overflow-y-auto">
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
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-fredoka text-lg font-bold text-white tracking-tight">
              Share Your Earnings
            </h3>
            <p className="text-[11px] text-cyan-300/80">
              Showcase your passive income to friends & earn bonuses
            </p>
          </div>
        </div>

        {/* Live Canvas Preview Card */}
        <div className="relative rounded-2xl bg-slate-900/90 border border-cyan-500/30 overflow-hidden shadow-xl flex items-center justify-center p-2">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[280px] h-auto rounded-xl shadow-md border border-cyan-500/20"
          />
        </div>

        {/* Download & Native Share Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadImage}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Share to App</span>
          </button>
        </div>

        {/* One-Click Social Apps */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold pl-1">Share via:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={shareWhatsApp}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Share to WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareTelegram}
              className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Share to Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            <button
              onClick={shareTwitter}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer transition-colors"
              title="Share to X / Twitter"
            >
              <Twitter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Social Text Block with Copy Button */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Shareable Text Block
            </span>
            <button
              onClick={handleCopyText}
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap select-all">
            {shareText}
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-500">
          Friends who sign up with your code earn you an immediate ₱1.00 bonus + 10% lifetime commission!
        </p>
      </div>
    </div>
  );
};
