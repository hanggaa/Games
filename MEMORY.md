# System Memory & Context 🧠

## 🏗️ Active Phase & Goal
**Current Task:** Full MVP build completed and verified (`npm run build` passing). Ready for testing and GitHub Pages deployment (`npm run deploy`).
**Next Steps:**
1. Test in browser using `npm run dev`.
2. Deploy to GitHub Pages using `npm run deploy` to publish to `games.hanggaa.xyz`.
3. In v2.0, build the Balatro-lite roguelike deckbuilder expansion.

## 📂 Architectural Decisions
- 2026-09-01 — Built 100% client-side React 19 + TypeScript + Vite + Zustand (`localStorage`) for zero server cost and instant playability on GitHub Pages (`games.hanggaa.xyz`).
- 2026-09-01 — Implemented procedural Web Audio API sound synthesis (card slide, chip clink, flip, win fanfare) for zero network latency and 100% offline reliability.
- 2026-09-01 — Enforced Mobile Portrait First layout (`min-h-[100dvh]`) with fixed bottom action sheets for comfortable one-handed thumb reach without needing to rotate phone.
- 2026-09-01 — Implemented accurate 6-deck Vegas Blackjack with Hi-Lo Card Counting Trainer (Running Count, True Count) and Basic Strategy advisor matrix.
- 2026-09-01 — Implemented 9/6 Full Pay Video Poker (Jacks or Better) with dynamic paytable and tap-to-hold mechanics.

## 🐛 Known Issues & Quirks
- None. Build passes with zero TypeScript errors or warnings.

## 📜 Completed Phases
- [x] Part 1: Deep Research (`research-hanggaa-games.md`)
- [x] Part 2: PRD Generator (`PRD-hanggaa-games-MVP.md`)
- [x] Part 3: Technical Design Document (`TechDesign-hanggaa-games-MVP.md`)
- [x] Part 4: AGENTS.md and memory setup
- [x] Full MVP Implementation & Production Build
