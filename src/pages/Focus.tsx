import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Square, ArrowLeft, BellOff, Volume2, ShieldCheck } from 'lucide-react';
import { DailyGoal, FocusSession } from '../types';
import { StorageService } from '../services/storage';
import { useTimer } from '../hooks/useTimer';
import { formatHMS, formatTimeMinutes } from '../utils/date';
import { DndModal } from '../components/DndModal';

export const Focus: React.FC = () => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [isDndModalOpen, setIsDndModalOpen] = useState(false);

  useEffect(() => {
    const todayGoal = StorageService.getTodayGoal();
    if (!todayGoal) {
      navigate('/');
      return;
    }
    setGoal(todayGoal);
    setSessions(StorageService.getGoalSessions(todayGoal.id));
  }, [navigate]);

  const handleSessionFinish = (durationMinutes: number) => {
    if (!goal) return;
    const now = new Date();
    const newSession: FocusSession = {
      id: 'sess_' + Date.now(),
      goalId: goal.id,
      startTime: new Date(now.getTime() - durationMinutes * 60000).toISOString(),
      endTime: now.toISOString(),
      durationMinutes,
    };

    StorageService.saveSession(newSession);
    const updatedSessions = StorageService.getGoalSessions(goal.id);
    setSessions(updatedSessions);
    const refreshed = StorageService.getTodayGoal();
    if (refreshed) setGoal(refreshed);
  };

  const timer = useTimer(goal?.id || '', handleSessionFinish);

  if (!goal) return null;

  return (
    <div className="min-h-screen bg-surface-950 text-neutral-100 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-surface-850 transition"
            aria-label="Back to Today"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsDndModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-900 border border-surface-750 text-xs text-brand-400 rounded-full hover:bg-surface-800 transition"
          >
            <BellOff className="w-3.5 h-3.5" />
            <span>Silence Calls & DND</span>
          </button>
        </div>

        {/* Goal Title */}
        <div className="text-center my-4">
          <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-500">
            TODAY'S ONE
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {goal.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Total logged: <span className="text-brand-400 font-mono font-medium">{formatTimeMinutes(goal.totalFocusMinutes || 0)}</span>
          </p>
        </div>
      </div>

      {/* Large Focus Timer */}
      <div className="my-auto text-center py-8">
        <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white select-none">
          {formatHMS(timer.seconds)}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <span className={`w-2 h-2 rounded-full ${timer.isRunning ? 'bg-brand-500 animate-ping' : 'bg-neutral-600'}`} />
          <span>{timer.isRunning ? 'Focus session active' : 'Session paused'}</span>
        </div>

        {/* Controls */}
        <div className="mt-10 flex items-center justify-center gap-4">
          {!timer.isRunning ? (
            <button
              onClick={timer.start}
              className="py-4 px-8 bg-brand-500 hover:bg-brand-400 text-surface-950 font-bold rounded-2xl text-base transition flex items-center gap-2 shadow-xl shadow-brand-500/20 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{timer.seconds > 0 ? 'Resume' : 'Start'}</span>
            </button>
          ) : (
            <button
              onClick={timer.pause}
              className="py-4 px-8 bg-amber-500 hover:bg-amber-400 text-surface-950 font-bold rounded-2xl text-base transition flex items-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {timer.seconds > 0 && (
            <button
              onClick={timer.finishSession}
              className="py-4 px-5 bg-surface-850 hover:bg-surface-800 border border-surface-700 text-neutral-200 font-semibold rounded-2xl text-sm transition flex items-center gap-1.5 active:scale-95"
            >
              <Square className="w-4 h-4 fill-current text-rose-400" />
              <span>Save Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Session Log */}
      <div>
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-neutral-400">Completed Sessions</span>
            <span className="text-xs font-mono text-neutral-400">{sessions.length} logged</span>
          </div>

          {sessions.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-3">No sessions logged yet today.</p>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {sessions.map((s, idx) => (
                <div key={s.id} className="flex justify-between items-center text-xs py-1.5 px-2 bg-surface-950 rounded-lg">
                  <span className="text-neutral-400">Session {idx + 1}</span>
                  <span className="font-mono text-brand-400 font-medium">{formatTimeMinutes(s.durationMinutes)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center px-2">
          <button
            onClick={() => navigate('/complete')}
            className="text-xs text-neutral-400 hover:text-brand-400 transition"
          >
            Ready to wrap up? Mark Complete &rarr;
          </button>
        </div>
      </div>

      <DndModal isOpen={isDndModalOpen} onClose={() => setIsDndModalOpen(false)} />
    </div>
  );
};
