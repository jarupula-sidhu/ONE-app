import { DailyGoal, FocusSession, UserSettings, AppDataExport } from '../types';
import { getLocalDateString } from '../utils/date';

const STORAGE_KEYS = {
  GOALS: 'one_goals_v1',
  SESSIONS: 'one_sessions_v1',
  SETTINGS: 'one_settings_v1',
  ACTIVE_TIMER: 'one_active_timer_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  dailyReminderEnabled: false,
  reminderTime: '20:00',
  soundEnabled: true,
  wakeLockEnabled: true,
};

export const StorageService = {
  getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getAllGoals(): DailyGoal[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveGoals(goals: DailyGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  getTodayGoal(): DailyGoal | null {
    const today = getLocalDateString();
    const goals = this.getAllGoals();
    return goals.find(g => g.date === today) || null;
  },

  saveTodayGoal(goal: DailyGoal): void {
    const goals = this.getAllGoals();
    const index = goals.findIndex(g => g.id === goal.id || g.date === goal.date);
    if (index >= 0) {
      goals[index] = goal;
    } else {
      goals.unshift(goal);
    }
    this.saveGoals(goals);
  },

  updateGoal(goal: DailyGoal): void {
    const goals = this.getAllGoals().map(g => (g.id === goal.id ? goal : g));
    this.saveGoals(goals);
  },

  // Automatically check past days that were left active and mark as missed
  reconcileDailyTransitions(): void {
    const today = getLocalDateString();
    const goals = this.getAllGoals();
    let updated = false;

    const reconciled = goals.map(g => {
      if (g.date < today && g.status === 'active') {
        updated = true;
        return {
          ...g,
          status: 'missed' as const,
          failureReason: g.failureReason || 'Day ended before completion',
        };
      }
      return g;
    });

    if (updated) {
      this.saveGoals(reconciled);
    }
  },

  getAllSessions(): FocusSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveSession(session: FocusSession): void {
    const sessions = this.getAllSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Update goal's accumulated minutes
    const goals = this.getAllGoals();
    const goalIndex = goals.findIndex(g => g.id === session.goalId);
    if (goalIndex >= 0) {
      goals[goalIndex].totalFocusMinutes = (goals[goalIndex].totalFocusMinutes || 0) + session.durationMinutes;
      this.saveGoals(goals);
    }
  },

  getGoalSessions(goalId: string): FocusSession[] {
    return this.getAllSessions().filter(s => s.goalId === goalId);
  },

  exportAllData(): AppDataExport {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      goals: this.getAllGoals(),
      sessions: this.getAllSessions(),
    };
  },

  importData(data: AppDataExport): boolean {
    if (!data || !Array.isArray(data.goals) || !Array.isArray(data.sessions)) {
      throw new Error('Invalid backup file structure.');
    }
    this.saveSettings(data.settings || DEFAULT_SETTINGS);
    this.saveGoals(data.goals);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
    return true;
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
  },
};
