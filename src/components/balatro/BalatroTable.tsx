import React, { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Storefront, Sparkle } from '@phosphor-icons/react';
import { useBalatroStore } from '../../store/useBalatroStore';
import { CardView } from '../common/CardView';
import { Button } from '../common/Button';
import { evaluate5Cards } from '../../engine/poker/holdemEvaluator';

export const BalatroTable: React.FC = () => {
  const {
    phase,
    ante,
    currentBlind,
    roundScore,
    runCash,
    handsLeft,
    discardsLeft,
    handCards,
    selectedCardIds,
    jokers,
    shopJokers,
    lastScoreBreakdown,
    startNewRun,
    toggleSelectCard,
    playHand,
    discardSelected,
    goToNextBlind,
    buyJoker,
    sellJoker,
    rerollShop,
  } = useBalatroStore();

  useEffect(() => {
    startNewRun();
  }, [startNewRun]);

  const selectedCards = handCards.filter((c) => selectedCardIds.includes(c.id));
  const currentHandPreview = selectedCards.length > 0 ? evaluate5Cards(selectedCards) : null;

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#0A0A0A] p-3 sm:p-5 min-h-[calc(100dvh-57px)] max-w-4xl mx-auto space-y-3">
      {/* TOP BAR: Blind Meta, Score, & Resources */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Blind Info */}
        <div className="bg-[#141414] border border-[#242424] p-2.5 rounded-lg">
          <div className="text-[10px] uppercase font-mono-meta text-[#8E8E93] font-semibold">Target Blind</div>
          <div className="font-serif-editorial font-bold text-sm text-[#EDEDED] truncate">{currentBlind.name}</div>
          <div className="text-[11px] font-mono-meta text-[#8E8E93] mt-0.5">Reward: ${currentBlind.rewardDollars}</div>
        </div>

        {/* Score Progress */}
        <div className="bg-[#141414] border border-[#242424] p-2.5 rounded-lg">
          <div className="text-[10px] uppercase font-mono-meta text-[#8E8E93] font-semibold">Round Score</div>
          <div className="font-mono-meta font-bold text-sm text-[#EDEDED]">
            {roundScore.toLocaleString()} <span className="text-[#8E8E93] font-normal">/ {currentBlind.targetScore.toLocaleString()}</span>
          </div>
          <div className="w-full bg-[#242424] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#EDEDED] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((roundScore / currentBlind.targetScore) * 100))}%` }}
            />
          </div>
        </div>

        {/* Hands & Discards */}
        <div className="bg-[#141414] border border-[#242424] p-2.5 rounded-lg flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] uppercase font-mono-meta text-[#8E8E93] font-semibold">Hands</div>
            <div className="font-mono-meta font-bold text-base text-[#EDEDED]">{handsLeft}</div>
          </div>
          <div className="w-px h-6 bg-[#242424]" />
          <div>
            <div className="text-[10px] uppercase font-mono-meta text-[#8E8E93] font-semibold">Discards</div>
            <div className="font-mono-meta font-bold text-base text-[#8E8E93]">{discardsLeft}</div>
          </div>
        </div>

        {/* Cash & Ante */}
        <div className="bg-[#141414] border border-[#242424] p-2.5 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono-meta text-[#8E8E93] font-semibold">Run Dollars</div>
            <div className="font-mono-meta font-bold text-base text-[#EDEDED]">${runCash}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono-meta bg-[#222222] text-[#EDEDED] border border-[#333333] px-2 py-0.5 rounded font-bold">
              ANTE {ante}/8
            </span>
          </div>
        </div>
      </div>

      {/* JOKERS BAR */}
      <div className="bg-[#141414] border border-[#242424] rounded-lg p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-bold text-[#EDEDED] uppercase font-mono-meta">
            <Sparkle size={13} weight="fill" className="text-[#FBBF24]" />
            <span>Active Jokers ({jokers.length}/5)</span>
          </div>
          <span className="text-[#8E8E93] text-[10px]">Multiplier & Chip modifiers</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {jokers.map((joker) => (
            <div
              key={joker.id}
              className="bg-[#181818] border border-[#2A2A2A] p-2 rounded-md flex flex-col justify-between text-xs space-y-1"
            >
              <div>
                <div className="font-bold text-[#EDEDED] truncate">{joker.name}</div>
                <div className="text-[10px] text-[#8E8E93] leading-tight mt-0.5">{joker.description}</div>
              </div>
              <button
                onClick={() => sellJoker(joker.id)}
                className="text-[9px] font-mono-meta text-[#F87171] hover:underline self-end pt-1 cursor-pointer"
              >
                Sell (${Math.max(1, Math.floor(joker.cost / 2))})
              </button>
            </div>
          ))}

          {Array.from({ length: 5 - jokers.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="border border-dashed border-[#242424] rounded-md p-2 flex items-center justify-center text-[10px] text-[#555555] font-mono-meta"
            >
              Empty Slot
            </div>
          ))}
        </div>
      </div>

      {/* SHOP MODAL / OVERLAY */}
      {phase === 'shop' && (
        <div className="bg-[#141414] border border-[#333333] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <div className="flex items-center gap-1.5 font-serif-editorial font-bold text-base text-[#EDEDED]">
              <Storefront size={18} weight="bold" className="text-[#FBBF24]" />
              <span>Ante Shop</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-meta font-bold text-[#EDEDED]">Cash: ${runCash}</span>
              <Button variant="outline" size="sm" onClick={rerollShop}>
                Reroll ($5)
              </Button>
              <Button variant="primary" size="sm" onClick={goToNextBlind}>
                Next Blind →
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {shopJokers.map((joker) => (
              <div key={joker.id} className="bg-[#181818] border border-[#2A2A2A] p-3 rounded-lg flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#EDEDED]">{joker.name}</span>
                    <span className="font-mono-meta font-bold text-xs text-[#FBBF24]">${joker.cost}</span>
                  </div>
                  <p className="text-[11px] text-[#8E8E93] mt-1">{joker.description}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={runCash < joker.cost || jokers.length >= 5}
                  onClick={() => buyJoker(joker)}
                  className="w-full text-xs"
                >
                  Buy for ${joker.cost}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GAME OVER STATE */}
      {phase === 'game-over' && (
        <div className="bg-[#141414] border border-[#4D2024] rounded-xl p-5 text-center space-y-2">
          <h3 className="font-serif-editorial font-bold text-lg text-[#F87171]">Blind Failed (Game Over)</h3>
          <p className="text-xs text-[#8E8E93]">
            You reached Ante {ante} with a final round score of {roundScore.toLocaleString()} (Target: {currentBlind.targetScore.toLocaleString()}).
          </p>
          <Button variant="primary" size="md" onClick={startNewRun}>
            Start New Run
          </Button>
        </div>
      )}

      {/* CENTER: 8 Hand Cards */}
      {phase === 'playing' && (
        <div className="space-y-2">
          {/* Selected Hand Preview */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-[#8E8E93]">
              {selectedCardIds.length > 0 ? (
                <span>
                  Selected: <span className="font-bold text-[#EDEDED]">{selectedCardIds.length}/5 cards</span> —{' '}
                  <span className="font-serif-editorial font-bold text-[#EDEDED]">{currentHandPreview?.displayName}</span>
                </span>
              ) : (
                'Select up to 5 cards to play or discard'
              )}
            </span>

            {lastScoreBreakdown && (
              <span className="font-mono-meta text-[11px] text-[#4ADE80] bg-[#122416] border border-[#1E3A24] px-2 py-0.5 rounded font-semibold">
                Last Hand: +{lastScoreBreakdown.totalScore.toLocaleString()} ({lastScoreBreakdown.totalChips} × {lastScoreBreakdown.totalMult})
              </span>
            )}
          </div>

          {/* Cards Grid */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <AnimatePresence>
              {handCards.map((card) => {
                const isSelected = selectedCardIds.includes(card.id);
                return (
                  <CardView
                    key={card.id}
                    card={card}
                    isHeld={isSelected}
                    onClick={() => toggleSelectCard(card.id)}
                    className={isSelected ? '-translate-y-3' : ''}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      {phase === 'playing' && (
        <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="lg"
            disabled={selectedCardIds.length === 0 || discardsLeft <= 0}
            onClick={discardSelected}
            className="flex-1"
          >
            DISCARD ({selectedCardIds.length})
          </Button>

          <Button
            variant="primary"
            size="lg"
            disabled={selectedCardIds.length === 0 || handsLeft <= 0}
            onClick={playHand}
            className="flex-1 font-bold"
          >
            PLAY HAND ({selectedCardIds.length})
          </Button>
        </div>
      )}
    </div>
  );
};
