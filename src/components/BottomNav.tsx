import React from 'react';
import { Home, Footprints, Cpu, Gamepad2, Wallet, HeadphonesIcon } from 'lucide-react';
import { sound } from '../utils/sound';

export type TabType = 'home' | 'walk' | 'mine' | 'games' | 'wallet' | 'support' | 'referral';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unclaimedMining: number;
  freeSpins: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  unclaimedMining,
  freeSpins,
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'walk' as TabType,
      label: 'Walk',
      icon: Footprints,
    },
    {
      id: 'mine' as TabType,
      label: 'Mine',
      icon: Cpu,
      badge: unclaimedMining > 20 ? `${Math.min(99, Math.floor(unclaimedMining))}` : undefined,
    },
    {
      id: 'games' as TabType,
      label: 'Games',
      icon: Gamepad2,
      badge: freeSpins > 0 ? `${freeSpins}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'wallet' as TabType,
      label: 'Wallet',
      icon: Wallet,
    },
    {
      id: 'support' as TabType,
      label: 'Help',
      icon: HeadphonesIcon,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 pb-safe">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active glow / background pill */}
              {isActive && (
                <div className="absolute inset-0 bg-amber-500/15 rounded-xl border border-amber-500/30 -z-10" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400 stroke-[2.3]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[10px] font-bold px-1 py-0.2 rounded-full min-w-4 text-center leading-tight shadow-md animate-pulse ${
                      tab.badgeColor || 'bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
