import React, { useEffect, useRef } from 'react';
import { Rocket, ArrowClockwise, Sparkle, Target } from '@phosphor-icons/react';
import { useOrbitalStore } from '../../store/useOrbitalStore';
import { Button } from '../common/Button';

export const OrbitalTable: React.FC = () => {
  const {
    phase,
    currentLevelIndex,
    level,
    probePos,
    trail,
    dragStart,
    dragCurrent,
    beaconsCollected,
    totalBeacons,
    initGame,
    startAiming,
    updateAiming,
    releaseLaunch,
    tickPhysics,
    resetCurrentLevel,
    nextLevel,
  } = useOrbitalStore();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Physics animation loop
  useEffect(() => {
    if (phase === 'in-flight') {
      const interval = setInterval(() => {
        tickPhysics();
      }, 25);
      return () => clearInterval(interval);
    }
  }, [phase, tickPhysics]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== 'aiming' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startAiming({ x, y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (phase !== 'aiming' || !dragStart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateAiming({ x, y });
  };

  const handlePointerUp = () => {
    if (phase === 'aiming' && dragStart) {
      releaseLaunch();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#0A0A0A] p-3 sm:p-5 min-h-[calc(100dvh-57px)] max-w-4xl mx-auto space-y-3">
      {/* TOP HEADER: Level & Beacon Info */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-2">
          <Rocket size={16} weight="bold" className="text-[#60A5FA]" />
          <div>
            <span className="font-serif-editorial font-bold text-sm text-[#EDEDED]">{level.name}</span>
            <div className="text-[10px] text-[#8E8E93] font-mono-meta">Level {currentLevelIndex + 1} of 3</div>
          </div>
        </div>

        {/* Beacon Pickups */}
        <div className="flex items-center gap-1 bg-[#181818] px-2.5 py-1 rounded-lg border border-[#262626] font-mono-meta text-xs">
          <Sparkle size={13} weight="fill" className="text-[#FBBF24]" />
          <span className="text-[#EDEDED] font-bold">
            {beaconsCollected}/{totalBeacons} Data Beacons
          </span>
        </div>
      </div>

      {/* MIDDLE: ORBITAL PHYSICS CANVAS CONTAINER */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full max-w-sm mx-auto h-96 bg-[#0E0E0E] border border-[#242424] rounded-2xl overflow-hidden touch-none select-none z-10 cursor-crosshair"
      >
        {/* Subtle Starfield BG */}
        <div className="absolute inset-0 bg-[radial-gradient(#333333_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

        {/* Warp Gate (Target) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-dashed border-[#4ADE80] animate-spin flex items-center justify-center bg-[#122416]/40"
          style={{ left: `${level.targetPos.x}px`, top: `${level.targetPos.y}px` }}
        >
          <Target size={18} weight="bold" className="text-[#4ADE80]" />
        </div>

        {/* Gravitational Planets */}
        {level.planets.map((p, idx) => (
          <div
            key={`planet-${idx}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#444444] bg-gradient-to-br from-[#282828] to-[#141414] shadow-xl flex items-center justify-center"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.radius * 2}px`,
              height: `${p.radius * 2}px`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        ))}

        {/* Data Beacons */}
        {level.beacons.map((b) => (
          <div
            key={b.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              b.collected
                ? 'opacity-0 scale-50'
                : 'bg-[#2A2210] border border-[#FBBF24] text-[#FBBF24] shadow'
            }`}
            style={{ left: `${b.x}px`, top: `${b.y}px` }}
          >
            <Sparkle size={10} weight="fill" />
          </div>
        ))}

        {/* Orbital Trajectory Trail */}
        {trail.map((t, idx) => (
          <div
            key={`trail-${idx}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#60A5FA]"
            style={{ left: `${t.x}px`, top: `${t.y}px`, opacity: (idx + 1) / trail.length }}
          />
        ))}

        {/* Probe Ship */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-[#0A0A0A] shadow-md flex items-center justify-center"
          style={{ left: `${probePos.x}px`, top: `${probePos.y}px` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
        </div>

        {/* Slingshot Aiming Line */}
        {dragStart && dragCurrent && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={probePos.x}
              y1={probePos.y}
              x2={probePos.x + (dragStart.x - dragCurrent.x)}
              y2={probePos.y + (dragStart.y - dragCurrent.y)}
              stroke="#60A5FA"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
        )}
      </div>

      {/* BOTTOM CONTROLS & INSTRUCTIONS */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 z-20">
        {phase === 'level-cleared' ? (
          <Button variant="gold" size="lg" className="w-full font-bold" onClick={nextLevel}>
            WARP GATE CLEARED — NEXT ORBIT →
          </Button>
        ) : phase === 'crashed' ? (
          <Button variant="danger" size="lg" className="w-full font-bold flex items-center justify-center gap-2" onClick={resetCurrentLevel}>
            <ArrowClockwise size={16} weight="bold" />
            <span>PROBE CRASHED — RETRY LAUNCH</span>
          </Button>
        ) : (
          <div className="flex items-center justify-between text-xs font-mono-meta text-[#8E8E93]">
            <span>Drag thumb backwards to aim trajectory & release</span>
            <button onClick={resetCurrentLevel} className="hover:text-white transition">
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
