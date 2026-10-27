import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireRewardConfetti } from '../../utils/confetti';
import { SUPPORT_EMAIL, APP_MISSION, SupportTicket } from '../../types';

interface SupportViewProps {
  tickets: SupportTicket[];
  onAddTicket: (ticket: SupportTicket) => void;
  onClose?: () => void;
}

const FAQS = [
  {
    q: 'How do I cash out my earnings?',
    a: 'Tap the glowing "Cash Out" button at the top of your dashboard. Choose your preferred channel (GCash, Maya, PayPal, Binance USDT, or ShopeePay), enter your account number, and submit. Payouts are usually processed within 12 to 24 hours with zero fees!',
  },
  {
    q: 'What is MoneyPaws’ mission?',
    a: 'MoneyPaws is designed to give everyday Android users reliable passive daily income. While it won’t pay off a giant mortgage, it empowers you to cover small everyday expenses like morning coffee, daily transport fares, snacks, or phone data loads.',
  },
  {
    q: 'How does Walking to Earn work?',
    a: 'MoneyPaws taps into your Android phone motion sensor to detect walking and steps automatically. You can also use the brisk walk simulator. Every 250 steps converts directly into real cash balance!',
  },
  {
    q: 'How does Tap to Mine generate income?',
    a: 'Tapping the central Paw button triggers high-frequency micro-hashing. In the background, sponsor reward pools share real advertising revenue directly with you in real time.',
  },
  {
    q: 'Where do I reach technical support?',
    a: `You can email our official customer care directly at ${SUPPORT_EMAIL} anytime, or submit an in-app ticket below. We reply to all inquiries within 24 hours.`,
  },
];

export const SupportView: React.FC<SupportViewProps> = ({ tickets, onAddTicket, onClose }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('withdrawal');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [newTicketId, setNewTicketId] = useState('');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sound.playFanfare();
    fireRewardConfetti(0.4);

    const ticketId = `PAW-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      subject: subject || `${category.toUpperCase()} Inquiry`,
      category,
      message,
      userEmail: userEmail || 'user@moneypaws.com',
      createdAt: Date.now(),
      status: 'OPEN',
    };

    setNewTicketId(ticketId);
    setTicketSubmitted(true);
    onAddTicket(newTicket);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="flex flex-col gap-4 pb-20 animate-in fade-in duration-200 text-white">
      {/* Official Support Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-cyan-950/70 border border-cyan-500/40 shadow-xl shadow-cyan-950/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
              Official Customer Support
            </span>
            <h2 className="font-fredoka text-base font-bold text-white mt-0.5">
              Need Help or Technical Assistance?
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Email us directly for fast support, payout verification, or account inquiries:
            </p>
            <div className="mt-2.5">
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=MoneyPaws%20App%20Inquiry`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="font-mono">{SUPPORT_EMAIL}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Manifesto Box */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
          <HeartHandshake className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-fredoka text-sm font-bold text-amber-300">The MoneyPaws Mission</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {APP_MISSION}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free • Safe Android Payouts Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Submit In-App Support Ticket */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="font-fredoka text-sm font-bold text-white">Submit a Support Ticket</h3>
        </div>

        {ticketSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
            <h4 className="font-bold text-xs text-white">Ticket #{newTicketId} Created</h4>
            <p className="text-[11px] text-slate-300 mt-1">
              Our engineering team has received your ticket and will investigate shortly.
            </p>
            <button
              onClick={() => setTicketSubmitted(false)}
              className="mt-3 px-4 py-1.5 rounded-lg bg-slate-800 text-xs text-cyan-300 hover:text-white cursor-pointer"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="withdrawal">Withdrawal / Cash Out Payout</option>
                <option value="mining">Tap to Mine Inquiry</option>
                <option value="pedometer">Walking & Step Counter</option>
                <option value="referral">Referral Bonus</option>
                <option value="other">Other Technical Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Message / Description
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue in detail..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Ticket to MoneyPaws Desk</span>
            </button>
          </form>
        )}
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h3 className="font-fredoka text-sm font-bold text-white mb-3">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40"
              >
                <button
                  onClick={() => {
                    sound.playClick();
                    setOpenFaq(isOpen ? null : idx);
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 text-xs font-semibold text-slate-200 hover:text-cyan-300 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
