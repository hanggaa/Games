import React, { useEffect, useState } from 'react';
import { Shield, Lightning, Play, ArrowClockwise, Plus, Trash } from '@phosphor-icons/react';
import { useDefenseStore } from '../../store/useDefenseStore';
import { TURRET_CONFIGS } from '../../engine/defense/defenseEngine';
import { TurretType } from '../../types/defense.types';
import { Button } from '../common/Button';

export const DefenseTable: React.FC = () => {
  const {
    phase,
    wave,
    coreHealth,
    energy,
    turrets,
    selectedTurretType,
    enemies,
    score,
    initGame,
    setSelectedTurretType,
    placeTurret,
    upgradeTurret,
    sellTurret,
    startWave,
    tickGame,
  } = useDefenseStore();

  const [inspectKey, setInspectKey] = useState<string | null>(null);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Game loop interval when wave is active
  useEffect(() => {
    if (phase === 'wave-active') {
      const interval = setInterval(() => {
        tickGame();
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase, tickGame]);

  const inspectedTurret = inspectKey ? turrets[inspectKey] : null;

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#0A0A0A] p-3 sm:p-5 min-h-[calc(100dvh-57px)] max-w-4xl mx-auto space-y-3">
      {/* TOP HEADER: Wave, Core Health & Energy */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 grid grid-cols-4 gap-2 text-xs z-10">
        <div className="bg-[#181818] p-2 rounded-lg border border-[#262626]">
          <div className="text-[9px] uppercase font-mono-meta text-[#8E8E93]">Wave</div>
          <div className="font-mono-meta font-bold text-sm text-[#EDEDED]">{wave}</div>
        </div>

        <div className="bg-[#181818] p-2 rounded-lg border border-[#262626]">
          <div className="text-[9px] uppercase font-mono-meta text-[#8E8E93]">Energy</div>
          <div className="font-mono-meta font-bold text-sm text-[#FBBF24] flex items-center gap-1">
            <Lightning size={14} weight="fill" />
            <span>{energy}</span>
          </div>
        </div>

        <div className="bg-[#181818] p-2 rounded-lg border border-[#262626]">
          <div className="text-[9px] uppercase font-mono-meta text-[#8E8E93]">Core HP</div>
          <div className="font-mono-meta font-bold text-sm text-[#4ADE80] flex items-center gap-1">
            <Shield size={14} weight="fill" />
            <span>{coreHealth}%</span>
          </div>
        </div>

        <div className="bg-[#181818] p-2 rounded-lg border border-[#262626] text-right">
          <div className="text-[9px] uppercase font-mono-meta text-[#8E8E93]">Score</div>
          <div className="font-mono-meta font-bold text-sm text-[#EDEDED]">{score}</div>
        </div>
      </div>

      {/* MIDDLE: THE DEFENSE COMBAT ARENA */}
      <div className="relative w-full max-w-sm mx-auto h-84 sm:h-96 bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden p-2 flex flex-col justify-between z-10">
        {/* Enemy Descent Lanes */}
        <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-20">
          {[0, 1, 2, 3].map((l) => (
            <div key={`lane-${l}`} className="border-r border-dashed border-[#444444]" />
          ))}
        </div>

        {/* Live Enemies Rendering */}
        <div className="absolute inset-0 pointer-events-none">
          {enemies.map((e) => (
            <div
              key={e.id}
              className="absolute -translate-x-1/2 transition-all duration-100 flex flex-col items-center"
              style={{
                left: `${(e.lane + 0.5) * 25}%`,
                top: `${Math.max(2, Math.min(92, e.y))}%`,
              }}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shadow ${
                  e.type === 'boss'
                    ? 'bg-[#F87171] text-[#0A0A0A] w-7 h-7 scale-110 ring-2 ring-white'
                    : e.type === 'tank'
                    ? 'bg-[#60A5FA] text-[#0A0A0A]'
                    : e.type === 'speeder'
                    ? 'bg-[#FBBF24] text-[#0A0A0A]'
                    : 'bg-[#EDEDED] text-[#0A0A0A]'
                }`}
              >
                {e.type === 'boss' ? '👾' : e.type === 'tank' ? '🛡️' : e.type === 'speeder' ? '⚡' : '🛸'}
              </div>
              <div className="w-6 bg-[#222222] h-1 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-[#4ADE80] h-full"
                  style={{ width: `${Math.round((e.health / e.maxHealth) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Turret Placement Grid (3 rows x 4 cols) */}
        <div className="relative z-10 grid grid-cols-4 grid-rows-3 gap-2 h-full py-4">
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const key = `${r},${c}`;
              const turret = turrets[key];
              const isInspected = inspectKey === key;

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (turret) {
                      setInspectKey(isInspected ? null : key);
                    } else {
                      placeTurret(r, c);
                    }
                  }}
                  className={`rounded-xl border flex flex-col items-center justify-center p-1 transition cursor-pointer ${
                    turret
                      ? isInspected
                        ? 'bg-white text-[#0A0A0A] border-white shadow-lg'
                        : 'bg-[#1C1C1C] hover:bg-[#262626] border-[#333333] text-[#EDEDED]'
                      : 'border-dashed border-[#262626] hover:border-[#444444] bg-transparent text-[#444444]'
                  }`}
                >
                  {turret ? (
                    <>
                      <span className="text-base">{TURRET_CONFIGS[turret.type].icon}</span>
                      <span className="text-[9px] font-mono-meta font-bold">L{turret.level}</span>
                    </>
                  ) : (
                    <Plus size={14} />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Bottom Energy Core Shield Bar */}
        <div className="relative z-10 w-full bg-[#181818] border border-[#282828] rounded-lg p-1.5 flex items-center justify-between text-xs font-mono-meta">
          <span className="text-[#8E8E93] text-[10px] uppercase font-bold">Base Core</span>
          <span className="text-[#4ADE80] font-bold">{coreHealth}% Shielded</span>
        </div>
      </div>

      {/* BOTTOM: TURRET SELECTOR OR INSPECT MENU */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 space-y-2.5 z-10">
        {inspectedTurret ? (
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-[#EDEDED] flex items-center gap-1.5">
                <span>{TURRET_CONFIGS[inspectedTurret.type].icon}</span>
                <span>{TURRET_CONFIGS[inspectedTurret.type].name} (Level {inspectedTurret.level})</span>
              </div>
              <div className="text-[10px] text-[#8E8E93] font-mono-meta">
                Damage: {inspectedTurret.damage} | Rate: {inspectedTurret.fireRate}/s
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={() => upgradeTurret(inspectedTurret.row, inspectedTurret.col)}
                disabled={energy < Math.round(TURRET_CONFIGS[inspectedTurret.type].cost * 0.8 * inspectedTurret.level)}
              >
                Upgrade (${Math.round(TURRET_CONFIGS[inspectedTurret.type].cost * 0.8 * inspectedTurret.level)})
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  sellTurret(inspectedTurret.row, inspectedTurret.col);
                  setInspectKey(null);
                }}
              >
                <Trash size={14} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono-meta text-[#8E8E93] uppercase">
              <span>Select Module to Place:</span>
              <span>Tap empty slot on grid</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(['pulse', 'cryo', 'arc', 'mortar'] as TurretType[]).map((type) => {
                const conf = TURRET_CONFIGS[type];
                const isSelected = selectedTurretType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedTurretType(type)}
                    className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#0A0A0A] border-white font-bold shadow'
                        : 'bg-[#181818] border-[#282828] text-[#EDEDED] hover:bg-[#222222]'
                    }`}
                  >
                    <div className="text-base">{conf.icon}</div>
                    <div className="text-[10px] truncate">{conf.name.split(' ')[0]}</div>
                    <div className="text-[9px] font-mono-meta text-[#FBBF24] font-semibold">${conf.cost}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Wave / Restart Controls */}
        <div className="pt-1">
          {phase === 'game-over' ? (
            <Button variant="danger" size="lg" className="w-full font-bold flex items-center justify-center gap-2" onClick={initGame}>
              <ArrowClockwise size={16} weight="bold" />
              <span>CORE BREACHED — RESTART DEFENSE</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              disabled={phase === 'wave-active'}
              onClick={startWave}
              className="w-full font-bold flex items-center justify-center gap-2"
            >
              <Play size={16} weight="fill" />
              <span>LAUNCH WAVE {wave} →</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
