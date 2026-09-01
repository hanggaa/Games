import React, { useEffect } from 'react';
import { Terminal, ShieldWarning, ArrowClockwise, LockKey, LockKeyOpen } from '@phosphor-icons/react';
import { useCyberStore } from '../../store/useCyberStore';
import { CYBER_TARGETS } from '../../engine/cyber/cyberEngine';
import { CyberTarget } from '../../types/cyber.types';
import { Button } from '../common/Button';

export const CyberTable: React.FC = () => {
  const {
    status,
    currentTarget,
    matrix,
    targetSequence,
    currentInputSequence,
    currentRow,
    currentCol,
    isRowActive,
    tracePercent,
    proxyHopsLeft,
    iceBreakersLeft,
    isFrozen,
    terminalLogs,
    initGame,
    selectTarget,
    selectCell,
    useProxyHop,
    useIceBreaker,
    tickTrace,
  } = useCyberStore();

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (status === 'infiltrating') {
      const timer = setInterval(() => {
        tickTrace();
      }, 200);
      return () => clearInterval(timer);
    }
  }, [status, tickTrace]);

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#0A0A0A] p-3 sm:p-5 min-h-[calc(100dvh-57px)] max-w-4xl mx-auto space-y-3">
      {/* TOP HEADER: Target & Trace Monitor */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 space-y-2 z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Terminal size={16} weight="bold" className="text-[#4ADE80]" />
            <span className="font-serif-editorial font-bold text-sm text-[#EDEDED]">
              {status === 'target-select' ? 'Cyber Infiltration Console' : currentTarget.name}
            </span>
          </div>
          {status !== 'target-select' && (
            <span className="text-[10px] font-mono-meta text-[#FBBF24] font-bold">
              Bounty: ${currentTarget.rewardChips}
            </span>
          )}
        </div>

        {/* Trace Detection Meter */}
        {status !== 'target-select' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono-meta">
              <span className="text-[#8E8E93] flex items-center gap-1">
                <ShieldWarning size={12} weight="fill" className="text-[#F87171]" />
                <span>TRACE DETECTION:</span>
              </span>
              <span className={`font-bold ${tracePercent > 75 ? 'text-[#F87171]' : 'text-[#EDEDED]'}`}>
                {Math.round(tracePercent)}% {isFrozen && '(FROZEN)'}
              </span>
            </div>
            <div className="w-full bg-[#222222] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  tracePercent > 75 ? 'bg-[#F87171]' : 'bg-[#4ADE80]'
                }`}
                style={{ width: `${Math.min(100, Math.round(tracePercent))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* MIDDLE: HEX MATRIX OR TARGET SELECT */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 z-10 py-1">
        {status === 'target-select' ? (
          <div className="w-full max-w-md space-y-3">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-serif-editorial font-bold text-[#EDEDED]">
                Select Infiltration Target
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Breach corporate firewalls and decrypt data buffers before trace lock.
              </p>
            </div>

            <div className="space-y-2">
              {CYBER_TARGETS.map((t: CyberTarget) => (
                <div
                  key={t.id}
                  onClick={() => selectTarget(t)}
                  className="bg-[#141414] hover:bg-[#1A1A1A] border border-[#242424] hover:border-white p-3.5 rounded-xl cursor-pointer transition active:scale-95 flex items-center justify-between"
                >
                  <div className="space-y-1 max-w-[75%]">
                    <div className="font-bold text-xs text-[#EDEDED] flex items-center gap-1.5">
                      <LockKey size={14} weight="bold" className="text-[#FBBF24]" />
                      <span>{t.name}</span>
                    </div>
                    <p className="text-[10px] text-[#8E8E93] leading-relaxed">{t.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono-meta text-[#8E8E93]">Sec Lv.{t.securityLevel}</div>
                    <div className="text-xs font-mono-meta font-bold text-[#4ADE80]">+${t.rewardChips}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-3">
            {/* Required Target Sequence */}
            <div className="bg-[#141414] border border-[#242424] p-2 rounded-lg flex items-center justify-between text-xs font-mono-meta">
              <span className="text-[#8E8E93] text-[10px] uppercase font-bold">Target Buffer:</span>
              <div className="flex items-center gap-1.5">
                {targetSequence.map((byte, idx) => {
                  const isDone = idx < currentInputSequence.length;
                  return (
                    <span
                      key={`seq-${idx}`}
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        isDone
                          ? 'bg-[#122416] text-[#4ADE80] border border-[#1E3A24]'
                          : 'bg-[#1E1E1E] text-[#EDEDED] border border-[#2A2A2A]'
                      }`}
                    >
                      {byte}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="bg-[#121212] border border-[#242424] p-3 rounded-xl flex flex-col gap-1.5">
              {matrix.map((row, rIdx) => {
                const isCurrentRowActive = isRowActive && rIdx === currentRow;

                return (
                  <div
                    key={`row-${rIdx}`}
                    className={`flex items-center justify-center gap-1.5 p-1 rounded-lg transition ${
                      isCurrentRowActive ? 'bg-[#1C1C1C] border border-[#333333]' : ''
                    }`}
                  >
                    {row.map((val, cIdx) => {
                      const isCurrentColActive = !isRowActive && cIdx === currentCol;
                      const isSelectable = isCurrentRowActive || isCurrentColActive;

                      return (
                        <button
                          key={`cell-${rIdx}-${cIdx}`}
                          disabled={!isSelectable || status !== 'infiltrating'}
                          onClick={() => selectCell(rIdx, cIdx)}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-mono-meta font-bold text-xs sm:text-sm flex items-center justify-center transition active:scale-95 cursor-pointer ${
                            isSelectable
                              ? 'bg-[#EDEDED] text-[#0A0A0A] font-extrabold shadow-md'
                              : 'bg-[#181818] border border-[#222222] text-[#666666]'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Live Terminal Log Stream */}
            <div className="bg-[#141414] border border-[#242424] p-2.5 rounded-lg h-18 overflow-y-auto font-mono-meta text-[10px] space-y-0.5 text-[#4ADE80]">
              {terminalLogs.map((log, i) => (
                <div key={`log-${i}`} className="leading-tight truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS & COUNTERMEASURES */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 z-20">
        {status === 'breached' ? (
          <Button variant="gold" size="lg" className="w-full font-bold flex items-center justify-center gap-2" onClick={initGame}>
            <LockKeyOpen size={16} weight="bold" />
            <span>DATA HARVEST COMPLETE — NEXT NODE</span>
          </Button>
        ) : status === 'compromised' ? (
          <Button variant="danger" size="lg" className="w-full font-bold flex items-center justify-center gap-2" onClick={initGame}>
            <ArrowClockwise size={16} weight="bold" />
            <span>CONNECTION SEVERED — RETRY</span>
          </Button>
        ) : status === 'infiltrating' ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="md"
              disabled={proxyHopsLeft <= 0}
              onClick={useProxyHop}
              className="text-xs font-mono-meta"
            >
              Proxy Hop ({proxyHopsLeft}) -30%
            </Button>
            <Button
              variant="secondary"
              size="md"
              disabled={iceBreakersLeft <= 0 || isFrozen}
              onClick={useIceBreaker}
              className="text-xs font-mono-meta"
            >
              ICE Breaker ({iceBreakersLeft}) Freeze 6s
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
