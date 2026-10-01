import { useState, useEffect, useRef, useCallback } from 'react';
import { audioFeedback } from '../utils/audio';
import { StorageService } from '../services/storage';

interface ActiveTimerState {
  goalId: string;
  isRunning: boolean;
  startTime: number | null; // Date.now() when last started/resumed
  elapsedSeconds: number;   // accumulated seconds
}

const TIMER_STORAGE_KEY = 'one_active_timer_v1';

export function useTimer(goalId: string, onSessionFinish: (durationMinutes: number) => void) {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Restore saved active timer state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const state: ActiveTimerState = JSON.parse(saved);
        if (state.goalId === goalId) {
          if (state.isRunning && state.startTime) {
            const added = Math.floor((Date.now() - state.startTime) / 1000);
            setSeconds(state.elapsedSeconds + Math.max(0, added));
            setIsRunning(true);
          } else {
            setSeconds(state.elapsedSeconds);
            setIsRunning(false);
          }
        }
      }
    } catch {
      // Ignore parse error
    }
  }, [goalId]);

  // Sync to local storage
  const syncStorage = useCallback((running: boolean, currentSec: number) => {
    const state: ActiveTimerState = {
      goalId,
      isRunning: running,
      startTime: running ? Date.now() : null,
      elapsedSeconds: currentSec,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  }, [goalId]);

  // Screen Wake Lock API
  const requestWakeLock = async () => {
    try {
      if (!StorageService.getSettings().wakeLockEnabled) return;
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Ignored if unsupported or disallowed
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  // Main tick and Page Visibility API handler
  useEffect(() => {
    if (!isRunning) {
      releaseWakeLock();
      return;
    }

    requestWakeLock();
    let lastTimestamp = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.floor((now - lastTimestamp) / 1000);
      if (deltaSec >= 1) {
        setSeconds(prev => {
          const next = prev + deltaSec;
          syncStorage(true, next);
          return next;
        });
        lastTimestamp = now;
      }
    }, 500);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        requestWakeLock();
        // Recalculate accurately from storage
        try {
          const raw = localStorage.getItem(TIMER_STORAGE_KEY);
          if (raw) {
            const parsed: ActiveTimerState = JSON.parse(raw);
            if (parsed.startTime) {
              const drift = Math.floor((Date.now() - parsed.startTime) / 1000);
              const corrected = parsed.elapsedSeconds + drift;
              setSeconds(corrected);
            }
          }
        } catch {
          // Ignore
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isRunning, syncStorage]);

  const start = () => {
    if (StorageService.getSettings().soundEnabled) {
      audioFeedback.playStartPing();
    }
    setIsRunning(true);
    syncStorage(true, seconds);
  };

  const pause = () => {
    setIsRunning(false);
    syncStorage(false, seconds);
    releaseWakeLock();
  };

  const finishSession = () => {
    setIsRunning(false);
    releaseWakeLock();
    const durationMinutes = Math.max(1, Math.round(seconds / 60));
    localStorage.removeItem(TIMER_STORAGE_KEY);
    setSeconds(0);
    onSessionFinish(durationMinutes);
  };

  const reset = () => {
    setIsRunning(false);
    releaseWakeLock();
    localStorage.removeItem(TIMER_STORAGE_KEY);
    setSeconds(0);
  };

  return {
    seconds,
    isRunning,
    start,
    pause,
    finishSession,
    reset,
  };
}
