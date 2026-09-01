# Product Requirements Document: Hanggaa Card & Casino Arcade MVP

## Overview

**Product Name:** Hanggaa Card & Casino Arcade (`hanggaa-games`)  
**Problem Statement:** Online mobile card games are bloated with intrusive video ads, forced logins, aggressive paywalls, and clumsy landscape-only orientations that make quick solo play frustrating.  
**MVP Goal:** Deliver an ultra-fast, zero-friction, ad-free solo card game hub optimized for one-handed mobile portrait play, featuring Blackjack (Classic & Card Counting Trainer) and Video Poker with 100% accurate strategy feedback and zero-cost hosting on GitHub Pages (`games.hanggaa.xyz`).  
**Target Launch:** 2–3 weeks.

---

## Target Users

### Primary User Profile
- **Who:** Solo player (Hanggaa) seeking engaging, high-speed card games during quick 2–10 minute downtime moments.
- **Problem:** Needs instant, zero-friction entertainment without ads, account setup, or slow multiplayer queues.
- **Current Solution:** Bloated mobile casino apps (Zynga, generic App Store blackjack apps with full-screen ads).
- **Why They'll Switch:** Instant browser launch, zero ads, authentic bankroll excitement without real money loss, vertical portrait ergonomics, and built-in strategy training.

### User Persona: Solo Player & Strategy Learner
- **Demographics:** Smartphone & laptop user, tech-savvy.
- **Tech Level:** Intermediate (familiar with web tech and card games).
- **Goals:** Enjoy fast card play, practice card counting (Hi-Lo), test basic strategy, and track bankroll growth.
- **Frustrations:** App loading delays, ads interrupting hands, losing game state upon page refresh, and landscape orientation requirements.

---

## User Journey

### The Story
When bored while commuting or resting, the user opens `games.hanggaa.xyz` on mobile. The page loads in under 1 second directly into a minimalist, cold-emerald luxury Lobby displaying their current virtual chip balance ($1,000+) and big game cards. Tapping "Blackjack Pro" instantly transitions to the felt table with a smooth deal animation and crisp card slide sound. The user plays one-handed with bottom thumb buttons, observes the real-time Card Counting HUD, refines their strategy decisions, and closes the browser knowing their bankroll and win stats are safely saved in `localStorage`.

### Key Touchpoints
1. **Discovery / Launch:** Direct bookmark or URL entry to `games.hanggaa.xyz`.
2. **First Contact (Lobby):** Header with chip balance, Quick Resume button, and game selector cards.
3. **Onboarding:** Zero onboarding needed; instant initial $1,000 chip grant on first visit.
4. **Core Loop:** Place Bet → Deal Cards → Make Tactical Decisions (Hit/Stand/Double/Split/Hold) → Win/Loss Payout → Instant Re-deal or Switch Game.
5. **Retention:** Bankroll progression, win-rate tracking, and mastery of card counting metrics.

---

## MVP Features

### Core Features (Must Have)

#### 1. Minimalist Luxury Lobby & Persistent Shared Bankroll
- **Description:** Central entry point displaying current chip bankroll, total win rate, quick resume for last played game, and game selection tiles (Blackjack Classic, Blackjack Pro Trainer, Video Poker).
- **User Value:** Gives a unified casino feeling where chips won in Blackjack can be played in Poker.
- **Success Criteria:**
  - Bankroll automatically initializes to $1,000 on first visit and persists across refreshes in `localStorage`.
  - Reset Bankroll button available if chips reach $0 (grants $500 reload).
  - Navigation between Lobby and Game Tables is instantaneous with smooth page transitions.
- **Priority:** Critical (P0)

#### 2. Blackjack Suite (Classic Mode & Pro Card Counting Trainer)
- **Description:** Complete 6-deck Blackjack engine following standard Vegas rules (dealer hits soft 17, 3:2 blackjack payout, double down, split, insurance).
  - *Classic Mode:* Pure casino play against automated Dealer AI.
  - *Pro Trainer Mode:* Adds a toggleable HUD showing Running Count (RC), True Count (TC), Shoe Penetration %, and a real-time Basic Strategy Advisor with post-decision feedback.
- **User Value:** Pure entertainment plus rigorous practice for real-world card counting and probability calculation.
- **Success Criteria:**
  - Hi-Lo counting logic is 100% mathematically accurate.
  - Basic Strategy advisor accurately identifies optimal mathematical decisions for every player/dealer card combination.
  - Split hands create independent playable hands with distinct bets.
- **Priority:** Critical (P0)

#### 3. Video Poker Suite (Jacks or Better 9/6 Full Pay)
- **Description:** Classic 5-card draw Video Poker against a standard payout matrix. Player gets 5 cards, selects which cards to "HOLD", and draws replacements for unheld cards with instant hand evaluation.
- **User Value:** Fast-paced, high-odds solo card strategy with big payout excitement (Royal Flush 800x).
- **Success Criteria:**
  - Automated 5-card poker hand evaluation correctly classifies hands (Royal Flush down to Pair of Jacks or Better).
  - Visual indicator highlights held cards with tactile animation.
  - Payout table highlights the winning tier and credits winnings to the shared bankroll.
- **Priority:** Critical (P0)

#### 4. Mobile-First Portrait UX & Tactical Bottom Action Sheet
- **Description:** Responsive interface designed specifically for one-handed portrait mode on smartphones (`min-h-[100dvh]`) with all active buttons (Hit, Stand, Double, Hold, Bet Chips) clustered in the natural lower thumb zone.
- **User Value:** Eliminates the frustration of having to rotate the phone or use both hands.
- **Success Criteria:**
  - Zero horizontal scroll or viewport overflow on screens from 360px up to 4K desktop.
  - No viewport jumping when mobile browser URL bars collapse/expand.
  - Touch buttons have tactile `:active` scale reduction (`scale-95`).
- **Priority:** Critical (P0)

#### 5. Zero-Latency Procedural Audio (Web Audio API)
- **Description:** Built-in procedural sound synthesis for all audio events (card deal, card flip, chip toss/clink, win chime, error/bust sound).
- **User Value:** Delivers satisfying, immersive feedback with zero download latency and 100% offline reliability.
- **Success Criteria:**
  - Sound triggers instantaneously (<5ms) upon user interaction.
  - Master Mute/Unmute toggle persisted in user settings.
- **Priority:** Critical (P0)

---

## Out of Scope (Not in MVP)

| Feature | Why Wait | Planned For |
| :--- | :--- | :--- |
| **Balatro-lite (Poker Roguelike Deckbuilder)** | Requires deep balancing of jokers, card modifiers, and escalating blinds. | Version 2.0 |
| **Texas Hold'em Multi-Bot Table** | Video Poker provides the core poker hand thrill faster for solo MVP play. | Version 1.5 |
| **Online Multiplayer / P2P** | Adds backend complexity and defeats the instant solo break goal. | Out of Scope |
| **Real Money Integration** | Strict personal project for fun/training; zero regulatory or financial risk. | Out of Scope |

---

## Success Metrics

### Primary Metrics
1. **Card Counting & Strategy Engine Accuracy:** 100% mathematical precision across all shoe depths and hand permutations.
   - *How to measure:* Automated unit tests covering all Basic Strategy lookup permutations and Hi-Lo count edge cases.
2. **Performance & Animation Smoothness:** Solid 60fps on mobile Safari/Chrome with 0 layout shift (`CLS = 0`).
   - *How to measure:* Chrome Lighthouse Performance score > 95.

### Secondary Metrics
- **State Reliability:** Zero lost bankroll/stats across browser refreshes and tab closures.
- **Deployment Velocity:** One-command automated deployment (`npm run deploy`) directly updating `games.hanggaa.xyz`.

---

## UI/UX Direction

**Design Feel:** Cold Luxury / Deep Emerald Felt, minimal, focused, tactile, and sleek (inspired by Zynga Poker elegance, built with anti-slop frontend standards).  
**Color Tokens:**
- Base Felt: Deep Emerald Green (`#062316` / `#0a3321`) with subtle vignette.
- Neutral Backdrop: Slate-950 (`#020617`).
- Accent Gold: Champagne Amber (`#d4af37` / `#f59e0b`).
- Card Face: Pure White (`#ffffff`) with crisp Suit Colors (True Black `#0f172a` and Vivid Crimson `#dc2626`).

### Key Screens
1. **Lobby View:**
   - Sticky Top Bar: Chip Bankroll Badge, Sound Toggle, Stats Modal trigger.
   - Quick Resume Hero Card.
   - Game Grid: Large luxury cards for Blackjack Classic, Blackjack Pro Trainer, and Video Poker.
2. **Blackjack Table View:**
   - Top: Dealer Area & Dealer Score.
   - Middle: Card Counting Trainer HUD (Toggleable RC, TC, Decks Left, Strategy Advice).
   - Bottom: Player Hands, Current Bet, Chip Denomination Selector ($5, $25, $100, $500), and Thumb Action Bar (Double, Hit, Stand, Split).
3. **Video Poker Table View:**
   - Top: Dynamic 9/6 Paytable with active winning tier highlight.
   - Middle: 5 Large Poker Cards with "HELD" badge overlays.
   - Bottom: Bet Level selector, Deal/Draw primary action button.

### Design Principles
1. **Thumb Ergonomics First:** All frequent actions reside in the lower 35% of the mobile screen.
2. **Visual Hierarchy without Clutter:** No decorative noise; every visual element communicates game state or bankroll value.
3. **Tactile Feedback:** Every touch provides immediate visual deformation (`scale-95`) and audio confirmation.

---

## Technical Considerations

- **Platform:** Web App (Mobile Portrait First & Desktop Responsive).
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion (`motion/react`), Zustand, Web Audio API.
- **Hosting:** GitHub Pages via `gh-pages` with custom subdomain `games.hanggaa.xyz`.
- **Offline / Zero Backend:** 100% client-side execution; state persisted in `localStorage`.
- **Accessibility:** WCAG 2.1 AA compliant contrast for text and cards, keyboard shortcuts for desktop (H = Hit, S = Stand, D = Double, Space = Deal).

---

## Budget & Constraints

- **Budget:** $0.00 (100% Free forever).
- **Timeline:** 2–3 weeks to production launch on `games.hanggaa.xyz`.
- **Team:** Solo developer + AI Agent pair programming.

---

## Definition of Done for MVP

- [ ] Core Deck, Blackjack, and Video Poker engines fully unit tested.
- [ ] Hi-Lo Card Counting Trainer & Basic Strategy Advisor verified against standard mathematical matrices.
- [ ] Mobile portrait layout tested across iOS Safari and Android Chrome without overflow or layout shifts.
- [ ] Web Audio procedural synthesizer functioning with master mute control.
- [ ] Zustand `localStorage` persistence verified (bankroll, game stats, sound preferences).
- [ ] Custom domain DNS and GitHub Pages deployment configured via `npm run deploy` to `games.hanggaa.xyz`.

---

## Handoff Context
<!-- Machine-readable summary for the next workflow step. Do not delete; the next prompt in the workflow reads this block. -->
- Stage: prd
- App name: hanggaa-games
- User level: C
- Target platform: web
- Budget: free
- Timeline: few weeks
- Source files: research-hanggaa-games.md → PRD-hanggaa-games-MVP.md
---
