import React, { useState } from 'react';
import { SpeakerHigh, SpeakerSlash, ChartBar, ArrowLeft, ArrowsClockwise } from '@phosphor-icons/react';
import { useBankrollStore } from '../../store/useBankrollStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Modal } from '../common/Modal';
import { StatsModal } from '../lobby/StatsModal';

interface HeaderProps {
  activeView: 'lobby' | 'blackjack' | 'blackjack-pro' | 'videopoker';
  onNavigate: (view: 'lobby' | 'blackjack' | 'blackjack-pro' | 'videopoker') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
  const { chips, resetBankroll } = useBankrollStore();
  const { isMuted, toggleMute } = useSettingsStore();
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
        {/* Left side: Back to Lobby or Logo */}
        <div className="flex items-center gap-2">
          {activeView !== 'lobby' ? (
            <button
              onClick={() => onNavigate('lobby')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-300 bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-800 transition active:scale-95"
            >
              <ArrowLeft size={16} />
              <span>Lobby</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-amber-400 font-serif-luxury font-bold text-xs">
                ♠
              </div>
              <span className="font-serif-luxury font-bold text-sm sm:text-base tracking-wider text-slate-100">
                HANGGAA
              </span>
            </div>
          )}
        </div>

        {/* Center: Bankroll Pill */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-400/30 px-3 py-1 rounded-full shadow-inner">
          <span className="text-amber-400 text-xs">🪙</span>
          <span className="font-mono font-bold text-sm sm:text-base text-amber-300">
            ${chips.toLocaleString()}
          </span>
          {chips <= 0 && (
            <button
              onClick={resetBankroll}
              title="Reload $500 chips"
              className="text-emerald-400 hover:text-emerald-300 transition active:scale-95 ml-1"
            >
              <ArrowsClockwise size={14} />
            </button>
          )}
        </div>

        {/* Right: Sound & Stats */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(true)}
            className="p-2 text-slate-300 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition active:scale-95"
            title="Statistics"
          >
            <ChartBar size={18} />
          </button>
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg border border-slate-800 transition active:scale-95 ${
              isMuted ? 'text-rose-400 bg-rose-950/40' : 'text-slate-300 hover:text-amber-300 bg-slate-900 hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <SpeakerSlash size={18} /> : <SpeakerHigh size={18} />}
          </button>
        </div>
      </header>

      {/* Stats Modal */}
      <Modal isOpen={showStats} onClose={() => setShowStats(false)} title="Personal Arcade Statistics">
        <StatsModal />
      </Modal>
    </>
  );
};
