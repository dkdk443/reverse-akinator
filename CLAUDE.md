# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reverse Akinator is a Japanese-language guessing game where the AI thinks of a historical figure and the user asks yes/no questions to identify them. Built with Next.js 14 (App Router).

## Common Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run data:generate # Regenerate static JSON from CSV files
```

Docker development:
```bash
docker-compose up dev   # Dev server with hot reload
docker-compose up app   # Production build
```

## Architecture

### Data Flow
Game data is pre-generated static JSON, not fetched from a database at runtime:
1. CSV files in `data/csv/` contain person/attribute data
2. `npm run data:generate` converts CSV → `public/data/gameData.json`
3. Client fetches `gameData.json` once at game start
4. All question answering (except AI questions) happens client-side by matching against the loaded data

### API Routes
- `POST /api/session/start` - Creates session with rate-limited AI question count (5 per session)
- `POST /api/ai/question` - Free-form AI questions via Gemini API (rate limited by session)
- `GET /api/og` - Dynamic OG image generation for sharing

### Key Client Components
- `app/game/hooks/useGameState.ts` - All game state (persons, attributes, session, chat history)
- `app/game/hooks/useQuestions.ts` - Question handling logic (predefined, year-based, hints, AI)
- `app/game/page.tsx` - Main game UI orchestration

### Session Management
In-memory session store (`lib/session.ts`) tracks:
- AI question count per session (max 5)
- Session expiry (30 minutes)
- Uses `globalThis` to persist across hot reloads in development

### Difficulty System
Persons have `trivia_level` (0-100) used for difficulty filtering:
- Easy: ≥85 (famous figures)
- Normal: 70-84
- Hard: <70 (obscure figures)

## Environment Variables

Required for AI questions:
```
GEMINI_API_KEY=your-gemini-api-key
```

## Data Updates

To add/modify historical figures:
1. Edit CSV files in `data/csv/` (persons.csv, attributes.csv, person_attributes.csv)
2. Run `npm run data:generate`
3. Restart dev server or rebuild
