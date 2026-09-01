# System Memory & Context 🧠

## 🏗️ Active Phase & Goal
**Current Task:** Dark Mode aesthetic applied across the entire app with **Premium Utilitarian Minimalist & Editorial UI** (`minimalist-ui`) + **Balatro-lite Roguelike Deckbuilder**.
**Next Steps:**
1. Test in browser using `npm run dev`.
2. Deploy to GitHub Pages using `npm run deploy` to publish to `games.hanggaa.xyz`.

## 📂 Architectural Decisions
- 2026-09-01 — **Dark Minimalist Editorial UI**: Transformed palette to Matte Charcoal/Graphite (`#0A0A0A`), crisp dark surface containers (`#141414`) with 1px `#242424` hairline borders, Off-white typography (`#EDEDED`), Newsreader editorial serif headings, Geist Mono metadata, muted dark pastels, and crisp playing card faces on the dark tables.
- 2026-09-01 — **Balatro-lite Roguelike Deckbuilder**: Ante progression (1 to 8), Target Blinds, 8-card hands, 5-card scoring formula ($(\text{Base Chips} + \text{Card Chips}) \times (\text{Base Mult} + \text{Joker Mult}) \times X\text{Mult}$), 4 Hands / 3 Discards, and a Shop phase with customizable Jokers.
- 2026-09-01 — **3-Deck Continuous Shoe Blackjack**: 156-card shoe with persistent Running Count & True Count across rounds, cut card auto-reshuffle.
- 2026-09-01 — **Texas Hold'em vs Bots**: Solitary poker table against Bot Elena & Bot Viktor with 7-card showdown evaluator.

## 🐛 Known Issues & Quirks
- None. `npm run build` and `tsc -b` pass cleanly with 0 vulnerabilities in `npm audit`.
