import React from 'react';
import { BellOff, Heart, Check, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DndModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-900 border border-surface-700/80 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-surface-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <BellOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight">Silence Distractions</h3>
            <p className="text-xs text-neutral-400">Keep favorite contacts available</p>
          </div>
        </div>

        <div className="bg-surface-850 border border-surface-800 rounded-xl p-3.5 mb-4 text-xs text-neutral-300 space-y-2.5">
          <div className="flex items-start gap-2 text-neutral-200">
            <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Browsers cannot mute native calls directly due to mobile OS security sandboxing. Set your device Focus once:</span>
          </div>

          <div className="border-t border-surface-800 pt-2 space-y-2">
            <div>
              <span className="font-medium text-brand-400">iPhone (iOS):</span>
              <p className="text-neutral-400 mt-0.5">
                Settings &gt; <strong>Focus</strong> &gt; Do Not Disturb &gt; <strong>People</strong> &gt; Allow Calls From <strong>Favorites</strong>.
              </p>
            </div>
            <div>
              <span className="font-medium text-accent-cyan">Android:</span>
              <p className="text-neutral-400 mt-0.5">
                Swipe down quick settings &gt; Long-press <strong>Do Not Disturb</strong> &gt; People &gt; Calls &gt; <strong>Starred contacts only</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Screen Wake-Lock is active while the timer runs so your screen won't sleep.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-surface-950 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10"
        >
          <Check className="w-4 h-4" />
          <span>I'm Ready to Focus</span>
        </button>
      </div>
    </div>
  );
};
