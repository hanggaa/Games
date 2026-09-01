# AGENTS.md — Master Plan for Hanggaa Arcade Suite

## Project Overview & Stack
**App:** Hanggaa Solo Arcade & Strategy Suite (`hanggaa-games`)  
**Overview:** Zero-friction, ad-free, solo arcade hub with a **Dark Premium Utilitarian Minimalist & Editorial UI** (`minimalist-ui`). Features 8 rich games spanning strategy, roguelikes, gravity physics, cyber terminals, and tabletop showdowns with shared virtual credits/bankroll in `localStorage`.  
**Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion (`motion/react`), Zustand, Web Audio API, GitHub Pages (`games.hanggaa.xyz`).  
**Critical Constraints:** 100% Free ($0 hosting & backend), Mobile-First Portrait mode (`min-h-[100dvh]`), Strict TypeScript (no `any`), Dark Minimalist Editorial Aesthetic (`#0A0A0A` canvas, 1px `#242424` borders, Newsreader serif typography, dark spot pastels, zero emoji text, zero heavy drop-shadows).

## Setup & Commands
- **Setup:** `npm install`
- **Development:** `npm run dev`
- **Testing / Typecheck:** `tsc -b`
- **Build:** `npm run build`
- **Deploy:** `npm run deploy` (deploys to GitHub Pages `games.hanggaa.xyz`)

## Protected Areas 🛡️
- **Domain & Deployment:** `public/CNAME` must remain `games.hanggaa.xyz`.
- **Zero Real Money:** Never introduce real payment gateways or real-money transactions.

## Current State 📍
**Last Updated:** 2026-09-01  
**Working On:** 8-Game Portrait Suite Complete, Tested, & Verified.  
**Recently Completed:**
1. ⚔️ Dungeon Crawl (Turn-Based Micro Roguelike)
2. 🛡️ Core Defense (Vertical Micro Tower Defense)
3. 💻 Cyber Infiltration (Minimalist Terminal Hacker)
4. 🚀 Lunar Orbital (Slingshot Gravity Physics)
5. 💥 Buckshot Roulette (12-Gauge Tabletop Duel vs The Dealer)
6. 🃏 Balatro-lite (Roguelike Poker Deckbuilder)
7. 🧠 3-Deck Continuous Shoe Blackjack (Card Counting Trainer)
8. ♠️ Texas Hold'em Poker (vs AI Bots)
**Blocked By:** None

## Roadmap 🗺️
- [x] Dark Minimalist Warm Monochrome Design System (`minimalist-ui`)
- [x] Non-Casino Strategy & Arcade Suite (Dungeon Crawl, Core Defense, Cyber Infiltration, Lunar Orbital)
- [x] Tabletop & Card Suite (Buckshot Roulette, Balatro-lite, 3-Deck Shoe Blackjack, Texas Hold'em vs Bots)
- [x] REVIEW-CHECKLIST.md Quality & Security Verification
