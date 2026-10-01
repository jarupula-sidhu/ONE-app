export type GoalCategory = 'Study' | 'Work' | 'Project' | 'Fitness' | 'Personal' | 'Other';

export type GoalStatus = 'active' | 'completed' | 'missed';

export type MissedReason =
  | 'Too much phone time'
  | 'Social media'
  | 'Lack of motivation'
  | 'Poor planning'
  | 'Unexpected work'
  | 'Tired / sleep'
  | 'Distraction'
  | 'Other';

export interface FocusSession {
  id: string;
  goalId: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  durationMinutes: number;
}

export interface DailyGoal {
  id: string;
  date: string; // YYYY-MM-DD local format
  title: string;
  category: GoalCategory;
  targetMinutes: number;
  status: GoalStatus;
  createdAt: string;
  completedAt?: string;
  totalFocusMinutes: number;
  failureReason?: MissedReason | string;
  note?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  dailyReminderEnabled: boolean;
  reminderTime: string; // '20:00'
  soundEnabled: boolean;
  wakeLockEnabled: boolean;
}

export interface AppDataExport {
  version: number;
  exportedAt: string;
  settings: UserSettings;
  goals: DailyGoal[];
  sessions: FocusSession[];
}
