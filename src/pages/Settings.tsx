import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, Bell, Sun, Volume2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { UserSettings, AppDataExport } from '../types';
import { StorageService } from '../services/storage';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleExport = () => {
    const data = StorageService.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Data exported successfully.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed: AppDataExport = JSON.parse(event.target?.result as string);
        StorageService.importData(parsed);
        setSettings(StorageService.getSettings());
        setStatusMessage('Backup imported successfully.');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        alert('Invalid backup file. Could not import data.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    StorageService.clearAllData();
    setShowClearConfirm(false);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-xs text-neutral-400">Preferences, notifications and local storage data.</p>
      </div>

      {statusMessage && (
        <div className="p-3 bg-brand-500/15 border border-brand-500/40 rounded-xl text-xs text-brand-300 font-medium">
          {statusMessage}
        </div>
      )}

      {/* Notifications and Reminders */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
          <Bell className="w-4 h-4 text-brand-400" />
          <span>Daily Reminders</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-medium text-neutral-200">Evening Reminder</span>
            <p className="text-neutral-400 text-[11px]">Prompt you to complete or review ONE</p>
          </div>
          <input
            type="checkbox"
            checked={settings.dailyReminderEnabled}
            onChange={(e) => updateSetting('dailyReminderEnabled', e.target.checked)}
            className="w-4 h-4 accent-brand-500 cursor-pointer"
          />
        </div>

        {settings.dailyReminderEnabled && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-850">
            <span className="text-neutral-400">Reminder Time</span>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => updateSetting('reminderTime', e.target.value)}
              className="bg-surface-950 border border-surface-800 rounded-lg px-2 py-1 text-neutral-200 text-xs"
            />
          </div>
        )}
      </div>

      {/* Sound & Wake-Lock */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
          <Volume2 className="w-4 h-4 text-brand-400" />
          <span>Focus Feedback</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-medium text-neutral-200">Audio Chimes</span>
            <p className="text-neutral-400 text-[11px]">Web Audio synthesized focus bell</p>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            className="w-4 h-4 accent-brand-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-850">
          <div>
            <span className="font-medium text-neutral-200">Screen Wake Lock</span>
            <p className="text-neutral-400 text-[11px]">Keep display active during focus sessions</p>
          </div>
          <input
            type="checkbox"
            checked={settings.wakeLockEnabled}
            onChange={(e) => updateSetting('wakeLockEnabled', e.target.checked)}
            className="w-4 h-4 accent-brand-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>Local Data & Privacy</span>
        </div>
        <p className="text-[11px] text-neutral-400">
          All data is saved offline on your device in LocalStorage. No accounts, no servers, zero telemetry.
        </p>

        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="py-2.5 px-3 bg-surface-850 hover:bg-surface-800 border border-surface-750 text-neutral-200 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 bg-surface-850 hover:bg-surface-800 border border-surface-750 text-neutral-200 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        <div className="pt-3 border-t border-surface-850">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Delete all your ONE data?</h3>
            </div>
            <p className="text-xs text-neutral-400">
              This will permanently delete all your goals, focus session history, and streaks from this device. This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 bg-surface-800 hover:bg-surface-700 text-neutral-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
