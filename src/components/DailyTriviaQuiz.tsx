import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireRewardConfetti } from '../utils/confetti';
import { formatPhp } from '../utils/storage';

export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  fact: string;
}

const TRIVIA_SET: TriviaQuestion[] = [
  {
    id: 1,
    question: 'Where do dogs and cats primarily sweat from on hot days?',
    options: ['Through their skin', 'From their paw pads', 'Through their ears', 'Under their tails'],
    correctIndex: 1,
    fact: 'Dogs and cats have merocrine sweat glands located in the pads of their paws!',
  },
  {
    id: 2,
    question: 'Approximately how many walking steps make up 1 kilometer?',
    options: ['About 400 steps', 'About 800 steps', 'About 1,300 to 1,500 steps', 'About 5,000 steps'],
    correctIndex: 2,
    fact: 'An average adult takes approximately 1,300 to 1,500 steps to walk 1 kilometer.',
  },
  {
    id: 3,
    question: 'What is MoneyPaws primary mission for everyday users?',
    options: ['Pay for luxury yachts', 'Help cover small daily expenses like coffee & snacks', 'Replace full corporate salaries', 'Trade volatile penny stocks'],
    correctIndex: 1,
    fact: 'MoneyPaws is designed to give passive micro-income for daily coffee, load, and fare!',
  },
];

interface DailyTriviaQuizProps {
  triviaAnsweredDate: string;
  onRewardEarned: (php: number, paws: number, title: string) => void;
}

export const DailyTriviaQuiz: React.FC<DailyTriviaQuizProps> = ({
  triviaAnsweredDate,
  onRewardEarned,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyAnswered = triviaAnsweredDate === todayStr;

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(alreadyAnswered);

  const question = TRIVIA_SET[currentQIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || isFinished) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === question.correctIndex;
    if (isCorrect) {
      sound.playFanfare();
      haptics.claim();
      fireRewardConfetti(0.3);
      setCorrectCount((prev) => prev + 1);
      onRewardEarned(0.10, 100, `Daily Trivia: Question ${currentQIndex + 1} Correct`);
    } else {
      sound.playClick();
      haptics.light();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentQIndex < TRIVIA_SET.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900/95 via-cyan-950/25 to-slate-900/95 border border-cyan-500/35 p-4 shadow-[0_0_15px_rgba(6,182,212,0.12)] flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-fredoka text-sm font-bold text-white tracking-wide">
                Daily Trivia Quiz
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                +₱0.10 / Q
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80">Answer 3 fun questions to earn instant Paws</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-semibold">
          <span>Q {Math.min(currentQIndex + 1, 3)}/3</span>
        </div>
      </div>

      {/* Main Quiz Body */}
      {isFinished ? (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center flex flex-col items-center gap-2">
          <div className="text-3xl animate-bounce">🏆</div>
          <span className="font-fredoka text-base font-bold text-white">
            Daily Trivia Completed!
          </span>
          <p className="text-xs text-slate-300">
            You scored <strong className="text-cyan-300 font-mono">{correctCount}/3 correct</strong> and earned up to{' '}
            <strong className="text-amber-300 font-mono">{formatPhp(correctCount * 0.10)}</strong>!
          </p>
          <span className="text-[10px] text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 mt-1">
            New questions reset at midnight 🌙
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {/* Question Text */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold text-slate-200 leading-relaxed">
            {question.question}
          </div>

          {/* Options */}
          <div className="space-y-1.5">
            {question.options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              const isCorrect = idx === question.correctIndex;

              let style = 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/40 text-slate-200';
              if (isAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300 font-bold';
                } else if (isChosen && !isCorrect) {
                  style = 'bg-rose-950/70 border-rose-500/70 text-rose-300';
                } else {
                  style = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-2.5 px-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer active:scale-98 ${style}`}
                >
                  <span className="truncate">{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isAnswered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Fun Fact / Feedback */}
          {isAnswered && (
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-slate-300 flex items-start gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-cyan-300">
                  {selectedOption === question.correctIndex ? 'Correct! ' : 'Good Try! '}
                </span>
                <span>{question.fact}</span>
              </div>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 cursor-pointer flex items-center justify-center gap-1 active:scale-98 transition-all"
            >
              <span>{currentQIndex < TRIVIA_SET.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
