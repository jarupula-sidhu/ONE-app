import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Zap, Award, BarChart3, ChevronRight } from 'lucide-react';
import { DailyGoal } from '../types';
import { StorageService } from '../services/storage';
import { formatFriendlyDate, formatTimeMinutes } from '../utils/date';

export const History: React.FC = () => {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<DailyGoal | null>(null);

  useEffect(() => {
    StorageService.reconcileDailyTransitions();
    const all = StorageService.getAllGoals().sort((a, b) => b.date.localeCompare(a.date));
    setGoals(all);
  }, []);

  // Compute Streak logic
  const completedGoals = goals.filter(g => g.status === 'completed');
  const totalDays = goals.length;
  const completionRate = totalDays > 0 ? Math.round((completedGoals.length / totalDays) * 100) : 0;

  // Streak calculator
  let currentStreak = 0;
  let bestStreak = 0;
  let running = 0;

  const chronological = [...goals].sort((a, b) => a.date.localeCompare(b.date));
  chronological.forEach((g) => {
    if (g.status === 'completed') {
      running += 1;
      if (running > bestStreak) bestStreak = running;
    } else {
      running = 0;
    }
  });

  // Current streak counting backwards from most recent
  for (const g of goals) {
    if (g.status === 'completed') {
      currentStreak += 1;
    } else if (g.status === 'missed') {
      break;
    }
  }

  // Insights calculations
  const totalFocusAll = goals.reduce((acc, g) => acc + (g.totalFocusMinutes || 0), 0);
  const avgFocus = totalDays > 0 ? Math.round(totalFocusAll / totalDays) : 0;

  const reasonCounts: Record<string, number> = {};
  goals.forEach(g => {
    if (g.status === 'missed' && g.failureReason) {
      reasonCounts[g.failureReason] = (reasonCounts[g.failureReason] || 0) + 1;
    }
  });

  let topDistraction = 'None recorded';
  let topDistractionCount = 0;
  Object.entries(reasonCounts).forEach(([r, count]) => {
    if (count > topDistractionCount) {
      topDistraction = r;
      topDistractionCount = count;
    }
  });

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">History & Insights</h1>
        <p className="text-xs text-neutral-400">Track your daily discipline over time.</p>
      </div>

      {/* Streak & Key Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">{currentStreak} <span className="text-xs font-normal text-neutral-400">days</span></div>
            <div className="text-[11px] text-neutral-400">Current Streak</div>
          </div>
        </div>

        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">{bestStreak} <span className="text-xs font-normal text-neutral-400">days</span></div>
            <div className="text-[11px] text-neutral-400">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-neutral-300">
          <BarChart3 className="w-4 h-4 text-brand-400" />
          <span>Pattern Insights</span>
        </div>

        {totalDays < 2 ? (
          <p className="text-xs text-neutral-500 py-2">
            Complete a few more days to see your patterns.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-surface-950 p-3 rounded-xl border border-surface-850">
              <span className="text-neutral-400 block mb-1">Completion Rate</span>
              <span className="text-base font-bold font-mono text-brand-400">{completionRate}%</span>
            </div>
            <div className="bg-surface-950 p-3 rounded-xl border border-surface-850">
              <span className="text-neutral-400 block mb-1">Avg Focus Time</span>
              <span className="text-base font-bold font-mono text-white">{formatTimeMinutes(avgFocus)}</span>
            </div>
            <div className="col-span-2 bg-surface-950 p-3 rounded-xl border border-surface-850">
              <span className="text-neutral-400 block mb-1">Common Distraction</span>
              <span className="text-xs font-medium text-amber-300">{topDistraction}</span>
            </div>
          </div>
        )}
      </div>

      {/* Timeline of Days */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Previous Days</h2>

        {goals.length === 0 ? (
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 text-center text-neutral-500 text-xs">
            Your journey starts today. Complete your first ONE.
          </div>
        ) : (
          <div className="space-y-2">
            {goals.map((goal) => {
              const isComp = goal.status === 'completed';
              return (
                <div
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal)}
                  className="bg-surface-900 hover:bg-surface-850 border border-surface-800 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    {isComp ? (
                      <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-neutral-500 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-mono text-neutral-400">{formatFriendlyDate(goal.date)}</div>
                      <div className="text-sm font-semibold text-neutral-100 line-clamp-1">{goal.title}</div>
                      {goal.status === 'missed' && goal.failureReason && (
                        <div className="text-[11px] text-amber-400/90 mt-0.5">Reason: {goal.failureReason}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">
                      {formatTimeMinutes(goal.totalFocusMinutes || 0)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-900 border border-surface-750 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-mono text-neutral-400">{formatFriendlyDate(selectedGoal.date)}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedGoal.status === 'completed' ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-800 text-neutral-400'}`}>
                {selectedGoal.status.toUpperCase()}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">{selectedGoal.title}</h3>

            <div className="bg-surface-950 p-3 rounded-xl border border-surface-850 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Category:</span>
                <span className="text-neutral-200">{selectedGoal.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Target Time:</span>
                <span className="text-neutral-200">{formatTimeMinutes(selectedGoal.targetMinutes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Focus:</span>
                <span className="text-brand-400 font-mono font-medium">{formatTimeMinutes(selectedGoal.totalFocusMinutes || 0)}</span>
              </div>
              {selectedGoal.failureReason && (
                <div className="pt-2 border-t border-surface-800">
                  <span className="text-neutral-400 block mb-0.5">Obstacle:</span>
                  <span className="text-amber-300 font-medium">{selectedGoal.failureReason}</span>
                </div>
              )}
              {selectedGoal.note && (
                <div className="pt-2 border-t border-surface-800">
                  <span className="text-neutral-400 block mb-0.5">Note:</span>
                  <span className="text-neutral-300 italic">{selectedGoal.note}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedGoal(null)}
              className="w-full py-2.5 bg-surface-800 hover:bg-surface-700 text-neutral-200 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
