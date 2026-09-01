# AGENTS.md — Master Plan for Hanggaa Card & Casino Arcade

## Project Overview & Stack
**App:** Hanggaa Card & Casino Arcade (`hanggaa-games`)  
**Overview:** Zero-friction, ad-free, solo card game hub optimized for mobile portrait (one-handed thumb play) and desktop browser, featuring Blackjack (Classic & Hi-Lo Card Counting Trainer) and Video Poker (Jacks or Better) with persistent shared bankroll in `localStorage`.  
**Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion (`motion/react`), Zustand, Web Audio API, GitHub Pages (`games.hanggaa.xyz`).  
**Critical Constraints:** 100% Free ($0 hosting & backend), Mobile-First Portrait mode (`min-h-[100dvh]`), Strict TypeScript (no `any`), Cold Luxury Felt aesthetic (anti-slop directives).

## Setup & Commands
- **Setup:** `npm install`
- **Development:** `npm run dev`
- **Testing / Typecheck:** `tsc -b`
- **Build:** `npm run build`
- **Deploy:** `npm run deploy` (deploys to GitHub Pages `games.hanggaa.xyz`)

## Protected Areas 🛡️
- **Domain & Deployment:** `public/CNAME` must remain `games.hanggaa.xyz`.
- **Zero Real Money:** Never introduce real payment gateways or real-money transactions.

## Coding Conventions
- **Formatting:** Prettier / ESLint with strict TypeScript.
- **Architecture:** Feature-based modular structure (`src/components/blackjack`, `src/components/videopoker`, `src/components/lobby`, `src/engine/`).
- **State Management:** Zustand stores with `persist` middleware targeting `localStorage`.
- **Styling & Animation:** Tailwind v4 utility tokens + Motion hardware-accelerated transforms (`transform`, `opacity` only).
- **Audio:** Pure procedural Web Audio API synthesis (zero external audio assets).

## Current State 📍
**Last Updated:** 2026-09-01  
**Working On:** MVP Complete & Tested. Ready for deployment.  
**Recently Completed:** Scaffolding, Web Audio Engine, Blackjack Engine + Trainer, Video Poker Suite, Lobby Hub, and Build Verification.  
**Blocked By:** None

## Roadmap 🗺️

### Phase 1: Foundation & Core Stack
- [x] Create PRD and Tech Design
- [x] Scaffold Vite + React 19 + TypeScript + Tailwind v4
- [x] Implement Web Audio procedural sound synthesizer (`soundEngine.ts`)
- [x] Implement 52-card shoe engine with Fisher-Yates shuffle
- [x] Implement Zustand persistent Bankroll & Settings stores

### Phase 2: Blackjack Suite & Card Counting Trainer
- [x] Blackjack core state machine (Deal, Hit, Stand, Double, Split, Insurance)
- [x] Hi-Lo Card Counting math engine (Running Count, True Count)
- [x] Basic Strategy lookup advisor & real-time Trainer HUD
- [x] Mobile portrait Blackjack table UI with 3D card flips & bottom action sheet

### Phase 3: Video Poker Suite (Jacks or Better)
- [x] 5-card poker evaluation engine (Royal Flush down to Pair of Jacks)
- [x] Dynamic 9/6 full-pay payout table component
- [x] Tap-to-hold card state machine & winning hand fanfare

### Phase 4: Lobby Hub, Polish & Deployment
- [x] Luxury Minimalist Lobby with quick resume & stats modal
- [x] Tactile sound effects and haptic touch feedback
- [x] Mobile portrait layout QA
- [x] GitHub Pages custom domain configuration (`games.hanggaa.xyz`)

## Context Files 📚
- `research-hanggaa-games.md` — Deep research findings
- `PRD-hanggaa-games-MVP.md` — Product requirements document
- `TechDesign-hanggaa-games-MVP.md` — Technical design document
- `MEMORY.md` — Active development memory
- `REVIEW-CHECKLIST.md` — Quality verification checklist
