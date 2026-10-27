import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Sparkles, Flame, Check } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireRewardConfetti } from '../utils/confetti';
import { PersonalGoal } from '../types';

interface PersonalGoalTrackerProps {
  goals: PersonalGoal[];
  onToggleGoal: (id: string) => void;
  onAddGoal: (title: string, icon: string) => void;
}

export const PersonalGoalTracker: React.FC<PersonalGoalTrackerProps> = ({
  goals,
  onToggleGoal,
  onAddGoal,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');

  const emojis = ['💧', '🏃', '📚', '🥗', '🧘', '💰', '🐾', '⏰'];

  const completedCount = goals.filter((g) => g.completed).length;

  const handleToggle = (id: string, alreadyCompleted: boolean) => {
    if (!alreadyCompleted) {
      sound.playCoin();
      haptics.claim();
      fireRewardConfetti(0.2);
    } else {
      sound.playClick();
      haptics.light();
    }
    onToggleGoal(id);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    sound.playClick();
    onAddGoal(newTitle.trim(), selectedEmoji);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900/95 via-cyan-950/25 to-slate-900/95 border border-cyan-500/35 p-4 shadow-[0_0_15px_rgba(6,182,212,0.12)] flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-bold">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-fredoka text-sm font-bold text-white tracking-wide">
                Daily Habits &amp; Goals
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                +50 Paws / Habit
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80">Build positive daily routines while earning micro-income</p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setIsAdding(!isAdding);
          }}
          className="p-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Add New Daily Habit"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Habits Progress Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>Habits Completed Today:</span>
        <span className="font-mono text-cyan-300 font-bold">
          {completedCount} / {goals.length} ({Math.round((completedCount / (goals.length || 1)) * 100)}%)
        </span>
      </div>
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 -mt-1.5">
        <div
          className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / (goals.length || 1)) * 100}%` }}
        />
      </div>

      {/* Add Custom Habit Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex flex-col gap-2 animate-in fade-in">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {emojis.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`p-1 px-1.5 rounded-lg text-sm border transition-all cursor-pointer ${
                  selectedEmoji === emoji ? 'bg-cyan-500/30 border-cyan-400 scale-110' : 'bg-slate-900 border-slate-800'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Meditate for 5 minutes"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer active:scale-95 transition-all"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Habit List */}
      <div className="space-y-1.5">
        {goals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => handleToggle(goal.id, goal.completed)}
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none active:scale-98 ${
              goal.completed
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/30 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base shrink-0">{goal.icon}</span>
              <span className={`text-xs truncate font-medium ${goal.completed ? 'line-through opacity-80' : ''}`}>
                {goal.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono font-bold text-cyan-300">
                +{goal.rewardPaws} Paws
              </span>
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  goal.completed
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/40'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                {goal.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
