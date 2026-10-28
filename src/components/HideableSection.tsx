import React from 'react';
import { X } from 'lucide-react';
import { sound } from '../utils/sound';

interface HideableSectionProps {
  id: string;
  hidden: string[];
  onHide: (id: string) => void;
  children: React.ReactNode;
}

/** Wraps a dashboard card with a close (X) button. Hidden cards can be restored from the bottom of the page. */
export const HideableSection: React.FC<HideableSectionProps> = ({ id, hidden, onHide, children }) => {
  if (hidden.includes(id)) return null;
  return (
    <div className="relative">
      <button
        onClick={() => {
          sound.playClick();
          onHide(id);
        }}
        aria-label="Hide this section"
        className="absolute -top-2 -right-1 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-slate-900 border border-slate-600 text-slate-300 hover:text-white cursor-pointer shadow-md"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {children}
    </div>
  );
};
