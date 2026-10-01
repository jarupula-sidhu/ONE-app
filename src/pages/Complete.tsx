import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { DailyGoal, MissedReason } from '../types';
import { audioFeedback } from '../utils/audio';
import { StorageService } from '../services/storage';

const MISSED_REASONS: MissedReason[] = [
  'Too much phone time',
  'Social media',
  'Lack of motivation',
  'Poor planning',
  'Unexpected work',
  'Tired / sleep',
  'Distraction',
  'Other',
];

export const Complete: React.FC = () => {
  const navigate = useNavigate();
  const [goal] = useState<DailyGoal | null>(() => StorageService.getTodayGoal());
  const [step, setStep] = useState<'confirm' | 'done' | 'missed'>('confirm');
  const [selectedReason, setSelectedReason] = useState<string>('Distraction');
  const [note, setNote] = useState('');

  if (!goal) {
    navigate('/');
    return null;
  }

  const handleYesCompleted = () => {
    const updated: DailyGoal = {
      ...goal,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
    StorageService.saveTodayGoal(updated);
    if (StorageService.getSettings().soundEnabled) {
      audioFeedback.playCompleteChime();
    }
    setStep('done');
  };

  const handleSaveMissed = () => {
    const updated: DailyGoal = {
      ...goal,
      status: 'missed',
      failureReason: selectedReason,
      note: note.trim() || undefined,
    };
    StorageService.saveTodayGoal(updated);
    navigate('/history');
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto flex flex-col justify-between">
      {/* Top Bar */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-surface-800 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Daily Review</h1>
        </div>

        {/* Step 1: Confirmation */}
        {step === 'confirm' && (
          <div className="bg-surface-900 border border-surface-800 rounded-3xl p-6 shadow-xl text-center space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              TODAY'S ONE
            </span>
            <h2 className="text-2xl font-bold text-white leading-snug">
              {goal.title}
            </h2>

            <p className="text-sm text-neutral-300">
              Did you complete today's ONE goal?
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleYesCompleted}
                className="w-full py-4 px-4 bg-brand-500 hover:bg-brand-400 text-surface-950 font-bold rounded-2xl text-base transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10 active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>YES, I DID IT</span>
              </button>

              <button
                onClick={() => setStep('missed')}
                className="w-full py-3.5 px-4 bg-surface-850 hover:bg-surface-800 border border-surface-750 text-neutral-300 font-semibold rounded-2xl text-sm transition flex items-center justify-center gap-2 active:scale-98"
              >
                <XCircle className="w-4 h-4 text-neutral-400" />
                <span>NOT YET</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: DONE Celebration */}
        {step === 'done' && (
          <div className="bg-surface-900 border border-surface-800 rounded-3xl p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 bg-brand-500/15 border border-brand-500/40 rounded-3xl flex items-center justify-center text-brand-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">ONE DONE.</h2>
              <p className="text-xs text-neutral-400 font-mono">
                Logged at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="p-4 bg-surface-950 rounded-2xl border border-surface-800/80 text-xs text-neutral-300">
              <span className="font-semibold text-brand-400">Great work. </span>
              Consistency compounds. Rest well and conquer tomorrow's ONE.
            </div>

            <button
              onClick={() => navigate('/history')}
              className="w-full py-3.5 px-4 bg-surface-800 hover:bg-surface-700 text-neutral-100 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              <span>View History & Streaks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Missed goal empathetic reflection */}
        {step === 'missed' && (
          <div className="bg-surface-900 border border-surface-800 rounded-3xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase">
              <Heart className="w-4 h-4" />
              <span>Information, not failure</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">What got in the way?</h2>
              <p className="text-xs text-neutral-400 mt-1">
                You missed today. That's information, not failure. Tomorrow is another ONE.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MISSED_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`py-2.5 px-3 text-xs rounded-xl border text-left transition ${
                    selectedReason === reason
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 font-medium'
                      : 'bg-surface-950 border-surface-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 font-medium">Optional reflection note</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What can you adjust tomorrow?"
                className="w-full bg-surface-950 border border-surface-800 rounded-xl p-3 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <button
              onClick={handleSaveMissed}
              className="w-full py-3.5 px-4 bg-surface-800 hover:bg-surface-700 text-neutral-100 font-semibold rounded-xl text-sm transition"
            >
              Save Reflection & Close Day
            </button>
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-neutral-500 py-2">
        Tomorrow is another ONE.
      </footer>
    </div>
  );
};
