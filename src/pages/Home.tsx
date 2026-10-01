import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Edit3, Sparkles, Clock, Target } from 'lucide-react';
import { DailyGoal } from '../types';
import { StorageService } from '../services/storage';
import { getLocalDateString, formatFriendlyDate, formatTimeMinutes } from '../utils/date';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [todayGoal, setTodayGoal] = useState<DailyGoal | null>(null);
  const [inputTitle, setInputTitle] = useState('');
  const [targetMins, setTargetMins] = useState(60);

  const todayStr = getLocalDateString();
  const friendlyToday = formatFriendlyDate(todayStr);

  useEffect(() => {
    StorageService.reconcileDailyTransitions();
    setTodayGoal(StorageService.getTodayGoal());
  }, []);

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    const newGoal: DailyGoal = {
      id: 'goal_' + Date.now(),
      date: todayStr,
      title: inputTitle.trim(),
      category: 'Other',
      targetMinutes: Number(targetMins) || 60,
      status: 'active',
      createdAt: new Date().toISOString(),
      totalFocusMinutes: 0,
    };

    StorageService.saveTodayGoal(newGoal);
    setTodayGoal(newGoal);
    setInputTitle('');
  };

  const progressPercent = todayGoal && todayGoal.targetMinutes > 0
    ? Math.min(100, Math.round(((todayGoal.totalFocusMinutes || 0) / todayGoal.targetMinutes) * 100))
    : 0;

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>ONE</span>
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            </h1>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 bg-surface-900 border border-surface-800 px-2.5 py-1 rounded-full">
              {friendlyToday}
            </span>
          </div>
          <p className="text-xs text-neutral-400 tracking-wide mt-1">One goal. One day. One step.</p>
        </header>

        {/* State 1: Goal NOT set yet */}
        {!todayGoal ? (
          <div className="mt-8 space-y-6">
            <div className="border border-surface-800 bg-surface-900/60 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center gap-2 text-brand-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your Day is Unwritten</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                What’s your ONE thing today?
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mb-6">
                Don't plan 20 things. Pick one important goal and finish it completely.
              </p>

              <form onSubmit={handleQuickCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-400 font-medium">Today's Primary Goal</label>
                  <input
                    type="text"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="e.g. Study DBMS for 2 hours"
                    className="w-full bg-surface-950 border border-surface-700/80 rounded-xl px-4 py-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-brand-500 transition"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-400 font-medium">Target Focus Time</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setTargetMins(mins)}
                        className={`py-2 text-xs font-mono rounded-lg border transition ${
                          targetMins === mins
                            ? 'bg-brand-500/10 border-brand-500 text-brand-400 font-semibold'
                            : 'bg-surface-950 border-surface-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {formatTimeMinutes(mins)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={!inputTitle.trim()}
                    className="w-full py-3.5 px-4 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:hover:bg-brand-500 text-surface-950 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10"
                  >
                    <span>Set Today's ONE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/create')}
                    className="text-xs text-neutral-400 hover:text-neutral-300 py-1 transition text-center"
                  >
                    More options (Category & custom duration) &rarr;
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* State 2: Goal is active or completed */
          <div className="mt-4 space-y-5">
            <div className="bg-surface-900 border border-surface-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
                  TODAY'S ONE
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border border-surface-700 bg-surface-850 text-neutral-300">
                  {todayGoal.category}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-5">
                {todayGoal.title}
              </h2>

              {/* Progress Bar & Stats */}
              <div className="bg-surface-950 border border-surface-850 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-neutral-400">Today's Focus</span>
                  <div className="text-xs font-mono">
                    <span className="text-brand-400 font-semibold">{formatTimeMinutes(todayGoal.totalFocusMinutes || 0)}</span>
                    <span className="text-neutral-500"> / {formatTimeMinutes(todayGoal.targetMinutes)}</span>
                  </div>
                </div>

                <div className="w-full bg-surface-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Status banner if already marked */}
              {todayGoal.status === 'completed' && (
                <div className="mb-6 p-3.5 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center gap-3 text-brand-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-medium">ONE DONE. Completed for today!</span>
                </div>
              )}

              {todayGoal.status === 'missed' && (
                <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  <span className="font-semibold">Missed: </span> {todayGoal.failureReason || 'Day closed'}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/focus')}
                  className="w-full py-4 px-4 bg-brand-500 hover:bg-brand-400 text-surface-950 font-bold rounded-2xl text-sm transition flex items-center justify-center gap-2.5 shadow-xl shadow-brand-500/10 active:scale-[0.99]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START FOCUS</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => navigate('/create')}
                    className="py-3 px-3 bg-surface-850 hover:bg-surface-800 border border-surface-750 text-neutral-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Goal</span>
                  </button>

                  <button
                    onClick={() => navigate('/complete')}
                    className="py-3 px-3 bg-surface-850 hover:bg-surface-800 border border-surface-750 text-neutral-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                    <span>Mark Complete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quote footer */}
      <footer className="mt-8 text-center text-xs text-neutral-500 py-3">
        "Pick ONE important thing and finish it."
      </footer>
    </div>
  );
};
