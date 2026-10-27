import React, { useState } from 'react';
import { CheckSquare, Plus, Check, Edit2, Trash2, X, Sparkles, Flame } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireRewardConfetti } from '../utils/confetti';
import { PersonalGoal } from '../types';

interface DailyHabitTrackerProps {
  habits: PersonalGoal[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string, icon: string) => void;
  onEditHabit?: (id: string, newTitle: string, newIcon: string) => void;
  onDeleteHabit?: (id: string) => void;
}

export const DailyHabitTracker: React.FC<DailyHabitTrackerProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [habitTitle, setHabitTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💧');

  const emojis = ['💧', '🏃', '📚', '🥗', '🧘', '💰', '🐾', '⏰', '🍎', '💤'];

  const completedCount = habits.filter((h) => h.completed).length;

  const handleToggle = (id: string, alreadyCompleted: boolean) => {
    if (!alreadyCompleted) {
      sound.playCoin();
      haptics.claim();
      fireRewardConfetti(0.25);
    } else {
      sound.playClick();
      haptics.light();
    }
    onToggleHabit(id);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    sound.playClick();
    onAddHabit(habitTitle.trim(), selectedEmoji);
    setHabitTitle('');
    setIsAdding(false);
  };

  const handleStartEdit = (habit: PersonalGoal, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setEditingId(habit.id);
    setHabitTitle(habit.title);
    setSelectedEmoji(habit.icon);
    setIsAdding(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !habitTitle.trim()) return;
    sound.playClick();
    onEditHabit?.(editingId, habitTitle.trim(), selectedEmoji);
    setEditingId(null);
    setHabitTitle('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    onDeleteHabit?.(id);
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
                Daily Habit Tracker
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                +50 Paws / Habit
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80">Track custom daily recurring tasks to earn bonus Paws</p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setIsAdding(!isAdding);
            setEditingId(null);
            setHabitTitle('');
          }}
          className="p-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1 text-[11px] font-bold"
          title="Add New Daily Habit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>Habits Completed Today:</span>
        <span className="font-mono text-cyan-300 font-bold">
          {completedCount} / {habits.length} ({Math.round((completedCount / (habits.length || 1)) * 100)}%)
        </span>
      </div>
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 -mt-1.5">
        <div
          className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / (habits.length || 1)) * 100}%` }}
        />
      </div>

      {/* Add New Habit Form */}
      {isAdding && (
        <form onSubmit={handleSaveAdd} className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/40 flex flex-col gap-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
            <span>Add New Daily Habit</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
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
              value={habitTitle}
              onChange={(e) => setHabitTitle(e.target.value)}
              placeholder="e.g. Drink 8 glasses of water"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={!habitTitle.trim()}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer active:scale-95 transition-all"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Edit Habit Form */}
      {editingId && (
        <form onSubmit={handleSaveEdit} className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 flex flex-col gap-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
            <span>Edit Daily Habit</span>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {emojis.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`p-1 px-1.5 rounded-lg text-sm border transition-all cursor-pointer ${
                  selectedEmoji === emoji ? 'bg-amber-500/30 border-amber-400 scale-110' : 'bg-slate-900 border-slate-800'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={habitTitle}
              onChange={(e) => setHabitTitle(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={!habitTitle.trim()}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer active:scale-95 transition-all"
            >
              Update
            </button>
          </div>
        </form>
      )}

      {/* Habits List */}
      <div className="space-y-1.5">
        {habits.map((habit) => (
          <div
            key={habit.id}
            onClick={() => handleToggle(habit.id, habit.completed)}
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none active:scale-98 group ${
              habit.completed
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/30 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-base shrink-0">{habit.icon}</span>
              <span className={`text-xs truncate font-medium ${habit.completed ? 'line-through opacity-80' : ''}`}>
                {habit.title}
              </span>

              {/* Current Streak Badge */}
              <div
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold shrink-0 transition-all ${
                  habit.completed
                    ? 'bg-orange-500/25 border border-orange-400/50 text-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.35)]'
                    : 'bg-slate-900 border border-slate-700/80 text-orange-400/80'
                }`}
                title={`${habit.streakDays || 1}-day completion streak`}
              >
                <Flame className={`w-2.5 h-2.5 fill-orange-400 ${habit.completed ? 'text-orange-300' : 'text-orange-400'}`} />
                <span>{habit.streakDays || 1}d</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono font-bold text-cyan-300">
                +{habit.rewardPaws} Paws
              </span>

              {/* Action Buttons: Edit & Delete */}
              <button
                type="button"
                onClick={(e) => handleStartEdit(habit, e)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-white transition-opacity"
                title="Edit Habit"
              >
                <Edit2 className="w-3 h-3" />
              </button>

              {onDeleteHabit && (
                <button
                  type="button"
                  onClick={(e) => handleDelete(habit.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 transition-opacity"
                  title="Delete Habit"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  habit.completed
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/40'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                {habit.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
