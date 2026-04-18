# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HT Viewer is a full-stack web app for analyzing Hattrick (football sim game) data — player ratings, position analysis, and optimal lineup generation from Hattrick XML exports.

## Commands

### Root (backend)
```bash
npm run full      # Start both backend and frontend concurrently
npm run dev       # Backend only, hot reload (port 3000)
npm run build     # Compile TypeScript to dist/
npm start         # Run compiled server
```

### Frontend
```bash
cd frontend && npm run dev      # Astro dev server (port 4321)
cd frontend && npm run build    # Build to dist/
cd frontend && npm run preview  # Preview production build
```

## Architecture

Two-tier monorepo: Express/TypeScript backend + Astro frontend.

**Backend** (`src/`) follows routes → controllers → services → utils:
- `src/data/` — Hattrick XML exports (players.xml, team.xml, arena.xml, etc.)
- `src/utils/readXmlFile.ts` + `xmlToJson.ts` — parse XML files into JS objects
- `src/services/player.service.ts` — core logic: position ratings, lineup builder, chemistry
- `src/services/team.service.ts` — team aggregation (top player by TSI, newest signing)
- `src/routes/` + `src/controllers/` — REST API at `/api/player/*` and `/api/team/*`

**Frontend** (`frontend/src/`) — Astro pages fetch from the backend at runtime:
- `pages/index.astro` — team summary home
- `pages/players.astro` — player grid + formation selector + pitch lineup visualization
- `pages/team.astro` — detailed team info
- `layouts/Layout.astro` — global dark-theme layout with nav

**CORS:** frontend on `localhost:4321` → backend on `localhost:3000`.

## Key Business Logic

**Player position ratings** (`player.service.ts`): each player scores for 5 positions (GK, DEF, MID, WING, FW) using weighted skill sums. Best position is the highest-rated one, with role sub-classification (e.g. "Lateral" vs "Central" DEF) based on secondary skills.

**Lineup builder** (`buildLineup(formation)`): greedy best-player-per-position selection. Supported formations: `4-4-2`, `3-5-2`, `4-3-3`. Returns selected XI plus a **team chemistry** score computed from shared nationality (+2/pair), same original team (+1/pair), and similar age ±3 years (+1/pair).

**Data source**: all player/team data comes from static XML files under `src/data/` — there is no database.
