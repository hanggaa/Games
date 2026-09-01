import React, { useState } from 'react';
import { SpeakerHigh, SpeakerSlash, ChartBar, ArrowLeft, ArrowClockwise } from '@phosphor-icons/react';
import { useBankrollStore } from '../../store/useBankrollStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Modal } from '../common/Modal';
import { StatsModal } from '../lobby/StatsModal';

export type ExtendedView =
  | 'lobby'
  | 'dungeon'
  | 'defense'
  | 'cyber'
  | 'orbital'
  | 'buckshot'
  | 'balatro'
  | 'blackjack-pro'
  | 'videopoker'
  | 'blackjack';

interface HeaderProps {
  activeView: ExtendedView;
  onNavigate: (view: ExtendedView) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
  const { chips, resetBankroll } = useBankrollStore();
  const { isMuted, toggleMute } = useSettingsStore();
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#222222] px-4 py-3 flex items-center justify-between">
        {/* Left: Back / Title */}
        <div className="flex items-center gap-3">
          {activeView !== 'lobby' ? (
            <button
              onClick={() => onNavigate('lobby')}
              className="flex items-center gap-1.5 text-xs font-medium text-[#EDEDED] bg-[#141414] hover:bg-[#1C1C1C] px-2.5 py-1.5 rounded-md border border-[#2A2A2A] transition active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Hub</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#EDEDED] text-[#0A0A0A] flex items-center justify-center font-mono-meta font-bold text-xs">
                H
              </span>
              <span className="font-serif-editorial font-bold text-base text-[#EDEDED] tracking-tight">
                Hanggaa Arcade
              </span>
            </div>
          )}
        </div>

        {/* Center: Bankroll Counter */}
        <div className="flex items-center gap-2 bg-[#141414] border border-[#282828] px-3 py-1 rounded-md text-xs font-mono-meta">
          <span className="text-[#8E8E93]">CREDITS</span>
          <span className="font-bold text-[#EDEDED]">
            ${chips.toLocaleString()}
          </span>
          {chips <= 0 && (
            <button
              onClick={resetBankroll}
              title="Reset $500 credits"
              className="text-[#FBBF24] hover:text-white transition active:scale-95 ml-1 cursor-pointer"
            >
              <ArrowClockwise size={13} weight="bold" />
            </button>
          )}
        </div>

        {/* Right: Sound & Stats */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowStats(true)}
            className="p-1.5 text-[#EDEDED] bg-[#141414] hover:bg-[#1E1E1E] rounded-md border border-[#282828] transition active:scale-[0.98] cursor-pointer"
            title="Statistics"
          >
            <ChartBar size={16} weight="bold" />
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 text-[#EDEDED] bg-[#141414] hover:bg-[#1E1E1E] rounded-md border border-[#282828] transition active:scale-[0.98] cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <SpeakerSlash size={16} weight="bold" /> : <SpeakerHigh size={16} weight="bold" />}
          </button>
        </div>
      </header>

      {/* Stats Modal */}
      <Modal isOpen={showStats} onClose={() => setShowStats(false)} title="Session Performance">
        <StatsModal />
      </Modal>
    </>
  );
};
