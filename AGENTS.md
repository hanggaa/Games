# AGENTS.md — Master Plan for Hanggaa Card & Casino Arcade

## Project Overview & Stack
**App:** Hanggaa Card & Casino Arcade (`hanggaa-games`)  
**Overview:** Zero-friction, ad-free, solo card game hub with a **Dark Premium Utilitarian Minimalist & Editorial UI** (`minimalist-ui`). Features Balatro-lite Roguelike Poker Deckbuilder, 3-Deck Continuous Shoe Blackjack (with Hi-Lo Card Counting Trainer), and Texas Hold'em Poker (vs AI Bots) with persistent shared bankroll in `localStorage`.  
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
**Working On:** Dark Minimalist UI Complete + Balatro-lite Roguelike Mode Implemented & Verified.  
**Recently Completed:** Dark Minimalist Bento Hub, Balatro-lite Deckbuilder & Joker Shop, 3-Deck Shoe Blackjack, Texas Hold'em vs Bots.  
**Blocked By:** None

## Roadmap 🗺️
- [x] Dark Minimalist Warm Monochrome Design System (`minimalist-ui`)
- [x] Balatro-lite Roguelike Poker Deckbuilder (Ante 1-8, Escalating Blinds, Discards/Hands, Synergistic Jokers & Shop)
- [x] 3-Deck Physical Continuous Shoe Blackjack + Hi-Lo Card Counting Trainer
- [x] Texas Hold'em vs AI Bots (Elena & Viktor) with 7-Card Hand Evaluator
- [x] REVIEW-CHECKLIST.md Quality & Security Verification
