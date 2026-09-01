# Technical Design Document: Hanggaa Card & Casino Arcade MVP

## 1. Executive Summary & Recommended Approach

**System:** Hanggaa Card & Casino Arcade (`hanggaa-games`)  
**Architecture:** 100% Client-Side Single Page Application (SPA) with Persistent Local State  
**Platform Target:** Mobile Browser (Portrait-first, one-handed thumb ergonomics) & Responsive Desktop  
**Hosting & Deployment:** GitHub Pages static deployment via `npm run deploy` (`gh-pages`) with custom domain `games.hanggaa.xyz`  
**Estimated Time to MVP:** 2–3 weeks  
**Estimated Operating Cost:** $0.00 / month (100% Free forever)

---

## 2. Tech Stack & Justification

| Layer | Recommended Choice | Alternatives Considered | Rationale & Trade-offs |
| :--- | :--- | :--- | :--- |
| **Framework** | **React 19 + TypeScript + Vite** | Next.js (SSG), Vanilla JS | Next.js is overkill for a purely client-side game and adds build complexity on GitHub Pages. React + Vite provides instant HMR, type safety, and minimal bundle footprint (<150kB gzipped). |
| **Styling** | **Tailwind CSS v4** | CSS Modules, Styled Components | Tailwind v4 provides zero-runtime overhead, high-velocity utility styling, and native support for design tokens and dynamic aspect ratios. |
| **Animation** | **Motion (`motion/react`)** | GSAP, Plain CSS Transitions | Motion provides declarative layout animations (`layout`, `layoutId`), spring physics (`stiffness: 120, damping: 18`), and GPU-accelerated transforms (`x`, `y`, `scale`, `rotateY`) without jank. |
| **State Management** | **Zustand + `persist`** | Redux Toolkit, Context API | Zustand provides ultra-lightweight boilerplate, granular subscriptions without unnecessary re-renders, and built-in atomic synchronization with `localStorage`. |
| **Audio Engine** | **Synthesized Web Audio API** | Howler.js, Audio HTML5 tags | External MP3/WAV assets introduce network latency, asset loading race conditions, and 404 risks on GitHub Pages. Procedural synthesis is 100% offline, zero latency, and 0 bytes asset size. |
| **Icons** | **`@phosphor-icons/react`** | `lucide-react`, Custom SVGs | Follows anti-slop guidelines: consistent stroke weight, sharp geometry, and luxury aesthetic fit. |

---

## 3. Project Directory Structure

```
hanggaa-games/
├── public/
│   ├── CNAME                     # Contains 'games.hanggaa.xyz' for GitHub Pages
│   └── favicon.svg               # Minimalist casino chip/spade icon
├── src/
│   ├── assets/                   # Static branding if needed
│   ├── components/
│   │   ├── common/               # Shared UI primitives
│   │   │   ├── Button.tsx        # Tactile button with active:scale-95 & haptic sfx
│   │   │   ├── CardView.tsx      # Crisp 3D flipping card component (Motion)
│   │   │   ├── ChipBadge.tsx     # Animated chip coin selector & balance pill
│   │   │   ├── Modal.tsx         # Slide-up bottom sheet / center dialog
│   │   │   └── SoundToggle.tsx   # Mute / Unmute switch
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Sticky header with bankroll & lobby return
│   │   │   ├── BottomSheet.tsx   # Fixed bottom thumb action area (Mobile-first)
│   │   │   └── GameContainer.tsx # 100dvh viewport wrapper (anti-layout-shift)
│   │   ├── lobby/
│   │   │   ├── GameCard.tsx      # Large luxury selector cards
│   │   │   ├── QuickResume.tsx   # Jump directly into active session
│   │   │   └── StatsModal.tsx    # Win-rates, hands played, counting accuracy
│   │   ├── blackjack/
│   │   │   ├── BlackjackTable.tsx# Main felt container
│   │   │   ├── DealerHand.tsx    # Dealer upcard & hidden hole card
│   │   │   ├── PlayerHand.tsx    # Dynamic card fans & split hand tabs
│   │   │   ├── TrainerHud.tsx    # Running count, true count, & strategy advice
│   │   │   └── BetControls.tsx   # Chip denominations & Deal button
│   │   └── videopoker/
│   │       ├── PokerTable.tsx    # Felt & 5-card layout
│   │       ├── Paytable.tsx      # Dynamic 9/6 payout chart
│   │       └── CardHoldItem.tsx  # Interactive tap-to-hold card
│   ├── engine/
│   │   ├── audio/
│   │   │   └── soundEngine.ts    # Web Audio procedural sound generator
│   │   ├── core/
│   │   │   ├── card.ts           # 52-card definitions, suits, ranks
│   │   │   └── shoe.ts           # Multi-deck shoe & Fisher-Yates shuffle
│   │   ├── blackjack/
│   │   │   ├── blackjackLogic.ts # Hand score calculation (hard/soft aces)
│   │   │   ├── cardCounting.ts   # Hi-Lo running & true count math
│   │   │   └── basicStrategy.ts  # Optimal play lookup matrix [H, S, D, P]
│   │   └── videopoker/
│   │       ├── evaluator.ts      # 5-card rank histogram & flush/straight detector
│   │       └── paytable.ts       # Jacks or Better 9/6 multiplier logic
│   ├── store/
│   │   ├── useBankrollStore.ts   # Chips, bankroll history, persistence
│   │   ├── useBlackjackStore.ts  # Game state machine for Blackjack
│   │   ├── usePokerStore.ts      # Game state machine for Video Poker
│   │   └── useSettingsStore.ts   # Audio volume, trainer toggles, theme
│   ├── types/
│   │   ├── card.types.ts
│   │   ├── blackjack.types.ts
│   │   └── poker.types.ts
│   ├── App.tsx                   # Top-level router / view switcher (Lobby / Games)
│   ├── index.css                 # Tailwind v4 theme, emerald felt gradients, animations
│   └── main.tsx                  # React DOM mount
├── index.html                    # Viewport meta tags, theme color #062316
├── package.json                  # Dependencies & gh-pages deploy script
├── tsconfig.json                 # Strict TypeScript configuration
└── vite.config.ts                # Vite config with base: '/'
```

---

## 4. Core Data Models & TypeScript Contracts

### 4.1 Card & Shoe Models (`src/types/card.types.ts`)

```typescript
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;          // e.g. "d1-spades-A" (deckIndex-suit-rank)
  suit: Suit;
  rank: Rank;
  value: number;       // Base value (2-10, 10 for J/Q/K, 11 for Ace)
  faceUp: boolean;
}

export interface HandScore {
  total: number;       // Best valid total <= 21, or lowest bust total
  isSoft: boolean;     // True if Ace is counted as 11 without busting
  isBlackjack: boolean;// True if natural 2-card 21
  isBust: boolean;     // True if total > 21
}
```

---

### 4.2 Blackjack State Machine (`src/types/blackjack.types.ts`)

```typescript
export type BlackjackPhase =
  | 'betting'          // Placing chips
  | 'dealing'          // Initial 4-card deal animation
  | 'player-turn'      // Player deciding: Hit, Stand, Double, Split, Insurance
  | 'dealer-turn'      // Hole card flip & automated dealer draw
  | 'round-over'       // Settlement & payout animation
  | 'reshuffle';       // Shoe penetration reached cut card

export type StrategyAction = 'H' | 'S' | 'D' | 'P' | 'Rh'; // Hit, Stand, Double, Split, Surrender

export interface PlayerHandState {
  id: string;
  cards: Card[];
  bet: number;
  status: 'active' | 'stood' | 'busted' | 'blackjack' | 'doubled';
  score: HandScore;
  isSplit: boolean;
}

export interface CountingState {
  runningCount: number;
  trueCount: number;
  decksRemaining: number;
  cardsDealt: number;
  totalCards: number;
}
```

---

### 4.3 Video Poker Models (`src/types/poker.types.ts`)

```typescript
export type PokerHandRank =
  | 'ROYAL_FLUSH'
  | 'STRAIGHT_FLUSH'
  | 'FOUR_OF_A_KIND'
  | 'FULL_HOUSE'
  | 'FLUSH'
  | 'STRAIGHT'
  | 'THREE_OF_A_KIND'
  | 'TWO_PAIR'
  | 'JACKS_OR_BETTER'
  | 'HIGH_CARD';

export interface PokerEvaluationResult {
  rank: PokerHandRank;
  payoutMultiplier: number;
  displayName: string;
  winningCardIndices: number[]; // Indices of cards contributing to the win
}

export type VideoPokerPhase = 'betting' | 'holding' | 'drawn' | 'payout';
```

---

## 5. Core Game Logic & Algorithm Implementations

### 5.1 Fisher-Yates Shoe Shuffling (`src/engine/core/shoe.ts`)
```typescript
import { Card, Suit, Rank } from '../../types/card.types';

export function createShoe(deckCount = 6): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const shoe: Card[] = [];

  for (let d = 0; d < deckCount; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        let value = parseInt(rank, 10);
        if (['J', 'Q', 'K'].includes(rank)) value = 10;
        if (rank === 'A') value = 11;
        shoe.push({
          id: `d${d}-${suit}-${rank}-${Math.random().toString(36).slice(2, 6)}`,
          suit,
          rank,
          value,
          faceUp: true,
        });
      }
    }
  }
  return shuffleShoe(shoe);
}

export function shuffleShoe(shoe: Card[]): Card[] {
  const array = [...shoe];
  for (let i = array.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

---

### 5.2 Hi-Lo Card Counting & Strategy Lookup (`src/engine/blackjack/cardCounting.ts`)

```typescript
import { Card } from '../../types/card.types';
import { StrategyAction } from '../../types/blackjack.types';

export function getHiLoValue(card: Card): number {
  if (['2', '3', '4', '5', '6'].includes(card.rank)) return +1;
  if (['7', '8', '9'].includes(card.rank)) return 0;
  return -1; // 10, J, Q, K, A
}

export function calculateTrueCount(runningCount: number, cardsRemaining: number): number {
  const decksRemaining = Math.max(0.5, cardsRemaining / 52);
  const rawTrueCount = runningCount / decksRemaining;
  return Math.round(rawTrueCount * 10) / 10; // 1 decimal precision
}

// Basic Strategy Matrix (Vegas 4-8 Decks, Dealer Hits Soft 17)
export function getBasicStrategy(
  playerTotal: number,
  isSoft: boolean,
  isPair: boolean,
  dealerUpcardValue: number
): StrategyAction {
  const upcard = Math.min(11, Math.max(2, dealerUpcardValue));

  // Pair Splitting Logic
  if (isPair) {
    if (playerTotal === 16 || playerTotal === 22) return 'P'; // 8,8 or A,A always split
    if (playerTotal === 20) return 'S'; // 10,10 never split
    if (playerTotal === 18) return (upcard >= 2 && upcard <= 6) || (upcard >= 8 && upcard <= 9) ? 'P' : 'S'; // 9,9
    if (playerTotal === 14) return upcard >= 2 && upcard <= 7 ? 'P' : 'H'; // 7,7
    if (playerTotal === 12) return upcard >= 2 && upcard <= 6 ? 'P' : 'H'; // 6,6
    if (playerTotal === 10) return upcard >= 2 && upcard <= 9 ? 'D' : 'H'; // 5,5 double
    if (playerTotal === 8) return upcard >= 5 && upcard <= 6 ? 'P' : 'H';  // 4,4
    if (playerTotal === 4 || playerTotal === 6) return upcard >= 2 && upcard <= 7 ? 'P' : 'H'; // 2,2 or 3,3
  }

  // Soft Totals Logic
  if (isSoft) {
    if (playerTotal >= 20) return 'S'; // A,9+
    if (playerTotal === 19) return upcard === 6 ? 'D' : 'S'; // A,8
    if (playerTotal === 18) return upcard >= 2 && upcard <= 6 ? 'D' : (upcard <= 8 ? 'S' : 'H'); // A,7
    if (playerTotal === 17) return upcard >= 3 && upcard <= 6 ? 'D' : 'H'; // A,6
    if (playerTotal === 15 || playerTotal === 16) return upcard >= 4 && upcard <= 6 ? 'D' : 'H'; // A,4 - A,5
    if (playerTotal === 13 || playerTotal === 14) return upcard >= 5 && upcard <= 6 ? 'D' : 'H'; // A,2 - A,3
  }

  // Hard Totals Logic
  if (playerTotal >= 17) return 'S';
  if (playerTotal >= 13 && playerTotal <= 16) return upcard >= 2 && upcard <= 6 ? 'S' : 'H';
  if (playerTotal === 12) return upcard >= 4 && upcard <= 6 ? 'S' : 'H';
  if (playerTotal === 11) return 'D';
  if (playerTotal === 10) return upcard <= 9 ? 'D' : 'H';
  if (playerTotal === 9) return upcard >= 3 && upcard <= 6 ? 'D' : 'H';
  return 'H';
}
```

---

### 5.3 Video Poker Evaluator (`src/engine/videopoker/evaluator.ts`)

```typescript
import { Card } from '../../types/card.types';
import { PokerEvaluationResult } from '../../types/poker.types';

export function evaluate5CardPoker(cards: Card[]): PokerEvaluationResult {
  if (cards.length !== 5) {
    return { rank: 'HIGH_CARD', payoutMultiplier: 0, displayName: 'High Card', winningCardIndices: [] };
  }

  const rankValues = cards.map(c => {
    if (c.rank === 'A') return 14;
    if (c.rank === 'K') return 13;
    if (c.rank === 'Q') return 12;
    if (c.rank === 'J') return 11;
    return parseInt(c.rank, 10);
  }).sort((a, b) => a - b);

  const suitCounts: Record<string, number> = {};
  const rankCounts: Record<number, number> = {};

  cards.forEach(c => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  });
  rankValues.forEach(val => {
    rankCounts[val] = (rankCounts[val] || 0) + 1;
  });

  const isFlush = Object.values(suitCounts).some(count => count === 5);
  
  // Straight check (including A-2-3-4-5 wheel)
  let isStraight = false;
  let isRoyal = false;
  if (new Set(rankValues).size === 5) {
    const isStandardStraight = rankValues[4] - rankValues[0] === 4;
    const isWheelStraight = rankValues[0] === 2 && rankValues[1] === 3 && rankValues[2] === 4 && rankValues[3] === 5 && rankValues[4] === 14;
    isStraight = isStandardStraight || isWheelStraight;
    isRoyal = isFlush && isStraight && rankValues[0] === 10 && rankValues[4] === 14;
  }

  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  if (isRoyal) return { rank: 'ROYAL_FLUSH', payoutMultiplier: 800, displayName: 'Royal Flush', winningCardIndices: [0,1,2,3,4] };
  if (isStraight && isFlush) return { rank: 'STRAIGHT_FLUSH', payoutMultiplier: 50, displayName: 'Straight Flush', winningCardIndices: [0,1,2,3,4] };
  if (counts[0] === 4) return { rank: 'FOUR_OF_A_KIND', payoutMultiplier: 25, displayName: 'Four of a Kind', winningCardIndices: getIndicesByCount(cards, rankCounts, 4) };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 'FULL_HOUSE', payoutMultiplier: 9, displayName: 'Full House', winningCardIndices: [0,1,2,3,4] };
  if (isFlush) return { rank: 'FLUSH', payoutMultiplier: 6, displayName: 'Flush', winningCardIndices: [0,1,2,3,4] };
  if (isStraight) return { rank: 'STRAIGHT', payoutMultiplier: 4, displayName: 'Straight', winningCardIndices: [0,1,2,3,4] };
  if (counts[0] === 3) return { rank: 'THREE_OF_A_KIND', payoutMultiplier: 3, displayName: 'Three of a Kind', winningCardIndices: getIndicesByCount(cards, rankCounts, 3) };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 'TWO_PAIR', payoutMultiplier: 2, displayName: 'Two Pair', winningCardIndices: getIndicesByCount(cards, rankCounts, 2) };
  
  // Jacks or Better check (Pair of J, Q, K, or A)
  if (counts[0] === 2) {
    const pairRank = Number(Object.keys(rankCounts).find(r => rankCounts[Number(r)] === 2));
    if (pairRank >= 11) {
      return { rank: 'JACKS_OR_BETTER', payoutMultiplier: 1, displayName: 'Jacks or Better', winningCardIndices: getIndicesByRank(cards, pairRank) };
    }
  }

  return { rank: 'HIGH_CARD', payoutMultiplier: 0, displayName: 'No Win', winningCardIndices: [] };
}

function getIndicesByCount(cards: Card[], rankCounts: Record<number, number>, targetCount: number): number[] {
  const targetRanks = Object.keys(rankCounts).filter(r => rankCounts[Number(r)] === targetCount).map(Number);
  return cards.map((c, i) => {
    const val = c.rank === 'A' ? 14 : c.rank === 'K' ? 13 : c.rank === 'Q' ? 12 : c.rank === 'J' ? 11 : parseInt(c.rank, 10);
    return targetRanks.includes(val) ? i : -1;
  }).filter(i => i !== -1);
}

function getIndicesByRank(cards: Card[], targetRank: number): number[] {
  return cards.map((c, i) => {
    const val = c.rank === 'A' ? 14 : c.rank === 'K' ? 13 : c.rank === 'Q' ? 12 : c.rank === 'J' ? 11 : parseInt(c.rank, 10);
    return val === targetRank ? i : -1;
  }).filter(i => i !== -1);
}
```

---

## 6. Procedural Audio Synthesis Engine (`src/engine/audio/soundEngine.ts`)

```typescript
class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  private initContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playCardSlide() {
    const ctx = this.initContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, ctx.currentTime);
    filter.Q.setValueAtTime(4.0, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  playChipToss() {
    const ctx = this.initContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  }

  playWinFanfare() {
    const ctx = this.initContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + index * 0.09;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  playButtonClick() {
    const ctx = this.initContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }
}

export const sound = new SoundEngine();
```

---

## 7. State Store Architecture (Zustand + `localStorage`)

```typescript
// src/store/useBankrollStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BankrollState {
  chips: number;
  totalWon: number;
  totalLost: number;
  handsPlayed: number;
  lastActiveGame: 'blackjack' | 'blackjack-pro' | 'videopoker' | null;
  addChips: (amount: number) => void;
  deductChips: (amount: number) => boolean;
  recordHand: (wonAmount: number, betAmount: number, game: 'blackjack' | 'blackjack-pro' | 'videopoker') => void;
  resetBankroll: () => void;
}

export const useBankrollStore = create<BankrollState>()(
  persist(
    (set, get) => ({
      chips: 1000,
      totalWon: 0,
      totalLost: 0,
      handsPlayed: 0,
      lastActiveGame: null,
      addChips: (amount) => set((s) => ({ chips: s.chips + amount })),
      deductChips: (amount) => {
        if (get().chips < amount) return false;
        set((s) => ({ chips: s.chips - amount }));
        return true;
      },
      recordHand: (wonAmount, betAmount, game) =>
        set((s) => ({
          chips: s.chips + wonAmount,
          totalWon: wonAmount > 0 ? s.totalWon + wonAmount : s.totalWon,
          totalLost: wonAmount === 0 ? s.totalLost + betAmount : s.totalLost,
          handsPlayed: s.handsPlayed + 1,
          lastActiveGame: game,
        })),
      resetBankroll: () => set({ chips: 500 }),
    }),
    {
      name: 'hanggaa-bankroll-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## 8. Mobile-First Portrait Layout & CSS Blueprint

### 8.1 Viewport Stability & Anti-Jank (`src/index.css`)
```css
@import "tailwindcss";

@layer base {
  html, body, #root {
    min-height: 100dvh;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #020617; /* slate-950 */
    color: #f8fafc;
    overflow-x: hidden;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}

/* Luxury Casino Felt Gradient */
.casino-felt {
  background: radial-gradient(ellipse at 50% 30%, #0a3a25 0%, #062316 70%, #03140c 100%);
}
```

---

## 9. GitHub Pages Deployment Configuration

### 9.1 `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // Custom domain games.hanggaa.xyz maps to root path
});
```

### 9.2 `package.json` Scripts & Dependencies
```json
{
  "name": "hanggaa-games",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "@phosphor-icons/react": "^2.1.7",
    "motion": "^12.4.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.9",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "gh-pages": "^6.3.0",
    "tailwindcss": "^4.0.9",
    "typescript": "~5.7.2",
    "vite": "^6.2.0"
  }
}
```

### 9.3 Custom Domain `CNAME`
File placed at `public/CNAME`:
```
games.hanggaa.xyz
```

---

## 10. Step-by-Step Implementation Milestones

```
[Phase 1: Foundation]
├── 1.1 Project scaffolding (Vite + React 19 + TypeScript + Tailwind v4)
├── 1.2 Web Audio synthesis engine (soundEngine.ts)
├── 1.3 52-card deck & shoe engine with Fisher-Yates shuffle
└── 1.4 Persistent Zustand Bankroll & Settings stores

[Phase 2: Blackjack Suite & Trainer]
├── 2.1 Blackjack core state machine (dealing, hit, stand, double, split)
├── 2.2 Hi-Lo Running Count & True Count calculation engine
├── 2.3 Basic Strategy lookup matrix & real-time Trainer HUD
└── 2.4 Mobile portrait layout with bottom action sheet & 3D card flips

[Phase 3: Video Poker (Jacks or Better)]
├── 3.1 5-card poker hand evaluation algorithm
├── 3.2 Dynamic 9/6 full-pay payout table component
└── 3.3 Card hold/draw state machine & winning hand highlight animations

[Phase 4: Lobby Hub, Polish & Deployment]
├── 4.1 Luxury minimalist Lobby view with quick resume & stats modal
├── 4.2 Comprehensive mobile portrait touch QA (Safari/Chrome)
└── 4.3 Automated GitHub Pages deployment to games.hanggaa.xyz
```

---

## 11. Maintenance & Open Questions

### Maintenance Plan
- Dependencies are strictly locked to stable releases (React 19, Motion 12, Zustand 5, Tailwind v4).
- Zero external database or server maintenance required.
- All code logic is 100% testable via unit tests.

### Open Questions & Future Extensions (TBD)
- **Balatro-lite expansion:** Will be added in Phase 2.0 utilizing the same card engine with a modifier/joker layer.
- **Texas Hold'em vs 3 Bot Personalities:** Planned for Version 1.5.

---

## Handoff Context
<!-- Machine-readable summary for the next workflow step. Do not delete; the next prompt in the workflow reads this block. -->
- Stage: techdesign
- App name: hanggaa-games
- User level: C
- Target platform: web
- Budget: free
- Timeline: few weeks
- Chosen stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion + Zustand + Web Audio + GitHub Pages
- AI coding tool: Antigravity Agent
- Source files: research-hanggaa-games.md → PRD-hanggaa-games-MVP.md → TechDesign-hanggaa-games-MVP.md
---
