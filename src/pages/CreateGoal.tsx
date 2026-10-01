import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Clock, Tag } from 'lucide-react';
import { GoalCategory, DailyGoal } from '../types';
import { StorageService } from '../services/storage';
import { getLocalDateString } from '../utils/date';

const CATEGORIES: GoalCategory[] = ['Study', 'Work', 'Project', 'Fitness', 'Personal', 'Other'];

export const CreateGoal: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [targetMinutes, setTargetMinutes] = useState(60);
  const [category, setCategory] = useState<GoalCategory>('Study');
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    const existing = StorageService.getTodayGoal();
    if (existing) {
      setTitle(existing.title);
      setTargetMinutes(existing.targetMinutes || 60);
      setCategory(existing.category || 'Study');
      setExistingId(existing.id);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todayStr = getLocalDateString();
    const existing = StorageService.getTodayGoal();

    const goal: DailyGoal = {
      id: existingId || 'goal_' + Date.now(),
      date: todayStr,
      title: title.trim(),
      category,
      targetMinutes: Number(targetMinutes) || 60,
      status: existing ? existing.status : 'active',
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      totalFocusMinutes: existing ? existing.totalFocusMinutes : 0,
      completedAt: existing?.completedAt,
      failureReason: existing?.failureReason,
    };

    StorageService.saveTodayGoal(goal);
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-surface-800 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">
          {existingId ? "Edit Today's ONE" : "Define Today's ONE"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal Title */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-brand-400" />
            <span>Goal Title (Required)</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Study DBMS for 2 hours"
            className="w-full bg-surface-900 border border-surface-750 rounded-xl px-4 py-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Target Duration */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-400" />
            <span>Target Duration: {targetMinutes} mins</span>
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[30, 45, 60, 90, 120, 150, 180, 240].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setTargetMinutes(mins)}
                className={`py-2 text-xs font-mono rounded-lg border transition ${
                  targetMinutes === mins
                    ? 'bg-brand-500/10 border-brand-500 text-brand-400 font-semibold'
                    : 'bg-surface-900 border-surface-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
          <input
            type="range"
            min={15}
            max={360}
            step={15}
            value={targetMinutes}
            onChange={(e) => setTargetMinutes(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-brand-400" />
            <span>Category</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2.5 px-2 text-xs font-medium rounded-xl border transition ${
                  category === cat
                    ? 'bg-brand-500/15 border-brand-500 text-brand-300'
                    : 'bg-surface-900 border-surface-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full py-4 px-4 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-surface-950 font-bold rounded-2xl text-sm transition shadow-lg shadow-brand-500/10 mt-8"
        >
          {existingId ? 'Save Changes' : 'Create ONE'}
        </button>
      </form>
    </div>
  );
};
